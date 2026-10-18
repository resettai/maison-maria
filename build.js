// Maison Maria – static site builder. `node build.js` writes the site into ./public.
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const OUT = path.join(ROOT, 'public');
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'products.json'), 'utf8'));
const P = data.products;
const bySlug = Object.fromEntries(P.map(p => [p.slug, p]));
const nok = n => 'NOK ' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

const NAV = [
  ['/shop', 'Butikk'],
  ['/vanity', 'Vanity Collection'],
  ['/maison', 'Maison'],
  ['/journal', 'Journal']
];

function layout({ title, desc, body, current, hero = false }) {
  const nav = NAV.map(([href, label]) => `<a href="${href}"${current === href ? ' aria-current="page"' : ''}>${label}</a>`).join('');
  const catalog = Object.fromEntries(P.map(p => [p.slug, { name: p.name, sub: p.sub, price: p.price, image: p.image }]));
  return `<!doctype html>
<html lang="nb">
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
<a class="skip" href="#main">Hopp til innhold</a>
<header class="hdr">
  <div class="wrap hdr-in">
    <a class="hdr-brand" href="/" aria-label="Maison Maria – forsiden"><img src="/assets/maria-wordmark-compact.svg" alt="" width="1029" height="288"></a>
    <nav class="nav ui" aria-label="Meny">${nav}</nav>
    <div class="hdr-tools ui">
      <button type="button" class="cart-btn" data-open-cart aria-label="Åpne handlekurven">Handlekurv <span class="count" data-cart-count data-zero="true">0</span></button>
      <button type="button" class="menu-btn" data-menu aria-expanded="false" aria-controls="mnav">Meny</button>
    </div>
  </div>
  <nav id="mnav" class="mnav ui" data-open="false" aria-label="Meny, mobil">${nav}</nav>
</header>
<main id="main">
${body}
</main>
<footer class="ftr">
  <div class="wrap ftr-in">
    <div><img src="/assets/maison-maria-lockup-inverse.svg" alt="Maison Maria" width="640" height="420"><p class="ftr-note" style="margin-top:1rem">Solpleie som hudpleie. Formulert og produsert i Frankrike. Ålesund, Norge.</p></div>
    <div><h4>Butikk</h4><a href="/shop#solpleie">Solpleie</a><a href="/shop#hudpleie">Hudpleie</a><a href="/vanity">Vanity Collection</a><a href="/handlekurv">Handlekurv</a></div>
    <div><h4>Maison</h4><a href="/maison">Om Maison Maria</a><a href="/maison#maria">Maria</a><a href="/maison#france">Fabriqué en France</a><a href="/journal">Journal</a></div>
    <div><h4>Forhåndsvisning</h4><p class="ftr-note">Betaling er ikke aktivert. Produktbilder er AI-genererte mockups, tydelig merket, og produktinformasjon, priser og påstander er foreløpige til de er godkjent. MARIA Skincare AS (under stiftelse), 2026.</p></div>
  </div>
</footer>
<div class="drawer-bg" data-close-cart></div>
<aside class="drawer" aria-label="Handlekurv">
  <div class="drawer-h"><h2>Handlekurv</h2><button type="button" class="drawer-x" data-close-cart>Lukk</button></div>
  <div class="drawer-body" data-cart-lines></div>
  <div class="drawer-f">
    <div class="tot"><span>Sum</span><strong data-cart-total>NOK 0</strong></div>
    <a class="btn" href="/handlekurv">Se handlekurven</a>
    <button type="button" class="btn" disabled aria-disabled="true" data-checkout>Til kassen</button>
    <p class="pay-note">Betaling aktiveres når betalingsløsning og produktinformasjon er godkjent. Frakt og mva beregnes i kassen.</p>
  </div>
</aside>
<script>window.MM_PRODUCTS=${JSON.stringify(catalog)};</script>
<script src="/app.js" defer></script>
</body>
</html>`;
}

