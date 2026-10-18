import { next } from '@vercel/functions';

// Password gate for the preview site.
// Unauthenticated visitors get a branded landing page with a single password
// field (no username). The form posts to /api/access, which verifies the password
// against SITE_PASS and sets an HttpOnly cookie; this middleware checks that cookie.

export const config = { matcher: '/:path*' };

const COOKIE = 'mm_access';
const PUBLIC = new Set([
  '/api/access',
  '/favicon.ico',
  '/favicon-64.png',
  '/apple-touch-icon.png',
  '/assets/maison-maria-lockup.svg',
  '/assets/maison-maria-lockup-light.svg',
  '/assets/img/daily-fluid.jpg',
  '/assets/img/collection.jpg'
]);
const enc = new TextEncoder();

async function expectedToken(pass) {
  const key = await crypto.subtle.importKey('raw', enc.encode(pass), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode('maison-maria-access-v1'));
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
    ? '<p class="err" role="alert">That password is not right. Try again.</p>'
    : state === 'unset'
      ? '<p class="err" role="alert">No password has been set for this site yet.</p>'
      : '';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#3B2A22">
<title>Maison Maria</title>
<link rel="icon" href="/favicon-64.png?v=5" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" as="image" href="/assets/img/daily-fluid.jpg?v=5" media="(max-width: 59.99rem)">
<link rel="preload" as="image" href="/assets/img/collection.jpg?v=5" media="(min-width: 60rem)">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&amp;family=Inter:wght@400;500&amp;display=swap">
<style>
:root { --ivory:#F4EFE6; --sand:#EAE2D6; --taupe:#B9A99B; --taupe-2:#8C7B6B; --espresso:#3B2A22; --ink:#2A1F19; --gold:#C8A961; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html { -webkit-text-size-adjust: 100%; }
body { background: var(--espresso); color: var(--ivory); font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 300; }
.shell { position: relative; min-height: 100svh; }
.photo { position: fixed; inset: 0; z-index: 0; background: var(--espresso); overflow: hidden; }
.photo img { width: 100%; height: 118%; object-fit: cover; object-position: 50% 30%; display: block; animation: fade 1.4s ease both; }
.credit { position: absolute; right: .9rem; top: 3.6rem; font-family: Inter, system-ui, sans-serif; font-size: .58rem; letter-spacing: .14em; text-transform: uppercase; color: rgba(244,239,230,.8); text-shadow: 0 0 6px rgba(42,31,25,.5); z-index: 1; }
.photo::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(42,31,25,.28) 0%, rgba(42,31,25,0) 22%, rgba(42,31,25,0) 40%, rgba(42,31,25,.9) 66%, rgba(42,31,25,.96) 100%); }
.panel { position: relative; z-index: 1; min-height: 100svh; display: flex; flex-direction: column; padding: calc(1.4rem + env(safe-area-inset-top)) 20px calc(1.2rem + env(safe-area-inset-bottom)); }
.logo { width: 260px; max-width: 82%; height: auto; display: block; margin: 0 auto; }
.logo--dark { display: none; }
.rule { width: 2.5rem; height: 1px; background: var(--gold); margin: 1.4rem 0 1.2rem; }
.gate { margin-top: auto; padding-top: 38svh; animation: in 1s .35s ease both; }
h1 { font-weight: 300; font-size: clamp(2rem, 7.5vw, 2.5rem); line-height: 1.08; letter-spacing: .005em; text-wrap: balance; }
.lead { margin-top: .6rem; font-size: 1.15rem; color: rgba(244,239,230,.78); }
form { margin-top: 1.5rem; }
label { display: block; font-family: Inter, system-ui, sans-serif; font-size: .66rem; letter-spacing: .18em; text-transform: uppercase; color: rgba(244,239,230,.75); }
input { display: block; width: 100%; margin-top: .25rem; font: inherit; font-size: 1.3rem; letter-spacing: .12em; padding: .5rem 0; border: 0; border-bottom: 1px solid rgba(244,239,230,.55); background: transparent; color: var(--ivory); caret-color: var(--gold); border-radius: 0; outline: none; }
input:focus { border-bottom-color: var(--gold); }
input:focus-visible { box-shadow: 0 2px 0 0 var(--gold); }
.err { margin-top: .8rem; font-size: 1.05rem; color: var(--ivory); }
button { display: block; width: 100%; margin-top: 1.3rem; font-family: Inter, system-ui, sans-serif; font-size: .72rem; letter-spacing: .2em; text-transform: uppercase; padding: 1rem; border: 1px solid var(--ivory); background: var(--ivory); color: var(--espresso); cursor: pointer; border-radius: 0; transition: background .25s, color .25s; }
button:hover { background: transparent; color: var(--ivory); }
button:focus-visible { outline: 2px solid var(--gold); outline-offset: 3px; }
footer { margin-top: 1.5rem; text-align: center; font-family: Inter, system-ui, sans-serif; font-size: .6rem; letter-spacing: .18em; text-transform: uppercase; color: rgba(244,239,230,.62); }
footer span { display: inline-block; margin: 0 .6rem; }
@keyframes fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .photo img, .gate { animation: none; } }
@media (min-width: 60rem) {
  body { background: var(--ivory); color: var(--ink); }
  .shell { display: grid; grid-template-columns: minmax(26rem, 52%) 1fr; }
  .photo { position: sticky; top: 0; inset: auto; height: 100svh; }
  .photo img { height: 100%; object-position: 26% 50%; }
  .credit { top: .8rem; color: rgba(42,31,25,.55); text-shadow: none; }
  .photo::after { background: linear-gradient(90deg, rgba(42,31,25,0) 85%, rgba(42,31,25,.08) 100%); }
  .panel { min-height: 100svh; justify-content: center; align-items: center; padding: 5rem clamp(2rem, 6vw, 7rem) 6rem; }
  .logo { width: 340px; }
  .logo--light { display: none; }
  .logo--dark { display: block; }
  .gate { margin-top: 2.2rem; padding-top: 0; width: 100%; max-width: 26rem; text-align: center; }
  .rule { margin: 0 auto 1.4rem; }
  h1 { font-size: 2.15rem; }
  .lead { color: var(--taupe-2); }
  form { text-align: left; margin-top: 1.9rem; }
  label { color: var(--taupe-2); }
  input { border-bottom-color: var(--taupe); color: var(--ink); }
  .err { color: var(--espresso); }
  button { background: var(--espresso); color: var(--ivory); border-color: var(--espresso); }
  button:hover { background: transparent; color: var(--espresso); }
  footer { position: absolute; left: 0; right: 0; bottom: 1.8rem; margin: 0; color: var(--taupe-2); }
}
</style>
</head>
<body>
<div class="shell">
  <div class="photo" aria-hidden="true"><picture><source media="(min-width: 60rem)" srcset="/assets/img/collection.jpg?v=5"><img src="/assets/img/daily-fluid.jpg?v=5" alt="" width="960" height="1280"></picture><span class="credit">AI-generated mockup</span></div>
  <main class="panel">
    <img class="logo logo--light" src="/assets/maison-maria-lockup-light.svg?v=5" alt="Maison Maria" width="1191" height="123">
    <img class="logo logo--dark" src="/assets/maison-maria-lockup.svg?v=5" alt="Maison Maria" width="1191" height="123">
    <div class="gate">
      <div class="rule" aria-hidden="true"></div>
      <h1>A private preview.</h1>
      <p class="lead">Enter the password you were given.</p>
      <form method="post" action="/api/access" autocomplete="off">
        <input type="hidden" name="next" value="${esc(nextPath)}">
        <label for="password">Password</label>
        <input id="password" name="password" type="password" autocomplete="current-password" enterkeyhint="go" required spellcheck="false" autocapitalize="off">
        ${message}
        <button type="submit">Enter</button>
      </form>
    </div>
    <footer><span>Fabriqué en France</span><span>Maison Maria · 2027</span></footer>
  </main>
</div>
<script>if (matchMedia('(min-width: 60rem)').matches) { var f = document.getElementById('password'); if (f) f.focus(); }</script>
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
  const state = !pass ? 'unset' : params.get('access') === 'denied' ? 'wrong' : '';
  params.delete('access');
  const q = params.toString();
  const nextPath = (path === '/api/access' ? '/' : path) + (q ? '?' + q : '');
  return new Response(page(nextPath, state), {
    status: 401,
    headers: { ...headers, 'Content-Type': 'text/html; charset=utf-8' }
  });
}
