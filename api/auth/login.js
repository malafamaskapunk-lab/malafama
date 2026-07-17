export const config = { runtime: 'edge' };

function randomState() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export default async function handler(request) {
  const state = randomState();
  const url = new URL(request.url);
  const redirectUri = `${url.origin}/api/auth/callback/google`;

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.appdata',
    access_type: 'offline',
    prompt: 'consent',
    state,
  });

  const headers = new Headers();
  headers.set('Location', `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
  headers.append('Set-Cookie', `mf_oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`);

  return new Response(null, { status: 302, headers });
}
