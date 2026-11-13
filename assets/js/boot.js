/*
 * Starts a page.
 *
 * Every page has a <x-dc> template (the markup) and a
 *   <script type="text/x-dc" data-dc-script data-src="assets/js/pages/<page>.js">
 * tag pointing at its logic. This file loads that logic into the tag, then
 * starts dc-runtime.js, which renders the template with React.
 *
 * React is served from assets/js/vendor/ instead of a CDN.
 */
(function () {
  var VENDOR = 'assets/js/vendor/';
  window.__resources = {
    'https://unpkg.com/react@18.3.1/umd/react.production.min.js': VENDOR + 'react.production.min.js',
    'https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js': VENDOR + 'react-dom.production.min.js',
  };

  var tag = document.querySelector('script[data-dc-script]');
  fetch(tag.getAttribute('data-src'))
    .then(function (r) {
      if (!r.ok) throw new Error(r.status + ' ' + r.url);
      return r.text();
    })
    .then(function (code) {
      tag.textContent = code;
      var s = document.createElement('script');
      s.src = VENDOR + 'dc-runtime.js';
      document.head.appendChild(s);
    })
    .catch(function (e) {
      console.error('[boot] could not load page script', e);
    });
})();
