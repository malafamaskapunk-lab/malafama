import { signSession } from '../../_lib/session.js';

export const config = { runtime: 'edge' };

function decodeJwtPayload(idToken) {
  const part = idToken.split('.')[1];
  const padded = part.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (part.length % 4)) % 4);
  return JSON.parse(atob(padded));
}

function failRedirect(reason, detail) {
  const headers = new Headers();
  let loc = `/login.html?error=${encodeURIComponent(reason)}`;
  if (detail) loc += `&detail=${encodeURIComponent(String(detail).slice(0, 300))}`;
  headers.set('Location', loc);
  headers.append('Set-Cookie', 'mf_oauth_state=; Path=/; Max-Age=0');
  return new Response(null, { status: 302, headers });
}

export default async function handler(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  const cookieHeader = request.headers.get('cookie') || '';
  const stateCookie = cookieHeader.match(/mf_oauth_state=([^;]+)/)?.[1];

  if (error) return failRedirect(error);
  if (!code || !state || state !== stateCookie) return failRedirect('invalid_state');

  const redirectUri = `${url.origin}/api/auth/callback/google`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenRes.ok) {
    const errBody = await tokenRes.text();
    return failRedirect('token_exchange_failed', errBody);
  }
  const tokens = await tokenRes.json();

  let idPayload;
  try {
    idPayload = decodeJwtPayload(tokens.id_token);
  } catch (e) {
    return failRedirect('token_exchange_failed', 'no id_token: ' + (e && e.message));
  }

  const allowedEmail = (process.env.ALLOWED_EMAIL || '').toLowerCase().trim();
  const email = (idPayload.email || '').toLowerCase().trim();

  if (!email || !idPayload.email_verified || email !== allowedEmail) {
    return failRedirect('unauthorized_email');
  }

  if (!tokens.refresh_token) {
    // Google solo manda refresh_token la primera vez que se autoriza (o con prompt=consent).
    // Si por algun motivo no llega, igual dejamos entrar pero sin acceso a Drive persistente.
  }

  const now = Date.now();
  const session = {
    email: idPayload.email,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token || null,
    token_expiry: now + tokens.expires_in * 1000,
    exp: now + 30 * 24 * 60 * 60 * 1000,
  };

  const signed = await signSession(session, process.env.SESSION_SECRET);

  const headers = new Headers();
  headers.set('Location', '/');
  headers.append('Set-Cookie', `mf_session=${signed}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${30 * 24 * 60 * 60}`);
  headers.append('Set-Cookie', 'mf_oauth_state=; Path=/; Max-Age=0');

  return new Response(null, { status: 302, headers });
}
