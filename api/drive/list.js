import { verifySession, signSession } from '../_lib/session.js';

export const config = { runtime: 'edge' };

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

function extractFolderId(driveUrl) {
  if (!driveUrl) return null;
  const m = driveUrl.match(/folders\/([a-zA-Z0-9_-]+)/);
  return m ? m[1] : null;
}

export default async function handler(request) {
  const jsonHeaders = { 'Content-Type': 'application/json' };
  const cookieHeader = request.headers.get('cookie') || '';
  const token = cookieHeader.match(/mf_session=([^;]+)/)?.[1];
  let session = token ? await verifySession(token, process.env.SESSION_SECRET) : null;

  if (!session) {
    return new Response(JSON.stringify({ error: 'No autenticado' }), { status: 401, headers: jsonHeaders });
  }
  if (!session.refresh_token) {
    return new Response(
      JSON.stringify({ error: 'Esta sesion no tiene acceso a Drive. Cierra sesion y vuelve a entrar para autorizarlo.' }),
      { status: 403, headers: jsonHeaders }
    );
  }

  const headers = new Headers(jsonHeaders);
  let accessToken = session.access_token;

  if (Date.now() > session.token_expiry - 60000) {
    const refreshed = await refreshAccessToken(session.refresh_token);
    if (!refreshed) {
      return new Response(JSON.stringify({ error: 'No se pudo renovar el acceso a Drive' }), { status: 401, headers: jsonHeaders });
    }
    accessToken = refreshed.access_token;
    session = { ...session, access_token: accessToken, token_expiry: Date.now() + refreshed.expires_in * 1000 };
    const newSigned = await signSession(session, process.env.SESSION_SECRET);
    headers.append('Set-Cookie', `mf_session=${newSigned}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${30 * 24 * 60 * 60}`);
  }

  const url = new URL(request.url);
  const rawFolder = url.searchParams.get('folderId') || url.searchParams.get('driveUrl');
  const folderId = rawFolder && rawFolder.includes('drive.google.com') ? extractFolderId(rawFolder) : rawFolder;
  const q = folderId ? `'${folderId}' in parents and trashed = false` : 'trashed = false';

  const driveRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,mimeType,webViewLink,thumbnailLink,modifiedTime)&pageSize=50&orderBy=modifiedTime desc`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!driveRes.ok) {
    const detail = await driveRes.text();
    return new Response(JSON.stringify({ error: 'Error al consultar Drive', detail }), { status: 502, headers });
  }

  const data = await driveRes.json();
  return new Response(JSON.stringify({ files: data.files || [] }), { status: 200, headers });
}
