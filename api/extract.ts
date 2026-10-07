import type { IncomingMessage, ServerResponse } from 'http';
import { extractWebsite } from './_shared';

export default async function handler(req: IncomingMessage & { body?: any }, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  let bodyData: any = req.body;
  if (!bodyData) {
    const buffers: Buffer[] = [];
    for await (const chunk of req) {
      buffers.push(Buffer.from(chunk));
    }
    const rawBody = Buffer.concat(buffers).toString('utf-8');
    try {
      bodyData = JSON.parse(rawBody);
    } catch {
      bodyData = {};
    }
  }

  const url = bodyData?.url;
  if (!url || typeof url !== 'string') {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Please provide a valid website URL.' }));
    return;
  }

  try {
    const result = await extractWebsite(url);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(result));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: message }));
  }
}
