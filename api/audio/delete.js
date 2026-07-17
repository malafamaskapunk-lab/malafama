// Elimina un archivo de Vercel Blob (usado al reemplazar/quitar el audio
// subido de una cancion, o al borrar la cancion completa). Best-effort desde
// el frontend: si esto falla no bloquea la operacion en localStorage.
// Runtime Node.js clasico (req, res) — ver upload-token.js para el porque.
import { del } from '@vercel/blob';
import { verifySession } from '../_lib/session.js';

const BLOB_URL_RE = /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//i;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Metodo no permitido' });
    return;
  }

  const cookieHeader = req.headers.cookie || '';
  const token = cookieHeader.match(/mf_session=([^;]+)/)?.[1];
  const session = token ? await verifySession(token, process.env.SESSION_SECRET) : null;
  if (!session) {
    res.status(401).json({ error: 'No autenticado' });
    return;
  }

  const url = req.body && req.body.url;
  if (!url || !BLOB_URL_RE.test(url)) {
    res.status(400).json({ error: 'URL invalida' });
    return;
  }

  try {
    await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN });
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err && err.message ? err.message : 'Error al eliminar archivo' });
  }
}
