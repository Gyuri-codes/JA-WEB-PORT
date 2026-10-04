import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import fs from 'node:fs/promises';
import nodeFs from 'node:fs';
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
              const certAssetsDir = path.resolve(__dirname, 'public/assets/certificates');
              const distCertAssetsDir = path.resolve(__dirname, 'dist/assets/certificates');
              await fs.mkdir(certAssetsDir, { recursive: true });

              let ext = 'png';
              let base64Data = dataUrl;
              const match = dataUrl.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
              if (match) {
                ext = match[1] === 'svg+xml' ? 'svg' : match[1] === 'jpeg' ? 'jpg' : match[1];
                base64Data = match[2];
              }

              const fileName = `${certId}.${ext}`;
              const filePath = path.resolve(uploadDir, fileName);
              const assetFilePath = path.resolve(certAssetsDir, fileName);
              const buf = Buffer.from(base64Data, 'base64');
              
              await fs.writeFile(filePath, buf);
              await fs.writeFile(assetFilePath, buf);

              try {
                await fs.mkdir(distUploadDir, { recursive: true });
                await fs.writeFile(path.resolve(distUploadDir, fileName), buf);
                await fs.mkdir(distCertAssetsDir, { recursive: true });
                await fs.writeFile(path.resolve(distCertAssetsDir, fileName), buf);
              } catch {
                // ignore if dist not built yet
              }

              const currentData = await readCertData();
              const updatedItem = {
                certId,
                imageUrl: `/JA-WEB-PORT/assets/certificates/${fileName}?v=${Date.now()}`,
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

function gallerySaverPlugin(): Plugin {
  return {
    name: 'gallery-saver',
    configureServer(server) {
      const jsonPath = path.resolve(__dirname, 'src/data/galleryImages.json');
      const publicJsonPath = path.resolve(__dirname, 'public/data/galleryImages.json');
      const distJsonPath = path.resolve(__dirname, 'dist/data/galleryImages.json');
      const uploadDir = path.resolve(__dirname, 'public/uploads/gallery');
      const distUploadDir = path.resolve(__dirname, 'dist/uploads/gallery');
      const galleryAssetsDir = path.resolve(__dirname, 'public/assets/gallery');
      const distGalleryAssetsDir = path.resolve(__dirname, 'dist/assets/gallery');

      const handleGalleryRequest = async (req: any, res: any) => {

        const readGalleryData = async (): Promise<{ images: any[]; albums: any[]; deletedIds: string[] }> => {
          try {
            const raw = await fs.readFile(jsonPath, 'utf-8');
            const parsed = JSON.parse(raw);
            return {
              images: Array.isArray(parsed.images) ? parsed.images : [],
              albums: Array.isArray(parsed.albums) ? parsed.albums : [],
              deletedIds: Array.isArray(parsed.deletedIds) ? parsed.deletedIds : [],
            };
          } catch {
            try {
              const raw = await fs.readFile(publicJsonPath, 'utf-8');
              const parsed = JSON.parse(raw);
              return {
                images: Array.isArray(parsed.images) ? parsed.images : [],
                albums: Array.isArray(parsed.albums) ? parsed.albums : [],
                deletedIds: Array.isArray(parsed.deletedIds) ? parsed.deletedIds : [],
              };
            } catch {
              return { images: [], albums: [], deletedIds: [] };
            }
          }
        };

        const writeGalleryData = async (data: { images: any[]; albums: any[]; deletedIds?: string[] }) => {
          const str = JSON.stringify(data, null, 2);
          await fs.mkdir(path.dirname(jsonPath), { recursive: true });
          await fs.mkdir(path.dirname(publicJsonPath), { recursive: true });
          await fs.writeFile(jsonPath, str, 'utf-8');
          await fs.writeFile(publicJsonPath, str, 'utf-8');
          try {
            await fs.mkdir(path.dirname(distJsonPath), { recursive: true });
            await fs.writeFile(distJsonPath, str, 'utf-8');
          } catch {}
        };

        if (req.method === 'GET') {
          try {
            const data = await readGalleryData();
            res.writeHead(200, {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            });
            res.end(JSON.stringify({ success: true, data }));
            return;
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to read gallery data' }));
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
              const currentData = await readGalleryData();

              if (payload.action === 'save_albums' && Array.isArray(payload.albums)) {
                currentData.albums = payload.albums;
                await writeGalleryData(currentData);
                res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                res.end(JSON.stringify({ success: true, data: currentData }));
                return;
              }

              if (Array.isArray(payload.albums) && payload.albums.length > 0) {
                const albumMap = new Map();
                currentData.albums.forEach((a: any) => albumMap.set(a.id, a));
                payload.albums.forEach((a: any) => albumMap.set(a.id, a));
                currentData.albums = Array.from(albumMap.values());
              }

              const incomingImages: any[] = Array.isArray(payload.images)
                ? payload.images
                : payload.image
                ? [payload.image]
                : [];

              if (incomingImages.length === 0) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'No images provided' }));
                return;
              }

              await fs.mkdir(uploadDir, { recursive: true });
              await fs.mkdir(galleryAssetsDir, { recursive: true });
              try {
                await fs.mkdir(distUploadDir, { recursive: true });
                await fs.mkdir(distGalleryAssetsDir, { recursive: true });
              } catch {}

              const savedImages: any[] = [];

              const incomingIds = incomingImages.map((img: any) => img.id).filter(Boolean);
              if (currentData.deletedIds) {
                currentData.deletedIds = currentData.deletedIds.filter((dId: string) => !incomingIds.includes(dId));
              }

              for (const img of incomingImages) {
                const dataUrl = img.dataUrl;
                if (!dataUrl) continue;

                let ext = 'png';
                let base64Data = dataUrl;
                const match = dataUrl.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
                if (match) {
                  ext = match[1] === 'svg+xml' ? 'svg' : match[1] === 'jpeg' ? 'jpg' : match[1];
                  base64Data = match[2];
                }

                const safeId = (img.id || `gallery_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`).replace(/[^a-zA-Z0-9_-]/g, '_');
                const fileName = `${safeId}.${ext}`;
                const filePath = path.resolve(uploadDir, fileName);
                const assetFilePath = path.resolve(galleryAssetsDir, fileName);
                const buf = Buffer.from(base64Data, 'base64');
                await fs.writeFile(filePath, buf);
                await fs.writeFile(assetFilePath, buf);
                try {
                  await fs.writeFile(path.resolve(distUploadDir, fileName), buf);
                  await fs.writeFile(path.resolve(distGalleryAssetsDir, fileName), buf);
                } catch {}

                const repoUrl = `/JA-WEB-PORT/assets/gallery/${fileName}`;

                const imageItem = {
                  id: img.id || safeId,
                  imageUrl: repoUrl,
                  dataUrl: repoUrl,
                  title: img.title || 'Untitled Photo',
                  caption: img.caption || '',
                  category: img.category || '',
                  albumIds: Array.isArray(img.albumIds) ? img.albumIds : [],
                  uploadedAt: img.uploadedAt || Date.now(),
                  sizeBytes: img.sizeBytes || buf.length,
                  width: img.width || 1200,
                  height: img.height || 800,
                };

                savedImages.push(imageItem);

                const existingIdx = currentData.images.findIndex((i: any) => i.id === imageItem.id);
                if (existingIdx >= 0) {
                  currentData.images[existingIdx] = imageItem;
                } else {
                  currentData.images.unshift(imageItem);
                }
              }

              await writeGalleryData(currentData);

              res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              });
              res.end(JSON.stringify({ success: true, savedImages, data: currentData }));
              return;
            } catch (err) {
              console.error('Save gallery error:', err);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Failed to save gallery images' }));
            }
          });
          return;
        }

        if (req.method === 'PUT') {
          let body = '';
          req.on('data', (chunk: Buffer) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const { id, updates } = JSON.parse(body);
              if (!id || !updates) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing id or updates' }));
                return;
              }

              const currentData = await readGalleryData();
              const idx = currentData.images.findIndex((i: any) => i.id === id);
              if (idx >= 0) {
                currentData.images[idx] = { ...currentData.images[idx], ...updates };
                await writeGalleryData(currentData);
              }

              res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
              res.end(JSON.stringify({ success: true, data: currentData }));
              return;
            } catch (err) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Failed to update image' }));
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
              let ids: string[] = [];
              try {
                const parsed = JSON.parse(body);
                ids = Array.isArray(parsed.ids) ? parsed.ids : parsed.id ? [parsed.id] : [];
              } catch {
                const url = new URL(req.url, 'http://localhost');
                const id = url.searchParams.get('id');
                if (id) ids = [id];
              }

              if (ids.length === 0) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing ids to delete' }));
                return;
              }

              const currentData = await readGalleryData();
              const idSet = new Set(ids);
              currentData.images = currentData.images.filter((img: any) => !idSet.has(img.id));
              currentData.deletedIds = Array.from(new Set([...(currentData.deletedIds || []), ...ids]));

              currentData.albums.forEach((album: any) => {
                album.imageIds = album.imageIds.filter((imgId: string) => !idSet.has(imgId));
                if (album.coverImageId && idSet.has(album.coverImageId)) {
                  album.coverImageId = album.imageIds[0] || undefined;
                }
              });

              await writeGalleryData(currentData);

              for (const id of ids) {
                const cleanId = id.replace(/^gallery_/, '');
                const matches = (f: string) => f.startsWith(`${id}.`) || f.startsWith(`${cleanId}.`);

                try {
                  const files = await fs.readdir(uploadDir);
                  for (const f of files) {
                    if (matches(f)) {
                      await fs.unlink(path.resolve(uploadDir, f));
                    }
                  }
                } catch {}
                try {
                  const assetFiles = await fs.readdir(galleryAssetsDir);
                  for (const f of assetFiles) {
                    if (matches(f)) {
                      await fs.unlink(path.resolve(galleryAssetsDir, f));
                    }
                  }
                } catch {}
                try {
                  const distFiles = await fs.readdir(distUploadDir);
                  for (const f of distFiles) {
                    if (matches(f)) {
                      await fs.unlink(path.resolve(distUploadDir, f));
                    }
                  }
                } catch {}
                try {
                  const distAssetFiles = await fs.readdir(distGalleryAssetsDir);
                  for (const f of distAssetFiles) {
                    if (matches(f)) {
                      await fs.unlink(path.resolve(distGalleryAssetsDir, f));
                    }
                  }
                } catch {}
              }

              res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
              res.end(JSON.stringify({ success: true, data: currentData }));
              return;
            } catch (err) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Failed to delete gallery images' }));
            }
          });
          return;
        }

        res.writeHead(405);
        res.end();
      };

      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0];
        if (
          url === '/api/gallery' ||
          url === '/JA-WEB-PORT/api/gallery' ||
          url === '/api/gallery/albums' ||
          url === '/JA-WEB-PORT/api/gallery/albums'
        ) {
          handleGalleryRequest(req, res);
        } else if (
          url &&
          (url.startsWith('/JA-WEB-PORT/assets/gallery/') ||
            url.startsWith('/assets/gallery/') ||
            url.startsWith('/JA-WEB-PORT/uploads/gallery/') ||
            url.startsWith('/uploads/gallery/'))
        ) {
          const fileName = path.basename(url);
          const candidates = [
            path.resolve(galleryAssetsDir, fileName),
            path.resolve(uploadDir, fileName),
          ];
          let foundPath = '';
          for (const cand of candidates) {
            if (nodeFs.existsSync(cand)) {
              foundPath = cand;
              break;
            }
          }
          if (foundPath) {
            const ext = path.extname(foundPath).toLowerCase();
            const mimeMap: Record<string, string> = {
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
              '.png': 'image/png',
              '.webp': 'image/webp',
              '.gif': 'image/gif',
            };
            res.writeHead(200, {
              'Content-Type': mimeMap[ext] || 'application/octet-stream',
              'Cache-Control': 'public, max-age=31536000',
            });
            nodeFs.createReadStream(foundPath).pipe(res);
            return;
          }
          next();
        } else {
          next();
        }
      });
    },
  };
}

export default defineConfig({
  base: '/JA-WEB-PORT/',
  plugins: [react(), tailwindcss(), portraitSaverPlugin(), certificationsSaverPlugin(), gallerySaverPlugin()],
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

