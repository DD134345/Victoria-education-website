#!/usr/bin/env node
// Photo intake: collect photos from an inbox folder (e.g. a Google Drive for desktop
// folder the school uploads to) and place each one into its slot in src/assets/photos/.
//
//   npm run photos:shotlist          write/refresh <inbox>/shotlist.csv (one row per slot)
//   npm run photos:import            DRY RUN: show what would be imported, change nothing
//   npm run photos:apply             import for real (writes src/assets/photos + photos.json)
//   ... -- --suggest                 also ask a local Ollama vision model to sort photos in
//                                    _chua-phan-loai/ and flag photos that may show children
//   ... -- --overwrite               replace a slot that already has a photo
//   ... -- --allow-children          import photos the vision check flagged (after you checked)
//
// Inbox = PHOTO_INBOX in website/.env, or --inbox <dir>, default website/photo-inbox/.
// Inbox layout mirrors the slot keys (see shotlist.csv):
//   home-hero.jpg · home-ly-do-1.jpg · banners/Liên hệ.jpg · co-so-vat-chat/01 Phòng học.jpg
//   giao-vien/Cô Lan Anh.jpg · lop-hoc/Mầm 1.jpg · _chua-phan-loai/<anything>
// File names may keep Vietnamese accents and spaces; they are slugified to the slot key.
//
// Gates (website/AGENTS.md rule 3 - no identifiable children without consent):
//   - a photo is imported only when its slot row in shotlist.csv has `nguoi_duyet` filled
//     (the person confirming the photo may be published);
//   - with --suggest, photos the vision model thinks show a child are held back until
//     re-run with --allow-children.
// Nothing is committed or pushed; review on /khung-anh/ (npm run dev) and commit yourself.
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join, relative, resolve, sep } from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const PHOTOS_DIR = join(ROOT, 'src/assets/photos');
const ALT_FILE = join(ROOT, 'src/data/photos.json');
const SHOTLIST = 'shotlist.csv';
const REPORT = '_ket-qua-nhap-anh.csv';
const UNSORTED = '_chua-phan-loai';
const IMG_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.tif', '.tiff']);
const NO_SUPPORT = new Set(['.heic', '.heif']); // iPhone: export as JPG ("Most compatible")
const MAX_EDGE = 2400; // long edge kept in the repo; the build makes the web sizes
const MAX_BYTES = 2 * 1024 * 1024;
const MIN_EDGE = 800; // below this the photo is rejected
const COLS = ['slot', 'vi_tri', 'can_chup', 'ti_le', 'toi_thieu_px', 'alt', 'nguoi_duyet', 'ghi_chu'];

try { process.loadEnvFile(join(ROOT, '.env')); } catch { /* no .env is fine */ }

const argv = process.argv.slice(2);
const cmd = argv[0] && !argv[0].startsWith('--') ? argv[0] : 'import';
const flag = (f) => argv.includes(f);
const opt = (f) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : undefined; };
const INBOX = resolve(ROOT, opt('--inbox') ?? process.env.PHOTO_INBOX ?? 'photo-inbox');
const APPLY = flag('--apply');

// ---------- helpers ----------
const slug = (s) => s.replace(/đ/g, 'd').replace(/Đ/g, 'D').normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 80).replace(/-$/, '');
const sha = (buf) => createHash('sha256').update(buf).digest('hex');
const walk = (d) => (existsSync(d) ? readdirSync(d, { withFileTypes: true }) : [])
  .flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));
const posix = (p) => p.split(sep).join('/');
const read = (p) => readFileSync(join(ROOT, p), 'utf8');

