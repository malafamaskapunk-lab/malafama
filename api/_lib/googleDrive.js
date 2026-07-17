// Helper compartido para endpoints de Drive (api/drive/list.js, api/drive/state.js):
// resuelve la cookie de sesion a un access token valido, refrescandolo si hace
// falta, y centraliza las ramas de error (sin sesion, sin acceso a Drive, sin
// el scope necesario, fallo al refrescar) para no repetirlas en cada endpoint.
import { verifySession, signSession } from './session.js';

const COOKIE_MAX_AGE = 30 * 24 * 60 * 60;

async function refreshAccessToken(refreshToken) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });
  if (!res.ok) return null;
  return res.json();
}

export class DriveAuthError extends Error {
  constructor(status, body) {
    super(body.error);
    this.status = status;
    this.body = body;
  }
}

// options.requireAppData: exige que la sesion tenga el scope drive.appdata
// (usado por api/drive/state.js, no por api/drive/list.js que solo necesita
// drive.readonly).
export async function requireDriveSession(request, options = {}) {
  const cookieHeader = request.headers.get('cookie') || '';
  const token = cookieHeader.match(/mf_session=([^;]+)/)?.[1];
  let session = token ? await verifySession(token, process.env.SESSION_SECRET) : null;

  if (!session) {
    throw new DriveAuthError(401, { error: 'No autenticado' });
  }
  if (!session.refresh_token) {
    throw new DriveAuthError(403, {
      error: 'Esta sesion no tiene acceso a Drive. Cierra sesion y vuelve a entrar para autorizarlo.',
    });
  }
  if (options.requireAppData && !(session.scope && session.scope.includes('drive.appdata'))) {
    throw new DriveAuthError(403, {
      error: 'Esta sesion no tiene permiso para sincronizar datos. Cierra sesion y vuelve a entrar para autorizarlo.',
      reason: 'scope_insufficient',
    });
  }

  let accessToken = session.access_token;
  let newSignedCookie = null;

  if (Date.now() > session.token_expiry - 60000) {
    const refreshed = await refreshAccessToken(session.refresh_token);
    if (!refreshed) {
      throw new DriveAuthError(401, { error: 'No se pudo renovar el acceso a Drive' });
    }
    accessToken = refreshed.access_token;
    session = { ...session, access_token: accessToken, token_expiry: Date.now() + refreshed.expires_in * 1000 };
    newSignedCookie = await signSession(session, process.env.SESSION_SECRET);
  }

  return { session, accessToken, newSignedCookie };
}

export function withSessionCookie(headers, newSignedCookie) {
  if (newSignedCookie) {
    headers.append('Set-Cookie', `mf_session=${newSignedCookie}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${COOKIE_MAX_AGE}`);
  }
  return headers;
}
