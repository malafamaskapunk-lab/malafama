import { verifySession } from './api/_lib/session.js';

export const config = {
  matcher: ['/', '/index.html'],
};

export default async function middleware(request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const token = cookieHeader.match(/mf_session=([^;]+)/)?.[1];
  const session = token ? await verifySession(token, process.env.SESSION_SECRET) : null;

  if (!session) {
    return Response.redirect(new URL('/login.html', request.url));
  }
}
