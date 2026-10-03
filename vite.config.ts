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

function certificationsSaverPlugin(): Plugin {
  return {
    name: 'certifications-saver',
    configureServer(server) {
      const handleCertRequest = async (req: any, res: any) => {
        const jsonPath = path.resolve(__dirname, 'src/data/savedCertifications.json');
        const publicJsonPath = path.resolve(__dirname, 'public/data/savedCertifications.json');
        const distJsonPath = path.resolve(__dirname, 'dist/data/savedCertifications.json');
        const uploadDir = path.resolve(__dirname, 'public/uploads/certifications');
        const distUploadDir = path.resolve(__dirname, 'dist/uploads/certifications');

        const readCertData = async () => {
          try {
            const raw = await fs.readFile(jsonPath, 'utf-8');
            return JSON.parse(raw);
          } catch {
            try {
              const raw = await fs.readFile(publicJsonPath, 'utf-8');
              return JSON.parse(raw);
            } catch {
              return {};
            }
          }
        };

        const writeCertData = async (data: Record<string, any>) => {
          const str = JSON.stringify(data, null, 2);
          await fs.mkdir(path.dirname(jsonPath), { recursive: true });
          await fs.mkdir(path.dirname(publicJsonPath), { recursive: true });
          await fs.writeFile(jsonPath, str, 'utf-8');
          await fs.writeFile(publicJsonPath, str, 'utf-8');
          try {
            await fs.mkdir(path.dirname(distJsonPath), { recursive: true });
            await fs.writeFile(distJsonPath, str, 'utf-8');
          } catch {
            // ignore if dist not built yet
          }
        };

        if (req.method === 'GET') {
          try {
            const data = await readCertData();
            res.writeHead(200, {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            });
            res.end(JSON.stringify({ success: true, data }));
            return;
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to read certifications' }));
            return;
          }
        }

        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: Buffer) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const payload = JSON.parse(body);
              const { certId, dataUrl, title, issuer, badgeLevel, description, date } = payload;
              if (!certId || !dataUrl) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing certId or dataUrl' }));
                return;
              }

              await fs.mkdir(uploadDir, { recursive: true });

              let ext = 'png';
              let base64Data = dataUrl;
              const match = dataUrl.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
              if (match) {
                ext = match[1] === 'svg+xml' ? 'svg' : match[1] === 'jpeg' ? 'jpg' : match[1];
                base64Data = match[2];
              }

              const fileName = `${certId}.${ext}`;
              const filePath = path.resolve(uploadDir, fileName);
              const buf = Buffer.from(base64Data, 'base64');
              await fs.writeFile(filePath, buf);
              try {
                await fs.mkdir(distUploadDir, { recursive: true });
                await fs.writeFile(path.resolve(distUploadDir, fileName), buf);
              } catch {
                // ignore if dist not built yet
              }

              const currentData = await readCertData();
              const updatedItem = {
                certId,
                imageUrl: `/JA-WEB-PORT/uploads/certifications/${fileName}?v=${Date.now()}`,
                title: title || currentData[certId]?.title || certId,
                issuer: issuer || currentData[certId]?.issuer || '',
                badgeLevel: badgeLevel || currentData[certId]?.badgeLevel || '',
                description: description || currentData[certId]?.description || '',
                date: date || currentData[certId]?.date || '',
                uploadedAt: Date.now(),
              };

              currentData[certId] = updatedItem;
              await writeCertData(currentData);

              res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              });
              res.end(JSON.stringify({ success: true, item: updatedItem, data: currentData }));
              return;
            } catch (err) {
              console.error('Save certification error:', err);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Failed to save certification image' }));
            }
          });
          return;
        }

        if (req.method === 'DELETE') {
          let body = '';
          req.on('data', (chunk: Buffer) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              let certId = '';
              try {
                const parsed = JSON.parse(body);
                certId = parsed.certId;
              } catch {
                const url = new URL(req.url, 'http://localhost');
                certId = url.searchParams.get('certId') || '';
              }

              if (!certId) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing certId' }));
                return;
              }

              const currentData = await readCertData();
              delete currentData[certId];
              await writeCertData(currentData);

              try {
                const files = await fs.readdir(uploadDir);
                for (const f of files) {
                  if (f.startsWith(`${certId}.`)) {
                    await fs.unlink(path.resolve(uploadDir, f));
                  }
                }
              } catch {}

              try {
                const distFiles = await fs.readdir(distUploadDir);
                for (const f of distFiles) {
                  if (f.startsWith(`${certId}.`)) {
                    await fs.unlink(path.resolve(distUploadDir, f));
                  }
                }
              } catch {}

              res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              });
              res.end(JSON.stringify({ success: true, data: currentData }));
              return;
            } catch (err) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Failed to delete certification' }));
            }
          });
          return;
        }

        res.writeHead(405);
        res.end();
      };

      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0];
        if (url === '/api/certifications' || url === '/JA-WEB-PORT/api/certifications') {
          handleCertRequest(req, res);
        } else {
          next();
        }
      });
    },
  };
}

export default defineConfig({
  base: '/JA-WEB-PORT/',
  plugins: [react(), tailwindcss(), portraitSaverPlugin(), certificationsSaverPlugin()],
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

