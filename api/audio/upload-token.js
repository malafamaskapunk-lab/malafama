// Emite tokens de client-upload para Vercel Blob (el navegador sube el archivo
// directamente a Blob, sin pasar el binario por esta funcion — necesario porque
// las Serverless Functions tienen un limite de tamano de body mucho menor al de
// un archivo de audio). Runtime Node.js por defecto (sin `config.runtime`),
// que es lo que requiere @vercel/blob/client → handleUpload.
import { handleUpload } from '@vercel/blob/client';
import { verifySession } from '../_lib/session.js';

const ALLOWED_CONTENT_TYPES = [
  'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/wave',
  'audio/mp4', 'audio/x-m4a', 'audio/aac', 'audio/ogg', 'audio/flac',
  'audio/webm', 'audio/3gpp', 'audio/*',
];
const MAX_SIZE_BYTES = 150 * 1024 * 1024; // 150 MB

async function getSession(request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const token = cookieHeader.match(/mf_session=([^;]+)/)?.[1];
  return token ? verifySession(token, process.env.SESSION_SECRET) : null;
}

export default async function handler(request) {
  const jsonHeaders = { 'Content-Type': 'application/json' };

  const session = await getSession(request);
  if (!session) {
    return new Response(JSON.stringify({ error: 'No autenticado' }), { status: 401, headers: jsonHeaders });
  }

  const body = await request.json();

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ALLOWED_CONTENT_TYPES,
        addRandomSuffix: true,
        maximumSizeInBytes: MAX_SIZE_BYTES,
        cacheControlMaxAge: 31536000,
      }),
      onUploadCompleted: async () => {
        // No hay base de datos que actualizar: el frontend recibe la URL del
        // blob directamente del resultado de upload() y la guarda en localStorage.
      },
    });
    return new Response(JSON.stringify(jsonResponse), { status: 200, headers: jsonHeaders });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err && err.message ? err.message : 'Error al generar token de subida' }),
      { status: 400, headers: jsonHeaders }
    );
  }
}