function card(p, wide = false) {
  return `<a class="card${wide ? ' card--wide' : ''}" href="/produkt/${p.slug}">
  <div class="card-img"><img src="/assets/img/${p.image}-sm.jpg" alt="${esc(p.alt)}" loading="lazy" width="700" height="${wide ? 525 : 933}"></div>
  <h3>${p.name}${p.sub ? `<span>${esc(p.sub)}</span>` : ''}</h3>
  <p class="price">${nok(p.price)}${p.compare ? `<s>${nok(p.compare)}</s>` : ''}</p>
  <p class="format">${esc(p.format)}</p>
</a>`;
}

const FACTS = `<dl class="facts">
  <div><dt>3 097</dt><dd>nordmenn fikk diagnosen melanom i 2025.</dd></div>
  <div><dt>20×</dt><dd>så mange tilfeller som på 1950-tallet. Bare New Zealand har høyere dødelighet.</dd></div>
  <div><dt>50+</dt><dd>er den høyeste beskyttelsen EU lar oss trykke. Hver MARIA-fluid har den, med UVA-beskyttelse på minst en tredjedel av SPF.</dd></div>
</dl>
<p class="source"><a href="https://www.fhi.no/kreft/nokkeltall/kreftformer/melanom/" rel="noopener" target="_blank">Kilde: Folkehelseinstituttet, Cancer in Norway 2025</a></p>`;

// ---------- home ----------
const home = layout({
  title: 'Maison Maria – solpleie som hudpleie, laget i Frankrike',
  desc: 'MARIA: luksus solpleie fra Norge, formulert og produsert i Frankrike. Daily Fluid SPF 50+, Vanity Collection og mer.',
  current: '/',
  body: `
<section class="hero" aria-labelledby="h1">
  <div class="hero-img"><img src="/assets/img/collection.jpg" alt="MARIA-kolleksjonen på travertin i nordisk dagslys (AI-generert mockup)" width="1536" height="1024" fetchpriority="high"><span class="hero-credit">AI-generert mockup</span></div>
  <div class="hero-in">
    <span class="ui">Fabriqué en France · lansering juni 2027</span>
    <h1 id="h1">Ta vare på huden du har.</h1>
    <p>Solbeskyttelse som hudpleie. SPF 50+ hver dag, laget i Frankrike for nordisk lys.</p>
    <a class="btn" href="/shop">Se kolleksjonen</a>
  </div>
</section>

<section class="sec" aria-labelledby="h-coll">
  <div class="wrap">
    <div class="sec-head"><span class="ui">Kolleksjonen</span><h2 id="h-coll">Fem produkter. Maks tre steg.</h2><p>Parfymefritt, vegansk og ikke-komedogent, med kun EU-godkjente UV-filtre.</p></div>
    <div class="grid">${P.filter(p => p.category !== 'vanity').map(p => card(p)).join('')}</div>
  </div>
</section>

<section class="band band--dark" aria-labelledby="h-vanity">
  <div class="band-img"><img src="/assets/img/vanity-king.jpg" alt="${esc(bySlug['vanity-king-size'].alt)}" loading="lazy" width="1280" height="960"></div>
  <div class="band-txt">
    <span class="ui" style="color:var(--gold)">Vanity Collection</span>
    <h2 id="h-vanity">Hele rutinen, pakket i espresso og gull.</h2>
    <p>Tre størrelser: King Size til badet, Medium til reisen, Mini til vesken. Vegansk skinn, champagnegull beslag, og produktene ferdig pakket.</p>
    <a class="btn" href="/vanity">Se Vanity Collection</a>
  </div>
</section>

<section class="sec" aria-labelledby="h-soleil" style="background:var(--espresso);color:var(--ivory)">
  <div class="wrap">
    <div class="sec-head"><span class="ui" style="color:var(--gold)">Soleil du Nord</span><h2 id="h-soleil">Norge har en av verdens høyeste forekomster av melanom.</h2><p style="color:#D9CFC2">Lyset står lavt, dagene er lange, og vi er ute mer enn vi beskytter oss.</p></div>
    ${FACTS.replace('class="source"', 'class="source" style="color:#B5A999"')}
  </div>
</section>

<section class="band band--rev" aria-labelledby="h-france">
  <div class="band-img"><img src="/assets/img/atelier.jpg" alt="Laboratoriebenk med glassutstyr (AI-generert illustrasjon)" loading="lazy" width="953" height="1024"></div>
  <div class="band-txt">
    <span class="ui" style="color:var(--gold)">Fabriqué en France</span>
    <h2 id="h-france">Formulert og laget utenfor Lyon.</h2>
    <p>Hos et fransk hus som har laget hudpleie og solpleie siden 1947, med eget laboratorium for SPF og sertifisering etter ISO 22716. Hver solkrem testes etter ISO 24444 og ISO 24443 før den settes på markedet.</p>
    <a class="btn btn--ghost" href="/maison">Les om Maison Maria</a>
  </div>
</section>

<section class="sec" aria-labelledby="h-wl">
  <div class="wrap">
    <div class="sec-head"><span class="ui">Ventelisten</span><h2 id="h-wl">De første 1 000 får startsettet før lansering.</h2></div>
    <form id="waitlist" class="form" novalidate style="margin-top:1.5rem">
      <label for="wl-name">Navn</label><input id="wl-name" type="text" autocomplete="name">
      <label for="wl-email">E-post</label><input id="wl-email" type="email" autocomplete="email">
      <button class="btn" type="submit">Sett meg på listen</button>
      <p class="pdp-note" style="margin-top:.8rem">Forhåndsvisning. Ingenting sendes eller lagres.</p>
    </form>
    <p id="wl-confirm" class="quote" hidden></p>
  </div>
</section>`
});

