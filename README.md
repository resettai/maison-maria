# Maison Maria

Preview web shop for MARIA – luxury sun-care-led skincare from Norway, made in France.

- `data/products.json` – catalogue (products, Vanity Collection, prices)
- `src/` – styles and cart script
- `build.js` – generates the static site into `public/` (`npm run build`)
- `middleware.js` – password gate: unauthenticated visitors get a branded landing page with a single password field (no username)
- `api/adgang.js` – verifies the password against env `SITE_PASS` and sets a 30-day HttpOnly cookie

Product images are AI-generated mockups, labelled as such on the site. Photos of Maria are real, supplied by her, and only cropped for layout. Checkout is disabled until payment and product information are approved.
