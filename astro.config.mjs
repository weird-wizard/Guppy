// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import pagefind from 'astro-pagefind';

// https://astro.build/config
export default defineConfig({
  site: 'https://guppy.qichiyoufeng.top',
  integrations: [mdx(), pagefind()],
  vite: {
    plugins: [tailwindcss()],
  },
});
