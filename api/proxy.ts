import type { IncomingMessage, ServerResponse } from 'http';
import { safeFetch } from './_shared';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const target = parsedUrl.searchParams.get('url');

  if (!target) {
    res.statusCode = 400;
    res.end('Missing url parameter');
    return;
  }

  try {
    const fetchRes = await safeFetch(target, 8000, false);
    if (!fetchRes.ok || !fetchRes.buffer) {
      res.statusCode = fetchRes.status || 502;
      res.end('Failed to proxy asset');
      return;
    }

    const contentType = fetchRes.headers.get('content-type') || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.statusCode = 200;
    res.end(Buffer.from(fetchRes.buffer));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.statusCode = 500;
    res.end(`Proxy error: ${message}`);
  }
}
