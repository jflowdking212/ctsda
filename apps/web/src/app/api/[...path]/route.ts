import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'http://127.0.0.1:4000';

async function handleProxy(req: NextRequest) {
  console.log(`[API PROXY] Received ${req.method} request for ${req.url}`);
  // Use nextUrl.pathname to avoid Next.js 15 params type issues
  const pathname = req.nextUrl.pathname; // e.g. /api/admin/training/...
  const apiPath = pathname.replace(/^\/api\//, ''); // e.g. admin/training/...
  const url = new URL(req.url);
  const targetUrl = `${API_BASE}/${apiPath}${url.search}`;

  const headers = new Headers(req.headers);
  headers.delete('host'); // Let fetch set the correct host

  try {
    let body = undefined;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      body = await req.arrayBuffer(); // Use arrayBuffer to safely forward any content
    }

    const res = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      redirect: 'manual',
      // Ensure we don't cache API requests by default
      cache: 'no-store',
    });

    const resHeaders = new Headers(res.headers);
    // Remove headers that might cause issues
    resHeaders.delete('content-encoding');

    return new NextResponse(res.body, {
      status: res.status,
      headers: resHeaders,
    });
  } catch (err: any) {
    console.error('API Proxy Error:', err);
    return NextResponse.json({ error: 'Internal API Proxy Error', details: err.message }, { status: 502 });
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const DELETE = handleProxy;
export const PATCH = handleProxy;
export const OPTIONS = handleProxy;
