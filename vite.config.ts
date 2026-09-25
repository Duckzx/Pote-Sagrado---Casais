import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({ 
        registerType: 'autoUpdate',
        includeAssets: ['icon.svg'],
        manifest: {
          name: 'Pote Sagrado',
          short_name: 'Pote',
          description: 'Aplicação de finanças e gamificação para casais.',
          theme_color: '#FDF6E3',
          background_color: '#FDF6E3',
          display: 'standalone',
          start_url: '/',
          lang: 'pt-BR',
          icons: [
            {
              src: 'icon.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any'
            }
          ]
        },
        workbox: {
          // Firebase handles its own offline cache; never intercept its APIs
          navigateFallbackDenylist: [/^\/api\//, /^\/__\//],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify: file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
