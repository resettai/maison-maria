import { next } from '@vercel/functions';

// Password gate for the preview site.
// Unauthenticated visitors get a branded landing page with a single password
// field (no username). The form posts to /api/adgang, which verifies the password
// against SITE_PASS and sets an HttpOnly cookie; this middleware checks that cookie.

export const config = { matcher: '/:path*' };

const COOKIE = 'mm_adgang';
const PUBLIC = new Set([
  '/api/adgang',
  '/favicon.ico',
  '/favicon-64.png',
  '/apple-touch-icon.png',
  '/assets/maison-maria-lockup.svg'
]);
const enc = new TextEncoder();

async function expectedToken(pass) {
  const key = await crypto.subtle.importKey('raw', enc.encode(pass), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode('maison-maria-adgang-v1'));
  return Array.from(new Uint8Array(sig), b => b.toString(16).padStart(2, '0')).join('');
}

function readCookie(request, name) {
  const raw = request.headers.get('cookie') || '';
  for (const part of raw.split(';')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    if (part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
  }
  return '';
}

function same(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function page(nextPath, state) {
  const message = state === 'wrong'
    ? '<p class="err" role="alert">Passordet stemmer ikke. Prøv igjen.</p>'
    : state === 'unset'
      ? '<p class="err" role="alert">Passord er ikke konfigurert for denne siden ennå.</p>'
      : '';
  return `<!doctype html>
<html lang="nb">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Maison Maria</title>
<link rel="icon" href="/favicon-64.png" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&amp;family=Inter:wght@400;500&amp;display=swap">
<style>
:root { --ivory:#F4EFE6; --ivory-2:#FAF7F1; --sand:#EAE2D6; --taupe:#B9A99B; --taupe-2:#8C7B6B; --espresso:#3B2A22; --ink:#2A1F19; --gold:#C8A961; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html { -webkit-text-size-adjust: 100%; }
body { min-height: 100svh; background: var(--ivory); color: var(--ink); font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 300; display: grid; grid-template-rows: 1fr auto; }
main { display: grid; place-items: center; padding: 3rem 16px; }
.gate { width: 100%; max-width: 26rem; text-align: center; animation: in .9s ease both; }
@media (prefers-reduced-motion: reduce) { .gate { animation: none; } }
@keyframes in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
.logo { width: 200px; max-width: 70%; height: auto; display: block; margin: 0 auto; }
.rule { width: 2.5rem; height: 1px; background: var(--gold); margin: 2rem auto 1.6rem; }
h1 { font-weight: 300; font-size: clamp(1.7rem, 5vw, 2.1rem); line-height: 1.15; letter-spacing: .01em; }
.lead { margin-top: .7rem; font-size: 1.15rem; color: var(--taupe-2); }
form { margin-top: 2rem; text-align: left; }
label { display: block; font-family: Inter, system-ui, sans-serif; font-size: .68rem; letter-spacing: .18em; text-transform: uppercase; color: var(--taupe-2); }
input { display: block; width: 100%; margin-top: .3rem; font: inherit; font-size: 1.3rem; letter-spacing: .12em; padding: .55rem 0; border: 0; border-bottom: 1px solid var(--taupe); background: transparent; color: var(--ink); border-radius: 0; outline: none; }
input:focus { border-bottom-color: var(--gold); }
input:focus-visible { box-shadow: 0 2px 0 0 var(--gold); }
.err { margin-top: .9rem; font-size: 1.05rem; color: var(--espresso); }
button { display: block; width: 100%; margin-top: 1.6rem; font-family: Inter, system-ui, sans-serif; font-size: .72rem; letter-spacing: .2em; text-transform: uppercase; padding: 1rem; border: 1px solid var(--espresso); background: var(--espresso); color: var(--ivory); cursor: pointer; border-radius: 0; transition: background .25s, color .25s; }
button:hover { background: transparent; color: var(--espresso); }
button:focus-visible { outline: 2px solid var(--gold); outline-offset: 3px; }
footer { padding: 1.5rem 16px 2rem; text-align: center; font-family: Inter, system-ui, sans-serif; font-size: .62rem; letter-spacing: .18em; text-transform: uppercase; color: var(--taupe-2); }
footer span { display: inline-block; margin: 0 .6rem; }
</style>
</head>
<body>
<main>
  <div class="gate">
    <img class="logo" src="/assets/maison-maria-lockup.svg" alt="Maison Maria" width="200" height="70">
    <div class="rule" aria-hidden="true"></div>
    <h1>Forhåndsvisning for inviterte.</h1>
    <p class="lead">Skriv inn passordet du har fått.</p>
    <form method="post" action="/api/adgang" autocomplete="off">
      <input type="hidden" name="next" value="${esc(nextPath)}">
      <label for="passord">Passord</label>
      <input id="passord" name="passord" type="password" autocomplete="current-password" enterkeyhint="go" required autofocus spellcheck="false" autocapitalize="off">
      ${message}
      <button type="submit">Åpne</button>
    </form>
  </div>
</main>
<footer><span>Fabriqué en France</span><span>Maison Maria · 2027</span></footer>
</body>
</html>`;
}

export default async function middleware(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  if (PUBLIC.has(path)) return next();

  const pass = process.env.SITE_PASS;
  if (pass) {
    const got = readCookie(request, COOKIE);
    if (got && same(got, await expectedToken(pass))) {
      return next({ headers: { 'X-Robots-Tag': 'noindex, nofollow' } });
    }
  }

  const headers = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow', Vary: 'Cookie' };
  const wantsPage = (request.headers.get('accept') || '').includes('text/html') || !/\.[a-z0-9]{2,5}$/i.test(path);
  if (!wantsPage) return new Response('Authentication required', { status: 401, headers });

  const params = new URLSearchParams(url.search);
  const state = !pass ? 'unset' : params.get('adgang') === 'feil' ? 'wrong' : '';
  params.delete('adgang');
  const q = params.toString();
  const nextPath = (path === '/api/adgang' ? '/' : path) + (q ? '?' + q : '');
  return new Response(page(nextPath, state), {
    status: 401,
    headers: { ...headers, 'Content-Type': 'text/html; charset=utf-8' }
  });
}
