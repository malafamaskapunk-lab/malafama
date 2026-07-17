// Guarda/lee un unico archivo JSON (todo el estado de la app: ajustes, eventos,
// canciones, integrantes, media) en la carpeta oculta appDataFolder del Drive
// del usuario logueado — asi la misma sesion en otro dispositivo puede
// recuperar los mismos datos, sin base de datos propia. Runtime Edge, igual
// que api/drive/list.js (aca no interviene @vercel/blob, que es lo que forzo
// runtime Node en api/audio/*).
import { requireDriveSession, withSessionCookie, DriveAuthError } from '../_lib/googleDrive.js';

export const config = { runtime: 'edge' };

const STATE_FILENAME = 'malaifama-state.json';

class DriveApiError extends Error {
  constructor(message, status, detail) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

// Busca el archivo por nombre dentro de appDataFolder. Si por una carrera rara
// entre dos dispositivos llegara a haber mas de uno, usa el mas reciente en
// vez de asumir que nunca puede pasar.
async function findStateFile(accessToken) {
  const q = `name='${STATE_FILENAME}' and trashed=false`;
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=${encodeURIComponent(q)}&fields=files(id,modifiedTime)&orderBy=modifiedTime desc`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) {
    throw new DriveApiError('Error al buscar el archivo de sincronizacion', 502, await res.text());
  }
  const data = await res.json();
  return (data.files && data.files[0]) || null;
}

async function createStateFile(accessToken) {
  const res = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: STATE_FILENAME, parents: ['appDataFolder'], mimeType: 'application/json' }),
  });
  if (!res.ok) {
    throw new DriveApiError('Error al crear el archivo de sincronizacion', 502, await res.text());
  }
  return res.json();
}

async function writeStateFile(accessToken, fileId, jsonText) {
  const res = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: jsonText,
  });
  if (!res.ok) {
    throw new DriveApiError('Error al guardar el archivo de sincronizacion', 502, await res.text());
  }
}

export default async function handler(request) {
  const jsonHeaders = { 'Content-Type': 'application/json' };

  let accessToken, newSignedCookie;
  try {
    ({ accessToken, newSignedCookie } = await requireDriveSession(request, { requireAppData: true }));
  } catch (err) {
    if (err instanceof DriveAuthError) {
      return new Response(JSON.stringify(err.body), { status: err.status, headers: jsonHeaders });
    }
    throw err;
  }

  const headers = withSessionCookie(new Headers(jsonHeaders), newSignedCookie);

  try {
    if (request.method === 'GET') {
      const file = await findStateFile(accessToken);
      if (!file) return new Response(JSON.stringify({ exists: false }), { status: 200, headers });

      const contentRes = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!contentRes.ok) {
        throw new DriveApiError('Error al leer el archivo de sincronizacion', 502, await contentRes.text());
      }
      const state = await contentRes.json();
      return new Response(JSON.stringify({ exists: true, state }), { status: 200, headers });
    }

    if (request.method === 'POST') {
      let body;
      try {
        body = await request.json();
      } catch {
        return new Response(JSON.stringify({ error: 'JSON invalido' }), { status: 400, headers });
      }
      const jsonText = JSON.stringify(body);

      let file = await findStateFile(accessToken);
      if (!file) file = await createStateFile(accessToken);
      await writeStateFile(accessToken, file.id, jsonText);

      return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
    }

    if (request.method === 'DELETE') {
      const file = await findStateFile(accessToken);
      if (file) {
        const res = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok && res.status !== 404) {
          throw new DriveApiError('Error al eliminar el archivo de sincronizacion', 502, await res.text());
        }
      }
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
    }

    return new Response(JSON.stringify({ error: 'Metodo no permitido' }), { status: 405, headers });
  } catch (err) {
    if (err instanceof DriveApiError) {
      return new Response(JSON.stringify({ error: err.message, detail: err.detail }), { status: err.status, headers });
    }
    throw err;
  }
}
