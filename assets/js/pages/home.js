const CART_KEY = "fp-cart";
const MAX_QTY = 10;
const CHECKOUT_KEY = "fp-checkout";
// <image-slot> (vendor) re-applies its saved crop when the image finishes loading, without clamping it to the
// current frame. A crop saved for a wide desktop frame (e.g. the hero, shifted 38% down) is out of range in a
// tall phone frame, so a late-loading image was pushed down and left a band under the header. Clamp first.
customElements.whenDefined("image-slot").then(() => {
  const P = customElements.get("image-slot").prototype;
  if (P._fpClampPatched || typeof P._applyView !== "function" || typeof P._clampView !== "function") return;
  const apply = P._applyView;
  P._applyView = function () { try { this._clampView(); } catch (e) {} return apply.apply(this, arguments); };
  P._fpClampPatched = true;
});
const PRODUCT_IMAGES = {"a-prod1":"assets/images/a-prod1.webp","a-prod2":"assets/images/a-prod2.webp","a-prod3":"assets/images/a-prod3-f.webp","a-prod4":"assets/images/a-prod4-f.webp","a-prod5":"assets/images/a-prod5-v1-1792601583101.webp","a-prod6":"assets/images/a-prod6-f.webp","a-prod7":"assets/images/a-prod7-f.webp","a-prod8":"assets/images/a-prod8-main.webp","a-prod9":"assets/images/a-prod9-f.webp","a-prod10":"assets/images/a-prod10-f.webp","a-prod11":"assets/images/a-prod11-f.webp"};

class Component extends DCLogic {
  state = {
    email: "",
    submitLabel: "Subscribe",
    comingSoon: false,
    csEmail: "",
    csSubmitLabel: "Join the waitlist",
    detailIndex: null,
    selectedSize: null,
    cartLabel: "Add to cart",
    cart: [],
    cartOpen: false,
    cartNote: "",
    openPanel: 0,
    imageIndex: 0,
    menuOpen: false,
    detailGroup: "products",
    products: [
      { slot:"a-prod1", name:"Reptile Jacket -  women", material:"Double-faced wool", price:"CHF 490", description:"A sculpted overcoat cut from double-faced wool, hand-finished at the shoulder. Falls in a clean column and holds its architecture through the season.", care:"90% virgin wool, 10% cashmere. Fully canvassed, horn buttons.\nDry clean only. Store on a broad wooden hanger. Steam to refresh.", fit:"Cut for a relaxed, straight silhouette. Takes a layer underneath comfortably. If between sizes, take the smaller for a sharper line, the larger to layer. Model is 178 cm, wears size 1." },
      { slot:"a-prod2", name:"Reptile Jacket - unisex", material:"Virgin wool", price:"CHF 490", description:"An asymmetric single-button blazer in virgin wool. Tailored close through the body with a softened, natural shoulder.", care:"100% virgin wool. Bemberg lining. Single horn button.\nDry clean only. Reshape shoulders by hand after wear.", fit:"Tailored, close through the waist. Size up if you prefer room across the chest. Model is 178 cm, wears size 1." },
      { slot:"a-prod13", name:"Produkt 13", material:"Material", price:"CHF 0", description:"Beschreibung folgt.", care:"Material & care details to follow.", fit:"Passform folgt." },
      { slot:"a-prod8", name:"Produkt 8", material:"Material", price:"CHF 0", description:"Beschreibung folgt.", care:"Material & care details to follow.", fit:"Passform folgt." },
      { slot:"a-prod3", name:"Column Trouser", material:"Wool crêpe", price:"CHF 890", description:"A high-waisted trouser in fluid wool crêpe. Draped to fall straight from the hip with a quiet, elongating line.", care:"96% wool, 4% elastane. Hook-and-bar closure, invisible zip.\nDry clean only. Press on reverse under a cloth.", fit:"High-waisted with a straight, fluid leg. True to size at the waist. Unhemmed length 108 cm. Model is 178 cm, wears size 1." },
      { slot:"a-prod9", name:"Produkt 9", material:"Material", price:"CHF 0", description:"Beschreibung folgt.", care:"Material & care details to follow.", fit:"Passform folgt." },
      { slot:"a-prod4", name:"Draped Shell Top", material:"Silk habotai", price:"CHF 390", description:"A bias-cut shell in silk habotai. Weightless, with a soft drape that moves with the body.", care:"100% silk habotai.\nDry clean, or hand wash cold and dry flat. Cool iron on reverse.", fit:"Softly draped, skims the body. Take your usual size; size up for a looser fall. Model is 178 cm, wears size 1." },
      { slot:"a-prod5", name:"Folded Knit", material:"Cashmere", price:"CHF 290", description:"A generously folded knit in pure cashmere. Made to be lived in — softening and returning to its line with wear.", care:"100% grade-A Mongolian cashmere.\nHand wash cold with wool detergent, dry flat. Do not hang. De-pill gently.", fit:"Oversized, drops off the shoulder. Take one size down for a closer fit. Model is 178 cm, wears size 1." },
      { slot:"a-prod6", name:"Architectural Skirt", material:"Bonded cotton", price:"CHF 150", description:"A structured midi skirt in bonded cotton. Holds a firm, sculptural silhouette while staying light.", care:"100% bonded cotton. Invisible back zip.\nDry clean only to preserve the structure.", fit:"Firm, sculptural midi. True to size at the waist. Length 74 cm. Model is 178 cm, wears size 1." },
      { slot:"a-prod7", name:"Produkt 7", material:"Material", price:"CHF 0", description:"Beschreibung folgt.", care:"Material & care details to follow.", fit:"Passform folgt." }
    ],
    accessories: [
      { slot:"a-prod10", name:"Produkt 10", material:"Material", price:"CHF 0", description:"Beschreibung folgt.", care:"Material & care details to follow.", fit:"Passform folgt." },
      { slot:"a-prod11", name:"Bloody Corpse Clutch", material:"Material", price:"CHF 290", description:"Beschreibung folgt.", care:"Material & care details to follow.", fit:"Passform folgt." },
      { slot:"a-prod12", name:"Produkt 12", material:"Material", price:"CHF 0", description:"Beschreibung folgt.", care:"Material & care details to follow.", fit:"Passform folgt." },
    ],
    looks: [
      { slot:"a-look1",  caption:"Reptile leather bag",  num:"01" },
      { slot:"a-look2",  caption:"Draped trouser",       num:"02" },
      { slot:"a-look3",  caption:"The opening silhouette", num:"03" },
      { slot:"a-look4",  caption:"Wool overcoat",        num:"04" },
      { slot:"a-look5",  caption:"Silk shell top",       num:"05" },
      { slot:"a-look6",  caption:"Folded knit",          num:"06" },
      { slot:"a-look7",  caption:"Tailored shoulder",    num:"07" },
      { slot:"a-look8",  caption:"Leather harness",      num:"08" },
      { slot:"a-look9",  caption:"Column dress",         num:"09" },
      { slot:"a-look10", caption:"The closing look",     num:"10" },
    ],
  };