// ---------- shop ----------
const shop = layout({
  title: 'Butikk – Maison Maria',
  desc: 'Hele MARIA-kolleksjonen: solpleie, hudpleie og Vanity Collection.',
  current: '/shop',
  body: `<section class="sec" style="padding-top:3rem">
  <div class="wrap">
    <div class="sec-head"><h1 style="font-size:clamp(2.4rem,5vw,3.6rem)">Butikk</h1><p>Alt vi lager, i én oversikt. Betaling aktiveres ved lansering.</p></div>
    <p class="ui" style="margin-top:1.5rem;display:flex;gap:1.5rem;flex-wrap:wrap">${data.categories.map(c => `<a href="#${c.id}" style="text-decoration:none;border-bottom:1px solid var(--gold);padding-bottom:.2rem">${c.name}</a>`).join('')}</p>
    ${data.categories.map(c => `
    <h2 id="${c.id}" style="font-size:2rem;margin-top:3.5rem">${c.name}</h2>
    <p style="color:var(--taupe-2);margin-top:.3rem">${c.blurb}</p>
    <div class="grid${c.id === 'vanity' ? ' grid--4' : ''}">${P.filter(p => p.category === c.id).map(p => card(p, c.id === 'vanity')).join('')}</div>`).join('')}
  </div>
</section>`
});

// ---------- vanity ----------
const V = P.filter(p => p.category === 'vanity');
const vanity = layout({
  title: 'Vanity Collection – Maison Maria',
  desc: 'Maison Maria Vanity Collection: King Size, Medium og Mini i espresso vegansk skinn med gull.',
  current: '/vanity',
  body: `<section class="band band--dark" aria-labelledby="hv">
  <div class="band-img"><img src="/assets/img/vanity-king.jpg" alt="${esc(bySlug['vanity-king-size'].alt)}" width="1280" height="960" fetchpriority="high"></div>
  <div class="band-txt"><span class="ui" style="color:var(--gold)">Maison Maria</span><h1 id="hv" style="font-size:clamp(2.4rem,5vw,3.6rem)">Vanity Collection</h1><p>Tre størrelser, ett språk: espresso pebbled vegansk skinn, champagnegull beslag, elfenben innmat. Hver veske leveres med produktene ferdig pakket.</p><p class="ai-note" style="color:#B5A999">Bildene er AI-genererte mockups</p></div>
</section>
<section class="sec"><div class="wrap">
  <div class="grid">${V.map(p => card(p, true)).join('')}</div>
  <h2 style="font-size:2rem;margin-top:4rem">Sammenlign</h2>
  <div style="overflow:auto;margin-top:1rem"><table style="border-collapse:collapse;width:100%;min-width:640px;font-size:1.05rem">
    <thead><tr style="text-align:left"><th class="ui" style="padding:.8rem 0;border-bottom:1px solid var(--taupe)">Modell</th><th class="ui" style="padding:.8rem 0;border-bottom:1px solid var(--taupe)">Mål</th><th class="ui" style="padding:.8rem 0;border-bottom:1px solid var(--taupe)">Innhold</th><th class="ui" style="padding:.8rem 0;border-bottom:1px solid var(--taupe)">Pris</th></tr></thead>
    <tbody>${V.map(p => `<tr><td style="padding:.9rem 1rem .9rem 0;border-bottom:1px solid var(--sand)"><a href="/produkt/${p.slug}">${p.name}</a></td><td style="padding:.9rem 1rem .9rem 0;border-bottom:1px solid var(--sand)">${p.dims}</td><td style="padding:.9rem 1rem .9rem 0;border-bottom:1px solid var(--sand)">${p.set.map(s => bySlug[s].name + (bySlug[s].sub ? ' ' + bySlug[s].sub : '')).join(', ')}</td><td style="padding:.9rem 0;border-bottom:1px solid var(--sand);white-space:nowrap">${nok(p.price)}</td></tr>`).join('')}</tbody>
  </table></div>
  <p class="pdp-note" style="margin-top:1rem">Materialer, mål og priser er foreløpige til produsent og betaling er godkjent.</p>
</div></section>`
});

