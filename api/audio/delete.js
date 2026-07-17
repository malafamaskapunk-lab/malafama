// Elimina un archivo de Vercel Blob (usado al reemplazar/quitar el audio
// subido de una cancion, o al borrar la cancion completa). Best-effort desde
// el frontend: si esto falla no bloquea la operacion en localStorage.
import { del } from '@vercel/blob';
import { verifySession } from '../_lib/session.js';

const BLOB_URL_RE = /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//i;

// El runtime Node.js por defecto de Vercel (a diferencia de Edge, usado en
// middleware.js y api/drive/list.js) no entrega un Request estandar — headers
// puede ser un objeto plano sin `.get()`. Soporta ambas formas.
function getCookieHeader(request) {
  const h = request.headers;
  if (h && typeof h.get === 'function') return h.get('cookie') || '';
  return (h && (h.cookie || h['cookie'])) || '';
}

export default async function handler(request) {
  const jsonHeaders = { 'Content-Type': 'application/json' };

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Metodo no permitido' }), { status: 405, headers: jsonHeaders });
  }

  const cookieHeader = getCookieHeader(request);
  const token = cookieHeader.match(/mf_session=([^;]+)/)?.[1];
  const session = token ? await verifySession(token, process.env.SESSION_SECRET) : null;
  if (!session) {
    return new Response(JSON.stringify({ error: 'No autenticado' }), { status: 401, headers: jsonHeaders });
  }

  let url;
  try {
    ({ url } = await request.json());
  } catch {
    return new Response(JSON.stringify({ error: 'JSON invalido' }), { status: 400, headers: jsonHeaders });
  }

  if (!url || !BLOB_URL_RE.test(url)) {
    return new Response(JSON.stringify({ error: 'URL invalida' }), { status: 400, headers: jsonHeaders });
  }

  try {
    await del(url);
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: jsonHeaders });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err && err.message ? err.message : 'Error al eliminar archivo' }),
      { status: 500, headers: jsonHeaders }
    );
  }
}
