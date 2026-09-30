# Ảnh cho website (image frames)

Drop a photo here with the right file name and it appears in its frame on the next
build (cropped to the frame, converted to AVIF/WebP). Any of .jpg .jpeg .png .webp .avif.
Open http://localhost:4321/khung-anh/ while `npm run dev` runs to see every frame and
whether it is filled.

| File | Where it shows |
|---|---|
| `home-hero.jpg` | Homepage, large photo at the top |
| `home-ly-do-1.jpg` … `home-ly-do-3.jpg` | Homepage, the 3 "Vì sao chọn" cards (same order as src/data/home-reasons.json) |
| `co-so-vat-chat/*.jpg` | Every photo in this folder: homepage facility strip (first 4) + Cơ sở vật chất gallery. Name them `01-phong-hoc.jpg`, `02-san-choi.jpg`… to set the order |
| `banners/<page>.jpg` | Photo in the header band of that page. `<page>` = the URL with `/` → `-`: `gioi-thieu.jpg`, `lien-he.jpg`, `cong-khai-tai-chinh.jpg`, `giao-duc-tuyen-sinh-thuc-don.jpg` |
| `giao-vien/<name>.jpg` | Teacher portrait (4:5). `<name>` = teacher name without accents, e.g. "Cô Lan Anh" → `co-lan-anh.jpg` |
| `lop-hoc/<class>.jpg` | Class photo. "Mầm 1" → `mam-1.jpg` |

Alt text (what the photo shows, for screen readers): `src/data/photos.json`.

**Rules (website/AGENTS.md):** no photos where a child can be identified unless the
parent's written consent is in the school's consent register. Staff portraits: 4:5,
≥ 1200 px tall, plain light background (spec §6.7). Keep each file under ~2 MB; the
build makes the web-sized copies. Photos are stripped of GPS/EXIF data by the build.
