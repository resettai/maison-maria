// Maison Maria – static site builder. `node build.js` writes the site into ./public.
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const OUT = path.join(ROOT, 'public');
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'products.json'), 'utf8'));
const C = require('./data/content.js');
const P = data.products;
const bySlug = Object.fromEntries(P.map(p => [p.slug, p]));
const byNeed = Object.fromEntries(data.needs.map(n => [n.id, n]));
const nok = n => 'NOK ' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const catName = id => data.categories.find(c => c.id === id).name;
const WIDE = ['collection', 'set-morning', 'set-complete', 'vanity-king', 'vanity-medium', 'vanity-mini', 'nord', 'atelier'];
const isWide = img => WIDE.includes(img);

const NAV = [
  ['/shop', 'Shop'],
  ['/vanity', 'Vanity Collection'],
  ['/guide', 'Sun guide'],
  ['/journal', 'Journal'],
  ['/maison', 'Maison']
];

function layout({ title, desc, body, current }) {
  const nav = NAV.map(([href, label]) => `<a href="${href}"${current === href ? ' aria-current="page"' : ''}>${label}</a>`).join('');
  const catalog = Object.fromEntries(P.map(p => [p.slug, { name: p.name, sub: p.sub, price: p.price, image: p.image }]));
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#F4EFE6">
<link rel="icon" href="/assets/maria-monogram.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&amp;family=Inter:wght@400;500&amp;display=swap">
<link rel="stylesheet" href="/styles.css">
</head>
<body data-cart-open="false">
<a class="skip" href="#main">Skip to content</a>
<header class="hdr">
  <div class="wrap hdr-in">
    <a class="hdr-brand" href="/" aria-label="Maison Maria – home"><img src="/assets/maria-wordmark-compact.svg" alt="" width="1029" height="288"></a>
    <nav class="nav ui" aria-label="Menu">${nav}</nav>
    <div class="hdr-tools ui">
      <button type="button" class="cart-btn" data-open-cart aria-label="Open cart">Cart <span class="count" data-cart-count data-zero="true">0</span></button>
      <button type="button" class="menu-btn" data-menu aria-expanded="false" aria-controls="mnav">Menu</button>
    </div>
  </div>
  <nav id="mnav" class="mnav ui" data-open="false" aria-label="Menu, mobile">${nav}<a href="/faq">FAQ</a><a href="/contact">Contact</a></nav>
</header>
<main id="main">
${body}
</main>
<footer class="ftr">
  <div class="wrap ftr-in">
    <div><img src="/assets/maison-maria-lockup-inverse.svg" alt="Maison Maria" width="640" height="420"><p class="ftr-note" style="margin-top:1rem">Sun care as skincare. Formulated and made in France. Ålesund, Norway.</p></div>
    <div><h4>Shop</h4><a href="/shop#sun">Sun care</a><a href="/shop#skin">Skincare</a><a href="/shop#sets">Sets</a><a href="/vanity">Vanity Collection</a><a href="/cart">Cart</a></div>
    <div><h4>Learn</h4><a href="/guide">Sun guide</a><a href="/journal">Journal</a><a href="/faq">FAQ</a><a href="/maison#standards">Testing and standards</a></div>
    <div><h4>Maison</h4><a href="/maison">About the house</a><a href="/maison#france">Fabriqué en France</a><a href="/contact">Contact</a><a href="/shipping">Shipping and returns</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a></div>
  </div>
  <div class="wrap"><p class="ftr-note ftr-legal">Preview. Payment is not enabled. Product images are AI-generated mockups and labelled as such. Product information, prices, ingredients and claims are provisional until approved and notified. MARIA Skincare AS (in formation), 2026.</p></div>
</footer>
<div class="drawer-bg" data-close-cart></div>
<aside class="drawer" aria-label="Cart">
  <div class="drawer-h"><h2>Cart</h2><button type="button" class="drawer-x" data-close-cart>Close</button></div>
  <div class="drawer-body" data-cart-lines></div>
  <div class="drawer-f">
    <div class="tot"><span>Total</span><strong data-cart-total>NOK 0</strong></div>
    <a class="btn" href="/cart">View cart</a>
    <button type="button" class="btn" disabled aria-disabled="true" data-checkout>Checkout</button>
    <p class="pay-note">Payment will be enabled once the payment solution and product information are approved. Shipping and VAT are calculated at checkout.</p>
  </div>
</aside>
<script>window.MM_PRODUCTS=${JSON.stringify(catalog)};</script>
<script src="/app.js" defer></script>
</body>
</html>`;
}

function card(p, wide = isWide(p.image)) {
  return `<a class="card${wide ? ' card--wide' : ''}" href="/product/${p.slug}">
  <div class="card-img"><img src="/assets/img/${p.image}-sm.jpg" alt="${esc(p.alt)}" loading="lazy" width="700" height="${wide ? 467 : 933}"></div>
  <h3>${p.name}${p.sub ? `<span>${esc(p.sub)}</span>` : ''}</h3>
  <p class="price">${nok(p.price)}${p.compare ? `<s>${nok(p.compare)}</s>` : ''}</p>
  <p class="format">${esc(p.format)}</p>
</a>`;
}

const grid = (items, cls = '') => `<div class="grid${cls ? ' ' + cls : ''}">${items.map(p => card(p)).join('')}</div>`;

function needChips(active) {
  return `<nav class="chips" aria-label="Shop by need">${data.needs.map(n => `<a href="/for/${n.id}"${active === n.id ? ' aria-current="page"' : ''}>${n.name}</a>`).join('')}</nav>`;
}

const facts = dark => `<dl class="facts${dark ? ' facts--dark' : ''}">
  <div><dt>6–7</dt><dd>midday UV index on a clear June day in Oslo. The same as a spring day in Rome.</dd></div>
  <div><dt>80%</dt><dd>of UV is reflected by fresh snow. A March day on the mountain can match June in the city.</dd></div>
  <div><dt>50+</dt><dd>is the highest protection the EU lets us print. Every MARIA fluid carries it, with UVA protection of at least a third of the SPF.</dd></div>
</dl>
<p class="source${dark ? ' source--dark' : ''}">Sources: Norwegian Radiation and Nuclear Safety Authority (DSA); World Health Organization, Global Solar UV Index. <a href="/journal/melanoma-in-norway">The health numbers, for those who want them</a>.</p>`;

const STANDARDS = `<ul class="std">
  <li><strong>SPF in vivo</strong><span>ISO 24444 at an independent laboratory. 50+ means a measured SPF of at least 60.</span></li>
  <li><strong>UVA at least a third of SPF</strong><span>ISO 24443, critical wavelength above 370 nm. The UVA circle on every sunscreen.</span></li>
  <li><strong>Water resistance</strong><span>ISO 16217: 40 minutes for the face fluids, 80 minutes for Sport Stick and Body Fluid.</span></li>
  <li><strong>Notified before sale</strong><span>Safety assessment, Product Information File and CPNP notification under EU Regulation 1223/2009.</span></li>
</ul>`;

function journalCard(a) {
  return `<a class="card card--wide jcard" href="/journal/${a.slug}"><div class="card-img"><img src="/assets/img/${a.image}-sm.jpg" alt="" loading="lazy" width="700" height="${isWide(a.image) ? 467 : 933}"></div><p class="format">${a.date} · ${a.read}</p><h3>${a.title}</h3><p class="dek">${a.dek}</p></a>`;
}

// ---------- home ----------
const sun = P.filter(p => p.category === 'sun');
const skin = P.filter(p => p.category === 'skin');
const sets = P.filter(p => p.category === 'sets');
const home = layout({
  title: 'Maison Maria – sun care as skincare, made in France',
  desc: 'MARIA: luxury sun care and skincare from Norway, formulated and made in France. SPF 50+ fluids, serums, the Vanity Collection and more.',
  current: '/',
  body: `
<section class="hero" aria-labelledby="h1">
  <div class="hero-img"><img src="/assets/img/collection.jpg" alt="The MARIA collection on travertine in Nordic daylight (AI-generated mockup)" width="1536" height="1024" fetchpriority="high"><span class="hero-credit">AI-generated mockup</span></div>
  <div class="hero-in">
    <span class="ui">Fabriqué en France · launching June 2027</span>
    <h1 id="h1">Take care of the skin you have.</h1>
    <p>Sun protection as skincare. SPF 50+ every day, made in France for Nordic light.</p>
    <a class="btn" href="/shop">See the collection</a>
  </div>
</section>

<section class="sec sec--tight" aria-label="Shop by need">
  <div class="wrap">
    <p class="ui" style="color:var(--gold)">Shop by need</p>
    ${needChips()}
  </div>
</section>

<section class="sec" aria-labelledby="h-sun">
  <div class="wrap">
    <div class="sec-head"><span class="ui">Sun care</span><h2 id="h-sun">Eight ways to wear SPF.</h2><p>Face, lips, hands and body. Fragrance-free, vegan and non-comedogenic, with EU-approved UV filters only.</p></div>
    ${grid(sun, 'grid--4')}
  </div>
</section>

<section class="sec" style="background:var(--ivory-2)" aria-labelledby="h-skin">
  <div class="wrap">
    <div class="sec-head"><span class="ui">Skincare</span><h2 id="h-skin">What comes before the sun, and what repairs after it.</h2><p>A cleanser that removes SPF, serums that hold water and antioxidants, a barrier cream and a night cream without retinol.</p></div>
    ${grid(skin, 'grid--4')}
  </div>
</section>

<section class="sec" aria-labelledby="h-sets">
  <div class="wrap">
    <div class="sec-head"><span class="ui">Sets</span><h2 id="h-sets">Routines put together.</h2><p>Priced below the sum of the parts, boxed in ivory board with blind embossing.</p></div>
    ${grid(sets)}
  </div>
</section>

<section class="band band--dark" aria-labelledby="h-vanity">
  <div class="band-img"><img src="/assets/img/vanity-king.jpg" alt="${esc(bySlug['vanity-king-size'].alt)}" loading="lazy" width="1280" height="960"></div>
  <div class="band-txt">
    <span class="ui" style="color:var(--gold)">Vanity Collection</span>
    <h2 id="h-vanity">The whole routine, packed in espresso and gold.</h2>
    <p>Three sizes: King Size for the bathroom, Medium for travel, Mini for the handbag. Vegan leather, champagne-gold hardware, and the products packed and ready.</p>
    <a class="btn" href="/vanity">See the Vanity Collection</a>
  </div>
</section>

<section class="strip" aria-labelledby="h-soleil">
  <img src="/assets/img/nord.jpg" alt="Low sun over a Norwegian fjord (AI-generated illustration)" loading="lazy" width="1536" height="1024">
  <div class="strip-txt"><span class="ui">Soleil du Nord</span><h2 id="h-soleil">The light sits low here. It still counts.</h2></div>
</section>
<section class="sec" style="background:var(--espresso);color:var(--ivory)">
  <div class="wrap">
    <div class="sec-head"><h2 style="color:var(--ivory)">Northern light, taken seriously.</h2><p style="color:#D9CFC2">Low sun, long days, snow and water. Norway gets more UV than it feels, and MARIA is formulated for exactly that light.</p></div>
    ${facts(true)}
    <p style="margin-top:2rem"><a class="btn btn--ghost btn--light" href="/guide">Read the sun guide</a></p>
  </div>
</section>

<section class="band band--rev" aria-labelledby="h-france">
  <div class="band-img"><img src="/assets/img/atelier.jpg" alt="Laboratory bench with glassware (AI-generated illustration)" loading="lazy" width="953" height="1024"></div>
  <div class="band-txt">
    <span class="ui" style="color:var(--gold)">Fabriqué en France</span>
    <h2 id="h-france">Formulated and made outside Lyon.</h2>
    <p>At a French house that has made skincare and sun care since 1947, with its own SPF laboratory and ISO 22716 certification. Every sunscreen is tested to ISO 24444 and ISO 24443 before it reaches the market.</p>
    <a class="btn btn--ghost" href="/maison">About the house</a>
  </div>
</section>

<section class="sec" aria-labelledby="h-std">
  <div class="wrap">
    <div class="sec-head"><span class="ui">Testing and standards</span><h2 id="h-std">What every MARIA sunscreen goes through.</h2></div>
    ${STANDARDS}
  </div>
</section>

<section class="sec" style="background:var(--ivory-2)" aria-labelledby="h-journal">
  <div class="wrap">
    <div class="sec-head"><span class="ui">Journal</span><h2 id="h-journal">Notes on sun, skin and the north.</h2></div>
    <div class="grid">${C.journal.slice(0, 3).map(journalCard).join('')}</div>
    <p style="margin-top:2rem"><a class="btn btn--ghost" href="/journal">All articles</a></p>
  </div>
</section>

<section class="sec" aria-labelledby="h-wl">
  <div class="wrap">
    <div class="sec-head"><span class="ui">The waitlist</span><h2 id="h-wl">The first 1,000 receive the Starter Set before launch.</h2></div>
    <form id="waitlist" class="form" novalidate style="margin-top:1.5rem">
      <label for="wl-name">Name</label><input id="wl-name" type="text" autocomplete="name">
      <label for="wl-email">Email</label><input id="wl-email" type="email" autocomplete="email">
      <button class="btn" type="submit">Put me on the list</button>
      <p class="pdp-note" style="margin-top:.8rem">Preview. Nothing is sent or stored.</p>
    </form>
    <p id="wl-confirm" class="quote" hidden></p>
  </div>
</section>`
});

// ---------- shop ----------
const shop = layout({
  title: 'Shop – Maison Maria',
  desc: 'The full MARIA collection: sun care, skincare, sets and the Vanity Collection.',
  current: '/shop',
  body: `<section class="sec" style="padding-top:3rem">
  <div class="wrap">
    <div class="sec-head"><h1 style="font-size:clamp(2.4rem,5vw,3.6rem)">Shop</h1><p>${P.length} products, four families. Payment is enabled at launch.</p></div>
    <p class="ui catnav">${data.categories.map(c => `<a href="#${c.id}">${c.name}</a>`).join('')}</p>
    <p class="ui" style="margin-top:2rem;color:var(--gold)">Or shop by need</p>
    ${needChips()}
    ${data.categories.map(c => `
    <h2 id="${c.id}" class="cat-h">${c.name}</h2>
    <p class="cat-p">${c.blurb}</p>
    ${grid(P.filter(p => p.category === c.id), c.id === 'sun' || c.id === 'skin' ? 'grid--4' : '')}`).join('')}
  </div>
</section>`
});

// ---------- needs ----------
function needPage(n) {
  const items = n.products.map(s => bySlug[s]);
  return layout({
    title: `${n.name} – Maison Maria`,
    desc: n.blurb,
    current: '/shop',
    body: `<section class="sec" style="padding-top:3rem"><div class="wrap">
  <p class="crumbs"><a href="/shop">Shop</a> / Shop by need</p>
  <div class="sec-head"><span class="ui">Shop by need</span><h1 style="font-size:clamp(2.4rem,5vw,3.6rem)">${n.name}</h1><p>${n.blurb}</p></div>
  ${needChips(n.id)}
  ${grid(items, items.length > 3 ? 'grid--4' : '')}
</div></section>`
  });
}

// ---------- vanity ----------
const V = P.filter(p => p.category === 'vanity');
const vanity = layout({
  title: 'Vanity Collection – Maison Maria',
  desc: 'Maison Maria Vanity Collection: King Size, Medium and Mini in espresso vegan leather with gold.',
  current: '/vanity',
  body: `<section class="band band--dark" aria-labelledby="hv">
  <div class="band-img"><img src="/assets/img/vanity-king.jpg" alt="${esc(bySlug['vanity-king-size'].alt)}" width="1280" height="960" fetchpriority="high"></div>
  <div class="band-txt"><span class="ui" style="color:var(--gold)">Maison Maria</span><h1 id="hv" style="font-size:clamp(2.4rem,5vw,3.6rem)">Vanity Collection</h1><p>Three sizes, one language: espresso pebbled vegan leather, champagne-gold hardware, ivory lining. Every case comes with the products packed and ready.</p><p class="ai-note" style="color:#B5A999">Images are AI-generated mockups</p></div>
</section>
<section class="sec"><div class="wrap">
  ${grid(V)}
  <h2 style="font-size:2rem;margin-top:4rem">Compare</h2>
  <div class="tbl-wrap"><table class="tbl">
    <thead><tr><th>Model</th><th>Dimensions</th><th>Contents</th><th>Price</th></tr></thead>
    <tbody>${V.map(p => `<tr><td><a href="/product/${p.slug}">${p.name}</a></td><td>${p.dims}</td><td>${[...new Set(p.set)].map(s => { const n = p.set.filter(x => x === s).length; return bySlug[s].name + (bySlug[s].sub ? ' ' + bySlug[s].sub : '') + (n > 1 ? ' × ' + n : ''); }).join(', ')}</td><td style="white-space:nowrap">${nok(p.price)}</td></tr>`).join('')}</tbody>
  </table></div>
  <h2 style="font-size:2rem;margin-top:4rem">The material</h2>
  <div class="cols2">
    <p>The cases are made from a solvent-free polyurethane on a recycled polyester backing, embossed with a fine pebble grain and edge-painted in espresso. It was chosen over leather to keep the collection vegan, and over cheaper vegan options because it does not crack at the corners after a winter in a handbag.</p>
    <p>Hardware is zinc alloy plated in champagne gold, zips are YKK Excella. The lining is ivory microsuede, wipe-clean, with elastic loops sized to the MARIA bottles. Every case carries a discreet gold MARIA mark on the front and Fabriqué en France on the inside label.</p>
  </div>
  <p class="pdp-note" style="margin-top:1.5rem">Materials, dimensions and prices are provisional until the manufacturer and payment are approved.</p>
</div></section>`
});

// ---------- product pages ----------
function productPage(p) {
  const pairs = (p.pairs || []).map(s => bySlug[s]).filter(Boolean);
  const rel = pairs.length >= 3 ? pairs : pairs.concat(P.filter(x => x.slug !== p.slug && x.category === p.category && !pairs.includes(x)).slice(0, 3 - pairs.length));
  const wide = isWide(p.image);
  const variant = p.variants ? `<label for="variant">${p.variants.label}</label><select id="variant" data-for="${p.slug}">${p.variants.options.map(o => `<option>${o}</option>`).join('')}</select>` : '';
  const setBlock = p.set ? `<section class="pdp-set"><h2>Contains</h2><div class="set-list">${[...new Set(p.set)].map(s => { const q = bySlug[s]; const n = p.set.filter(x => x === s).length; return `<a href="/product/${q.slug}"><div class="card-img"><img src="/assets/img/${q.image}-sm.jpg" alt="${esc(q.alt)}" loading="lazy" width="700" height="700"></div><h3>${q.name} ${q.sub || ''}${n > 1 ? ' × ' + n : ''}</h3></a>`; }).join('')}</div></section>` : '';
  const ingredients = p.ingredients ? `<details class="acc" open><summary>Key ingredients</summary><dl class="kv">${p.ingredients.map(i => `<div><dt>${esc(i.name)}</dt><dd>${esc(i.role)}</dd></div>`).join('')}</dl></details>` : '';
  const freeFrom = p.free_from ? `<details class="acc"><summary>Formulated without</summary><ul class="inline-list">${p.free_from.map(f => `<li>${esc(f)}</li>`).join('')}</ul></details>` : '';
  const tests = p.tests ? `<details class="acc"><summary>Testing and standards</summary><ul>${p.tests.map(t => `<li>${esc(t)}</li>`).join('')}</ul><p class="pdp-note" style="margin-top:.8rem">Test results are provisional until the final formula is approved. <a href="/maison#standards">How we test</a>.</p></details>` : '';
  const faq = p.faq && p.faq.length ? `<section class="pdp-faq"><h2>Questions</h2>${p.faq.map(f => `<details class="faq"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}<p class="pdp-note" style="margin-top:1rem"><a href="/faq">All questions and answers</a></p></section>` : '';
  const skinChips = p.skin ? `<p class="skin-for"><span>For</span>${p.skin.map(s => `<em>${esc(s)}</em>`).join('')}</p>` : '';
  return layout({
    title: `${p.name} ${p.sub || ''} – Maison Maria`.replace(/\s+/g, ' '),
    desc: p.short,
    current: p.category === 'vanity' ? '/vanity' : '/shop',
    body: `<section class="wrap pdp">
  <figure class="pdp-img${wide ? ' pdp-img--wide' : ''}"><img src="/assets/img/${p.image}.jpg" alt="${esc(p.alt)}" width="${wide ? 1536 : 960}" height="${wide ? 1024 : 1280}" fetchpriority="high"><figcaption class="ai-note" style="padding:.6rem 0">Product image: AI-generated mockup</figcaption></figure>
  <div class="pdp-info">
    <p class="crumbs"><a href="/shop">Shop</a> / <a href="/shop#${p.category}">${catName(p.category)}</a></p>
    <h1>${p.name}${p.sub ? `<span>${esc(p.sub)}</span>` : ''}</h1>
    <p class="pdp-kicker">${esc(p.kicker)}</p>
    <p class="pdp-price">${nok(p.price)}${p.compare ? `<s>${nok(p.compare)}</s>` : ''}</p>
    <p class="pdp-format">${esc(p.format)}</p>
    <p class="pdp-short">${esc(p.short)}</p>
    <ul class="pdp-claims">${p.claims.map(c => `<li>${esc(c)}</li>`).join('')}</ul>
    ${skinChips}
    <div class="pdp-buy">${variant}<button type="button" class="btn" data-add="${p.slug}">Add to cart</button><p class="pdp-note">Preview: the cart works, payment is enabled at launch. Free shipping in Norway over NOK 800.</p></div>
    <div style="margin-top:2rem">
      <details class="acc" open><summary>How to use</summary><p>${esc(p.use)}</p></details>
      ${ingredients}
      ${freeFrom}
      ${tests}
      <details class="acc"><summary>Details</summary><ul>${p.details.map(d => `<li>${esc(d)}</li>`).join('')}</ul></details>
      <details class="acc"><summary>Delivery and returns</summary><p>Ships within one working day from Oslo. Two to four working days in Norway, three to seven in the EU and UK. Free shipping in Norway over NOK 800. 30-day returns on unopened products. <a href="/shipping">Full terms</a>.</p></details>
    </div>
    ${setBlock}
    ${faq}
  </div>
</section>
<section class="wrap related"><h2 style="font-size:1.8rem">Goes with</h2>${grid(rel)}</section>`
  });
}

// ---------- maison ----------
const maison = layout({
  title: 'Maison – Maison Maria',
  desc: 'About Maison Maria: a Norwegian sun-care house, formulated and made in France. Principles, production, testing and packaging.',
  current: '/maison',
  body: `<section class="band" aria-labelledby="hm">
  <div class="band-img"><img src="/assets/img/collection.jpg" alt="${esc(bySlug['starter-set'].alt)}" width="1536" height="1024" fetchpriority="high"></div>
  <div class="band-txt"><span class="ui" style="color:var(--gold)">Maison Maria</span><h1 id="hm" style="font-size:clamp(2.4rem,5vw,3.6rem)">A Norwegian sun-care house, made in France.</h1><p>MARIA is built around one idea: that protection should be the easiest step in the routine, not the one you skip. Sun care formulated like skincare, skincare formulated around the sun, and no claims we cannot document.</p></div>
</section>

<section class="sec" aria-labelledby="h-pr"><div class="wrap">
  <div class="sec-head"><span class="ui">Principles</span><h2 id="h-pr">Five things we hold to.</h2></div>
  <ol class="principles">
    <li><h3>The highest category, every day</h3><p>Every face fluid is 50+, the top of the EU scale, with UVA protection above the legal minimum. The number is the same on the lightest texture and the tinted one.</p></li>
    <li><h3>Filters chosen, not inherited</h3><p>Four modern photostable filters and zinc oxide. No octocrylene, homosalate, oxybenzone or octinoxate, because 50+ does not need them.</p></li>
    <li><h3>Nothing that does not earn its place</h3><p>No fragrance, no colourants beyond the iron oxides that give a tint, no alcohol that dries. If an ingredient is in the bottle, it is on the product page with its reason.</p></li>
    <li><h3>Tested where it will be worn</h3><p>ISO tests at independent laboratories in France, and a 28-day use panel in Norway between March and June, when the light changes fastest.</p></li>
    <li><h3>Made to be kept</h3><p>Frosted glass, airless pumps, refills planned from the second year. Boxes in FSC board printed in Norway. Vegan throughout.</p></li>
  </ol>
</div></section>

<section class="sec" style="background:var(--espresso);color:var(--ivory)"><div class="wrap">
  <div class="sec-head"><span class="ui" style="color:var(--gold)">Soleil du Nord</span><h2 style="color:var(--ivory)">Why a Norwegian sun-care brand.</h2><p style="color:#D9CFC2">Norway gets more sun than it feels: low light that reaches the face, long days, snow and water that reflect it. Protection used every day is the most effective habit there is, and a daily habit needs a product people want to wear.</p></div>
  <div style="color:var(--ivory)">${facts(true)}</div>
</div></section>

<section class="band band--rev" id="france" aria-labelledby="hf">
  <div class="band-img"><img src="/assets/img/atelier.jpg" alt="Laboratory bench with glassware (AI-generated illustration)" loading="lazy" width="953" height="1024"></div>
  <div class="band-txt"><span class="ui" style="color:var(--gold)">Fabriqué en France</span><h2 id="hf">Château-Gaillard, outside Lyon.</h2><p>MARIA is formulated and made at a family-owned French house that has produced skincare and sun care since 1947, with its own laboratory measuring SPF before anything leaves the building. The factory is certified to ISO 22716 (cosmetics GMP) and approved for COSMOS.</p><p>The glass comes from a French glassworks that supplies the perfume houses. The boxes are printed in Norway. <a href="/journal/why-france">Why France, in more detail</a>.</p></div>
</section>

<section class="sec" id="standards" aria-labelledby="h-st"><div class="wrap">
  <div class="sec-head"><span class="ui">Testing and standards</span><h2 id="h-st">How a MARIA sunscreen is proven.</h2><p>Every sunscreen is tested at independent laboratories and notified in the EU before it is sold. These are the methods behind the numbers on the label.</p></div>
  ${STANDARDS}
  <div class="cols2" style="margin-top:3rem">
    <div><h3 class="h3">The regulatory frame</h3><p>Cosmetics in the EU and Norway are governed by Regulation (EC) 1223/2009. Each product has a Product Information File, a Cosmetic Product Safety Report signed by a qualified assessor, and a Responsible Person who answers for it. UV filters may only be those on the regulation's positive list, at or below the permitted concentration. Sunscreen labelling follows Commission Recommendation 2006/647/EC: eight SPF categories, the UVA circle, and no claims of total or all-day protection.</p></div>
    <div><h3 class="h3">Skincare too</h3><p>The products without SPF go through stability testing at 25 and 40 degrees, challenge testing of the preservative system, dermatological testing under occlusion, and for the barrier products a 28-day measurement of transepidermal water loss. Results are summarised on each product page and are provisional until the final formulas are approved.</p></div>
  </div>
</div></section>

<section class="sec" style="background:var(--ivory-2)" aria-labelledby="h-pk"><div class="wrap">
  <div class="sec-head"><span class="ui">Packaging</span><h2 id="h-pk">Glass, board and what we left out.</h2></div>
  <div class="cols3">
    <div><h3 class="h3">Glass</h3><p>Fluids, serums and creams come in frosted glass with airless pumps or wide-mouth jars. Glass is heavier to ship than plastic and better for the filters, the vitamin C and the hand. Refill cartridges for the three most used products are planned for year two.</p></div>
    <div><h3 class="h3">Board</h3><p>Outer boxes are FSC-certified ivory board, printed in Norway with blind embossing instead of foil. There is no cellophane, no insert and no leaflet; the product page is the leaflet.</p></div>
    <div><h3 class="h3">Leather, without the animal</h3><p>The Vanity Collection is made from a solvent-free polyurethane on recycled polyester, chosen for durability over the cheaper options. Hardware is plated zinc alloy, zips are YKK.</p></div>
  </div>
</div></section>

<section class="sec" aria-labelledby="h-co"><div class="wrap">
  <div class="sec-head"><span class="ui">Company</span><h2 id="h-co">MARIA Skincare AS</h2><p>Registered in Ålesund, Norway, in formation. Formulation and production in France, warehouse outside Oslo, delivery to Norway, the EU and the UK from June 2027.</p></div>
  <p style="margin-top:1.5rem"><a class="btn btn--ghost" href="/contact">Contact</a></p>
</div></section>`
});

// ---------- guide ----------
const guide = layout({
  title: 'Sun guide – Maison Maria',
  desc: 'The sun in the north, month by month: UV index, how much sunscreen to apply, what the SPF numbers mean and which MARIA product to choose.',
  current: '/guide',
  body: `<section class="strip strip--tall" aria-labelledby="hg">
  <img src="/assets/img/nord.jpg" alt="Low sun over a Norwegian fjord (AI-generated illustration)" width="1536" height="1024" fetchpriority="high">
  <div class="strip-txt"><span class="ui">Sun guide</span><h1 id="hg">Sun in the north.</h1><p>A year of UV in Norway, how much to apply, and what the numbers on the bottle mean.</p></div>
</section>

<section class="sec" aria-labelledby="h-uv"><div class="wrap">
  <div class="sec-head"><span class="ui">Month by month</span><h2 id="h-uv">The UV index in Norway.</h2><p>Typical clear-sky midday values. The World Health Organization recommends protection from index 3. Cloud reduces UV less than it feels; snow, water and altitude add to it.</p></div>
  <div class="tbl-wrap"><table class="tbl tbl--uv">
    <thead><tr><th>Month</th><th>Southern Norway</th><th>Northern Norway</th><th>What it means</th></tr></thead>
    <tbody>${C.guide.uv.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join('')}</tbody>
  </table></div>
  <p class="source">Sources: Norwegian Radiation and Nuclear Safety Authority (DSA) UV forecasts; World Health Organization, Global Solar UV Index. Approximate values for Oslo and Tromsø.</p>
</div></section>

<section class="sec" style="background:var(--ivory-2)" aria-labelledby="h-amt"><div class="wrap">
  <div class="sec-head"><span class="ui">How much</span><h2 id="h-amt">The teaspoon rule.</h2><p>SPF is measured at 2 milligrams per square centimetre. Most people apply a quarter to a half of that, and protection falls far faster than the amount.</p></div>
  <div class="tbl-wrap"><table class="tbl">
    <thead><tr><th>Area</th><th>Amount</th><th>In MARIA terms</th></tr></thead>
    <tbody>${C.guide.amounts.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</tbody>
  </table></div>
  <p style="margin-top:1.5rem"><a href="/journal/the-teaspoon-rule">More on dosing in the journal</a></p>
</div></section>

<section class="sec" aria-labelledby="h-spf"><div class="wrap">
  <div class="sec-head"><span class="ui">The numbers</span><h2 id="h-spf">What SPF actually measures.</h2><p>SPF describes protection against UVB, the wavelengths that burn, at the tested dose. The UVA circle describes the rest.</p></div>
  <div class="cols2">
    <div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>Category</th><th>UVB filtered</th><th>Gets through</th></tr></thead>
      <tbody>${C.guide.spf.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</tbody>
    </table></div>
    <div>
      <h3 class="h3">UVA</h3><p>UVA penetrates deeper, drives most visible ageing and contributes to melanoma risk. In the EU, the UVA-in-a-circle mark means UVA protection is at least a third of the SPF and the critical wavelength is 370 nm or more. All MARIA sunscreens carry it.</p>
      <h3 class="h3" style="margin-top:1.5rem">Water resistance</h3><p>"Water resistant" keeps at least half its SPF after two 20-minute swims; "very water resistant" after four. Towelling removes more than water. Reapply after both.</p>
      <h3 class="h3" style="margin-top:1.5rem">Snow and altitude</h3><p>Fresh snow reflects up to 80 percent of UV back at the face, and UV rises roughly 10 percent per 1,000 metres. A March day on the mountain can match a June day in the city.</p>
    </div>
  </div>
</div></section>

<section class="sec" style="background:var(--ivory-2)" aria-labelledby="h-ch"><div class="wrap">
  <div class="sec-head"><span class="ui">Which one</span><h2 id="h-ch">Choosing a MARIA sunscreen.</h2></div>
  <ul class="choose">${C.guide.choose.map(([t, s]) => { const p = bySlug[s]; return `<li><span>${t}</span><a href="/product/${p.slug}"><img src="/assets/img/${p.image}-sm.jpg" alt="" loading="lazy" width="525" height="700">${p.name} <em>${p.sub}</em></a></li>`; }).join('')}</ul>
</div></section>

<section class="sec" aria-labelledby="h-re"><div class="wrap">
  <div class="sec-head"><span class="ui">The routine</span><h2 id="h-re">Morning and evening, in order.</h2></div>
  <div class="cols2">
    <div><h3 class="h3">Morning</h3><ol class="steps"><li><a href="/product/cleanser">Cleanser</a>, or water if the skin is dry</li><li><a href="/product/antioxidant-serum">Antioxidant Serum</a>, four drops, wait a minute</li><li><a href="/product/hydrating-serum">Hydrating Serum</a> in the dry months</li><li><a href="/product/moisturiser">Daily Moisturiser</a> for normal to dry skin</li><li><a href="/product/daily-fluid">Daily</a>, <a href="/product/tinted-fluid">Tinted</a> or <a href="/product/mineral-fluid">Mineral Fluid</a>, two pumps, last</li><li><a href="/product/lip-spf30">Lip SPF 30</a> and <a href="/product/hand-cream">Hand Cream SPF 30</a> on the way out</li></ol></div>
    <div><h3 class="h3">Midday and evening</h3><ol class="steps"><li><a href="/product/sun-mist">Sun Mist</a> over make-up every two hours outdoors, or <a href="/product/sport-stick">Sport Stick</a> on bare skin</li><li><a href="/product/cleanser">Cleanser</a>, twice after a day of reapplying</li><li><a href="/product/toner">Exfoliating Toner</a> three evenings a week</li><li><a href="/product/hydrating-serum">Hydrating Serum</a></li><li><a href="/product/night-cream">Night Cream</a>, or <a href="/product/after-sun">After Sun</a> after a long day outside</li></ol></div>
  </div>
</div></section>`
});

// ---------- journal ----------
const journal = layout({
  title: 'Journal – Maison Maria',
  desc: 'Notes on sun, skin and the north: SPF explained, how we chose the filters, melanoma in Norway, why France.',
  current: '/journal',
  body: `<section class="sec" style="padding-top:3rem"><div class="wrap">
  <div class="sec-head"><span class="ui">Journal</span><h1 style="font-size:clamp(2.4rem,5vw,3.6rem)">Notes on sun, skin and the north.</h1><p>What we learned building a sunscreen for a country with long winters, written down so you do not have to take our word for it.</p></div>
  <div class="grid" style="margin-top:3rem">${C.journal.map(journalCard).join('')}</div>
</div></section>`
});

function articlePage(a, i) {
  const next = C.journal[(i + 1) % C.journal.length];
  return layout({
    title: `${a.title} – Maison Maria`,
    desc: a.dek,
    current: '/journal',
    body: `<article class="article">
  <header class="wrap article-h">
    <p class="crumbs"><a href="/journal">Journal</a></p>
    <h1>${a.title}</h1>
    <p class="dek">${a.dek}</p>
    <p class="format">${a.date} · ${a.read} read</p>
  </header>
  <figure class="article-img"><img src="/assets/img/${a.image}.jpg" alt="" width="${isWide(a.image) ? 1536 : 960}" height="${isWide(a.image) ? 1024 : 1280}" fetchpriority="high"><figcaption class="ai-note">AI-generated image</figcaption></figure>
  <div class="wrap article-body">${a.body}</div>
  <footer class="wrap article-f"><p class="ui" style="color:var(--gold)">Next</p><a class="next" href="/journal/${next.slug}">${next.title}</a></footer>
</article>`
  });
}

// ---------- faq ----------
const faqPage = layout({
  title: 'FAQ – Maison Maria',
  desc: 'Questions and answers about MARIA products, pregnancy, children, reef safety, shelf life, delivery, returns and the house.',
  current: '',
  body: `<section class="sec" style="padding-top:3rem"><div class="wrap narrow">
  <div class="sec-head"><span class="ui">Questions</span><h1 style="font-size:clamp(2.4rem,5vw,3.6rem)">Asked and answered.</h1><p>If it is not here, <a href="/contact">write to us</a>.</p></div>
  ${C.faq.map(g => `<h2 class="faq-g">${g.group}</h2>${g.items.map(f => `<details class="faq"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}`).join('')}
</div></section>`
});

// ---------- simple pages ----------
function textPage({ title, desc, kicker, h1, html, slug }) {
  return layout({ title: `${title} – Maison Maria`, desc, current: '', body: `<section class="sec" style="padding-top:3rem"><div class="wrap narrow prose">
  <div class="sec-head"><span class="ui">${kicker}</span><h1 style="font-size:clamp(2.4rem,5vw,3.6rem)">${h1}</h1></div>
  ${html}
</div></section>` });
}
const shipping = textPage({ title: 'Shipping and returns', desc: 'Delivery times, shipping costs and the return policy at Maison Maria.', kicker: 'Service', h1: 'Shipping and returns.', html: C.shipping });
const privacy = textPage({ title: 'Privacy', desc: 'How Maison Maria handles personal data.', kicker: 'Legal', h1: 'Privacy.', html: C.privacy });
const terms = textPage({ title: 'Terms', desc: 'Terms of sale at Maison Maria.', kicker: 'Legal', h1: 'Terms of sale.', html: C.terms });

const contact = layout({
  title: 'Contact – Maison Maria',
  desc: 'Contact Maison Maria: customer care, press, wholesale.',
  current: '',
  body: `<section class="sec" style="padding-top:3rem"><div class="wrap">
  <div class="sec-head"><span class="ui">Contact</span><h1 style="font-size:clamp(2.4rem,5vw,3.6rem)">Write to us.</h1><p>We answer within one working day, in English or Norwegian.</p></div>
  <div class="cols3" style="margin-top:2.5rem">
    <div><h3 class="h3">Customer care</h3><p><a href="mailto:care@maisonmaria.no">care@maisonmaria.no</a><br>Orders, returns, product advice.</p></div>
    <div><h3 class="h3">Press</h3><p><a href="mailto:press@maisonmaria.no">press@maisonmaria.no</a><br>Images, samples, interviews.</p></div>
    <div><h3 class="h3">Wholesale</h3><p><a href="mailto:wholesale@maisonmaria.no">wholesale@maisonmaria.no</a><br>Selected retail partners from 2028.</p></div>
  </div>
  <form id="contact" class="form" novalidate style="margin-top:3rem">
    <label for="c-name">Name</label><input id="c-name" type="text" autocomplete="name">
    <label for="c-email">Email</label><input id="c-email" type="email" autocomplete="email">
    <label for="c-msg">Message</label><textarea id="c-msg" rows="4"></textarea>
    <button class="btn" type="submit">Send</button>
    <p class="pdp-note" style="margin-top:.8rem">Preview. Nothing is sent or stored. Email addresses are activated at launch.</p>
  </form>
  <p id="c-confirm" class="quote" hidden></p>
  <p style="margin-top:3rem" class="pdp-note">MARIA Skincare AS (in formation) · Ålesund, Norway</p>
</div></section>`
});

// ---------- cart page ----------
const cart = layout({
  title: 'Cart – Maison Maria',
  desc: 'Your Maison Maria cart.',
  current: '/cart',
  body: `<section class="wrap cart-page">
  <h1>Cart</h1>
  <div data-cart-lines style="margin-top:1.5rem"></div>
  <div class="cart-sum">
    <div class="tot"><span>Total</span><strong data-cart-total>NOK 0</strong></div>
    <button type="button" class="btn" disabled aria-disabled="true" data-checkout>Checkout</button>
    <p class="pay-note">Payment will be enabled once the payment solution and product information are approved. The cart is stored only in this browser.</p>
    <a class="btn btn--ghost" href="/shop">Continue shopping</a>
  </div>
</section>`
});

const notFound = layout({ title: 'Page not found – Maison Maria', desc: 'This page does not exist.', current: '', body: `<section class="wrap sec"><h1 style="font-size:2.6rem">This page does not exist.</h1><p style="margin-top:1rem"><a href="/">Back to the front page</a> · <a href="/shop">Shop</a></p></section>` });

// ---------- write ----------
for (const stale of ['produkt', 'handlekurv.html']) fs.rmSync(path.join(OUT, stale), { recursive: true, force: true });
for (const d of ['product', 'for', 'journal']) fs.mkdirSync(path.join(OUT, d), { recursive: true });
const pages = {
  'index.html': home, 'shop.html': shop, 'vanity.html': vanity, 'maison.html': maison, 'guide.html': guide,
  'journal.html': journal, 'faq.html': faqPage, 'shipping.html': shipping, 'privacy.html': privacy, 'terms.html': terms,
  'contact.html': contact, 'cart.html': cart, '404.html': notFound
};
for (const [f, html] of Object.entries(pages)) fs.writeFileSync(path.join(OUT, f), html);
for (const p of P) fs.writeFileSync(path.join(OUT, 'product', `${p.slug}.html`), productPage(p));
for (const n of data.needs) fs.writeFileSync(path.join(OUT, 'for', `${n.id}.html`), needPage(n));
C.journal.forEach((a, i) => fs.writeFileSync(path.join(OUT, 'journal', `${a.slug}.html`), articlePage(a, i)));
fs.copyFileSync(path.join(ROOT, 'src', 'styles.css'), path.join(OUT, 'styles.css'));
fs.copyFileSync(path.join(ROOT, 'src', 'app.js'), path.join(OUT, 'app.js'));
console.log(`built ${Object.keys(pages).length + P.length + data.needs.length + C.journal.length} pages into public/`);
