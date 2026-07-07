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
    // /People→/people and /Research→/research live in scripts/ci-case-redirects.mjs:
    // on a case-insensitive filesystem (macOS dev machines) their stubs would
    // overwrite the real pages in dist/. CI (Linux) writes them post-build.
    '/Blogs': '/blog',
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
