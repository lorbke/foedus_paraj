# FOEDUS PARAJ – Website

A static website: plain HTML, CSS, JavaScript and images. No build step, no server code, no database.
Any static host can serve this folder as it is (Netlify, Cloudflare Pages, Vercel, classic web space).

## Folder overview

```
index.html              Homepage: shop, lookbook, maison, newsletter
impressum.html          Impressum + AGB (two tabs; impressum.html#agb opens AGB)
datenschutz.html        Privacy policy
widerruf.html           Withdrawal form (opens a pre-filled email to contact@foedusparaj.com)

content/                Texts and image settings. These files are what normally gets edited.
  products.json           Fallback product texts, used only while Shopify hasn't loaded (Shopify is the source)
  page-texts.json         Edited texts of homepage / Maison / Lookbook
  impressum-texts.json    Impressum + AGB texts (DE/EN, stored as HTML)
  datenschutz-texts.json  Privacy policy texts (DE/EN, stored as HTML)
  images.json             Which image each image slot shows, plus its crop (s = zoom, x/y = shift in %)

assets/
  images/               All photos
  fonts/                Self-hosted fonts (Archivo, Schibsted Grotesk, Space Mono)
  css/fonts.css         Font definitions
  js/boot.js            Starts a page (see "How a page works")
  js/pages/*.js         Page logic, one file per page
  js/vendor/            Third-party code, do not edit: React 18, the dc-runtime
                        renderer and the <image-slot> component
```

## Run it locally

The pages load their content with `fetch()`, so they must be served over http. Double-clicking `index.html` won't work.

```sh
cd foedus-paraj
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

Upload the whole folder **except** `.env` and `shopify/` (those are only for setup; the site doesn't use them).

## Editing content

- **Product name / price / sizes / texts:** edit them **in Shopify** (see "Shop / Shopify" below). `content/products.json`
  is only the fallback shown while Shopify loads or if it can't be reached (keys `prod1` … `prod13`, fields `name`,
  `price`, `material`, `description`, `fit`; line breaks as `\n`). Keep it roughly in sync, or the page can briefly
  show old values before Shopify's arrive.
- **Replacing a photo:** put the new file in `assets/images/`, then in `content/images.json` change `"u"` of that slot
  to the new path. Set `"s": 1, "x": 0, "y": 0` to reset the crop.
  Slot ids: `a-prodN` = product main image, `a-prodN-vK` = extra gallery images, `a-lookN` = lookbook,
  `a-maisonN` = Maison, `a-campaign` = homepage hero.
- After editing a `.json` file, check that it is still valid JSON (e.g. paste it into jsonlint.com) before uploading.
  One missing comma breaks the whole file.

## How a page works

Each HTML file contains an `<x-dc>` template (the markup, using `{{ value }}`, `<sc-if>` and `<sc-for>`) and a
`<script type="text/x-dc" data-src="assets/js/pages/….js">` tag. `boot.js` loads that page script, then starts
`vendor/dc-runtime.js`, which renders the template with React. The values in `{{ … }}` come from `renderVals()` in
the page script.

This format comes from the design tool the site was built in (Claude Design). The project was unpacked from its
export without changing how anything looks.

## Known limitations / to do

- **Shop / Shopify:** the bag (header "Bag (n)" + slide-out drawer) lives in `assets/js/pages/home.js` (search for "Cart")
  and is saved in the visitor's browser (`localStorage` key `fp-cart`). "Checkout" creates a Shopify cart and sends the
  visitor to Shopify's checkout; orders arrive in the Shopify admin.
  - Connection: `assets/js/shopify-config.js` (store domain + public Storefront token), client: `assets/js/shopify.js`.
  - Products are matched by their Shopify tag `prod1` … `prod13`. A new product needs that tag in Shopify **and** an entry
    on the site (product list and images are still on the site).
  - **Everything on the product page except images comes from Shopify:** title, price (per size), sizes (the variants, in
    Shopify's order; a single "One size" variant shows no size buttons), description, and these product metafields:
    `custom.collection` (label above the title), `custom.material_care`, `custom.size_fit`, `custom.shipping_note`.
    An empty description/metafield hides that panel. The metafield definitions need **Storefronts access** turned on.
  - Sizes/products that Shopify marks unavailable are crossed out / shown as "Sold out".
  - `shopify/products.csv` is the current product import (legacy Shopify CSV format, with the metafield columns).
  - After a finished order the bag empties itself the next time the visitor opens the site.
- **Newsletter and waitlist forms** show "Thank you" but don't store the email anywhere (planned: Klaviyo or Mailchimp).
- **Coming-soon page** is switched off. To switch it on, both of these are needed: `comingSoon: true` in the `state`
  at the top of `assets/js/pages/home.js`, and `"default": true` for `comingSoonZeigen` in the `data-props` attribute
  in `index.html`. Clicking the logo three times hides it again.
- No favicon yet.
