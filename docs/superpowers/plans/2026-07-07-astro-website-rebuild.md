# Astro Website Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Franklin.jl group website with a hand-rolled Astro site: dark terminal aesthetic, data-driven pages, auto-generated blog index, same domain and preserved URLs.

**Architecture:** Astro 5 static site, no theme, no Tailwind, zero client-side JS. Design system lives in one `tokens.css` file. Blog posts are a content collection with zod-validated frontmatter; people/software/talks are YAML data files imported at build time. Old Franklin URLs are preserved via Astro's `redirects` (meta-refresh pages). Deploy stays on the existing gh-pages branch via GitHub Actions.

**Tech Stack:** Astro ^5, @astrojs/rss, @astrojs/sitemap, remark-math + rehype-katex + katex (math), Shiki (built into Astro, code highlighting), @fontsource/jetbrains-mono (self-hosted font), @rollup/plugin-yaml (YAML data imports).

**Spec:** `docs/superpowers/specs/2026-07-07-website-refactor-design.md`

## Execution Note: Division of Labor

Per user direction: the main (creative) agent handles design and copy decisions itself; mechanical tasks are dispatched to Opus subagents.

- **Creative (main agent, inline):** Task 2 (design system), Task 8 (home copy), Task 9 (join copy), Task 10 (about copy), copy edits in Task 13.
- **Mechanical (dispatch to Opus subagents):** Task 1 (scaffold), Task 3 (asset copy), Task 4 (post migration — frontmatter given verbatim), Task 5 (blog index/RSS — code given verbatim), Task 6 (people.yaml transcription + page), Task 7 (talks/software transcription; page code given), Task 11 (link checker), Task 12 (CI/README), Task 14 (teardown).
- Task 13 (verification) runs in the main agent since it gates the user preview.

## Global Constraints

