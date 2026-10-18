# Maison Maria

Preview web shop for MARIA – luxury sun care and skincare from Norway, made in France. English only.

- `data/products.json` – catalogue: 21 products in four families (sun care, skincare, sets, Vanity Collection) with key ingredients, testing, FAQ and pairings; `needs` drives the "shop by need" pages
- `data/content.js` – journal articles, sun guide tables, FAQ, shipping, privacy and terms
- `src/` – styles and cart script
- `build.js` – generates the static site into `public/` (`npm run build`): home, shop, /for/<need>, /product/<slug>, vanity, maison, guide, journal + articles, faq, shipping, contact, privacy, terms, cart, 404
- `middleware.js` – password gate: unauthenticated visitors get a landing page with a single password field (no username)
- `api/access.js` – verifies the password against env `SITE_PASS` and sets a 30-day HttpOnly cookie

Product images are AI-generated mockups, labelled as such on the site. Checkout is disabled until payment and product information are approved.
