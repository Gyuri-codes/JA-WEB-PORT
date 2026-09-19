import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { defineConfig, Plugin } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function portraitSaverPlugin(): Plugin {
  return {
    name: 'portrait-saver',
    configureServer(server) {
      server.middlewares.use('/api/save-portrait', async (req, res) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const { dataUrl } = JSON.parse(body);
              if (dataUrl && dataUrl.startsWith('data:image/png;base64,')) {
                const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
                const buf = Buffer.from(base64Data, 'base64');
                const assetsDir = path.resolve(__dirname, 'public/assets');
                await fs.mkdir(assetsDir, { recursive: true });
                await fs.writeFile(path.resolve(assetsDir, 'jeric-portrait.png'), buf);
                await fs.writeFile(path.resolve(__dirname, 'public/jeric-portrait.png'), buf);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: 'Portrait saved successfully' }));
                return;
              }
            } catch (err) {
              console.error('Save portrait error:', err);
            }
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to save portrait' }));
          });
        } else {
          res.writeHead(405);
          res.end();
        }
      });
    },
  };
}

export default defineConfig({
  base: '/JA-WEB-PORT/',
  plugins: [react(), tailwindcss(), portraitSaverPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
});

