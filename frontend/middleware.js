export const config = {
  matcher: '/api/:path*',
};

const BACKEND = 'https://skillswapp.infinityfreeapp.com/api';

export default async function middleware(request) {
  const url = new URL(request.url);
  const backendPath = url.pathname.replace(/^\/api\/?/, '');
  const backendUrl = `${BACKEND}/${backendPath}${url.search}`;

  const headers = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    Accept: 'application/json, text/plain, */*',
  };

  const contentType = request.headers.get('content-type');
  if (contentType) headers['Content-Type'] = contentType;

  const authorization = request.headers.get('authorization');
  if (authorization) headers.Authorization = authorization;

  const csrf = request.headers.get('x-csrf-token');
  if (csrf) headers['X-CSRF-Token'] = csrf;

  const hasBody = !['GET', 'HEAD'].includes(request.method);

  try {
    const response = await fetch(backendUrl, {
      method: request.method,
      headers,
      body: hasBody ? await request.text() : undefined,
    });

    return new Response(await response.text(), {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
      },
    });
  } catch {
    return Response.json({ success: false, message: 'Backend unavailable' }, { status: 502 });
  }
}
