// Writes redirect stubs whose source paths differ from a real page only by
// case (/People → /people, /Research → /research). These cannot live in
// astro.config.mjs redirects: on a case-insensitive filesystem the stub and
// the real page are the same file, and the stub overwrites the page.
// Run only on a case-sensitive filesystem (CI/Linux) after `astro build`.
import { mkdirSync, writeFileSync, existsSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const SITE = 'https://www.jinguo-group.science';
const REDIRECTS = { '/People': '/people', '/Research': '/research' };

// Case-sensitivity probe: on macOS, dist/people exists AND dist/People "exists".
const probe = join('dist', 'CASE-PROBE-Aa');
mkdirSync(probe, { recursive: true });
const caseInsensitive = existsSync(join('dist', 'case-probe-aa'));
rmSync(probe, { recursive: true, force: true });
if (caseInsensitive) {
  console.log('case-insensitive filesystem — skipping case-variant redirect stubs');
  process.exit(0);
}

for (const [from, to] of Object.entries(REDIRECTS)) {
  const dir = join('dist', from.slice(1));
  mkdirSync(dir, { recursive: true });
  const stub = `<!doctype html><title>Redirecting to: ${to}</title><meta http-equiv="refresh" content="0;url=${to}"><meta name="robots" content="noindex"><link rel="canonical" href="${SITE}${to}"><body>\t<a href="${to}">Redirecting from <code>${from}/</code> to <code>${to}</code></a></body>`;
  writeFileSync(join(dir, 'index.html'), stub);
  // sanity: the real lowercase page must still be intact (not a redirect stub)
  const real = readFileSync(join('dist', to.slice(1), 'index.html'), 'utf8');
  if (real.includes('http-equiv="refresh"')) {
    console.error(`ERROR: ${to} page was clobbered by the ${from} stub`);
    process.exit(1);
  }
  console.log(`wrote redirect stub ${from}/ -> ${to}`);
}
