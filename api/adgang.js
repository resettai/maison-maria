// POST /api/adgang — verifies the preview password and sets the access cookie.
// Pairs with middleware.js (same token derivation). No username, password only.
const crypto = require('crypto');

const COOKIE = 'mm_adgang';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function token(pass) {
  return crypto.createHmac('sha256', pass).update('maison-maria-adgang-v1').digest('hex');
}

function safeNext(n) {
  if (typeof n !== 'string' || !n.startsWith('/') || n.startsWith('//') || n.includes('\\') || n.startsWith('/api/')) return '/';
  return n.slice(0, 500);
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  let raw = typeof req.body === 'string' ? req.body : '';
  if (!raw && req.body === undefined) {
    raw = await new Promise((resolve, reject) => {
      let s = '';
      req.on('data', c => { s += c; if (s.length > 10000) req.destroy(); });
      req.on('end', () => resolve(s));
      req.on('error', reject);
    });
  }
  return Object.fromEntries(new URLSearchParams(raw));
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.statusCode = 405;
    return res.end('Method Not Allowed');
  }

  const body = await readBody(req);
  const next = safeNext(body.next);
  const pass = process.env.SITE_PASS || '';
  const given = String(body.passord || '');

  const a = crypto.createHash('sha256').update(given).digest();
  const b = crypto.createHash('sha256').update(pass).digest();
  const ok = Boolean(pass) && given.length > 0 && crypto.timingSafeEqual(a, b);

  if (!ok) {
    await new Promise(r => setTimeout(r, 600));
    const u = new URL(next, 'https://maisonmaria.northcp.no');
    u.searchParams.set('adgang', 'feil');
    res.statusCode = 303;
    res.setHeader('Location', u.pathname + u.search);
    return res.end();
  }

  res.setHeader('Set-Cookie', `${COOKIE}=${token(pass)}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax`);
  res.statusCode = 303;
  res.setHeader('Location', next);
  res.end();
};
