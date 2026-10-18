/* Maison Maria – cart, drawer, menu. Everything stays in this browser (localStorage); no network calls.
   Checkout is intentionally disabled until payment and product information are approved. */
(function () {
  'use strict';
  var KEY = 'mm-cart-v1';
  var catalog = window.MM_PRODUCTS || {};

  function read() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } }
  function write(items) { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) { /* private mode */ } }
  function nok(n) { return '€' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function lineKey(slug, variant) { return slug + (variant ? '::' + variant : ''); }

  var items = read();

  function count() { return items.reduce(function (a, i) { return a + i.qty; }, 0); }
  function total() { return items.reduce(function (a, i) { var p = catalog[i.slug]; return a + (p ? p.price * i.qty : 0); }, 0); }

  function add(slug, variant) {
    var k = lineKey(slug, variant);
    var found = items.filter(function (i) { return lineKey(i.slug, i.variant) === k; })[0];
    if (found) found.qty += 1; else items.push({ slug: slug, variant: variant || '', qty: 1 });
    write(items); render(); openDrawer(); toast('Added to cart');
  }
  function setQty(k, qty) {
    items = items.map(function (i) { if (lineKey(i.slug, i.variant) === k) i.qty = qty; return i; }).filter(function (i) { return i.qty > 0; });
    write(items); render();
  }

  function lineHTML(i) {
    var p = catalog[i.slug]; if (!p) return '';
    var k = lineKey(i.slug, i.variant);
    return '<div class="line" data-k="' + k + '">' +
      '<img src="/assets/img/' + p.image + '-sm.jpg" alt="">' +
      '<div><h3>' + p.name + (p.sub ? ' <span class="meta">' + p.sub + '</span>' : '') + '</h3>' +
      (i.variant ? '<p class="meta">' + i.variant + '</p>' : '') +
      '<div><span class="qty"><button type="button" data-dec aria-label="Decrease">−</button><span>' + i.qty + '</span><button type="button" data-inc aria-label="Increase">+</button></span>' +
      '<button type="button" class="rm" data-rm>Remove</button></div></div>' +
      '<div class="lp">' + nok(p.price * i.qty) + '</div></div>';
  }

  function render() {
    var n = count();
    Array.prototype.forEach.call(document.querySelectorAll('[data-cart-count]'), function (el) {
      el.textContent = n; el.setAttribute('data-zero', n === 0 ? 'true' : 'false');
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-cart-lines]'), function (el) {
      el.innerHTML = items.length ? items.map(lineHTML).join('') : '<p class="cart-empty">Your cart is empty.</p>';
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-cart-total]'), function (el) { el.textContent = nok(total()); });
  }

  function openDrawer() { document.body.setAttribute('data-cart-open', 'true'); var x = document.querySelector('.drawer-x'); if (x) x.focus(); }
  function closeDrawer() { document.body.setAttribute('data-cart-open', 'false'); }

  var toastEl, toastT;
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.setAttribute('data-show', 'true');
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.setAttribute('data-show', 'false'); }, 1800);
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('[data-add]') : null;
    if (t) {
      var variant = '';
      var sel = document.getElementById('variant');
      if (sel && t.getAttribute('data-add') === sel.getAttribute('data-for')) variant = sel.value;
      add(t.getAttribute('data-add'), variant);
      return;
    }
    if (e.target.closest('[data-open-cart]')) { e.preventDefault(); openDrawer(); return; }
    if (e.target.closest('[data-close-cart]')) { closeDrawer(); return; }
    var line = e.target.closest('.line');
    if (line) {
      var k = line.getAttribute('data-k');
      var it = items.filter(function (i) { return lineKey(i.slug, i.variant) === k; })[0];
      if (!it) return;
      if (e.target.closest('[data-inc]')) setQty(k, it.qty + 1);
      else if (e.target.closest('[data-dec]')) setQty(k, it.qty - 1);
      else if (e.target.closest('[data-rm]')) setQty(k, 0);
      return;
    }
    if (e.target.closest('[data-menu]')) {
      var m = document.getElementById('mnav'); var open = m.getAttribute('data-open') === 'true';
      m.setAttribute('data-open', open ? 'false' : 'true');
      e.target.closest('[data-menu]').setAttribute('aria-expanded', open ? 'false' : 'true');
      return;
    }
    if (e.target.closest('[data-checkout]')) { e.preventDefault(); toast('Payment is not enabled yet'); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDrawer(); });

  /* waitlist: preview only */
  var wl = document.getElementById('waitlist');
  if (wl) wl.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = (document.getElementById('wl-name').value || '').trim().split(/\s+/)[0];
    wl.hidden = true; var c = document.getElementById('wl-confirm'); c.hidden = false; c.textContent = 'Thank you' + (name ? ', ' + name : '') + '. You are on the list.';
  });

  /* contact form: preview only */
  var cf = document.getElementById('contact');
  if (cf) cf.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = (document.getElementById('c-name').value || '').trim().split(/\s+/)[0];
    cf.hidden = true; var c = document.getElementById('c-confirm'); c.hidden = false; c.textContent = 'Thank you' + (name ? ', ' + name : '') + '. We answer within one working day once the shop opens.';
  });

  render();
})();