// ---------- product pages ----------
function productPage(p) {
  const related = P.filter(x => x.slug !== p.slug && x.category === p.category).slice(0, 3);
  const rel = related.length >= 3 ? related : related.concat(P.filter(x => x.slug !== p.slug && !related.includes(x)).slice(0, 3 - related.length));
  const wide = ['collection', 'vanity-king', 'vanity-medium', 'vanity-mini'].includes(p.image);
  const variant = p.variants ? `<label for="variant">${p.variants.label}</label><select id="variant" data-for="${p.slug}">${p.variants.options.map(o => `<option>${o}</option>`).join('')}</select>` : '';
  const setBlock = p.set ? `<section class="pdp-set"><h2>Inneholder</h2><div class="set-list">${[...new Set(p.set)].map(s => { const q = bySlug[s]; const n = p.set.filter(x => x === s).length; return `<a href="/produkt/${q.slug}"><div class="card-img"><img src="/assets/img/${q.image}-sm.jpg" alt="${esc(q.alt)}" loading="lazy" width="700" height="700"></div><h3>${q.name} ${q.sub || ''}${n > 1 ? ' × ' + n : ''}</h3></a>`; }).join('')}</div></section>` : '';
  return layout({
    title: `${p.name} ${p.sub || ''} – Maison Maria`.replace(/\s+/g, ' '),
    desc: p.short,
    current: p.category === 'vanity' ? '/vanity' : '/shop',
    body: `<section class="wrap pdp">
  <figure class="pdp-img${wide ? ' pdp-img--wide' : ''}"><img src="/assets/img/${p.image}.jpg" alt="${esc(p.alt)}" width="${wide ? 1280 : 960}" height="${wide ? 960 : 1280}" fetchpriority="high"><figcaption class="ai-note" style="padding:.6rem 0">Produktbilde: AI-generert mockup</figcaption></figure>
  <div class="pdp-info">
    <p class="crumbs"><a href="/shop">Butikk</a> / <a href="/shop#${p.category}">${data.categories.find(c => c.id === p.category).name}</a></p>
    <h1>${p.name}${p.sub ? `<span>${esc(p.sub)}</span>` : ''}</h1>
    <p class="pdp-kicker">${esc(p.kicker)}</p>
    <p class="pdp-price">${nok(p.price)}${p.compare ? `<s>${nok(p.compare)}</s>` : ''}</p>
    <p class="pdp-format">${esc(p.format)}</p>
    <p class="pdp-short">${esc(p.short)}</p>
    <ul class="pdp-claims">${p.claims.map(c => `<li>${esc(c)}</li>`).join('')}</ul>
    <div class="pdp-buy">${variant}<button type="button" class="btn" data-add="${p.slug}">Legg i handlekurven</button><p class="pdp-note">Forhåndsvisning: handlekurven fungerer, betaling aktiveres ved lansering.</p></div>
    <div style="margin-top:2rem">
      <details class="acc"><summary>Slik brukes den</summary><p>${esc(p.use)}</p></details>
      <details class="acc"><summary>Detaljer</summary><ul>${p.details.map(d => `<li>${esc(d)}</li>`).join('')}</ul></details>
      <details class="acc"><summary>Levering og retur</summary><p>Fri frakt i Norge over NOK 800. 30 dagers åpent kjøp på uåpnede produkter. Detaljer fastsettes ved lansering.</p></details>
    </div>
    ${setBlock}
  </div>
</section>
<section class="wrap related"><h2 style="font-size:1.8rem">Passer sammen med</h2><div class="grid">${rel.map(x => card(x, x.category === 'vanity')).join('')}</div></section>`
  });
}

