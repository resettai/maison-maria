// HTTP Basic Auth gate for the preview. Credentials come only from env (SITE_USER / SITE_PASS).
import { next } from '@vercel/functions';

export const config = { matcher: '/:path*' };

function denied() {
  return new Response('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="MARIA", charset="UTF-8"', 'Cache-Control': 'no-store' }
  });
}

export default function middleware(request) {
  const user = process.env.SITE_USER;
  const pass = process.env.SITE_PASS;
  if (!user || !pass) return denied();
  const auth = request.headers.get('authorization') || '';
  const [scheme, encoded] = auth.split(' ');
  if (scheme !== 'Basic' || !encoded) return denied();
  let decoded = '';
  try { decoded = atob(encoded); } catch (e) { return denied(); }
  const i = decoded.indexOf(':');
  const u = decoded.slice(0, i), p = decoded.slice(i + 1);
  if (u === user && p === pass) return next({ headers: { 'X-Robots-Tag': 'noindex, nofollow' } });
  return denied();
}
