# FOEDUS PARAJ website: agent context

Static fashion-label site (Swiss brand, prices in CHF) with a Shopify headless checkout.
No build step, no package.json, no tests. Read `README.md` for the folder layout and content-editing guide;
this file covers what an agent needs on top of that.

## Run / verify

```sh
python3 -m http.server 8000   # pages fetch() their content, so file:// does not work
```

There is no test suite. Verify UI changes in a real browser at desktop (~1400px) **and** phone width (~390px).
Headless Chrome works: launch Chrome with `--remote-debugging-port` and drive it over CDP with Node's built-in
`WebSocket`, using `Emulation.setDeviceMetricsOverride` for phone widths. Plain `--window-size=390,…` does
**not** give a real narrow viewport, because Chrome enforces a minimum window width.

## How pages are built (Claude Design export)

- Each `*.html` holds an `<x-dc>` template plus `<script type="text/x-dc" data-dc-script data-src="assets/js/pages/<page>.js">`.
  `assets/js/boot.js` loads that script, then `assets/js/vendor/dc-runtime.js` renders the template with React 18.
- The page script must define `class Component extends DCLogic`. `renderVals()` returns everything the template can use.
  The runtime evaluates the script with `new Function(...)`, so top-level `const`s before the class are fine and local to it.
- Template syntax: `{{ value }}`, `<sc-if value="{{ bool }}">`, `<sc-for list="{{ arr }}" as="x">`, events as
  `sc-camel-on-click="{{ fn }}"` (likewise `-on-input`, `-on-submit`, `-on-mouse-enter`).
  - `sc-if` has no negation or expressions: expose separate booleans (e.g. `cartEmpty` / `cartHasItems`).
  - `{{ }}` works inside `style="…"` attributes and is used heavily for dynamic styling.
  - Build composite strings (e.g. `"Bag (2)"`) in JS rather than mixing text and `{{ }}` in the template.
- **Do not edit `assets/js/vendor/`.**
- Almost all styling is inline. Phone layout lives in one `@container atelier (max-width: 760px)` block in `index.html`;
  the legal pages each have a `@media (max-width: 760px)` block. Phone rules target elements by tag, id or `data-*` hook
  (`data-prod-grid`, `data-card-meta`, `data-detail-*`, `data-size-btn`, `data-mz-head`, `data-legal-pad`, …).
  **Never match on inline-style substrings** (`[style*="z-index:200"]`): React re-serializes inline styles
  (`z-index: 200`, `rgb(...)`), so such selectors silently match nothing. Add a `data-*` hook instead.
- `home.js` has text/brand post-processing (`_setupPageTexts`, `_brandify`) that rewrites DOM text in some sections.
  Mark new UI with `data-*` attributes and keep it outside `#maison`, `#lookbook`, `#newsletter` and `#top` text nodes.

## Product data: where values come from

- Product list and order: the `products` (clothing, has sizes) and `accessories` (no sizes, "One size") arrays in
  `state` in `assets/js/pages/home.js`, keyed by slot `a-prodN`.
- Display values: `_ov(p)` merges `content/products.json` (key `prodN`) over the `data-props` defaults in `index.html`
  over the hard-coded state. **Price is then overridden by the live Shopify price** once the catalog has loaded.
- Known content gap: `products.json` has a `description` only for `prod1`. All other products fall back to old
  template placeholder text (e.g. the pencil skirt is described as "cashmere knit"). Real texts are pending from the owner.
- Lookbook → product links: the `LOOK_PRODUCTS` map at the top of `home.js` (look slot → product slots, first one
  opens on image click). Unmapped looks are not clickable. Multi-product looks show links as hover chips on desktop
  (`data-look-overlay`) and as a row under the caption on phones (`data-look-shop`).
- Product thumbnails: the `PRODUCT_IMAGES` map at the top of `home.js`. Gallery images: `content/images.json`.
- `images.json` crops (`s`/`x`/`y`) are saved for one frame shape and must be clamped for others. The vendor `<image-slot>`
  skips that clamp on image load, so `home.js` patches `_applyView` to clamp first (top of file). Keep that patch.

## Cart and Shopify

- The bag is client-side: `state.cart = [{ slot, size, qty }]`, persisted in `localStorage["fp-cart"]`.
  The code is in the "Cart" section of `home.js` (`_addLine`, `_setQty`, `_cartVals`, `_checkout`). The drawer and
  "Bag (n)" buttons are in `index.html` (search `cartOpen`, `data-cart-btn`).
- Shopify client: `assets/js/shopify.js` (`window.FPShopify`: `loadCatalog`, `createCheckout`, `cartExists`).
  Config: `assets/js/shopify-config.js` holds the store domain and the **public** Storefront token. The token is
  meant for browser code, so committing it is fine. **Never add the private/Admin token anywhere in this repo.**
- Mapping site → Shopify: product tag `prodN` ↔ slot `a-prodN`; size string ↔ variant title
  (`Size 1`/`Size 2`/`Size 3`/`One size`). SKUs follow `FP-P01-S2` / `FP-P10-OS`. A new product needs the tag in
  Shopify **and** an entry in the `home.js` state.
- Checkout: `cartCreate` (Storefront API, version in config) → redirect to `checkoutUrl`. Before redirecting, the site
  stores `{cartId, sig}` in `localStorage["fp-checkout"]`. On the next visit, if Shopify no longer returns that cart
  (it was converted to an order) **and** the bag is unchanged, the bag is cleared.
- Availability: while `state.catalog` is `null` (not loaded, or Shopify down) everything counts as available; checkout
  re-checks against the catalog and blocks with a message if a line no longer maps to an available variant.
- Language for checkout: `localStorage["fp-lang"]` (set by the DE/EN toggle on the legal pages), falling back to
  `navigator.language`; sent as `@inContext(language: DE|EN)`.
- `shopify/shopify-products.csv` was the one-time product import (Shopify legacy CSV format), generated from the site data.

## Shopify store state (as of 2026-11-13)

Store `er00yd-m9.myshopify.com`, currency CHF, all 13 products active in the Headless channel, test payments on.
Still open on the owner's side (their checklist is `notes.txt`): store password is on (checkout hits `/password`),
shipping only to DE, checkout language EN only, store name "Test Store", no product images or descriptions in
Shopify, no return link from checkout to the website.

## Rules for agents

- Placing a test order means entering the store password and a payment on Shopify's hosted checkout, which the owner
  does. Agents can verify everything up to that point, e.g. read the created cart back via the Storefront API
  `cart(id:)` query.
- Do not deploy or commit `.env` (it duplicates the config values). `shopify/` and `notes.txt` are setup material and
  are not served by the site.
- Planned / not built: newsletter and waitlist forms don't store emails (Klaviyo or Mailchimp planned); no favicon.
- The Datenschutz (privacy) page does not mention Shopify as a data processor yet. That is legal text, so have the
  owner review any change.
