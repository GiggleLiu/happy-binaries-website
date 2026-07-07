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