- Work on branch `astro-rebuild`. Franklin files stay in place until Task 14 (they don't conflict — Astro uses `src/`, `public/`, `dist/`).
- Domain `www.jinguo-group.science` unchanged; `CNAME` and `google6e9457df963367ed.html` must ship in `public/`.
- Zero client-side JavaScript anywhere. No hamburger menu — nav wraps on mobile.
- Dark-only theme. Background `#0d1117` family, accent phosphor green. Print stylesheet flips to light.
- All asset URLs keep the `/assets/...` prefix so existing deep links keep working.
- Old page URLs must redirect: `/Blogs/ /Research/ /People/ /PhdProgram/ /Personal/ /training/ /culture/ /workflow/` and the four old flat blog-post paths.
- Blog post slugs preserved: `/blog/vibe-coding/`, `/blog/git-workflow/`, `/blog/sustainable-automation/`, `/blog/give-ai-agents-a-clock/`, zh sibling at `/blog/give-ai-agents-a-clock/zh/`.
- RSS at `/feed.xml` (Franklin's path).
- Publications is NOT a page — nav link to `https://scholar.google.com/citations?user=4edw228AAAAJ`.
- Commit after every task. Never commit `dist/` or `node_modules/`.
- Node ≥ 22 (dev machine has v26). Pin via `.nvmrc`.

---

### Task 1: Branch + Astro scaffold

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.nvmrc`
- Modify: `.gitignore`
- Create: `src/pages/index.astro` (placeholder, replaced in Task 8)

**Interfaces:**
- Produces: `npm run build` → static site in `dist/`; `npm run dev` → local preview. `astro.config.mjs` exports site URL `https://www.jinguo-group.science` used by sitemap/RSS.

- [ ] **Step 1: Create branch**

```bash
git checkout -b astro-rebuild
```

- [ ] **Step 2: Write package.json**

```json
{
  "name": "happy-binaries-website",
  "type": "module",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "node scripts/check-links.mjs"
  },
  "dependencies": {
    "@astrojs/rss": "^4.0.0",
    "@astrojs/sitemap": "^3.0.0",
    "@fontsource/jetbrains-mono": "^5.0.0",
    "astro": "^5.0.0",
    "katex": "^0.16.0",
    "rehype-katex": "^7.0.0",
    "remark-math": "^6.0.0"
  },
  "devDependencies": {
    "@rollup/plugin-yaml": "^4.1.0"
  }
}
```

- [ ] **Step 3: Write astro.config.mjs**

Redirects are included from the start so they're never forgotten.

```js
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import yaml from '@rollup/plugin-yaml';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
  site: 'https://www.jinguo-group.science',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  vite: { plugins: [yaml()] },
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
    shikiConfig: { theme: 'github-dark-default' },
  },
  redirects: {
    '/Blogs': '/blog',
    '/Research': '/research',
    '/People': '/people',
    '/PhdProgram': '/join',
    '/Personal': '/about',
    '/training': '/join',
    '/culture': '/join',
    '/workflow': '/join',
    '/vibe-coding': '/blog/vibe-coding',
    '/git-workflow': '/blog/git-workflow',
    '/sustainable-automation': '/blog/sustainable-automation',
    '/give-ai-agents-a-clock': '/blog/give-ai-agents-a-clock',
  },
});
```

- [ ] **Step 4: Write tsconfig.json and .nvmrc**

`tsconfig.json`:
```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "src/**/*"],
  "exclude": ["dist"]
}
```

`.nvmrc`:
```
22
```

- [ ] **Step 5: Update .gitignore**

Append these lines to the existing `.gitignore` (keep the Franklin entries for now):

```
node_modules/
dist/
.astro/
```

- [ ] **Step 6: Write placeholder src/pages/index.astro**

```astro
---
---
<html lang="en"><head><title>Jin-Guo Liu Group</title></head>
<body><h1>Jin-Guo Liu Group — under construction</h1></body></html>
```

- [ ] **Step 7: Install and verify the build fails-then-passes cycle**

```bash
npm install
npm run build
```
Expected: build completes, `dist/index.html` exists and `dist/Blogs/index.html` exists containing `http-equiv="refresh"`.

```bash
grep -l 'refresh' dist/Blogs/index.html && ls dist/index.html
```
Expected: both paths print.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json .nvmrc .gitignore src/pages/index.astro
git commit -m "feat: scaffold Astro project with redirects and math/yaml plumbing"
```

---

### Task 2: Design tokens, global styles, Base layout, Nav, Footer, 404

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/global.css`
- Create: `src/layouts/Base.astro`, `src/components/Nav.astro`, `src/components/Footer.astro`
- Create: `src/pages/404.astro`

**Interfaces:**
- Produces: `Base.astro` with props `{ title: string; description?: string }` — every page wraps in it. CSS classes used by later tasks: `.prompt-h` (heading with `>` marker), `.card`, `.btn-cmd`, `.tag`, `.crumb`, `.section`. CSS variables: `--bg, --bg-raised, --text, --muted, --border, --accent, --accent-dim, --font-mono, --font-body, --measure`.

- [ ] **Step 1: Write src/styles/tokens.css**

```css
/* The entire design system. Terminal aesthetic: dark, mono chrome, phosphor accent. */
:root {
  /* palette */
  --bg: #0d1117;
  --bg-raised: #161b22;
  --text: #e6edf3;
  --muted: #8b949e;
  --border: #30363d;
  --accent: #7ee787;        /* phosphor green — links, prompts, highlights */
  --accent-dim: #2ea043;    /* hover/borders of accent elements */
  /* Julia dot colors — tag accents only, use sparingly */
  --julia-purple: #9558b2;
  --julia-green: #389826;
  --julia-red: #cb3c33;
  --julia-blue: #4063d8;
  /* type */
  --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
  --font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans',
               'PingFang SC', 'Microsoft YaHei', sans-serif;
  /* layout */
  --measure: 44rem;         /* reading width */
  --wide: 62rem;            /* page width */
}
@media print {
  :root { --bg: #ffffff; --bg-raised: #f6f8fa; --text: #1f2328;
          --muted: #57606a; --border: #d0d7de; --accent: #1a7f37; --accent-dim: #1a7f37; }
}
```

- [ ] **Step 2: Write src/styles/global.css**

```css
@import './tokens.css';
@import '@fontsource/jetbrains-mono/400.css';
@import '@fontsource/jetbrains-mono/500.css';
@import '@fontsource/jetbrains-mono/700.css';

*, *::before, *::after { box-sizing: border-box; }
html { color-scheme: dark; }
@media print { html { color-scheme: light; } }
body {
  margin: 0; background: var(--bg); color: var(--text);
  font-family: var(--font-body); font-size: 1.0625rem; line-height: 1.7;
}
main { max-width: var(--wide); margin: 0 auto; padding: 1.5rem 1.25rem 4rem; }
h1, h2, h3, h4, nav, code, pre, .meta { font-family: var(--font-mono); }
h1 { font-size: 1.9rem; line-height: 1.25; }
h2 { font-size: 1.35rem; margin-top: 2.5rem; }
h3 { font-size: 1.1rem; }
a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }
img { max-width: 100%; height: auto; }
hr { border: 0; border-top: 1px solid var(--border); }
blockquote { border-left: 3px solid var(--accent-dim); margin-left: 0;
             padding-left: 1rem; color: var(--muted); }
table { border-collapse: collapse; width: 100%; font-size: 0.95rem; }
th, td { border: 1px solid var(--border); padding: 0.4rem 0.7rem; text-align: left; }
pre { background: var(--bg-raised) !important; border: 1px solid var(--border);
      border-radius: 6px; padding: 1rem; overflow-x: auto; font-size: 0.9rem; }
code { font-size: 0.92em; }
:not(pre) > code { background: var(--bg-raised); border: 1px solid var(--border);
                   border-radius: 4px; padding: 0.1em 0.35em; }

/* ── terminal chrome ─────────────────────────────── */
.prompt-h::before { content: '> '; color: var(--accent); }
.crumb { font-family: var(--font-mono); color: var(--muted); font-size: 0.9rem; }
.crumb a { color: var(--muted); }
.section { border-top: 1px solid var(--border); padding-top: 1.5rem; margin-top: 2.5rem; }
.card { background: var(--bg-raised); border: 1px solid var(--border);
        border-radius: 6px; padding: 1.1rem 1.3rem; margin-bottom: 1rem; }
.card:hover { border-color: var(--accent-dim); }
.btn-cmd { display: inline-block; font-family: var(--font-mono); font-size: 0.95rem;
           border: 1px solid var(--accent-dim); border-radius: 6px;
           padding: 0.45rem 1rem; color: var(--accent); }
.btn-cmd:hover { background: var(--bg-raised); text-decoration: none; }
.tag { display: inline-block; font-family: var(--font-mono); font-size: 0.78rem;
       color: var(--muted); border: 1px solid var(--border); border-radius: 999px;
       padding: 0.05rem 0.6rem; margin: 0 0.25rem 0.25rem 0; }
.meta { color: var(--muted); font-size: 0.85rem; }
.cursor::after { content: '█'; color: var(--accent); animation: blink 1.1s steps(1) infinite; }
@keyframes blink { 50% { opacity: 0; } }
@media print { .cursor::after { display: none; } }
```

- [ ] **Step 3: Write src/components/Nav.astro**

```astro
---
const items = [
  { href: '/research/', label: 'research' },
  { href: '/people/', label: 'people' },
  { href: '/blog/', label: 'blog' },
  { href: '/join/', label: 'join' },
  { href: '/about/', label: 'about' },
];
const { pathname } = Astro.url;
---
<header>
  <nav>
    <a class="logo" href="/">~/jinguo-group</a>
    <ul>
      {items.map((it) => (
        <li><a href={it.href} aria-current={pathname.startsWith(it.href) ? 'page' : undefined}>
          {it.label}</a></li>
      ))}
      <li><a href="https://scholar.google.com/citations?user=4edw228AAAAJ">publications ↗</a></li>
    </ul>
  </nav>
</header>
<style>
  header { border-bottom: 1px solid var(--border); }
  nav { max-width: var(--wide); margin: 0 auto; padding: 0.9rem 1.25rem;
        display: flex; flex-wrap: wrap; gap: 0.5rem 1.5rem; align-items: baseline;
        font-family: var(--font-mono); font-size: 0.95rem; }
  .logo { color: var(--text); font-weight: 700; }
  .logo::before { content: '$ '; color: var(--accent); }
  ul { display: flex; flex-wrap: wrap; gap: 0.25rem 1.1rem; list-style: none;
       margin: 0; padding: 0; }
  a { color: var(--muted); }
  a[aria-current='page'] { color: var(--accent); }
  a[aria-current='page']::before { content: '['; }
  a[aria-current='page']::after { content: ']'; }
</style>
```

- [ ] **Step 4: Write src/components/Footer.astro**

```astro
---
const year = new Date().getFullYear();
---
<footer>
  <div class="inner meta">
    <span>© {year} Jin-Guo Liu Group · HKUST(GZ)</span>
    <span>
      <a href="mailto:jinguoliu@hkust-gz.edu.cn">email</a> ·
      <a href="https://github.com/CodingThrust">github</a> ·
      <a href="http://zulip.hkust-gz.edu.cn/">zulip</a> ·
      <a href="/feed.xml">rss</a>
    </span>
  </div>
</footer>
<style>
  footer { border-top: 1px solid var(--border); margin-top: 3rem; }
  .inner { max-width: var(--wide); margin: 0 auto; padding: 1.2rem 1.25rem;
           display: flex; flex-wrap: wrap; gap: 0.5rem 2rem; justify-content: space-between; }
</style>
```

- [ ] **Step 5: Write src/layouts/Base.astro**

```astro
---
import '../styles/global.css';
import Nav from '../components/Nav.astro';
import Footer from '../components/Footer.astro';
interface Props { title: string; description?: string; }
const { title, description = 'Jin-Guo Liu research group at HKUST(Guangzhou): quantum computation, tensor networks, and open-source scientific computing.' } = Astro.props;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="icon" href="/assets/favicon.png" />
    <link rel="canonical" href={new URL(Astro.url.pathname, Astro.site)} />
    <link rel="alternate" type="application/rss+xml" title="Jin-Guo Liu Group" href="/feed.xml" />
  </head>
  <body>
    <Nav />
    <main><slot /></main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 6: Write src/pages/404.astro**

```astro
---
import Base from '../layouts/Base.astro';
---
<Base title="404 — Jin-Guo Liu Group">
  <pre>$ open {'{page}'}
zsh: command not found: {'{page}'}</pre>
  <p>The page you are looking for does not exist.</p>
  <p><a class="btn-cmd" href="/">[ cd ~ ]</a></p>
</Base>
```

- [ ] **Step 7: Point the placeholder index at Base**

Replace `src/pages/index.astro` content with:

```astro
---
import Base from '../layouts/Base.astro';
---
<Base title="Jin-Guo Liu Group">
  <h1 class="prompt-h">Jin-Guo Liu Group</h1>
  <p>Full home page lands in Task 8.</p>
</Base>
```

- [ ] **Step 8: Build and verify**

```bash
npm run build
grep -o '~/jinguo-group' dist/index.html
grep -o 'command not found' dist/404.html
grep -o 'scholar.google.com' dist/index.html
```
Expected: each grep prints its match. (favicon 404s until Task 3 — fine.)

- [ ] **Step 9: Commit**

```bash
git add src/styles src/layouts src/components src/pages
git commit -m "feat: terminal design system, base layout, nav, footer, 404"
```

---

### Task 3: Migrate static assets

**Files:**
- Create: `public/assets/**` (copied from `_assets/`), `public/CNAME`, `public/google6e9457df963367ed.html`, `public/robots.txt`

**Interfaces:**
- Produces: all images reachable at the same `/assets/...` URLs Franklin used; `dist/CNAME` present so the JamesIves deploy keeps the custom domain.

- [ ] **Step 1: Copy assets**

```bash
mkdir -p public/assets
cp -R _assets/avatars _assets/images _assets/slides public/assets/
cp _assets/group.jpg _assets/favicon.png public/assets/
# et-book fonts are Franklin-theme only — do NOT copy
cp google6e9457df963367ed.html public/
printf 'www.jinguo-group.science\n' > public/CNAME
printf 'User-agent: *\nAllow: /\nSitemap: https://www.jinguo-group.science/sitemap-index.xml\n' > public/robots.txt
```

- [ ] **Step 2: Build and verify**

```bash
npm run build
ls dist/CNAME dist/google6e9457df963367ed.html dist/assets/group.jpg \
   dist/assets/avatars/jinguoliu.png dist/assets/images/cryochamber-give-ai-agents-a-clock.jpg
```
Expected: all five paths listed, no error.

- [ ] **Step 3: Commit**

```bash
git add public
git commit -m "feat: migrate static assets to public/, keep /assets URLs, CNAME, robots"
```

---

### Task 4: Blog content collection, post migration, Post layout

**Files:**
- Create: `src/content.config.ts`
- Create: `src/content/blog/vibe-coding.md`, `src/content/blog/git-workflow.md`, `src/content/blog/sustainable-automation.md`, `src/content/blog/give-ai-agents-a-clock.md`, `src/content/blog/give-ai-agents-a-clock-zh.md` (from the five root `.md` files)
- Create: `src/layouts/Post.astro`, `src/pages/blog/[...slug].astro`

**Interfaces:**
- Consumes: `Base.astro` from Task 2.
- Produces: collection `blog` with schema `{ title: string; description: string; date: Date; tags: string[]; lang: 'en'|'zh'; translationOf?: string }`. URL rule used everywhere: en post → `/blog/<id>/`, zh post → `/blog/<translationOf>/zh/`. Helper exported from `src/lib/blog.ts`: `postUrl(entry): string` and `sortedEnPosts(entries): entries` (date desc, en only).

- [ ] **Step 1: Write src/content.config.ts**

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    lang: z.enum(['en', 'zh']).default('en'),
    translationOf: z.string().optional(),
  }),
});

export const collections = { blog };
```

- [ ] **Step 2: Write src/lib/blog.ts**

```ts
import type { CollectionEntry } from 'astro:content';

export function postUrl(entry: CollectionEntry<'blog'>): string {
  return entry.data.lang === 'zh' && entry.data.translationOf
    ? `/blog/${entry.data.translationOf}/zh/`
    : `/blog/${entry.id}/`;
}

export function sortedEnPosts(entries: CollectionEntry<'blog'>[]) {
  return entries
    .filter((e) => e.data.lang === 'en')
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}
```

- [ ] **Step 3: Migrate the five posts**

For each file: `git mv` it into the collection, replace the Franklin `+++ ... +++` frontmatter with YAML frontmatter, and **delete the duplicated `# <title>` heading line** from the body (the layout renders the title). Body text is otherwise unchanged — image paths (`/assets/images/...`) already work after Task 3.

```bash
mkdir -p src/content/blog
git mv vibe-coding.md src/content/blog/vibe-coding.md
git mv git-workflow.md src/content/blog/git-workflow.md
git mv sustainable-automation.md src/content/blog/sustainable-automation.md
git add give-ai-agents-a-clock.md give-ai-agents-a-clock_zh.md
git mv give-ai-agents-a-clock.md src/content/blog/give-ai-agents-a-clock.md
git mv give-ai-agents-a-clock_zh.md src/content/blog/give-ai-agents-a-clock-zh.md
```

Exact frontmatter replacements (descriptions taken from the old `Blogs.md` cards; dates from git history):

`vibe-coding.md`:
```yaml
---
title: "Vibe Coding Done Right"
description: "A systematic approach to AI-assisted coding through test-driven development, drawing parallels with quantum error correction."
date: 2026-01-10
tags: [ai, testing, software-engineering]
---
```

`git-workflow.md`:
```yaml
---
title: "The Necessity of Git in the Vibe Coding Era"
description: "A practical Git workflow guide for human-AI collaboration, explaining why Git is essential for vibe coding."
date: 2026-01-23
tags: [ai, git, software-engineering]
---
```

`sustainable-automation.md`:
```yaml
---
title: "Sustainable Automation: Programming the Programmer"
description: "Teaching AI to remember and follow procedures — with CLAUDE.md and Skills. The third in a trilogy on human-AI collaboration."
date: 2026-02-27
tags: [ai, agents, automation]
---
```

`give-ai-agents-a-clock.md`:
```yaml
---
title: "Give AI Agents a Clock"
description: "Hibernation infrastructure for agents that work across time, using Cryochamber's disk-size monitor as the running example."
date: 2026-07-07
tags: [ai, agents, automation, cryochamber]
---
```

`give-ai-agents-a-clock-zh.md`:
```yaml
---
title: "给 AI Agent 一个时钟"
description: "为跨越时间的 Agent 打造的休眠基础设施。"
date: 2026-07-07
tags: [ai, agents, automation, cryochamber]
lang: zh
translationOf: give-ai-agents-a-clock
---
```

In each file also remove the now-redundant first heading (e.g. the line `# Vibe Coding Done Right`). Keep any italic subtitle lines.

- [ ] **Step 4: Write src/layouts/Post.astro**

```astro
---
import 'katex/dist/katex.min.css';
import Base from './Base.astro';
import { getCollection, render } from 'astro:content';
import { postUrl } from '../lib/blog';
import type { CollectionEntry } from 'astro:content';

interface Props { entry: CollectionEntry<'blog'>; }
const { entry } = Astro.props;
const { Content } = await render(entry);

const all = await getCollection('blog');
const translation =
  entry.data.lang === 'en'
    ? all.find((e) => e.data.translationOf === entry.id)
    : all.find((e) => e.id === entry.data.translationOf);
const dateStr = entry.data.date.toISOString().slice(0, 10);
---
<Base title={`${entry.data.title} — Jin-Guo Liu Group`} description={entry.data.description}>
  <article lang={entry.data.lang}>
    <p class="crumb"><a href="/blog/">~/blog</a>/{entry.data.lang === 'zh' ? entry.data.translationOf + '/zh' : entry.id}</p>
    <h1>{entry.data.title}</h1>
    <p class="meta">
      {dateStr}
      {entry.data.tags.map((t) => <span class="tag">{t}</span>)}
      {translation && <> · <a href={postUrl(translation)}>{entry.data.lang === 'en' ? '中文版' : 'English'}</a></>}
    </p>
    <div class="prose"><Content /></div>
  </article>
</Base>
<style>
  article { max-width: var(--measure); margin: 0 auto; }
  .prose :global(img) { border: 1px solid var(--border); border-radius: 6px;
                        background: #fff; }
  .prose :global(h2) { border-bottom: 1px solid var(--border); padding-bottom: 0.3rem; }
</style>
```

- [ ] **Step 5: Write src/pages/blog/[...slug].astro**

```astro
---
import { getCollection } from 'astro:content';
import Post from '../../layouts/Post.astro';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map((entry) => ({
    params: {
      slug: entry.data.lang === 'zh' && entry.data.translationOf
        ? `${entry.data.translationOf}/zh`
        : entry.id,
    },
    props: { entry },
  }));
}
const { entry } = Astro.props;
---
<Post entry={entry} />
```

- [ ] **Step 6: Build and verify**

```bash
npm run build
ls dist/blog/vibe-coding/index.html dist/blog/git-workflow/index.html \
   dist/blog/sustainable-automation/index.html \
   dist/blog/give-ai-agents-a-clock/index.html \
   dist/blog/give-ai-agents-a-clock/zh/index.html
grep -o 'katex' dist/blog/vibe-coding/index.html | head -1
grep -o 'astro-code' dist/blog/git-workflow/index.html | head -1
grep -o '中文版' dist/blog/give-ai-agents-a-clock/index.html
```
Expected: five files listed; `katex` (math rendered), `astro-code` (Shiki applied), `中文版` (language switch) all print. If git-workflow has no code block, check vibe-coding instead — at least one migrated post must show `astro-code`.

- [ ] **Step 7: Verify frontmatter validation fails loudly**

Temporarily remove the `date:` line from `vibe-coding.md`, run `npm run build`, expect a zod validation error naming the file; restore the line, rebuild, expect success.

- [ ] **Step 8: Commit**

```bash
git add src/content.config.ts src/lib src/content src/layouts/Post.astro src/pages/blog
git commit -m "feat: blog content collection, migrate five posts, post layout with katex/shiki"
```

---

### Task 5: Blog index, tag pages, RSS

**Files:**
- Create: `src/pages/blog/index.astro`, `src/pages/blog/tags/[tag].astro`, `src/pages/feed.xml.js`
- Create: `src/components/PostList.astro`

**Interfaces:**
- Consumes: `sortedEnPosts`, `postUrl` from `src/lib/blog.ts`.
- Produces: `PostList.astro` with props `{ posts: CollectionEntry<'blog'>[] }` (reused on Home in Task 8).

- [ ] **Step 1: Write src/components/PostList.astro**

```astro
---
import { postUrl } from '../lib/blog';
import type { CollectionEntry } from 'astro:content';
interface Props { posts: CollectionEntry<'blog'>[]; }
const { posts } = Astro.props;
---
<ul class="postlist">
  {posts.map((p) => (
    <li>
      <span class="meta">{p.data.date.toISOString().slice(0, 10)}</span>
      <div>
        <a href={postUrl(p)}>{p.data.title}</a>
        <p class="meta">{p.data.description}</p>
        <span>{p.data.tags.map((t) => <a class="tag" href={`/blog/tags/${encodeURIComponent(t)}/`}>{t}</a>)}</span>
      </div>
    </li>
  ))}
</ul>
<style>
  .postlist { list-style: none; padding: 0; margin: 0; }
  .postlist li { display: flex; gap: 1.2rem; padding: 0.9rem 0;
                 border-bottom: 1px dashed var(--border); }
  .postlist li > span.meta { flex-shrink: 0; padding-top: 0.15rem; }
  .postlist p { margin: 0.2rem 0 0.4rem; }
</style>
```

- [ ] **Step 2: Write src/pages/blog/index.astro**

```astro
---
import Base from '../../layouts/Base.astro';
import PostList from '../../components/PostList.astro';
import { getCollection } from 'astro:content';
import { sortedEnPosts } from '../../lib/blog';
const posts = sortedEnPosts(await getCollection('blog'));
---
<Base title="Blog — Jin-Guo Liu Group">
  <p class="crumb">~/blog</p>
  <h1 class="prompt-h">Blog</h1>
  <PostList posts={posts} />

  <div class="section">
    <h2 class="prompt-h">Elsewhere</h2>
    <div class="card">
      <strong>Scientific Computing for Physicists</strong> — our group's book on
      scientific computing with Julia: tensor networks, optimization, numerical methods.
      <a href="https://scfp.jinguo-group.science/">read online →</a>
    </div>
    <div class="card">
      <strong>知乎 (Zhihu)</strong> — technical articles in Chinese on quantum
      computing, tensor networks, and Julia.
      <a href="https://www.zhihu.com/people/leo-31-42">GiggleLiu on Zhihu →</a>
    </div>
  </div>
</Base>
```

- [ ] **Step 3: Write src/pages/blog/tags/[tag].astro**

```astro
---
import Base from '../../../layouts/Base.astro';
import PostList from '../../../components/PostList.astro';
import { getCollection } from 'astro:content';
import { sortedEnPosts } from '../../../lib/blog';

export async function getStaticPaths() {
  const posts = sortedEnPosts(await getCollection('blog'));
  const tags = [...new Set(posts.flatMap((p) => p.data.tags))];
  return tags.map((tag) => ({
    params: { tag },
    props: { posts: posts.filter((p) => p.data.tags.includes(tag)) },
  }));
}
const { tag } = Astro.params;
const { posts } = Astro.props;
---
<Base title={`#${tag} — Jin-Guo Liu Group`}>
  <p class="crumb"><a href="/blog/">~/blog</a>/tags/{tag}</p>
  <h1 class="prompt-h">grep -r "{tag}"</h1>
  <PostList posts={posts} />
</Base>
```

- [ ] **Step 4: Write src/pages/feed.xml.js**

```js
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { sortedEnPosts, postUrl } from '../lib/blog';

export async function GET(context) {
  const posts = sortedEnPosts(await getCollection('blog'));
  return rss({
    title: 'Jin-Guo Liu Group',
    description: 'Quantum computation, tensor networks, and open-source scientific computing at HKUST(GZ).',
    site: context.site,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.date,
      link: postUrl(p),
    })),
  });
}
```

- [ ] **Step 5: Build and verify**

```bash
npm run build
grep -c '<item>' dist/feed.xml
grep -o 'Give AI Agents a Clock' dist/blog/index.html | head -1
grep -o 'scfp.jinguo-group.science' dist/blog/index.html
ls dist/blog/tags/ai/index.html
grep -c '给 AI Agent' dist/blog/index.html || true
```
Expected: `4` items in feed; title and book link found; tag page exists; last grep prints `0` (zh post not listed on the index — it's reachable via the language switch).

- [ ] **Step 6: Commit**

```bash
git add src/pages/blog src/pages/feed.xml.js src/components/PostList.astro
git commit -m "feat: blog index, tag pages, and RSS at /feed.xml"
```

---

### Task 6: people.yaml + People page

**Files:**
- Create: `src/data/people.yaml`, `src/components/MemberCard.astro`, `src/pages/people.astro`

**Interfaces:**
- Produces: `people.yaml` — array of `{ name, hanzi, role: 'advisor'|'phd'|'ra'|'alumni', avatar, bio?, links?: {label, url}[], tags?: string[] }`. `MemberCard.astro` props `{ person }`.

- [ ] **Step 1: Write src/data/people.yaml**

Bios carried over from the old `People.md` (they are member data, not page copy). Full file:

```yaml
- name: Jin-Guo Liu
  hanzi: 刘金国
  role: advisor
  avatar: /assets/avatars/jinguoliu.png
  bio: >-
    Assistant professor at HKUST(Guangzhou), Advanced Materials Thrust and the
    Quantum Science and Technology Center. PhD from Nanjing University (2017);
    postdoc at IOP CAS and Harvard University. Main author of the quantum
    simulator Yao.jl. Interested in simulating the physical world numerically
    and understanding computation from a physics perspective.
  links:
    - { label: About page, url: /about/ }
    - { label: Google Scholar, url: "https://scholar.google.com/citations?user=4edw228AAAAJ" }
    - { label: GitHub, url: "https://github.com/GiggleLiu" }
  tags: [quantum information, tensor networks, Julia]
- name: Yu-Sheng Zhao
  hanzi: 赵昱圣
  role: phd
  avatar: /assets/avatars/yushengzhao.jpg
  bio: >-
    PhD candidate. B.A. in Physics and Computer Science from NYU, M.A. in
    Physics from Stony Brook University. Works on formulating hard optimization
    problems (such as the quantum ground-state problem) as polynomial
    optimization problems and solving them with semidefinite programs.
  links:
    - { label: Homepage, url: "https://exaclior.github.io/" }
    - { label: Email, url: "mailto:yzhao053@connect.hkust-gz.edu.cn" }
  tags: [polynomial optimization, semidefinite program]
- name: Zhong-Yi Ni
  hanzi: 倪中一
  role: phd
  avatar: /assets/avatars/zhongyini.jpg
  bio: >-
    Dual B.Sc. in Mathematics and Electronic Information Science from Fudan
    University. PhD student since 2023, working on scientific computing and
    quantum error correction. Maintains TensorQEC.jl, a Julia package using
    tensor networks to decode and simulate quantum error-correcting codes.
  links:
    - { label: Email, url: "mailto:zni573@connect.hkust-gz.edu.cn" }
    - { label: TensorQEC.jl, url: "https://github.com/QuantumBFS/TensorQEC.jl" }
  tags: [quantum error correction, tensor networks]
- name: Qing-Yun Qian
  hanzi: 钱青云
  role: phd
  avatar: /assets/avatars/qingyunqian.jpg
  bio: >-
    B.Sc. in Physics from Suzhou University of Science and Technology. PhD
    student since 2023, focusing on quantum thermodynamics and quantum
    many-body physics. Contributed to PXPConstraint.jl for simulating
    constrained PXP dynamics; explores quantum many-body scars as quantum
    batteries.
  links:
    - { label: Email, url: "mailto:qingyunq.physica@gmail.com" }
  tags: [quantum thermodynamics, quantum many-body physics, Rydberg atoms]
- name: Yu-Qing Rong
  hanzi: 容雨晴
  role: phd
  avatar: /assets/avatars/yuqingrong.png
  bio: >-
    B.S. in Physics from Guangzhou University. Joined in 2024, working on
    isometric PEPS on Rydberg atom arrays: tensor-network variational
    optimization, compiling isoPEPS to quantum circuits, and designing isoPEPS
    ansätze for Rydberg platforms.
  links:
    - { label: Email, url: "mailto:qqian716@connect.hkust-gz.edu.cn" }
  tags: [tensor networks, quantum simulation]
- name: Long-Li Zheng
  hanzi: 郑隆立
  role: phd
  avatar: /assets/avatars/longlizheng.png
  bio: >-
    B.Sc. in Physics from Shandong University. PhD student since 2024, working
    on crystal material design and structure prediction: 2D material generation
    with machine learning, and structure search via ab initio calculation and
    mathematical optimization.
  links:
    - { label: Email, url: "mailto:lzheng228@connect.hkust-gz.edu.cn" }
  tags: [materials science, machine learning]
- name: Han Wang
  hanzi: 王涵
  role: phd
  avatar: /assets/avatars/hanwang.png
  bio: >-
    B.S. from East China Normal University, M.S. in Atomic and Molecular
    Physics from ECNU. Joined in 2024, focusing on topologically protected
    fault-tolerant quantum computation and Rydberg-atom-based universal quantum
    cellular automata.
  links:
    - { label: Email, url: "mailto:hwang924@connect.hkust-gz.edu.cn" }
  tags: [neutral-atom quantum computation, Rydberg atoms, quantum error correction]
- name: Kai-Wen Jin
  hanzi: 靳开文
  role: phd
  avatar: /assets/avatars/kaiwenjin.png
  bio: >-
    B.Sc. in Mathematics from Nankai University. PhD student since 2024,
    focusing on automatic differentiation and numerical algorithms: backward
    rules for linear and semidefinite programs, and sensitivity analysis of
    analytic continuation for Green's functions.
  links:
    - { label: Email, url: "mailto:kjing327@connect.hkust-gz.edu.cn" }
  tags: [numerical algorithms, automatic differentiation]
- name: Huan-Hai Zhou
  hanzi: 周唤海
  role: phd
  avatar: /assets/avatars/huanhaizhou.png
  bio: >-
    B.Sc. in Software Engineering from Tsinghua University, M.Sc. in Physics
    from CUHK. PhD student since 2024, developing computational many-body
    methods that combine optimization tools and tensor networks, inspired by
    bootstrap approaches.
  links:
    - { label: Email, url: "mailto:albus.zhouhh@gmail.com" }
  tags: [quantum many-body physics, optimization]
- name: Xiao-Feng Li
  hanzi: 李晓锋
  role: ra
  avatar: /assets/avatars/xiaofengli.png
  bio: >-
    Pursuing a B.Eng. in Artificial Intelligence at HKUST(GZ); joined as a
    research assistant in 2024 through UGRP. Develops and maintains
    ProblemReductions.jl, a Julia package for reductions between
    computationally hard problems.
  links:
    - { label: Email, url: "mailto:xli683@connect.hkust-gz.edu.cn" }
    - { label: ProblemReductions.jl, url: "https://github.com/Happy-Binaries/ProblemReductions.jl" }
  tags: [computational complexity]
- name: Yi-Dai Zhang
  hanzi: 张伊代
  role: alumni
  avatar: /assets/avatars/yidaizhang.jpeg
  links:
    - { label: Email, url: "mailto:yzhang958@connect.hkust-gz.edu.cn" }
```

- [ ] **Step 2: Write src/components/MemberCard.astro**

```astro
---
interface Props { person: any; }
const { person } = Astro.props;
---
<div class="card member" class:list={{ alumni: person.role === 'alumni' }}>
  <img src={person.avatar} alt={person.name} width="110" height="110" loading="lazy" />
  <div>
    <h3>{person.name} <span class="meta">({person.hanzi})</span></h3>
    {person.bio && <p>{person.bio}</p>}
    {person.links && (
      <p class="meta">{person.links.map((l: any, i: number) =>
        <>{i > 0 && ' · '}<a href={l.url}>{l.label}</a></>)}</p>
    )}
    {person.tags && <span>{person.tags.map((t: string) => <span class="tag">{t}</span>)}</span>}
  </div>
</div>
<style>
  .member { display: flex; gap: 1.3rem; }
  .member img { border-radius: 6px; border: 1px solid var(--border);
                object-fit: cover; flex-shrink: 0; }
  .member h3 { margin: 0 0 0.4rem; }
  .member p { margin: 0 0 0.5rem; font-size: 0.95rem; }
  .alumni { opacity: 0.75; }
  @media (max-width: 540px) { .member { flex-direction: column; } }
</style>
```

- [ ] **Step 3: Write src/pages/people.astro**

```astro
---
import Base from '../layouts/Base.astro';
import MemberCard from '../components/MemberCard.astro';
import people from '../data/people.yaml';

const groups: [string, string][] = [
  ['advisor', 'Advisor'], ['phd', 'PhD Students'],
  ['ra', 'Research Assistants'], ['alumni', 'Alumni'],
];
---
<Base title="People — Jin-Guo Liu Group">
  <p class="crumb">~/people</p>
  <h1 class="prompt-h">People</h1>
  {groups.map(([role, label]) => {
    const members = (people as any[]).filter((p) => p.role === role);
    return members.length > 0 && (
      <section class="section">
        <h2 class="prompt-h">{label}</h2>
        {members.map((p) => <MemberCard person={p} />)}
      </section>
    );
  })}
</Base>
```

- [ ] **Step 4: Add YAML module type declaration**

Create `src/env.d.ts`:
```ts
declare module '*.yaml' {
  const value: any;
  export default value;
}
```

- [ ] **Step 5: Build and verify**

```bash
npm run build
for n in "Jin-Guo Liu" "Yu-Sheng Zhao" "Zhong-Yi Ni" "Qing-Yun Qian" "Yu-Qing Rong" \
         "Long-Li Zheng" "Han Wang" "Kai-Wen Jin" "Huan-Hai Zhou" "Xiao-Feng Li" \
         "Yi-Dai Zhang"; do grep -q "$n" dist/people/index.html || echo "MISSING: $n"; done
```
Expected: no `MISSING:` lines.

- [ ] **Step 6: Commit**

```bash
git add src/data/people.yaml src/components/MemberCard.astro src/pages/people.astro src/env.d.ts
git commit -m "feat: data-driven people page from people.yaml"
```

---

### Task 7: software.yaml + talks.yaml + Research page

**Files:**
- Create: `src/data/software.yaml`, `src/data/talks.yaml`, `src/pages/research.astro`

**Interfaces:**
- Consumes: `Base.astro`.
- Produces: `software.yaml` — array of `{ name, repo, blurb, role }`; `talks.yaml` — array of `{ date, venue, venue_url?, title, type, links?: {label,url}[] }`, newest first. Home (Task 8) imports `software.yaml`.

- [ ] **Step 1: Write src/data/software.yaml**

```yaml
- name: Yao.jl
  repo: https://github.com/QuantumBFS/Yao.jl
  blurb: Extensible, efficient quantum algorithm design framework — one of the fastest quantum circuit simulators.
  role: co-author
- name: OMEinsum.jl
  repo: https://github.com/under-Peter/OMEinsum.jl
  blurb: Einstein-summation engine with hyper-optimized contraction-order search, the backbone of our tensor-network stack.
  role: maintainer
- name: GenericTensorNetworks.jl
  repo: https://github.com/QuEraComputing/GenericTensorNetworks.jl
  blurb: Solution-space properties of combinatorial optimization problems via generic tensor networks.
  role: author
- name: TensorQEC.jl
  repo: https://github.com/QuantumBFS/TensorQEC.jl
  blurb: Tensor-network decoding and simulation of quantum error-correcting codes.
  role: group project
- name: ProblemReductions.jl
  repo: https://github.com/Happy-Binaries/ProblemReductions.jl
  blurb: Reductions between computationally hard problems (spin glass, SAT, ...).
  role: group project
- name: TensorInference.jl
  repo: https://github.com/TensorBFS/TensorInference.jl
  blurb: Probabilistic inference on graphical models with tensor networks and differentiable programming.
  role: author
```

- [ ] **Step 2: Write src/data/talks.yaml**

Convert **every** entry of the old `Research.md` "Talks & Presentations" section (lines 65–113 of the Franklin file; it is still on disk during this task) into this schema, newest first. The two most recent entries, fully converted, as the format reference:

```yaml
- date: 2025-01-13
  venue: '"100 Years of Matrix Mechanics" International Symposium'
  venue_url: https://qlab.bimsa.cn/events/matrix/2025/
  title: Automated Discovery of Branching Rules with Optimal Complexity for the Maximum Independent Set Problem
  type: invited talk
- date: 2024-12-25
  venue: CompQu online seminar series
  title: 'Gadget design: towards embedding computational hard problems to physical devices'
  type: seminar talk
```

Conversion rules: `date` is the first day when a range is given; keep venue links as `venue_url`; talk-material links (Video/Slides/Notes/Poster/Photo) become `links: [{label, url}]` — slide/photo paths keep their `/assets/...` URLs; entries where the role isn't a talk (e.g. "Organizer", "Committee member") use that role string as `type` and omit `title`; Chinese venue names are kept verbatim. When done, `grep -c '^- date:' src/data/talks.yaml` must equal the number of `*` bullets in the old list (count them: expected 20).

- [ ] **Step 3: Write src/pages/research.astro**

```astro
---
import Base from '../layouts/Base.astro';
import software from '../data/software.yaml';
import talks from '../data/talks.yaml';

const topics = [
  {
    title: 'Tensor networks',
    body: 'Contraction-order optimization and generic tensor networks — a unified framework we use to compute solution-space properties of combinatorial optimization problems and to run probabilistic inference on graphical models.',
  },
  {
    title: 'Quantum computation & error correction',
    body: 'Quantum algorithm design and simulation (Yao.jl), tensor-network decoders for quantum error-correcting codes, universal quantum computing with a single arbitrary gate, and algorithms for neutral-atom (Rydberg) hardware.',
  },
  {
    title: 'Computational complexity',
    body: 'The nature of computation from a physics perspective: problem reductions, automated discovery of branching rules with optimal complexity, and embedding hard problems into physical devices.',
  },
  {
    title: 'AI-native scientific computing',
    body: 'Automatic differentiation through numerical methods, and human-AI collaboration workflows for building research software — test-driven vibe coding, agent infrastructure, sustainable automation.',
  },
];
---
<Base title="Research — Jin-Guo Liu Group">
  <p class="crumb">~/research</p>
  <h1 class="prompt-h">Research</h1>
  <p>
    We sit at the intersection of computation and physics: using numerical
    methods to simulate the physical world, and using physics to understand the
    nature of computation. Our full publication list lives on
    <a href="https://scholar.google.com/citations?user=4edw228AAAAJ">Google Scholar ↗</a>.
  </p>

  {topics.map((t) => (
    <section class="section">
      <h2 class="prompt-h">{t.title}</h2>
      <p>{t.body}</p>
    </section>
  ))}

  <section class="section">
    <h2 class="prompt-h">ls software/</h2>
    <p>Research here ships as open-source Julia packages. Group organizations:
      <a href="https://github.com/CodingThrust">CodingThrust</a>,
      <a href="https://github.com/QuantumBFS">QuantumBFS</a>,
      <a href="https://github.com/Happy-Binaries">Happy-Binaries</a>.</p>
    {(software as any[]).map((s) => (
      <div class="card">
        <strong><a href={s.repo}>{s.name}</a></strong>
        <span class="tag">{s.role}</span>
        <p style="margin: 0.3rem 0 0;">{s.blurb}</p>
      </div>
    ))}
  </section>

  <section class="section">
    <h2 class="prompt-h">Selected talks</h2>
    <details>
      <summary class="meta">{(talks as any[]).length} talks since 2023 — expand</summary>
      <ul>
        {(talks as any[]).map((t) => (
          <li>
            <span class="meta">{String(t.date).slice(0, 10)}</span> —
            {t.venue_url ? <a href={t.venue_url}>{t.venue}</a> : t.venue}
            {t.title && <> · <em>{t.title}</em></>}
            <span class="tag">{t.type}</span>
            {t.links && t.links.map((l: any) => <> <a href={l.url}>[{l.label}]</a></>)}
          </li>
        ))}
      </ul>
    </details>
  </section>
</Base>
```

- [ ] **Step 4: Build and verify**

```bash
npm run build
grep -o 'Yao.jl' dist/research/index.html | head -1
grep -o 'Selected talks' dist/research/index.html
grep -c '<li>' dist/research/index.html
grep -c '^- date:' src/data/talks.yaml
```
Expected: `Yao.jl` and `Selected talks` found; the two counts printed last are consistent (talks list items = talks in YAML; expected 20).

- [ ] **Step 5: Commit**

```bash
git add src/data/software.yaml src/data/talks.yaml src/pages/research.astro
git commit -m "feat: research page with topics, software showcase, talks from YAML"
```

---

### Task 8: Home page

**Files:**
- Modify: `src/pages/index.astro` (replace placeholder)

**Interfaces:**
- Consumes: `PostList.astro`, `sortedEnPosts`, `software.yaml`.

- [ ] **Step 1: Write src/pages/index.astro**

```astro
---
import Base from '../layouts/Base.astro';
import PostList from '../components/PostList.astro';
import { getCollection } from 'astro:content';
import { sortedEnPosts } from '../lib/blog';
import software from '../data/software.yaml';
const latest = sortedEnPosts(await getCollection('blog')).slice(0, 3);
---
<Base title="Jin-Guo Liu Group — quantum computation ∩ scientific computing">
  <section class="hero">
    <pre>$ whoami</pre>
    <h1>Jin-Guo Liu Group <span class="meta">@ HKUST(Guangzhou)</span></h1>
    <p class="tagline cursor">(Computation ∩ Physics ∩ Coding) \ Boring_study</p>
    <p>
      We study quantum computation, tensor networks, and computational
      complexity — and we build the open-source tools to match. Research here is
      AI-native: humans and AI agents develop, test, and document our software together.
    </p>
    <p>
      <a class="btn-cmd" href="/research/">[ cat research.md ]</a>
      <a class="btn-cmd" href="/join/">[ ./join_us.sh ]</a>
    </p>
  </section>

  <section class="section">
    <h2 class="prompt-h">Live coding, every Friday</h2>
    <p>
      Jin-Guo live-codes every Friday at 20:00 (GMT+8) — open to everyone.
      <a href="https://calendar.app.google/SnTMJ6dvurMCVXhi9">Add to calendar →</a>
    </p>
  </section>

  <section class="section">
    <h2 class="prompt-h">ls software/ | head</h2>
    <p class="meta">
      {(software as any[]).slice(0, 5).map((s, i) =>
        <>{i > 0 && '  '}<a href={s.repo}>{s.name}</a></>)}
      &nbsp;<a href="/research/">…more</a>
    </p>
  </section>

  <section class="section">
    <h2 class="prompt-h">tail -3 blog/</h2>
    <PostList posts={latest} />
    <p><a href="/blog/">all posts →</a></p>
  </section>

  <section class="section">
    <h2 class="prompt-h">Contact</h2>
    <p>
      <a href="mailto:jinguoliu@hkust-gz.edu.cn">jinguoliu@hkust-gz.edu.cn</a><br />
      <a href="https://amat.hkust-gz.edu.cn/">Advanced Materials Thrust</a>, Function Hub,
      <a href="https://www.hkust-gz.edu.cn/">HKUST (Guangzhou)</a><br />
      Discussion happens on <a href="http://zulip.hkust-gz.edu.cn/">HKUST-GZ Zulip</a> —
      email for an invitation.
    </p>
    <figure>
      <a href="/assets/group.jpg"><img src="/assets/group.jpg" alt="Jin-Guo Liu research group at HKUST(GZ)" /></a>
      <figcaption class="meta">The group at HKUST(GZ), 2024</figcaption>
    </figure>
  </section>
</Base>
<style>
  .hero pre { border: 0; background: none !important; padding: 0; color: var(--muted); }
  .hero h1 { margin: 0.2rem 0 0.6rem; }
  .tagline { font-family: var(--font-mono); color: var(--accent); font-size: 1.05rem; }
  .hero .btn-cmd { margin-right: 0.6rem; }
  figure { margin: 1rem 0 0; }
  figure img { border: 1px solid var(--border); border-radius: 6px; }
</style>
```

- [ ] **Step 2: Build and verify**

```bash
npm run build
grep -o 'Boring_study' dist/index.html
grep -o 'calendar.app.google' dist/index.html | head -1
grep -o 'Give AI Agents a Clock' dist/index.html | head -1
grep -o 'group.jpg' dist/index.html | head -1
```
Expected: all four greps print matches.

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: terminal-style home page with hero, software, latest posts"
```

---

### Task 9: Join Us page

**Files:**
- Create: `src/pages/join.astro`

Fresh copy replacing `PhdProgram.md`, with `culture.md`/`workflow.md`/`training.md` folded in. Undated (no "2024 academic year").

- [ ] **Step 1: Write src/pages/join.astro**

```astro
---
import Base from '../layouts/Base.astro';
---
<Base title="Join Us — Jin-Guo Liu Group"
      description="PhD, RA, and postdoc openings in quantum computation and scientific computing at HKUST(Guangzhou).">
  <p class="crumb">~/join</p>
  <h1 class="prompt-h">./join_us.sh</h1>
  <p>
    We are recruiting <strong>PhD students</strong> and <strong>research
    assistants</strong> in quantum many-body computation and quantum
    computation, jointly with
    <a href="https://scholar.google.com/citations?user=Rj1ZUlgAAAAJ">Prof. Xi Dai</a>'s
    group at HKUST (Clear Water Bay). Applications are reviewed year-round.
  </p>

  <section class="section">
    <h2 class="prompt-h">What you will learn</h2>
    <ul>
      <li><strong>World-class scientific computing.</strong> Not boring engineering
        practice — training in computational complexity, mathematics, and
        algorithms, building on our open-source stack (Yao.jl, OMEinsum,
        GenericTensorNetworks.jl).</li>
      <li><strong>Quantum algorithm design</strong>, including algorithms for
        neutral-atom (Rydberg) systems — experience from the Lukin group at Harvard.</li>
      <li><strong>Computational complexity theory</strong> — one of the ultimate
        questions statistical physics hopes to explore.</li>
      <li><strong>AI-native research workflows.</strong> We treat human-AI
        collaboration as a first-class research skill: test-driven vibe coding,
        agent automation, reproducible software. See <a href="/blog/">our blog</a>.</li>
      <li><strong>Collaboration and travel</strong> — long-term visits to Clear Water
        Bay, and strong support for attending international conferences.</li>
    </ul>
  </section>

  <section class="section">
    <h2 class="prompt-h">How we work</h2>
    <ul>
      <li>Topic-based discussion on <a href="http://zulip.hkust-gz.edu.cn/">HKUST-GZ Zulip</a>;
        a WeChat group for lunch and coffee.</li>
      <li>All code on GitHub — <a href="https://github.com/CodingThrust">CodingThrust</a> —
        mostly in <a href="https://julialang.org/">Julia</a>.</li>
      <li>Papers shared via <a href="https://www.zotero.org/">Zotero</a>.</li>
      <li>Live coding with Jin-Guo every Friday, 20:00 GMT+8
        (<a href="https://calendar.app.google/SnTMJ6dvurMCVXhi9">calendar</a>).</li>
    </ul>
  </section>

  <section class="section">
    <h2 class="prompt-h">cat required_reading.txt</h2>
    <ul>
      <li>Nielsen & Chuang, <em>Quantum Computation and Quantum Information</em>.</li>
      <li>Moore & Mertens, <em>The Nature of Computation</em>.</li>
      <li>Golub & Van Loan, <em>Matrix Computations</em>.</li>
    </ul>
    <p>
      More training material: our book
      <a href="https://scfp.jinguo-group.science/">Scientific Computing for Physicists</a>,
      the <a href="https://github.com/CodingThrust/CodingClub">CodingClub</a> repo
      (git, shell, cluster, MPI), and
      <a href="https://missing.csail.mit.edu/">MIT's Missing Semester</a>.
    </p>
  </section>

  <section class="section">
    <h2 class="prompt-h">Requirements</h2>
    <ul>
      <li>Integrity and a cooperative personality — willing to consult others and to help.</li>
      <li>Quantum mechanics (required); quantum computing is a plus.</li>
      <li>Pluses: Linux, git, a programming language (Julia recommended), data structures.</li>
      <li>PhD applicants need a bachelor's degree and English proficiency per HKUST(GZ)
        admission rules (TOEFL ≥ 80 or IELTS ≥ 6.5, unless your prior degree was taught in English).</li>
      <li>RA positions suit bachelor's graduates preparing a PhD application
        (a common on-ramp — RAs can apply for the PhD program while working with us).</li>
    </ul>
  </section>

  <section class="section">
    <h2 class="prompt-h">How to apply</h2>
    <ol>
      <li>Email <a href="mailto:jinguoliu@hkust-gz.edu.cn">jinguoliu@hkust-gz.edu.cn</a>
        with your CV, transcript, and any publications. Subject line: position + your name.</li>
      <li>Suitable candidates are interviewed by group members about background,
        skills, and research interests.</li>
      <li>Openings remain valid until filled.</li>
    </ol>
    <p class="meta">
      Curious about the campus? <a href="https://www.bilibili.com/video/BV1SP4y1f7xP/">Video tour</a> —
      maker space, gym, pool, and a river across campus.
    </p>
  </section>
</Base>
```

- [ ] **Step 2: Build and verify**

```bash
npm run build
grep -o 'required_reading' dist/join/index.html
grep -o 'Nature of Computation' dist/join/index.html
grep -o 'jinguoliu@hkust-gz.edu.cn' dist/join/index.html | head -1
grep -c '2024 academic year' dist/join/index.html || true
```
Expected: first three print; last prints `0` (undated copy).

- [ ] **Step 3: Commit**

```bash
git add src/pages/join.astro
git commit -m "feat: join page merging PhD program, culture, and training content"
```

---

### Task 10: About page

**Files:**
- Create: `src/pages/about.astro`

- [ ] **Step 1: Write src/pages/about.astro**

```astro
---
import Base from '../layouts/Base.astro';
const interests = ['quantum information', 'computational complexity', 'tensor networks',
                   'Julia programming', 'quantum simulation', 'quantum error correction'];
---
<Base title="About — Jin-Guo Liu" description="Jin-Guo Liu, computational physicist at HKUST(Guangzhou).">
  <p class="crumb">~/about</p>
  <div class="who">
    <img src="/assets/avatars/jinguoliu.png" alt="Jin-Guo Liu" width="130" height="130" />
    <div>
      <h1 class="prompt-h">Jin-Guo Liu <span class="meta">(刘金国)</span></h1>
      <p class="meta">Computational physicist · Open-source enthusiast</p>
    </div>
  </div>
  <p>
    Assistant professor at the Hong Kong University of Science and Technology
    (Guangzhou), Advanced Materials Thrust and the Quantum Science and
    Technology Center. PhD from Nanjing University (2017); postdoc at the
    Institute of Physics (CAS) and Harvard University. I love the open-source
    community and believe in making science accessible through code — I am one
    of the main authors of the quantum simulator
    <a href="https://github.com/QuantumBFS/Yao.jl">Yao.jl</a>.
  </p>
  <p>{interests.map((t) => <span class="tag">{t}</span>)}</p>

  <section class="section">
    <h2 class="prompt-h">Links</h2>
    <ul>
      <li>CV: <a href="https://github.com/GiggleLiu/CV/raw/master/cv.pdf">download PDF</a></li>
      <li>Google Scholar: <a href="https://scholar.google.com/citations?user=4edw228AAAAJ">Jin-Guo Liu</a></li>
      <li>GitHub: <a href="https://github.com/GiggleLiu">GiggleLiu</a></li>
      <li>X / Twitter: <a href="https://twitter.com/GiggleLiu">@GiggleLiu</a></li>
      <li>Zhihu: <a href="https://www.zhihu.com/people/leo-31-42">GiggleLiu</a></li>
      <li>University profile:
        <a href="https://facultyprofiles.hkust-gz.edu.cn/faculty-personal-page?id=2498">HKUST(GZ)</a></li>
      <li>Email: <a href="mailto:jinguoliu@hkust-gz.edu.cn">jinguoliu@hkust-gz.edu.cn</a></li>
    </ul>
  </section>
</Base>
<style>
  .who { display: flex; gap: 1.3rem; align-items: center; margin-bottom: 1rem; }
  .who img { border-radius: 6px; border: 1px solid var(--border); }
</style>
```

- [ ] **Step 2: Build and verify**

```bash
npm run build
grep -o 'cv.pdf' dist/about/index.html
grep -o 'facultyprofiles' dist/about/index.html
```
Expected: both print.

- [ ] **Step 3: Commit**

```bash
git add src/pages/about.astro
git commit -m "feat: about page for Jin-Guo Liu"
```

---

### Task 11: Link checker script

**Files:**
- Create: `scripts/check-links.mjs`

**Interfaces:**
- Produces: `npm run check` — after a build, verifies every root-relative `href`/`src` in `dist/**/*.html` resolves to a file in `dist/`. Exits 1 with a list of broken links otherwise. Used by CI (Task 12) and final verification (Task 13).

- [ ] **Step 1: Write scripts/check-links.mjs**

```js
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
```

- [ ] **Step 2: Run it against a fresh build**

```bash
npm run build && npm run check
```
Expected: `OK: <N> pages, no broken internal links.` If it reports broken links, fix the offending pages (these are real bugs) before committing.

- [ ] **Step 3: Prove it catches breakage**

Temporarily change a link in `src/pages/about.astro` to `/does-not-exist/`, rebuild, run `npm run check`, expect exit 1 naming the link. Revert, rebuild, expect OK.

- [ ] **Step 4: Commit**

```bash
git add scripts/check-links.mjs
git commit -m "feat: internal link checker for built site"
```

---

### Task 12: Deploy workflow + README

**Files:**
- Modify: `.github/workflows/Deploy.yml` (full replacement)
- Modify: `README.md` (full replacement)

**Interfaces:**
- Consumes: `npm run build`, `npm run check`.
- Produces: push to `master` deploys `dist/` to the existing `gh-pages` branch (GitHub Pages source stays unchanged; `public/CNAME` keeps the domain).

- [ ] **Step 1: Replace .github/workflows/Deploy.yml**

```yaml
name: Build and Deploy
on:
  push:
    branches: [master]
  pull_request:
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - run: npm run build
      - run: node scripts/ci-case-redirects.mjs
      - run: npm run check
      - name: Deploy
        if: github.ref == 'refs/heads/master'
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          branch: gh-pages
          folder: dist
```

- [ ] **Step 2: Replace README.md**

```markdown
# Jin-Guo Liu Group Website

Static site built with [Astro](https://astro.build), deployed to GitHub Pages
at https://www.jinguo-group.science.

## Common edits

| What | Where |
|---|---|
| Add a blog post | Drop a `.md` file in `src/content/blog/` with frontmatter `title, description, date, tags` (see existing posts). The index, tags, and RSS update automatically. Chinese translation: add `<slug>-zh.md` with `lang: zh` and `translationOf: <slug>`. |
| Add/edit a member | Edit `src/data/people.yaml`; avatar goes in `public/assets/avatars/`. |
| Add a package | Edit `src/data/software.yaml`. |
| Add a talk | Edit `src/data/talks.yaml` (newest first). |
| Page copy | `src/pages/*.astro` |
| Design tokens | `src/styles/tokens.css` |

## Local development

```bash
npm install
npm run dev       # live preview at localhost:4321
npm run build     # build to dist/
npm run check     # verify no broken internal links in dist/
```

Deployment is automatic: push to `master` builds and publishes via GitHub Actions.
```

- [ ] **Step 3: Validate workflow syntax and commit**

```bash
npx --yes yaml-lint .github/workflows/Deploy.yml 2>/dev/null || node -e "
  const yaml=require('js-yaml');" 2>/dev/null || echo "lint skipped — reviewed by eye"
git add .github/workflows/Deploy.yml README.md
git commit -m "feat: Astro CI deploy to gh-pages, rewrite README for the new stack"
```
(If no YAML linter is available, careful eyeball review is acceptable — the workflow runs on the PR anyway because of the `pull_request` trigger.)

---

### Task 13: Full verification + user preview gate

**Files:** none created — verification only. **This task gates Task 14.**

- [ ] **Step 1: Clean build + link check**

```bash
rm -rf dist && npm run build && npm run check
```
Expected: build succeeds; `OK` from the checker.

- [ ] **Step 2: Redirect spot-checks**

```bash
for p in Blogs PhdProgram Personal training culture workflow \
         vibe-coding git-workflow sustainable-automation give-ai-agents-a-clock; do
  grep -q 'http-equiv="refresh"' "dist/$p/index.html" && echo "OK /$p" || echo "FAIL /$p";
done
```
Expected: 10 × OK.

**Amendment (2026-07-07):** `/People` and `/Research` redirects cannot be
checked locally — on a case-insensitive filesystem (macOS) their stubs would
be the same file as the real `/people/` and `/research/` pages. They are
written in CI by `scripts/ci-case-redirects.mjs` (which no-ops on
case-insensitive filesystems) and are verified in production after merge:
`curl -sL https://www.jinguo-group.science/People/ | grep -o '<title>[^<]*'`.
Locally, verify instead that the real pages were NOT clobbered:
`grep -L 'http-equiv' dist/people/index.html dist/research/index.html` prints both paths.

- [ ] **Step 3: Feature spot-checks**

```bash
grep -q 'katex' dist/blog/vibe-coding/index.html && echo "OK katex"
grep -q 'astro-code' dist/blog/vibe-coding/index.html && echo "OK shiki"
test -f dist/feed.xml && echo "OK rss"
test -f dist/sitemap-index.xml && echo "OK sitemap"
test "$(cat dist/CNAME)" = "www.jinguo-group.science" && echo "OK cname"
grep -q 'lang="zh"' dist/blog/give-ai-agents-a-clock/zh/index.html && echo "OK zh"
```
Expected: 6 × OK.

- [ ] **Step 4: Lighthouse (best-effort)**

```bash
npm run preview &   # serves dist on localhost:4321
npx --yes lighthouse http://localhost:4321 --quiet --chrome-flags='--headless' \
  --only-categories=performance,accessibility,seo --output=json --output-path=/tmp/lh.json \
  && node -e "const r=require('/tmp/lh.json').categories; \
     for (const k in r) console.log(k, Math.round(r[k].score*100))"
kill %1
```
Expected: all three scores ≥ 90. If Chrome is unavailable, note it and move on — the other checks are the hard gate.

- [ ] **Step 5: USER PREVIEW GATE — stop and ask**

Run `npm run preview` and ask the user to click through the site (home, research, people, blog + one post + zh post, join, about, a redirect URL like `/Blogs/`). **Do not proceed to Task 14 until the user approves.** Fresh page copy (research topics, join, about, home) is drafted content — expect wording edits here; apply them, rebuild, re-run `npm run check`, and commit as `polish: copy edits from user review`.

---

### Task 14: Franklin teardown + merge (only after user approval in Task 13)

**Files:**
- Delete: `Blogs.md People.md Personal.md PhdProgram.md Research.md index.md config.md 404.md culture.md training.md workflow.md git-workflow.md` (root pages already migrated — note `give-ai-agents-a-clock*.md`, `vibe-coding.md`, `sustainable-automation.md`, `git-workflow.md` were `git mv`-ed in Task 4, so only delete what remains), `_layout/ _css/ _libs/ _rss/ _assets/ __site/ utils.jl Project.toml Manifest.toml Makefile google6e9457df963367ed.html image.png image-2.png`
- Modify: `.gitignore` (drop Franklin entries, keep node/dist/astro entries)

- [ ] **Step 1: Delete Franklin files**

```bash
git rm -r --cached __site 2>/dev/null; rm -rf __site
git rm Blogs.md People.md Personal.md PhdProgram.md Research.md index.md config.md \
       404.md culture.md training.md workflow.md \
       utils.jl Project.toml Manifest.toml Makefile google6e9457df963367ed.html \
       image.png image-2.png
git rm -r _layout _css _libs _rss _assets
```
(`google6e9457df963367ed.html` now lives in `public/`; `_assets` was copied to `public/assets` in Task 3. If any of these files is absent, skip it — some may already be gone.)

- [ ] **Step 2: Clean .gitignore**

Remove Franklin-specific ignore entries (`__site`, `_gen`, etc. if present); keep:
```
node_modules/
dist/
.astro/
```

- [ ] **Step 3: Verify nothing the site needs was deleted**

```bash
rm -rf dist && npm run build && npm run check
```
Expected: build + check pass identically to Task 13.

- [ ] **Step 4: Commit and merge**

```bash
git add -A
git commit -m "chore: remove Franklin site, Astro is now the only stack"
git checkout master && git pull && git merge --no-ff astro-rebuild
git push
```
Then watch the Actions run and confirm https://www.jinguo-group.science serves the new site (allow a few minutes for Pages). Verify one redirect in production: `curl -sL https://www.jinguo-group.science/Blogs/ | grep -o '<title>[^<]*'` should show the blog title.

---

## Self-Review Notes

- Spec coverage: site map (Tasks 8–10, 5–7), content model (4–7), design system (2), redirects/RSS/sitemap (1, 5, 3), CI/CD + README (12), error handling (2: 404; 4 step 7: schema failure), verification (11, 13), Franklin deletion (14), Scholar nav link (2). Talks-on-Research per approved amendment (7).
- Types consistent: `postUrl`/`sortedEnPosts` defined in Task 4, consumed in 5 and 8; `PostList` props defined in 5, used in 8; YAML schemas stated in producing tasks and matched by consuming pages.
- Known judgment calls for the executor: talks.yaml full transcription happens from the on-disk `Research.md` (still present until Task 14); expected count 20 is enforced by grep.
