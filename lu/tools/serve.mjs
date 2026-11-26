// Máy chủ tĩnh chạy trên máy (Local First, D30). Không cần cài thêm gì: node tools/serve.mjs [cổng]
// Chỉ nghe ở 127.0.0.1 để không mở cổng ra internet.
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.mp3': 'audio/mpeg', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp' };

export function serve(port = 5173) {
  const srv = http.createServer(async (req, res) => {
    try {
      let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (p === '/') p = '/admin/index.html';
      const f = path.resolve(ROOT, '.' + p);
      if (!f.startsWith(ROOT + path.sep)) { res.writeHead(403); return res.end(); }
      const s = await stat(f); if (!s.isFile()) throw new Error();
      res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream', 'cache-control': 'no-store' });
      res.end(await readFile(f));
    } catch { res.writeHead(404); res.end('Không tìm thấy'); }
  });
  return new Promise(r => srv.listen(port, '127.0.0.1', () => r(srv)));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.argv[2]) || 5173;
  await serve(port);
  console.log(`Lu đang chạy: http://localhost:${port}/  (Admin xem trước)  ·  http://localhost:${port}/player.html?lesson=MAU-001`);
}
