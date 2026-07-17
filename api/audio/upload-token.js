// Emite tokens de client-upload para Vercel Blob (el navegador sube el archivo
// directamente a Blob, sin pasar el binario por esta funcion — necesario porque
// las Serverless Functions tienen un limite de tamano de body mucho menor al de
// un archivo de audio). Runtime Node.js clasico (req, res): @vercel/blob depende
// de `undici`, que usa modulos internos de Node no soportados en Edge, y la
// firma "Request → Response" no funcionaba en el runtime Node de este proyecto
// (se colgaba hasta FUNCTION_INVOCATION_TIMEOUT porque nunca se cerraba la
// respuesta). res.status().json() es la API clasica y siempre soportada.
import { handleUpload } from '@vercel/blob/client';
import { verifySession } from '../_lib/session.js';

const ALLOWED_CONTENT_TYPES = [
  'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/wave',
  'audio/mp4', 'audio/x-m4a', 'audio/aac', 'audio/ogg', 'audio/flac',
  'audio/webm', 'audio/3gpp', 'audio/*',
];
const MAX_SIZE_BYTES = 150 * 1024 * 1024; // 150 MB

async function getSession(req) {
  const cookieHeader = req.headers.cookie || '';
  const token = cookieHeader.match(/mf_session=([^;]+)/)?.[1];
  return token ? verifySession(token, process.env.SESSION_SECRET) : null;
}

export default async function handler(req, res) {
  const session = await getSession(req);
  if (!session) {
    res.status(401).json({ error: 'No autenticado' });
    return;
  }

  try {
    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      token: process.env.BLOB_READ_WRITE_TOKEN,
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
    res.status(200).json(jsonResponse);
  } catch (err) {
    res.status(400).json({ error: err && err.message ? err.message : 'Error al generar token de subida' });
  }
}