// ---------- maison ----------
const maison = layout({
  title: 'Maison – Maison Maria',
  desc: 'Om Maison Maria: grunnlegger Maria Taftesund, nordisk lys og fransk produksjon.',
  current: '/maison',
  body: `<section class="band" aria-labelledby="hm">
  <div class="band-img"><img src="/assets/img/collection.jpg" alt="${esc(bySlug['startsettet'].alt)}" width="1536" height="1024" fetchpriority="high"></div>
  <div class="band-txt"><span class="ui" style="color:var(--gold)">Maison Maria</span><h1 id="hm" style="font-size:clamp(2.4rem,5vw,3.6rem)">Et norsk solpleiehus, laget i Frankrike.</h1><p>MARIA er bygget rundt én idé: at beskyttelse skal være det letteste steget i rutinen, ikke det du hopper over. Fem produkter, tre steg, ingen påstander vi ikke kan dokumentere.</p></div>
</section>
<section class="sec" id="maria" aria-labelledby="hmaria"><div class="wrap" style="display:grid;gap:2.5rem">
  <div class="sec-head"><span class="ui">Grunnlegger</span><h2 id="hmaria">Maria Taftesund</h2></div>
  <div style="display:grid;gap:2rem;grid-template-columns:1fr;align-items:start" class="maria-grid">
    <figure class="portrait-slot" style="max-width:30rem"><span>Portrett av Maria leveres av Maison Maria. Ingen AI-genererte personer brukes.</span></figure>
    <div><p class="quote">«Jeg har trent ute hele livet. Huden har fått mer sol enn beskyttelse. MARIA er det jeg selv manglet: en SPF jeg faktisk har lyst til å bruke hver dag.»</p><p class="quote-by">Maria Taftesund <span>utkast, godkjennes</span></p><p style="margin-top:1.5rem">Maria er treningsprofil fra Ålesund med et stort, internasjonalt publikum. Serien er utviklet med henne fra første skisse: hva som faktisk brukes, hva som blir liggende, og hvordan en SPF må føles for å bli påført igjen midt på dagen.</p></div>
  </div>
</div></section>
<section class="sec" style="background:var(--espresso);color:var(--ivory)"><div class="wrap">
  <div class="sec-head"><span class="ui" style="color:var(--gold)">Soleil du Nord</span><h2>Hvorfor et norsk solpleiemerke.</h2><p style="color:#D9CFC2">Norge har en av verdens høyeste forekomster av melanom. Før fylte 50 rammes kvinner oftest.</p></div>
  <div style="color:var(--ivory)">${FACTS.replace('class="source"', 'class="source" style="color:#B5A999"')}</div>
</div></section>
<section class="band band--rev" id="france" aria-labelledby="hf">
  <div class="band-img"><img src="/assets/img/atelier.jpg" alt="Laboratoriebenk med glassutstyr (AI-generert illustrasjon)" loading="lazy" width="953" height="1024"></div>
  <div class="band-txt"><span class="ui" style="color:var(--gold)">Fabriqué en France</span><h2 id="hf">Château-Gaillard, utenfor Lyon.</h2><p>MARIA formuleres og lages hos et fransk hus som har laget hudpleie og solpleie siden 1947, med eget laboratorium som måler SPF før noe forlater bygget. Fabrikken er sertifisert etter ISO 22716 (GMP for kosmetikk) og godkjent for COSMOS.</p><p>Hver solkrem testes for SPF etter ISO 24444 og for UVA etter ISO 24443 hos uavhengige laboratorier, og notifiseres i EU (CPNP) før den settes på markedet. Kun EU-godkjente UV-filtre, uten oktokrylen, homosalat og benzofenon-3.</p></div>
</section>`
});

