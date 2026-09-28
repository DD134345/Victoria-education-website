// Vietnamese-aware slugify. Rules: docs/NEWTON-BUILD-INSTRUCTIONS.md §13.4.
// NFD-normalise, drop combining marks, đ/Đ -> d, lowercase, non [a-z0-9] -> '-',
// collapse repeats, trim '-', max 80 chars at a word boundary.
// Collision suffixes (-2, -3, ...) are the caller's job (checked against the repo tree).

const MAX_LEN = 80;

export function slug(input: string): string {
  const noDStroke = input.replace(/đ/g, 'd').replace(/Đ/g, 'D');
  const decomposed = noDStroke.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const kebab = decomposed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (kebab.length <= MAX_LEN) return kebab;
  const cut = kebab.slice(0, MAX_LEN);
  const lastDash = cut.lastIndexOf('-');
  return (lastDash > 0 ? cut.slice(0, lastDash) : cut).replace(/-$/, '');
}
