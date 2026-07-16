export const config = { runtime: 'edge' };

export default async function handler() {
  const headers = new Headers();
  headers.set('Location', '/login.html');
  headers.append('Set-Cookie', 'mf_session=; Path=/; Max-Age=0');
  return new Response(null, { status: 302, headers });
}
