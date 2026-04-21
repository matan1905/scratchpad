import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/scratchpad/',
  plugins: [
    svelte(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Scratchpad',
        short_name: 'Scratch',
        description: 'Minimal scratchpad with file open/save',
        theme_color: '#1a1a1a',
        background_color: '#1a1a1a',
        display: 'standalone',
        start_url: '/scratchpad/',
        scope: '/scratchpad/',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
        file_handlers: [
          {
            action: '/scratchpad/',
            accept: {
              'text/plain': [
                '.txt', '.md', '.markdown', '.log', '.csv', '.tsv',
                '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
                '.json', '.jsonc', '.json5',
                '.html', '.htm', '.xml', '.svg',
                '.css', '.scss', '.sass', '.less',
                '.py', '.rb', '.go', '.rs', '.java', '.kt', '.swift',
                '.c', '.h', '.cpp', '.hpp', '.cc', '.cs',
                '.sh', '.bash', '.zsh', '.fish',
                '.yaml', '.yml', '.toml', '.ini', '.env',
                '.sql', '.graphql', '.gql',
                '.lua', '.pl', '.r', '.dart', '.ex', '.exs',
                '.vue', '.svelte', '.astro',
                '.dockerfile', '.gitignore', '.editorconfig',
              ],
            },
            launch_type: 'multiple-clients',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
      },
    }),
  ],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
