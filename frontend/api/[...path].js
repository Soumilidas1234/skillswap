const BACKEND = 'https://skillswapp.infinityfreeapp.com/api';

function buildBody(req) {
  if (!req.method || ['GET', 'HEAD'].includes(req.method)) return undefined;

  const contentType = req.headers['content-type'] || '';

  if (contentType.includes('application/x-www-form-urlencoded') && req.body && typeof req.body === 'object') {
    return new URLSearchParams(req.body).toString();
  }

  if (typeof req.body === 'string') return req.body;
  if (req.body && Object.keys(req.body).length > 0) return JSON.stringify(req.body);
  return undefined;
}

export default async function handler(req, res) {
  const segments = req.query.path;
  const path = Array.isArray(segments) ? segments.join('/') : (segments ?? '');

  const url = new URL(`${BACKEND}/${path}`);

  for (const [key, value] of Object.entries(req.query)) {
    if (key === 'path') continue;
    if (Array.isArray(value)) {
      value.forEach((v) => url.searchParams.append(key, v));
    } else if (value != null) {
      url.searchParams.set(key, String(value));
    }
  }

  const headers = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    Accept: 'application/json, text/plain, */*',
  };

  const contentType = req.headers['content-type'];
  if (contentType) headers['Content-Type'] = contentType;
  if (req.headers.authorization) headers.Authorization = req.headers.authorization;
  if (req.headers['x-csrf-token']) headers['X-CSRF-Token'] = req.headers['x-csrf-token'];

  try {
    const response = await fetch(url.toString(), {
      method: req.method,
      headers,
      body: buildBody(req),
    });

    const text = await response.text();
    res.status(response.status);
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
    res.send(text);
  } catch {
    res.status(502).json({ success: false, message: 'Backend unavailable' });
  }
}
