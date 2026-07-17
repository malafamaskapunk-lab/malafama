import { requireDriveSession, withSessionCookie, DriveAuthError } from '../_lib/googleDrive.js';

export const config = { runtime: 'edge' };

function extractFolderId(driveUrl) {
  if (!driveUrl) return null;
  const m = driveUrl.match(/folders\/([a-zA-Z0-9_-]+)/);
  return m ? m[1] : null;
}

export default async function handler(request) {
  const jsonHeaders = { 'Content-Type': 'application/json' };

  let accessToken, newSignedCookie;
  try {
    ({ accessToken, newSignedCookie } = await requireDriveSession(request));
  } catch (err) {
    if (err instanceof DriveAuthError) {
      return new Response(JSON.stringify(err.body), { status: err.status, headers: jsonHeaders });
    }
    throw err;
  }

  const headers = withSessionCookie(new Headers(jsonHeaders), newSignedCookie);

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