  _brandify(root) {
    const RE = /(foedus\s+paraj|paraj\s+foedus|foedus|paraj)/gi;
    const walker = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => {
        const p = n.parentElement;
        if (!p || p.closest("[style*='font-stretch: 125%'], [style*='font-stretch:125%']")) return NodeFilter.FILTER_REJECT;
        if (p.closest("[data-brand], script, style, title, input, textarea, button, a[href^='mailto'], a[href^='http'], [contenteditable='true']:focus")) return NodeFilter.FILTER_REJECT;
        RE.lastIndex = 0;
        return RE.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      },
    });
    const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((n) => {
      const frag = document.createDocumentFragment();
      let last = 0; const s = n.nodeValue; RE.lastIndex = 0; let m;
      while ((m = RE.exec(s))) {
        if (m.index > last) frag.appendChild(document.createTextNode(s.slice(last, m.index)));
        const sp = document.createElement("span");
        sp.setAttribute("data-brand", "");
        sp.style.cssText = "font-family:'Archivo',sans-serif; font-stretch:125%; font-weight:600; letter-spacing:.16em; text-transform:none;";
        m[0].split(/(\s+)/).forEach((w) => {
          if (/^\s+$/.test(w) || !w) { sp.appendChild(document.createTextNode(w)); return; }
          if (/^paraj$/i.test(w)) {
            sp.appendChild(document.createTextNode("PARA"));
            const j = document.createElement("span"); j.style.cssText = "letter-spacing:0; font-weight:670;"; j.textContent = "j"; sp.appendChild(j);
          } else sp.appendChild(document.createTextNode(w.toUpperCase()));
        });
        frag.appendChild(sp); last = m.index + m[0].length;
      }
      if (last < s.length) frag.appendChild(document.createTextNode(s.slice(last)));
      n.parentNode.replaceChild(frag, n);
    });
  }
  _setupPageTexts() {
    const FILE = "content/page-texts.json";
    const sel = "#maison h2, #maison p, #maison figcaption span, #lookbook h2, #lookbook p, #lookbook figcaption span, #newsletter h2, #newsletter p, #top p, [data-lbtext], [data-lbbody], [data-lbcap]";
    const els = [...document.querySelectorAll(sel)].filter((el) => [...el.childNodes].every((n) => n.nodeType === 3 || n.nodeName === "BR" || (n.nodeType === 1 && n.hasAttribute("data-brand"))));
    const counts = {};
    els.forEach((el) => {
      if (el.hasAttribute("data-lbtext")) { el.dataset.tk = "lbtext-" + el.getAttribute("data-lbtext"); return; }
      if (el.hasAttribute("data-lbbody")) { el.dataset.tk = "lbbody-" + el.getAttribute("data-lbbody"); return; }
      if (el.hasAttribute("data-lbcap")) { el.dataset.tk = "lbcap-" + el.getAttribute("data-lbcap"); return; }
      const sec = el.closest("section").id;
      counts[sec] = (counts[sec] || 0) + 1;
      el.dataset.tk = sec + "-" + counts[sec];
    });
    const apply = (map) => els.forEach((el) => { const v = map[el.dataset.tk]; if (v != null && document.activeElement !== el) el.textContent = v; });
    fetch(FILE, { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).then((j) => { if (j) { this._pageTexts = j; apply(j); } }).catch(() => {});
    clearInterval(this._brandT);
    document.querySelectorAll("[data-brand]").forEach((sp) => { if (!sp.closest("h1, h2, h3")) sp.replaceWith(document.createTextNode(sp.textContent.replace(/PARAj/g, "Paraj").replace(/FOEDUS/g, "Foedus"))); });
    const brandHeads = () => document.querySelectorAll("h1, h2").forEach((hd) => { if (hd.closest("header, footer, article")) return; this._brandify(hd); });
    setTimeout(brandHeads, 300);
    this._brandT = setInterval(brandHeads, 1500);
    els.forEach((el) => { const par = el.parentElement; if (!par.dataset.tg) par.dataset.tg = "grp-" + el.dataset.tk; });
    const baseOf = (el) => { if (el._baseFs == null) el._baseFs = parseFloat(el.style.fontSize) || parseFloat(getComputedStyle(el).fontSize); return el._baseFs; };
    const kOf = (el) => {
      const sec = el.closest("#lookbook, #maison"); if (!sec) return 1;
      const img = sec.id === "lookbook" ? sec.querySelector("[data-lookgrid] > figure:not([data-single]) image-slot") : sec.querySelector("image-slot");
      const ref = sec.id === "lookbook" ? 325 : 331;
      const w = img && img.offsetWidth;
      return w ? Math.max(0.6, Math.min(1.35, w / ref)) : 1;
    };
    const rescale = () => els.forEach((el) => { if (!el.closest("#lookbook, #maison")) return; const b = baseOf(el); el.style.setProperty("font-size", (b * kOf(el)).toFixed(2) + "px", "important"); });
    const applySizes = (map) => {
      els.forEach((el) => baseOf(el));
      els.forEach((el) => {
        const v = map["size:" + el.dataset.tk]; if (v) { el._baseFs = v; el.style.setProperty("font-size", v + "px", "important"); }
        if (el.hasAttribute("data-lbtext") || el.hasAttribute("data-lbbody")) { if (!el.textContent.trim()) el.style.display = "none"; }
        else if (!el.textContent.trim()) el.style.display = "none";
        const p = map["pos:" + el.dataset.tk]; if (p && window.innerWidth > 820) el.style.translate = p.x + "px " + p.y + "px";
      });
      const lg = document.querySelector("[data-lookgrid]");
      if (lg) [...lg.children].forEach((f) => {
        const s = f.querySelector("image-slot"); if (!s) return;
        const p = map["lbpos:" + s.id];
        if (!p || window.innerWidth <= 820) { f.style.translate = ""; f.style.scale = ""; return; }
        f.style.transformOrigin = "top left"; f.style.scale = p.s ? String(p.s) : "";
        if (p.fx != null) { f.style.translate = (p.fx * s.offsetWidth) + "px " + (p.fy * s.offsetHeight) + "px"; return; }
        f.style.translate = (p.x * lg.clientWidth) + "px " + (p.y * lg.clientWidth) + "px";
      });
      Object.keys(map).filter((k) => k.startsWith("order:")).forEach((k) => {
        const par = document.querySelector('[data-tg="' + k.slice(6) + '"]'); if (!par) return;
        const cur = [...par.children].filter((c) => c.dataset && c.dataset.tk);
        const want = map[k].map((tk) => cur.find((c) => c.dataset.tk === tk)).filter(Boolean);
        if (want.length !== cur.length) return;
        const marks = cur.map((c) => { const m = document.createComment(""); par.insertBefore(m, c); return m; });
        want.forEach((c, i) => par.insertBefore(c, marks[i]));
        marks.forEach((m) => m.remove());
      });
    };
    els.forEach((el) => baseOf(el));
    rescale();
    fetch(FILE, { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).then((j) => { if (j) applySizes(j); rescale(); }).catch(() => {});
    window.removeEventListener("resize", this._lpResize);
    this._lpResize = () => { clearTimeout(this._lpT); this._lpT = setTimeout(() => { applySizes(this._pageTexts || {}); rescale(); }, 150); };
    window.addEventListener("resize", this._lpResize);
  }
  componentDidUpdate() {
    this._probe();
    clearTimeout(this._reTxT);
    this._reTxT = setTimeout(() => {
      const lost = [...document.querySelectorAll("[data-lbtext], [data-lbbody], [data-lbcap], #maison p, #maison h2, #lookbook figcaption span")].some((el) => !el.dataset.tk);
      if (lost) this._setupPageTexts();
    }, 150);
  }
  componentDidMount() {
    setTimeout(() => this._setupPageTexts(), 400);
    this._saveScroll = () => { try { sessionStorage.setItem("fp-scroll", String(window.scrollY)); } catch (e) {} };
    window.addEventListener("pagehide", this._saveScroll);
    document.addEventListener("click", (e) => { const a = e.target.closest && e.target.closest("a[href]"); if (a && !a.getAttribute("href").startsWith("#")) this._saveScroll(); }, true);
    try {
      const nav = performance.getEntriesByType("navigation")[0];
      const y = +sessionStorage.getItem("fp-scroll");
      if ("scrollRestoration" in history) history.scrollRestoration = "manual";
      if (nav && nav.type === "back_forward" && y > 0) {
        const root = document.documentElement; root.style.opacity = "0";
        const done = () => { window.scrollTo({ top: y, behavior: "instant" }); root.style.transition = "opacity .25s"; root.style.opacity = "1"; setTimeout(() => (root.style.transition = ""), 300); };
        let n = 0; const t = setInterval(() => { if (document.documentElement.scrollHeight >= y + innerHeight || ++n > 25) { clearInterval(t); done(); } }, 40);
      }
    } catch (e) {}
    try { const c = JSON.parse(localStorage.getItem(CART_KEY) || "[]"); if (Array.isArray(c)) this.setState({ cart: c.filter((l) => l && l.slot && l.qty > 0) }); } catch (e) {}
    this._loadCatalog().catch(() => {});
    this._checkOrderPlaced();
    this._onPageShow = (e) => { if (e.persisted) { this.setState({ checkoutBusy: false }); this._checkOrderPlaced(); } };
    window.addEventListener("pageshow", this._onPageShow);
    this._zoomKey = (e) => {
      if (e.key !== "Escape") return;
      if (this.state.zoomSrc) this.setState({ zoomSrc: null, zoomIn: false });
      else if (this.state.cartOpen) this._setCartOpen(false);
    };
    window.addEventListener("keydown", this._zoomKey);
    fetch("content/products.json", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).then((j) => { if (j) this.setState({ texts: j }); }).catch(() => {});
    const els = [...document.querySelectorAll("[data-reveal]")];
    const show = (el) => { el.style.opacity = "1"; el.style.transform = "translateY(0)"; };
    els.forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(26px)";
      el.style.transition = "opacity .9s cubic-bezier(.5,0,.1,1), transform .9s cubic-bezier(.5,0,.1,1)";
    });
    const vh = window.innerHeight || 800;
    const above = els.filter((el) => el.getBoundingClientRect().top < vh * 0.92);
    const below = els.filter((el) => el.getBoundingClientRect().top >= vh * 0.92);
    above.forEach((el, i) => setTimeout(() => show(el), 120 + i * 90));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    below.forEach((el) => io.observe(el));
    this._revealFallback = setTimeout(() => below.forEach(show), 3000);
  }

  componentWillUnmount() {
    clearInterval(this._brandT);
    clearTimeout(this._revealFallback);
    window.removeEventListener("pageshow", this._onPageShow);
  }

  /* ---------- Cart ----------
   * The cart lives in this.state.cart as [{ slot, size, qty }] and is saved in localStorage,
   * so it survives reloads. Name, price and image are looked up from the product data at render
   * time, so edits to products.json show up in existing carts too.
   * Shopify hook-in point: _checkout() (and later _saveCart, to sync lines with a Shopify cart).
   */
  _srcOf(slot) { return PRODUCT_IMAGES[slot] || ""; }
  /* Shopify (assets/js/shopify.js). state.catalog stays null until loaded; while null, everything counts as available. */
  _loadCatalog() {
    if (!window.FPShopify || !window.FPShopify.configured) return Promise.reject(new Error("Shopify not configured"));
    if (!this._catalogP) {
      this._catalogP = window.FPShopify.loadCatalog()
        .then((catalog) => { this.setState({ catalog }); return catalog; })
        .catch((e) => { this._catalogP = null; console.error("[shop] could not load Shopify products", e); throw e; });
    }
    return this._catalogP;
  }
  _shop(slot) { const c = this.state.catalog; return c ? c[slot.replace("a-", "")] || null : undefined; }
  _sizeAvailable(slot, size) {
    const e = this._shop(slot);
    if (e === undefined) return true;
    const v = e && e.sizes[size];
    return !!(v && v.available);
  }
  _productAvailable(slot) { const e = this._shop(slot); return e === undefined ? true : !!(e && e.available); }
  _lang() {
    try { const l = localStorage.getItem("fp-lang"); if (l) return l; } catch (e) {}
    return navigator.language || "en";
  }
  /* After a completed Shopify checkout the cart can no longer be read. If that's the case and the bag is
     still exactly what was sent to checkout, the order went through → empty the bag. */
  _checkOrderPlaced() {
    let m = null;
    try { m = JSON.parse(localStorage.getItem(CHECKOUT_KEY) || "null"); } catch (e) {}
    if (!m || !m.cartId || !window.FPShopify || !window.FPShopify.configured) return;
    window.FPShopify.cartExists(m.cartId).then((exists) => {
      if (exists) return;
      try { localStorage.removeItem(CHECKOUT_KEY); } catch (e) {}
      if (JSON.stringify(this.state.cart) === m.sig) this._saveCart([]);
    }).catch(() => {});
  }
  _productOf(slot) { return this.state.products.find((p) => p.slot === slot) || this.state.accessories.find((p) => p.slot === slot) || null; }
  _priceNum(s) { const n = parseFloat(String(s || "").replace(/[^0-9.]/g, "")); return isNaN(n) ? 0 : n; }
  _currency(s) { const m = String(s || "").match(/[A-Z]{3}/); return m ? m[0] : "CHF"; }
  _money(n, cur) { return cur + " " + n.toLocaleString("de-CH", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }); }
  _saveCart(cart) {
    this.setState({ cart, cartNote: "" });
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {}
  }
  _setCartOpen(open) {
    this.setState({ cartOpen: open, cartNote: "" });
    try { document.documentElement.style.overflow = open ? "hidden" : ""; } catch (e) {}
  }
  _addLine(slot, size) {
    const cart = this.state.cart.slice();
    const i = cart.findIndex((l) => l.slot === slot && l.size === size);
    if (i >= 0) cart[i] = { ...cart[i], qty: Math.min(MAX_QTY, cart[i].qty + 1) };
    else cart.push({ slot, size, qty: 1 });
    this._saveCart(cart);
  }
  _setQty(idx, qty) {
    const cart = this.state.cart.slice();
    if (qty <= 0) cart.splice(idx, 1); else cart[idx] = { ...cart[idx], qty: Math.min(MAX_QTY, qty) };
    this._saveCart(cart);
  }
  _checkout() {
    if (this.state.checkoutBusy || !this.state.cart.length) return;
    const fail = (e) => {
      if (e) console.error("[shop] checkout failed", e);
      this.setState({ checkoutBusy: false, cartNote: this._ui("cart_error", "Checkout could not be opened. Please try again in a moment.") });
    };
    this.setState({ checkoutBusy: true, cartNote: "" });
    this._loadCatalog().then((catalog) => {
      const cart = this.state.cart;
      const lines = cart.map((l) => {
        const e = catalog[l.slot.replace("a-", "")];
        const v = e && e.sizes[l.size];
        return v && v.available ? { variantId: v.id, qty: l.qty } : null;
      });
      if (lines.some((l) => !l)) {
        this.setState({ checkoutBusy: false, cartNote: this._ui("cart_unavailable", "Some pieces in your bag are no longer available. Please remove them to continue.") });
        return;
      }
      return window.FPShopify.createCheckout(lines, this._lang()).then((r) => {
        try { localStorage.setItem(CHECKOUT_KEY, JSON.stringify({ cartId: r.cartId, sig: JSON.stringify(cart) })); } catch (e) {}
        window.location.href = r.checkoutUrl;
      });
    }).catch(fail);
  }
  _cartVals() {
    const lines = this.state.cart.map((l, idx) => {
      const raw = this._productOf(l.slot);
      if (!raw) return null;
      const p = this._ov(raw);
      const unit = this._priceNum(p.price), cur = this._currency(p.price);
      const src = this._srcOf(l.slot);
      const unavailable = !this._sizeAvailable(l.slot, l.size);
      return {
        unavailable,
        unavailableText: this._ui("cart_line_unavailable", "No longer available"),
        name: p.name,
        size: l.size,
        qty: l.qty,
        cur, total: unit * l.qty,
        lineTotal: this._money(unit * l.qty, cur),
        thumb: src ? 'url("' + src + '")' : "none",
        dec: () => this._setQty(idx, l.qty - 1),
        inc: () => this._setQty(idx, l.qty + 1),
        remove: () => this._setQty(idx, 0),
        decOpacity: l.qty > 1 ? 1 : 0.35,
        incOpacity: l.qty < MAX_QTY ? 1 : 0.35,
      };
    }).filter(Boolean);
    const count = lines.reduce((a, l) => a + l.qty, 0);
    const cur = lines.length ? lines[0].cur : "CHF";
    const bag = this._ui("bag", "Bag");
    return {
      cartLines: lines,
      cartCount: count,
      cartNavLabel: bag + " (" + count + ")",
      cartEmpty: lines.length === 0,
      cartHasItems: lines.length > 0,
      cartSubtotal: this._money(lines.reduce((a, l) => a + l.total, 0), cur),
      cartOpen: this.state.cartOpen,
      cartNote: this.state.cartNote,
      hasCartNote: !!this.state.cartNote,
      openCart: (e) => { if (e && e.preventDefault) e.preventDefault(); this.setState({ menuOpen: false }); this._setCartOpen(true); },
      closeCart: () => this._setCartOpen(false),
      checkout: () => this._checkout(),
      checkoutLabel: this.state.checkoutBusy ? this._ui("cart_redirecting", "One moment…") : this._ui("cart_checkout", "Checkout"),
      checkoutOpacity: this.state.checkoutBusy ? 0.6 : 1,
      cartUi: {
        title: bag,
        empty: this._ui("cart_empty", "Your bag is empty."),
        continueShopping: this._ui("cart_continue", "Continue shopping"),
        size: this._ui("size", "Size"),
        remove: this._ui("cart_remove", "Remove"),
        subtotal: this._ui("cart_subtotal", "Subtotal"),
        taxNote: this._ui("cart_tax_note", "Shipping and taxes are calculated at checkout."),
        checkout: this._ui("cart_checkout", "Checkout"),
      },
    };
  }

  _ui(k, d) { const u = ((this.state.texts || {})._ui) || {}; return u[k] != null && u[k] !== "" ? u[k] : d; }
  _ov(p) {
    const r = this._ovText(p);
    const e = this._shop(p.slot);
    if (e && e.price != null) r.price = this._money(e.price, e.currency || "CHF");
    return r;
  }
  _ovText(p) {
    const k = p.slot.replace("a-", "");
    const pr = this.props;
    const t = (this.state.texts || {})[k] || {};
    const N = (s) => String(s || "").replace(/\s*[-–—]\s*/g, " ").replace(/\s+/g, " ").trim().toUpperCase();
    if (t.name || t.price || t.material || t.description != null || t.fit != null) return { ...p, fit: t.fit != null ? t.fit : p.fit, name: N(t.name || pr["name_" + k] || p.name), price: t.price || pr["price_" + k] || p.price, material: t.material || p.material, description: t.description != null ? t.description : (pr["text_" + k] || p.description) };
    return { ...p, name: N(pr["name_" + k] || p.name), price: pr["price_" + k] || p.price, description: pr["text_" + k] || p.description };
  }
  _vis(p) {
    const all = [0,1,2,3,4,5,6,7,8,9];
    const f = this.state.filled || {};
    return all.filter((k) => k === 0 || f[k === 0 ? p.slot : p.slot + "-v" + k] === true);
  }
  _images() {
    if (!this._imagesP) this._imagesP = fetch("content/images.json").then((r) => (r.ok ? r.json() : {})).catch(() => ({}));
    return this._imagesP;
  }
  _probe() {
    if (this.state.detailIndex == null) return;
    const p = this.state[this.state.detailGroup][this.state.detailIndex]; if (!p) return;
    this._probed = this._probed || {};
    for (let k = 1; k < 10; k++) {
      const id = p.slot + "-v" + k; if (this._probed[id]) continue; this._probed[id] = 1;
      this._images().then((all) => all[id] || null).then((j) => {
        const ok = !!(j && j.u && !j.deleted);
        this.setState((s) => ({ filled: { ...(s.filled || {}), [id]: ok } }));
      });
    }
  }
  _openZoom() {
    const g = this.state.detailGroup, i = this.state.detailIndex;
    if (i == null) return;
    const p = this.state[g][i]; const vis = this._vis(p); const k = vis[this.state.imageIndex || 0] || 0;
    const id = k === 0 ? p.slot : p.slot + "-v" + k;
    const el = [...document.querySelectorAll("image-slot")].find((s) => s.id === id);
    const img = el && el.shadowRoot && el.shadowRoot.querySelector("img");
    const src = img && (img.currentSrc || img.src);
    if (src) this.setState({ zoomSrc: src, zoomIn: false });
  }
  _lookLayout() {
    const pr = this.props;
    const defs = [
      ["Groß","Links","Hoch 2:3","Kein"],["Mittel","Rechts","Hoch 2:3","Groß"],["Halb","Mitte","Hoch 2:3","Kein"],["Mittel","Links","Hoch 2:3","Mittel"],["Groß","Rechts","Hoch 2:3","Kein"],["Halb","Links","Hoch 2:3","Kein"],["Halb","Rechts","Hoch 2:3","Groß"],["Halb","Mitte","Hoch 2:3","Kein"],["Groß","Links","Hoch 2:3","Kein"],["Mittel","Rechts","Hoch 2:3","Groß"]];
    const SPAN = { "Klein":4, "Mittel":5, "Halb":6, "Groß":7, "Sehr groß":9, "Ganz":12 };
    const AR = { "Hoch 4:5":"4/5", "Hoch 2:3":"2/3", "Quadrat":"1/1", "Quer 3:2":"3/2", "Panorama 21:9":"21/9" };
    const MT = { "Kein":"0px", "Klein":"64px", "Mittel":"140px", "Groß":"240px" };
    const out = {};
    defs.forEach((d, j) => {
      const n = j + 1;
      const span = SPAN[pr["lb" + n + "_groesse"] ?? d[0]] || 6;
      const pos = pr["lb" + n + "_position"] ?? d[1];
      const start = span >= 12 ? 1 : pos === "Rechts" ? 13 - span : pos === "Mitte" ? 1 + Math.floor((12 - span) / 2) : 1;
      out["L" + n] = {
        col: start + " / span " + span,
        order: pr["lb" + n + "_reihenfolge"] ?? n,
        ar: AR[pr["lb" + n + "_format"] ?? d[2]] || "4/5",
        mt: MT[pr["lb" + n + "_versatz"] ?? d[3]] || "0px",
      };
    });
    return out;
  }
  renderVals() {
    const ratioMap = { "Cinematic 21:9": "21/9", "Wide 16:9": "16/9", "Classic 3:2": "3/2", "Portrait 4:5": "4/5" };
    const heroStyle = this.props.heroImageStyle ?? "Campaign banner";
    const csX = this.props.bildLinksRechts ?? 50, csY = this.props.bildObenUnten ?? 50;
    return {
      companyName: this.props.companyName ?? "Paraj Foedus Kkult",
      csPos: csX + "% " + csY + "%",
      csZoom: (this.props.bildZoom ?? 100) / 100,
      showCampaign: heroStyle === "Campaign banner",
      showFloating: heroStyle === "Floating portrait",
      menuOpen: this.state.menuOpen,
      toggleMenu: () => this.setState((s) => ({ menuOpen: !s.menuOpen })),
      campaignRatio: ratioMap[this.props.campaignRatio ?? "Wide 16:9"] || "16/9",
      showCaption: this.props.showCaption ?? false,
      products: this.state.products.map((p, i) => ({
        ...this._ov(p),
        src: this._srcOf(p.slot),
        open: () => { this._detailY = window.scrollY; this.setState({ detailIndex: i, detailGroup: "products", selectedSize: null, cartLabel: "Add to cart", openPanel: 0, imageIndex: 0 }); },
      })),
      accessories: this.state.accessories.map((p, i) => ({
        ...this._ov(p),
        src: this._srcOf(p.slot),
        open: () => { this._detailY = window.scrollY; this.setState({ detailIndex: i, detailGroup: "accessories", selectedSize: null, cartLabel: "Add to cart", openPanel: 0, imageIndex: 0 }); },
      })),
      detail: this.state.detailIndex == null ? null : this._ov(this.state[this.state.detailGroup][this.state.detailIndex]),
      detailImages: this.state.detailIndex == null ? [] : (() => {
        const p = this.state[this.state.detailGroup][this.state.detailIndex];
        const labels = ["Front", "Back", "Detail", "Fabric", "On the body", "Bild 6", "Bild 7", "Bild 8", "Bild 9", "Bild 10"];
        const cur = this.state.imageIndex;
        const vis = this._vis(p);
        if (vis.length < 2) return [];
        return vis.map((k, n) => ({
          slot: k === 0 ? p.slot : p.slot + "-v" + k,
          placeholder: p.name + " — " + labels[k],
          opacity: n === cur ? 1 : 0,
          z: n === cur ? 2 : 1,
          dot: n === cur ? "#16140F" : "rgba(22,20,15,.28)",
          go: () => this.setState({ imageIndex: n }),
        }));
      })(),
      allGalleries: this.state.detailIndex == null ? [] : [this.state.detailGroup].flatMap((g) => this.state[g].filter((p, i) => i === this.state.detailIndex).map((p) => {
        const active = true;
        const cur = this.state.imageIndex;
        return {
          display: active ? "block" : "none",
          images: this._vis(p).map((k, n) => ({
            slot: k === 0 ? p.slot : p.slot + "-v" + k,
            placeholder: p.name + " — " + ["Front", "Back", "Detail", "Fabric", "On the body", "Bild 6", "Bild 7", "Bild 8", "Bild 9", "Bild 10"][k],
            opacity: active && n === cur ? 1 : 0,
            z: n === cur ? 2 : 1,
            pe: n === cur ? "auto" : "none",
          })),
        };
      })),
      prevImage: () => this.setState((s) => { const p = s.detailIndex == null ? null : s[s.detailGroup][s.detailIndex]; const n = p ? this._vis(p).length : 10; return { imageIndex: (s.imageIndex + n - 1) % n }; }),
      nextImage: () => this.setState((s) => { const p = s.detailIndex == null ? null : s[s.detailGroup][s.detailIndex]; const n = p ? this._vis(p).length : 10; return { imageIndex: (s.imageIndex + 1) % n }; }),
      showArrows: (this.state.detailIndex != null && this._vis(this.state[this.state.detailGroup][this.state.detailIndex]).length > 1) ? "flex" : "none",
      panels: this.state.detailIndex == null ? [] : (() => {
        const p = this._ov(this.state[this.state.detailGroup][this.state.detailIndex]);
        const defs = [
          { title: this._ui("t_description", "Description"), tk: "t_description", body: p.description, field: "description" },
          { title: this._ui("t_material", "Material & care"), tk: "t_material", body: p.material, field: "material" },
          { title: this._ui("t_fit", "Size & fit"), tk: "t_fit", body: p.fit, field: "fit" },
        ].filter((d) => !(this.state.detailGroup === "accessories" && d.field === "fit"));
        return defs.map((d, k) => ({
          title: d.title,
          body: d.body,
          open: this.state.openPanel === k,
          icon: this.state.openPanel === k ? "–" : "+",
          toggle: () => this.setState({ openPanel: this.state.openPanel === k ? null : k }),
        }));
      })(),
      hasSizes: this.state.detailGroup !== "accessories",
      sizes: ["Size 1", "Size 2", "Size 3"].map((label) => {
        const cur = this.state.detailIndex == null ? null : this.state[this.state.detailGroup][this.state.detailIndex];
        const ok = !cur || this._sizeAvailable(cur.slot, label);
        const active = ok && this.state.selectedSize === label;
        return {
          label,
          select: () => { if (ok) this.setState({ selectedSize: label }); },
          border: active ? "#16140F" : ok ? "#C9C3B4" : "#E7E2D7",
          bg: active ? "#16140F" : "transparent",
          color: active ? "#F4F1EA" : ok ? "#16140F" : "#B9B3A6",
          deco: ok ? "none" : "line-through",
          cursor: ok ? "pointer" : "not-allowed",
          disabledLabel: ok ? label : label + " (sold out)",
        };
      }),
      ...(() => {
        const cur = this.state.detailIndex == null ? null : this.state[this.state.detailGroup][this.state.detailIndex];
        const soldOut = !!cur && !this._productAvailable(cur.slot);
        return {
          cartLabel: soldOut ? this._ui("sold_out", "Sold out") : this.state.cartLabel,
          cartBtnBg: soldOut ? "#B9B3A6" : "#16140F",
          cartBtnCursor: soldOut ? "not-allowed" : "pointer",
        };
      })(),
      stop: (e) => e.stopPropagation(),
      closeDetail: () => { const y = this._detailY; this.setState({ detailIndex: null, openPanel: 0 }, () => { if (y != null && Math.abs(window.scrollY - y) > 2) window.scrollTo({ top: y, behavior: "instant" }); }); },
      addToCart: () => {
        const cur = this.state[this.state.detailGroup][this.state.detailIndex];
        const isAcc = this.state.detailGroup === "accessories";
        if (!cur || !this._productAvailable(cur.slot)) return;
        if (isAcc && !this._sizeAvailable(cur.slot, "One size")) return;
        if (!isAcc && !this.state.selectedSize) { this.setState({ cartLabel: "Select a size" }); setTimeout(() => this.setState({ cartLabel: "Add to cart" }), 1600); return; }
        this._addLine(cur.slot, isAcc ? "One size" : this.state.selectedSize);
        this.setState({ cartLabel: "Added ✓" });
        this._setCartOpen(true);
        setTimeout(() => this.setState({ cartLabel: "Add to cart" }), 2000);
      },
      ...this._cartVals(),
      looks: this.state.looks,
      ...Object.fromEntries(["shop", "lookbook", "maison", "contact"].flatMap((k) => [
        ["open_" + k, this.state.navMenu === k],
        ["line_" + k, this.state.navMenu === k ? "#16140F" : "transparent"],
        ["enter_" + k, () => { clearTimeout(this._shopT); if (this.state.navMenu !== k) this.setState({ navMenu: k }); }],
      ])),
      shopLeave: () => { clearTimeout(this._shopT); this._shopT = setTimeout(() => this.setState({ navMenu: null }), 120); },
      menuProducts: this.state.products.map((p, i) => ({ name: this._ov(p).name, go: (e) => { e.preventDefault(); this.setState({ navMenu: null, detailIndex: i, detailGroup: "products", selectedSize: null, cartLabel: "Add to cart", openPanel: 0, imageIndex: 0 }); } })),
      menuAccessories: this.state.accessories.map((p, i) => ({ name: this._ov(p).name, go: (e) => { e.preventDefault(); this.setState({ navMenu: null, detailIndex: i, detailGroup: "accessories", selectedSize: null, cartLabel: "Add to cart", openPanel: 0, imageIndex: 0 }); } })),
      ui: {
        collection: this._ui("collection", "Collection No. 01"),
        size: this._ui("size", "Size"),
        shipping: this._ui("shipping", "Made to order in Switzerland · Ships in 3–4 weeks"),
      },
      ...this._lookLayout(),
      zoomOpen: !!this.state.zoomSrc,
      zoomBg: this.state.zoomSrc ? 'url("' + this.state.zoomSrc + '")' : "none",
      zoomScale: this.state.zoomIn ? 2.6 : 1,
      zoomOrigin: (this.state.zoomX ?? 50) + "% " + (this.state.zoomY ?? 50) + "%",
      zoomCursor: this.state.zoomIn ? "zoom-out" : "zoom-in",
      openZoom: (e) => { if (e) e.stopPropagation(); this._openZoom(); },
      galleryClick: (e) => {
        if (e && e.target && e.target.closest && e.target.closest("button")) return;
        if (Date.now() - (this._swipedAt || 0) < 400) return;
        this._openZoom();
      },
      // Horizontal swipe on the product gallery (phones): left = next image, right = previous.
      galleryTouchStart: (e) => {
        const t = e.touches && e.touches[0];
        this._swipe = t ? { x: t.clientX, y: t.clientY } : null;
      },
      galleryTouchEnd: (e) => {
        const s = this._swipe; this._swipe = null;
        const t = e.changedTouches && e.changedTouches[0];
        if (!s || !t) return;
        const dx = t.clientX - s.x, dy = t.clientY - s.y;
        if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
        this._swipedAt = Date.now();
        this.setState((st) => {
          const p = st.detailIndex == null ? null : st[st.detailGroup][st.detailIndex];
          const n = p ? this._vis(p).length : 10;
          return { imageIndex: (st.imageIndex + (dx < 0 ? 1 : n - 1)) % n };
        });
      },
      closeZoom: (e) => { if (e) e.stopPropagation(); this.setState({ zoomSrc: null, zoomIn: false }); },
      zoomToggle: (e) => {
        const r = e.currentTarget.getBoundingClientRect();
        this.setState((s) => ({ zoomIn: !s.zoomIn, zoomX: ((e.clientX - r.left) / r.width) * 100, zoomY: ((e.clientY - r.top) / r.height) * 100 }));
      },
      zoomMove: (e) => {
        if (!this.state.zoomIn) return;
        const r = e.currentTarget.getBoundingClientRect();
        this.setState({ zoomX: ((e.clientX - r.left) / r.width) * 100, zoomY: ((e.clientY - r.top) / r.height) * 100 });
      },
      zoomTouch: (e) => {
        if (!this.state.zoomIn || !e.touches || !e.touches[0]) return;
        const r = e.currentTarget.getBoundingClientRect(); const t = e.touches[0];
        this.setState({ zoomX: 100 - ((t.clientX - r.left) / r.width) * 100, zoomY: 100 - ((t.clientY - r.top) / r.height) * 100 });
      },
      comingSoon: this.state.comingSoon && (this.props.comingSoonZeigen ?? true),
      csEmail: this.state.csEmail,
      csSubmitLabel: this.state.csSubmitLabel,
      csLogoClick: () => {
        const n = (this._csClicks || 0) + 1;
        this._csClicks = n;
        clearTimeout(this._csClickTimer);
        if (n >= 3) { this._csClicks = 0; this.setState({ comingSoon: false }); return; }
        this._csClickTimer = setTimeout(() => { this._csClicks = 0; }, 900);
      },
      onCsEmail: (e) => this.setState({ csEmail: e.target.value }),
      onCsSubmit: (e) => {
        e.preventDefault();
        this.setState({ csSubmitLabel: "Thank you" });
        setTimeout(() => this.setState({ csSubmitLabel: "Join the waitlist", csEmail: "" }), 2400);
      },
      email: this.state.email,
      submitLabel: this.state.submitLabel,
      onEmail: (e) => this.setState({ email: e.target.value }),
      onSubmit: (e) => {
        e.preventDefault();
        this.setState({ submitLabel: "Thank you" });
        setTimeout(() => this.setState({ submitLabel: "Subscribe", email: "" }), 2400);
      },
    };
  }
}
