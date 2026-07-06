# Group Website Refactor — Design Spec

**Date:** 2026-07-07
**Repo:** happy-binaries-website (www.jinguo-group.science)
**Status:** Approved design, pending implementation plan

## Goal

Rebuild the Jin-Guo Liu group website: replace the Franklin.jl/Bootstrap stack with
Astro, redesign around a dark-first terminal aesthetic, and restructure the content.
Blog posts migrate as-is; all other page copy is written fresh, emphasizing the
group's open-source software, research program, and AI-native workflow.

## Decisions (from brainstorming)

| Question | Decision |
|---|---|
| Stack | Astro, hand-rolled (no theme, no Tailwind), vanilla CSS design tokens |
| Visual direction | Terminal / code aesthetic, dark-only (no light mode; print stylesheet flips to light) |
| Site map | Restructured 6 pages + external Publications link |
| Publications | No page — nav item "Publications ↗" links to Google Scholar profile |
| Talks | Kept as `talks.yaml`-driven "Selected talks" section on Research |
| Content | Blog posts migrate verbatim; all pages get fresh copy (user reviews) |
| Messaging | Open-source software + research program + AI-native workflow |
| Repo strategy | Same repo, feature branch; Franklin files deleted at merge |
| Deploy | GitHub Actions → GitHub Pages, domain unchanged |

## Site map

```
/                 Home        — identity, what the group does, latest blog + news, join CTA
/research/        Research    — research topics (fresh copy) + software showcase + selected talks
/people/          People      — cards from people.yaml (advisor + students + alumni)
/blog/            Blog        — auto index from content collection, tag filtering
/blog/<slug>/     Post        — markdown; optional zh sibling at /blog/<slug>/zh/ with language switch
/join/            Join Us     — fresh recruiting page (PhD/RA); culture & training folded in
/about/           About       — Jin-Guo's profile, CV, contact, social links
Publications ↗                — nav link to https://scholar.google.com/citations?user=4edw228AAAAJ
```

Orphan Franklin pages (`culture.md`, `training.md`, `workflow.md`) fold into Join Us;
`PhdProgram.md`'s dated recruiting pitch is rewritten undated for /join/.

## Content model

- `src/content/blog/*.md` — posts with frontmatter: `title, date, description, tags,
  lang, translation`. Blog index, tag pages, and RSS generate automatically.
  Migrating posts: vibe-coding, git-workflow, sustainable-automation,
  give-ai-agents-a-clock (+ `_zh` sibling). The Blogs page's "Books" entry
  (Modern Scientific Computing) and Zhihu link become cards on the blog index.
- `src/data/people.yaml` — per member: name, hanzi, role, avatar, bio, links, tags,
  `alumni` flag. Adding a student = one YAML block.
- `src/data/software.yaml` — packages for the Research showcase (Yao.jl, OMEinsum.jl,
  TensorQEC.jl, GenericTensorNetworks.jl, …): name, repo URL, one-liner, role.
- `src/data/talks.yaml` — date, venue, venue URL, title, type (invited/seminar/…),
  optional links (slides/video). Rendered as a collapsible section on Research.
- Pages are `.astro` files with fresh copy, drafted during implementation and
  reviewed by the user before merge.

## Visual design system

Identity: **a physicist's terminal** — dark-first, monospace-led, restrained. The
terminal is a motif in the chrome; prose stays maximally readable.

- **Tokens** (`src/styles/tokens.css`, the entire design system): near-black
  background (#0d1117 family, not pure black), warm off-white text, one primary
  accent (phosphor green or amber — decided by trying both) for prompts, links,
  highlights; muted secondary for borders and metadata. Julia dot colors allowed
  sparingly as tag accents.
- **Type**: self-hosted monospace (JetBrains Mono or Commit Mono) for headings,
  nav, code, UI chrome. Body: readable sans or relaxed mono — decided on a real
  blog post during implementation. Generous body size and line height.
- **Motifs**: `$`/`>` prompt markers on headings and CTAs; box-drawing characters
  for rules and card borders; blinking cursor on the hero tagline
  `(Computation ∩ Physics ∩ Coding) \ Boring_study`; path-style breadcrumbs
  (`~/blog/vibe-coding`); command-style buttons (`[ ./join_us.sh ]`).
- **Blog reading**: narrow measure, Shiki syntax highlighting, KaTeX for math,
  light-background figures framed for dark backgrounds.
- **JS budget**: zero client-side JS except (at most) a tiny mobile-nav script.
  Print stylesheet renders light.

## Architecture & deployment

```
src/
  content/blog/*.md        posts (+ zh siblings)
  data/{people,software,talks}.yaml
  layouts/Base.astro       head, nav, footer
  components/              MemberCard, PostList, PromptHeading, SoftwareCard, ...
  pages/                   index, research, people, blog/, join, about, 404
  styles/tokens.css
public/                    avatars, images, slides, favicon, CNAME, google6e9457df963367ed.html
```

- **CI/CD**: GitHub Actions — push to `master` → `astro build` → GitHub Pages.
  Domain `www.jinguo-group.science` unchanged; CNAME and Google Search Console
  verification file carried into `public/`. Node pinned via `.nvmrc`.
  `npm run dev` for local preview; README rewritten accordingly.
- **URL compatibility** (Astro `redirects` → meta-refresh pages):
  `/Blogs/→/blog/`, `/Research/→/research/`, `/People/→/people/`,
  `/PhdProgram/→/join/`, `/Personal/→/about/`, and each old flat post path
  (`/vibe-coding/` etc.) → `/blog/<slug>/`. Post slugs are preserved.
- **RSS** via Astro RSS integration; **sitemap** via @astrojs/sitemap.
- **Deletion at merge**: all Franklin files — page `*.md`, `_layout/`, `_css/`,
  `_libs/`, `_rss/`, `utils.jl`, `Project.toml`, `Manifest.toml`, `__site/`,
  stray `image*.png`. Git history preserves them.

## Error handling

- Custom 404 page in the terminal style (`command not found` treatment).
- Build fails loudly on invalid frontmatter (Astro content-collection schema via
  zod) and on malformed YAML data files — bad data cannot silently ship.
- External links (Scholar, Zulip, calendar) are plain links; no runtime fetches,
  so no runtime failure modes.

## Verification before merge

1. `astro build` clean; content-collection schemas validate.
2. Internal link check over the built site (no broken links).
3. Redirect spot-checks for every old URL.
4. Both en and zh blog posts render; KaTeX and code highlighting verified against
   existing posts (sustainable-automation has tables/figures; vibe-coding has code).
5. Lighthouse pass (performance, accessibility, SEO) on the built site.
6. Preview deploy for user click-through approval before replacing the live site.

## Out of scope

- Light theme / theme toggle (dark-only by decision).
- Publication data automation (Scholar link instead).
- Site search, comments, analytics.
- Rewriting or translating blog posts.