// ---------- cart page ----------
const cart = layout({
  title: 'Handlekurv – Maison Maria',
  desc: 'Handlekurven din hos Maison Maria.',
  current: '/handlekurv',
  body: `<section class="wrap cart-page">
  <h1>Handlekurv</h1>
  <div data-cart-lines style="margin-top:1.5rem"></div>
  <div class="cart-sum">
    <div class="tot"><span>Sum</span><strong data-cart-total>NOK 0</strong></div>
    <button type="button" class="btn" disabled aria-disabled="true" data-checkout>Til kassen</button>
    <p class="pay-note">Betaling aktiveres når betalingsløsning og produktinformasjon er godkjent. Handlekurven lagres bare i denne nettleseren.</p>
    <a class="btn btn--ghost" href="/shop">Fortsett å handle</a>
  </div>
</section>`
});

// ---------- journal ----------
const journal = layout({
  title: 'Journal – Maison Maria',
  desc: 'Skin journal: tolv uker fra laboratoriet i Frankrike til lansering.',
  current: '/journal',
  body: `<section class="sec" style="padding-top:3rem"><div class="wrap">
  <div class="sec-head"><span class="ui">Journal</span><h1 style="font-size:clamp(2.4rem,5vw,3.6rem)">Skin journal</h1><p>Tolv uker fra laboratoriet utenfor Lyon til lansering, fortalt mens det skjer. Første kapittel kommer mars 2027.</p></div>
  <div class="grid" style="margin-top:3rem">
    <a class="card card--wide" href="/maison#france"><div class="card-img"><img src="/assets/img/atelier.jpg" alt="Laboratoriebenk (AI-generert illustrasjon)" loading="lazy" width="700" height="525"></div><h3>Uke 1 · Laboratoriet</h3><p class="format">Hvordan en SPF-base blir til, og hva som testes først.</p></a>
    <a class="card card--wide" href="/produkt/daily-fluid"><div class="card-img"><img src="/assets/img/collection-sm.jpg" alt="Kolleksjonen (AI-generert mockup)" loading="lazy" width="700" height="467"></div><h3>Uke 5 · Fem produkter</h3><p class="format">Hvorfor serien stopper på fem, og hva som ble lagt bort.</p></a>
    <a class="card card--wide" href="/vanity"><div class="card-img"><img src="/assets/img/vanity-mini-sm.jpg" alt="Vanity Mini (AI-generert mockup)" loading="lazy" width="700" height="525"></div><h3>Uke 9 · Vesken</h3><p class="format">Skinn, gull og det som skal få plass i lommen.</p></a>
  </div>
</div></section>`
});

const notFound = layout({ title: 'Siden finnes ikke – Maison Maria', desc: 'Siden finnes ikke.', current: '', body: `<section class="wrap sec"><h1 style="font-size:2.6rem">Siden finnes ikke.</h1><p style="margin-top:1rem"><a href="/">Til forsiden</a></p></section>` });

// ---------- write ----------
fs.mkdirSync(path.join(OUT, 'produkt'), { recursive: true });
fs.writeFileSync(path.join(OUT, 'index.html'), home);
fs.writeFileSync(path.join(OUT, 'shop.html'), shop);
fs.writeFileSync(path.join(OUT, 'vanity.html'), vanity);
fs.writeFileSync(path.join(OUT, 'maison.html'), maison);
fs.writeFileSync(path.join(OUT, 'handlekurv.html'), cart);
fs.writeFileSync(path.join(OUT, 'journal.html'), journal);
fs.writeFileSync(path.join(OUT, '404.html'), notFound);
for (const p of P) fs.writeFileSync(path.join(OUT, 'produkt', `${p.slug}.html`), productPage(p));
fs.copyFileSync(path.join(ROOT, 'src', 'styles.css'), path.join(OUT, 'styles.css'));
fs.copyFileSync(path.join(ROOT, 'src', 'app.js'), path.join(OUT, 'app.js'));
console.log(`built ${7 + P.length} pages into public/`);
