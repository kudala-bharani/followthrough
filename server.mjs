import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url));
const publicFiles = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/styles.css', ['styles.css', 'text/css; charset=utf-8']],
  ['/src/app.mjs', ['src/app.mjs', 'text/javascript; charset=utf-8']],
  ['/src/model.mjs', ['src/model.mjs', 'text/javascript; charset=utf-8']],
  ['/src/storage.mjs', ['src/storage.mjs', 'text/javascript; charset=utf-8']],
  ['/app-map.html', ['devpost/app-map.html', 'text/html; charset=utf-8']],
]);

export function createServer() {
  return http.createServer(async (request, response) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Referrer-Policy', 'no-referrer');
    response.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'none'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'");
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { Allow: 'GET, HEAD', 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Method not allowed');
      return;
    }
    // Match the raw path exactly: never normalize, decode, or join untrusted paths.
    const pathname = (request.url || '').split('?')[0];
    const entry = publicFiles.get(pathname);
    if (!entry) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end(request.method === 'HEAD' ? undefined : 'Not found');
      return;
    }
    try {
      const body = await readFile(path.join(root, entry[0]));
      response.writeHead(200, { 'Content-Type': entry[1], 'Content-Length': body.length });
      response.end(request.method === 'HEAD' ? undefined : body);
    } catch (error) {
      response.writeHead(error.code === 'ENOENT' ? 404 : 500, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end(request.method === 'HEAD' ? undefined : 'Unable to load this page');
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const server = createServer();
  server.on('error', error => {
    console.error(`Could not start the local server: ${error.message}`);
    process.exitCode = 1;
  });
  server.listen(4173, '127.0.0.1', () => console.log('FollowThrough is ready at http://127.0.0.1:4173'));
}
