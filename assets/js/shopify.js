/*
 * Small Shopify Storefront API client used by the shop.
 *
 *   FPShopify.loadCatalog()      → { prod1: { available, price, currency, sizes: { "Size 1": { id, available } } }, … }
 *   FPShopify.createCheckout(lines, lang) → checkoutUrl  (lines: [{ variantId, qty }])
 *   FPShopify.cartExists(cartId) → false once the cart has been turned into an order (or has expired)
 *
 * Products are matched to the site by their Shopify tag "prod1" … "prod13" (see shopify/shopify-products.csv),
 * sizes by the variant title ("Size 1", "Size 2", "Size 3", "One size").
 */
(function () {
  var cfg = window.FP_SHOPIFY || {};

  function gql(query, variables) {
    if (!cfg.domain || !cfg.token) return Promise.reject(new Error("Shopify is not configured (assets/js/shopify-config.js)"));
    return fetch("https://" + cfg.domain + "/api/" + (cfg.apiVersion || "2025-10") + "/graphql.json", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": cfg.token },
      body: JSON.stringify({ query: query, variables: variables || {} }),
    })
      .then(function (r) {
        if (!r.ok) throw new Error("Shopify HTTP " + r.status);
        return r.json();
      })
      .then(function (j) {
        if (j.errors && j.errors.length) throw new Error("Shopify: " + j.errors.map(function (e) { return e.message; }).join("; "));
        return j.data;
      });
  }

  var CATALOG_Q =
    "query Catalog($after: String) { products(first: 100, after: $after) { pageInfo { hasNextPage endCursor } nodes {" +
    " tags availableForSale variants(first: 20) { nodes { id title availableForSale price { amount currencyCode } } } } } }";

  function loadCatalog() {
    var out = {};
    function page(after) {
      return gql(CATALOG_Q, { after: after || null }).then(function (d) {
        d.products.nodes.forEach(function (p) {
          var key = (p.tags || []).filter(function (t) { return /^prod\d+$/.test(t); })[0];
          if (!key) return;
          var sizes = {}, min = null, cur = null;
          p.variants.nodes.forEach(function (v) {
            sizes[v.title] = { id: v.id, available: !!v.availableForSale };
            var a = parseFloat(v.price.amount);
            if (min == null || a < min) { min = a; cur = v.price.currencyCode; }
          });
          out[key] = { available: !!p.availableForSale, price: min, currency: cur, sizes: sizes };
        });
        if (d.products.pageInfo.hasNextPage) return page(d.products.pageInfo.endCursor);
        return out;
      });
    }
    return page(null);
  }

  var CREATE_Q =
    "mutation Create($lines: [CartLineInput!]!) @inContext(language: LANG) { cartCreate(input: { lines: $lines }) {" +
    " cart { id checkoutUrl totalQuantity } userErrors { field message } warnings { code message } } }";

  function createCheckout(lines, lang) {
    var L = String(lang || "en").toLowerCase().indexOf("de") === 0 ? "DE" : "EN";
    var q = CREATE_Q.replace("LANG", L);
    var input = lines.map(function (l) { return { merchandiseId: l.variantId, quantity: l.qty }; });
    return gql(q, { lines: input }).then(function (d) {
      var r = d.cartCreate;
      if (r.userErrors && r.userErrors.length) throw new Error(r.userErrors.map(function (e) { return e.message; }).join("; "));
      if (!r.cart || !r.cart.checkoutUrl) throw new Error("Shopify returned no checkout URL");
      if (r.warnings && r.warnings.length) console.warn("[shopify] cart warnings", r.warnings);
      return { cartId: r.cart.id, checkoutUrl: r.cart.checkoutUrl, totalQuantity: r.cart.totalQuantity };
    });
  }

  function cartExists(cartId) {
    return gql("query C($id: ID!) { cart(id: $id) { id } }", { id: cartId }).then(function (d) { return !!d.cart; });
  }

  window.FPShopify = { configured: !!(cfg.domain && cfg.token), loadCatalog: loadCatalog, createCheckout: createCheckout, cartExists: cartExists };
})();
