import { verifySession } from '../_lib/session.js';

export const config = { runtime: 'edge' };

export default async function handler(request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const token = cookieHeader.match(/mf_session=([^;]+)/)?.[1];
  const payload = token ? await verifySession(token, process.env.SESSION_SECRET) : null;

  const body = payload
    ? {
        authenticated: true,
        email: payload.email,
        hasDrive: !!payload.refresh_token,
        // Sesiones firmadas antes de agregar el scope drive.appdata no tienen
        // payload.scope -> hasAppData da false, forzando re-login en vez de
        // que Drive rechace la sincronizacion con un 403 silencioso.
        hasAppData: !!(payload.scope && payload.scope.includes('drive.appdata')),
      }
    : { authenticated: false };

  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
