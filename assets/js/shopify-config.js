/*
 * Shopify connection for the shop (Storefront API).
 * The public access token is meant to be used in browser code; it can only read
 * published products and create carts. Never put the PRIVATE token here.
 * Values come from Shopify admin → Sales channels → Headless → Storefront API.
 */
window.FP_SHOPIFY = {
  domain: "er00yd-m9.myshopify.com",
  token: "4df7dfe05cddce0bf8dd5dc37732b783",
  apiVersion: "2025-10",
};