function parseCsv(text) {
  text = text.replace(/^﻿/, '');
  const lines = text.split(/\r?\n/);
  if (/^sep=/i.test(lines[0])) lines.shift();
  const first = lines[0] ?? '';
  const d = (first.match(/;/g) ?? []).length > (first.match(/,/g) ?? []).length ? ';' : ',';
  const rows = []; let row = []; let cell = ''; let q = false;
  const src = lines.join('\n');
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (q) {
      if (c === '"' && src[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') q = false; else cell += c;
    } else if (c === '"') q = true;
    else if (c === d) { row.push(cell); cell = ''; }
    else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
    else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [head, ...body] = rows.filter((r) => r.some((x) => x.trim()));
  if (!head) return [];
  const keys = head.map((h) => h.trim());
  return body.map((r) => Object.fromEntries(keys.map((k, i) => [k, (r[i] ?? '').trim()])));
}
const csvCell = (v) => (/[",;\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
const writeCsv = (file, cols, rows) =>
  writeFileSync(file, '﻿' + [cols, ...rows.map((r) => cols.map((c) => r[c] ?? ''))].map((r) => r.map(csvCell).join(',')).join('\r\n') + '\r\n');

// ---------- slots (derived from the site code, so new pages appear automatically) ----------
function siteSlots() {
  const photosTs = read('src/lib/photos.ts');
  const navTs = read('src/lib/nav.ts');
  const slots = [];
  for (const m of photosTs.matchAll(/\{ key: '([^']+)', where: '([^']+)', ratio: '([^']+)'/g)) {
    slots.push({ slot: m[1], vi_tri: m[2], ti_le: m[3], toi_thieu_px: '1600 ngang',
      can_chup: m[1] === 'home-hero' ? 'Toàn cảnh trường / cổng trường, trời sáng' : 'Ảnh minh hoạ cho thẻ "Vì sao chọn" tương ứng' });
  }
  const routes = new Set();
  for (const m of navTs.matchAll(/href: '(\/[^']*)'/g)) routes.add(m[1]);
  for (const m of navTs.matchAll(/^\s*'([a-z0-9/-]+)',\s*$/gm)) routes.add(`/${m[1]}/`); // PAGE_ROUTES
  for (const m of navTs.matchAll(/\{ slug: '([a-z0-9-]+)', label: '([^']+)' \}/g)) routes.add(`/cong-khai/${m[1]}/`);
  routes.add('/cong-khai/luu-tru/');
  routes.delete('/');
  const labels = Object.fromEntries([...navTs.matchAll(/label: '([^']+)', href: '([^']+)'/g)].map((m) => [m[2], m[1]]));
  for (const r of [...routes].sort()) {
    const key = `banners/${r.split('/').filter(Boolean).join('-')}`;
    slots.push({ slot: key, vi_tri: `Ảnh đầu trang: ${labels[r] ?? r} (${r})`, ti_le: '5 / 4', toi_thieu_px: '1600 ngang',
      can_chup: 'Ảnh không gian/hoạt động hợp chủ đề trang, không thấy rõ mặt trẻ' });
  }
  slots.push({ slot: 'co-so-vat-chat/*', vi_tri: 'Thư viện Cơ sở vật chất + 4 ảnh đầu ở trang chủ', ti_le: '4 / 3',
    toi_thieu_px: '1600 ngang', can_chup: 'Phòng học, sân chơi, bếp, phòng ngủ… Đặt tên 01 …, 02 … để xếp thứ tự' });
  const names = (dir) => walk(join(ROOT, dir)).filter((f) => f.endsWith('.json'))
    .map((f) => { try { return JSON.parse(readFileSync(f, 'utf8')); } catch { return null; } })
    .filter((x) => x && typeof x.name === 'string').map((x) => x.name);
  for (const n of names('src/data/teachers')) {
    slots.push({ slot: `giao-vien/${slug(n)}`, vi_tri: `Ảnh chân dung ${n}`, ti_le: '4 / 5', toi_thieu_px: '1200 dọc',
      can_chup: 'Chân dung dọc, nền sáng trơn; hồ sơ giáo viên phải có photo_consent' });
  }
  let classes = [];
  try { classes = JSON.parse(read('src/data/classes.json')); } catch { /* none */ }
  for (const c of Array.isArray(classes) ? classes : []) {
    if (c && typeof c.className === 'string' && !JSON.stringify(c).includes('TODO-OWNER')) {
      slots.push({ slot: `lop-hoc/${slug(c.className)}`, vi_tri: `Ảnh lớp ${c.className}`, ti_le: '4 / 3', toi_thieu_px: '1600 ngang',
        can_chup: 'Ảnh phòng lớp; nếu có trẻ thì phải có trong sổ đồng ý' });
    }
  }
  return slots;
}

function loadShotlist() {
  const f = join(INBOX, SHOTLIST);
  return existsSync(f) ? parseCsv(readFileSync(f, 'utf8')) : [];
}

function cmdShotlist() {
  mkdirSync(INBOX, { recursive: true });
  const old = new Map(loadShotlist().map((r) => [r.slot, r]));
  const alts = JSON.parse(readFileSync(ALT_FILE, 'utf8')).alt ?? {};
  const rows = siteSlots().map((s) => {
    const o = old.get(s.slot) ?? {};
    return { ...s, alt: o.alt || alts[s.slot] || '', nguoi_duyet: o.nguoi_duyet ?? '', ghi_chu: o.ghi_chu ?? '' };
  });
  for (const [k, o] of old) if (!rows.some((r) => r.slot === k)) rows.push({ ...o, ghi_chu: `${o.ghi_chu ?? ''} [slot không còn trên web]`.trim() });
  writeCsv(join(INBOX, SHOTLIST), COLS, rows);
  for (const d of ['banners', 'co-so-vat-chat', 'giao-vien', 'lop-hoc', UNSORTED]) mkdirSync(join(INBOX, d), { recursive: true });
  console.log(`[photos] ${rows.length} slot -> ${join(INBOX, SHOTLIST)}`);
}

// ---------- vision (optional, local Ollama) ----------
const OLLAMA = process.env.OLLAMA_URL ?? 'http://localhost:11434';
const VISION = process.env.PHOTO_VISION_MODEL ?? 'qwen2.5vl:3b';
async function vision(buf, slots) {
  const small = await sharp(buf).rotate().resize(768, 768, { fit: 'inside' }).jpeg({ quality: 70 }).toBuffer();
  const prompt = `Ảnh này dùng cho website một trường mầm non. Trả lời JSON:
{"loai": một trong ["home-hero","co-so-vat-chat","banner","giao-vien","lop-hoc","khong-phu-hop"],
 "banner_goi_y": slot banner hợp nhất nếu loai="banner" (chọn trong: ${slots.filter((s) => s.startsWith('banners/')).join(', ')}),
 "co_tre_em": true nếu thấy mặt trẻ em nhận diện được,
 "alt": mô tả ngắn bằng tiếng Việt (tối đa 15 từ), không nêu tên người}`;
  const res = await fetch(`${OLLAMA}/api/chat`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ model: VISION, stream: false, format: 'json', options: { temperature: 0 },
      messages: [{ role: 'user', content: prompt, images: [small.toString('base64')] }] }),
    signal: AbortSignal.timeout(180_000),
  });
  if (!res.ok) throw new Error(`Ollama ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return JSON.parse((await res.json()).message.content);
}

// ---------- import ----------
function existingFor(key) {
  const dir = join(PHOTOS_DIR, dirname(key));
  const stem = basename(key);
  return (existsSync(dir) ? readdirSync(dir) : [])
    .filter((f) => f.slice(0, f.length - extname(f).length).toLowerCase() === stem && IMG_EXT.has(extname(f).toLowerCase()))
    .map((f) => join(dir, f));
}

async function encode(buf) {
  let q = 84;
  const base = sharp(buf, { failOn: 'error' }).rotate().resize(MAX_EDGE, MAX_EDGE, { fit: 'inside', withoutEnlargement: true });
  let out = await base.clone().jpeg({ quality: q, mozjpeg: true }).toBuffer(); // no withMetadata(): EXIF/GPS dropped
  while (out.length > MAX_BYTES && q > 60) { q -= 8; out = await base.clone().jpeg({ quality: q, mozjpeg: true }).toBuffer(); }
  return out;
}

async function cmdImport() {
  if (!existsSync(INBOX)) { console.error(`[photos] Không thấy thư mục ảnh: ${INBOX}\nChạy "npm run photos:shotlist" trước, hoặc đặt PHOTO_INBOX trong website/.env`); process.exit(1); }
  const shot = loadShotlist();
  if (!shot.length) { console.error(`[photos] Thiếu ${SHOTLIST} trong ${INBOX}. Chạy "npm run photos:shotlist".`); process.exit(1); }
  const exact = new Map(shot.filter((r) => !r.slot.endsWith('/*')).map((r) => [r.slot, r]));
  const folders = new Map(shot.filter((r) => r.slot.endsWith('/*')).map((r) => [r.slot.slice(0, -2), r]));
  const suggest = flag('--suggest');
  const altDoc = JSON.parse(readFileSync(ALT_FILE, 'utf8'));
  altDoc.alt ??= {};
  const report = [];
  const seen = new Map();
  let imported = 0;

  const files = walk(INBOX).filter((f) => {
    const rel = posix(relative(INBOX, f));
    return !basename(f).startsWith('.') && !basename(f).startsWith('_') && rel !== SHOTLIST && !/desktop\.ini$/i.test(rel);
  }).sort();

  for (const file of files) {
    const rel = posix(relative(INBOX, file));
    const ext = extname(file).toLowerCase();
    const r = { file: rel, slot: '', trang_thai: '', ghi_chu: '' };
    report.push(r);
    if (NO_SUPPORT.has(ext)) { r.trang_thai = 'loi'; r.ghi_chu = 'Ảnh HEIC (iPhone): xuất lại dạng JPG rồi tải lên'; continue; }
    if (!IMG_EXT.has(ext)) { r.trang_thai = 'bo-qua'; r.ghi_chu = 'Không phải file ảnh'; continue; }

    const parts = rel.split('/');
    const nameNoExt = basename(rel, extname(rel));
    const inUnsorted = parts[0] === UNSORTED;
    let key = '';
    let row;
    if (!inUnsorted) {
      const folder = parts.slice(0, -1).map(slug).join('/');
      key = [folder, slug(nameNoExt)].filter(Boolean).join('/');
      row = exact.get(key) ?? folders.get(folder);
      r.slot = key;
      if (!row) {
        const near = [...exact.keys()].filter((k) => k.startsWith(folder ? `${folder}/` : '') && (k.includes(slug(nameNoExt)) || slug(nameNoExt).includes(basename(k))));
        r.trang_thai = 'sai-ten'; r.ghi_chu = `Không có khung "${key}"${near.length ? ` - có phải: ${near.slice(0, 3).join(', ')}?` : ' - xem cột slot trong shotlist.csv'}`;
        continue;
      }
    }

    let buf;
    try { buf = readFileSync(file); } catch (e) { r.trang_thai = 'loi'; r.ghi_chu = e.message; continue; }
    const h = sha(buf);
    if (seen.has(h)) { r.trang_thai = 'trung'; r.ghi_chu = `Trùng ảnh với ${seen.get(h)}`; continue; }
    seen.set(h, rel);

    let meta;
    try { meta = await sharp(buf).metadata(); } catch { r.trang_thai = 'loi'; r.ghi_chu = 'File ảnh hỏng hoặc không đọc được'; continue; }
    const rot = (meta.orientation ?? 1) >= 5;
    const w = rot ? meta.height : meta.width;
    const hgt = rot ? meta.width : meta.height;

    let v;
    if (suggest || inUnsorted) {
      try { v = await vision(buf, [...exact.keys()]); } catch (e) {
        if (inUnsorted) { r.trang_thai = 'chua-phan-loai'; r.ghi_chu = `Cần xếp vào thư mục đúng (không gọi được mô hình ảnh: ${e.message})`; continue; }
        r.ghi_chu = `Không kiểm tra được bằng mô hình ảnh: ${e.message}. `;
      }
    }
    if (inUnsorted) {
      const target = v?.loai === 'banner' ? v.banner_goi_y : v?.loai === 'co-so-vat-chat' ? `co-so-vat-chat/${slug(nameNoExt)}` : v?.loai;
      r.slot = target ?? '';
      r.trang_thai = 'goi-y';
      r.ghi_chu = `Gợi ý: ${v?.loai ?? '?'}${target && target !== v?.loai ? ` -> ${target}` : ''}${v?.co_tre_em ? ' · CÓ TRẺ EM - kiểm tra sổ đồng ý' : ''} · alt: ${v?.alt ?? ''}. Chuyển file vào thư mục/tên đó để nhập.`;
      continue;
    }

    if (!row.nguoi_duyet) { r.trang_thai = 'cho-duyet'; r.ghi_chu += `Khung "${row.slot}" chưa có người duyệt (cột nguoi_duyet)`; continue; }
    if (Math.max(w, hgt) < MIN_EDGE) { r.trang_thai = 'loi'; r.ghi_chu += `Ảnh quá nhỏ (${w}x${hgt}), cần cạnh dài ≥ ${MIN_EDGE}px`; continue; }
    if (v?.co_tre_em && !flag('--allow-children')) {
      r.trang_thai = 'giu-lai'; r.ghi_chu += 'Mô hình ảnh thấy có thể có trẻ em: kiểm tra sổ đồng ý, rồi chạy lại với --allow-children'; continue;
    }
    const want = Number.parseInt(row.toi_thieu_px, 10) || 0;
    const side = /dọc|doc/i.test(row.toi_thieu_px) ? hgt : w;
    if (want && side < want) r.ghi_chu += `Độ phân giải thấp (${w}x${hgt}, nên ≥ ${row.toi_thieu_px}). `;
    if (row.ti_le === '4 / 5' && w > hgt) r.ghi_chu += 'Khung dọc 4:5 nhưng ảnh ngang - sẽ bị cắt nhiều. ';

    const old = existingFor(key);
    const out = await encode(buf);
    const dest = join(PHOTOS_DIR, `${key}.jpg`);
    if (old.length && old.some((p) => existsSync(p) && sha(readFileSync(p)) === sha(out))) { r.trang_thai = 'khong-doi'; r.ghi_chu += 'Ảnh này đã có trên web'; continue; }
    if (old.length && !flag('--overwrite')) { r.trang_thai = 'da-co-anh'; r.ghi_chu += 'Khung đã có ảnh khác - chạy lại với --overwrite để thay'; continue; }

    const isFolder = !exact.has(key);
    const humanName = nameNoExt.replace(/^[\d\s._-]+/, '').trim();
    const alt = (isFolder ? (humanName.length >= 3 ? humanName : row.alt) : row.alt) || v?.alt || '';
    r.trang_thai = APPLY ? 'da-nhap' : 'se-nhap';
    r.ghi_chu += `${(out.length / 1024).toFixed(0)}KB${alt ? ` · alt: ${alt}` : ' · THIẾU alt'}`;
    if (APPLY) {
      mkdirSync(dirname(dest), { recursive: true });
      for (const p of old) renameSync(p, `${p}.${Date.now()}.replaced`); // keep the old photo, never silently lose one
      writeFileSync(dest, out);
      if (alt && altDoc.alt[key] !== alt && (!altDoc.alt[key] || flag('--overwrite'))) altDoc.alt[key] = alt;
      imported++;
    }
  }

  if (APPLY && imported) writeFileSync(ALT_FILE, JSON.stringify(altDoc, null, 2) + '\n');
  writeCsv(join(INBOX, REPORT), ['file', 'slot', 'trang_thai', 'ghi_chu'], report);

  const count = report.reduce((m, x) => ((m[x.trang_thai] = (m[x.trang_thai] ?? 0) + 1), m), {});
  for (const x of report) console.log(`${x.trang_thai.padEnd(14)} ${x.file}${x.slot && x.slot !== x.file ? ` -> ${x.slot}` : ''}  ${x.ghi_chu}`);
  console.log(`\n[photos] ${APPLY ? 'ĐÃ NHẬP' : 'CHẠY THỬ (chưa ghi gì)'}: ${JSON.stringify(count)}`);
  console.log(`[photos] Báo cáo: ${join(INBOX, REPORT)}`);
  if (!APPLY && count['se-nhap']) console.log('[photos] Chạy "npm run photos:apply" để nhập thật, rồi xem /khung-anh/ trong npm run dev.');
  if (APPLY && imported) {
    const replaced = walk(PHOTOS_DIR).filter((f) => f.endsWith('.replaced'));
    if (replaced.length) console.log(`[photos] Ảnh cũ được giữ bản sao *.replaced (${replaced.length}) - xoá sau khi kiểm tra.`);
  }
}

if (cmd === 'shotlist') cmdShotlist();
else if (cmd === 'import') await cmdImport();
else { console.error(`Lệnh không rõ: ${cmd} (dùng: shotlist | import [--apply])`); process.exit(1); }
