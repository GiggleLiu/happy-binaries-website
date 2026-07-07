import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const htmlFiles = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.html')) htmlFiles.push(p);
  }
})(DIST);

const broken = [];
for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  for (const m of html.matchAll(/(?:href|src)="(\/[^"#?]*)/g)) {
    const url = decodeURIComponent(m[1]);
    const clean = url.endsWith('/') ? url + 'index.html' : url;
    const candidates = [join(DIST, clean), join(DIST, url, 'index.html'), join(DIST, url + '.html')];
    if (!candidates.some((c) => existsSync(c))) broken.push(`${file}: ${url}`);
  }
}
if (broken.length) {
  console.error(`BROKEN LINKS (${broken.length}):\n` + broken.join('\n'));
  process.exit(1);
}
console.log(`OK: ${htmlFiles.length} pages, no broken internal links.`);
