class Component extends DCLogic {
  state = { name: "", order: "", article: "", email: "", sent: false, lang: "de" };
  componentDidMount() {
    this._map = {};
    this._bind();
    this._mo = new MutationObserver(() => { clearTimeout(this._mt); this._mt = setTimeout(() => this._bind(), 50); });
    this._mo.observe(document.body, { childList: true, subtree: true });
  }
  componentWillUnmount() { this._mo && this._mo.disconnect(); }
  _bind() {
    document.querySelectorAll("[data-edit-root]").forEach((root) => {
      const key = root.dataset.editRoot;
      if (!root._restored) { root._restored = true; if (this._map[key] != null) root.innerHTML = this._map[key]; }
    });
  }
  renderVals() {
    const s = this.state;
    return {
      isEn: s.lang === "en", isDe: s.lang !== "en",
      enColor: s.lang === "en" ? "#16140F" : "#9a9485", deColor: s.lang !== "en" ? "#16140F" : "#9a9485",
      setEn: () => { try { localStorage.setItem("fp-lang", "en"); } catch (e) {} this.setState({ lang: "en" }); },
      setDe: () => { try { localStorage.setItem("fp-lang", "de"); } catch (e) {} this.setState({ lang: "de" }); },
      lName: "Name", lEmail: s.lang === "en" ? "Email" : "E-Mail", lOrder: s.lang === "en" ? "Order number" : "Bestellnummer", lArticle: s.lang === "en" ? "Item" : "Artikel",
      lSubmit: s.lang === "en" ? "Confirm withdrawal" : "Widerruf bestätigen",
      lSentTitle: s.lang === "en" ? "Withdrawal submitted" : "Widerruf übermittelt",
      lSentText: s.lang === "en" ? "Thank you. The withdrawal for order " + s.order + " has been received. A confirmation will follow by email to " + s.email + "." : "Vielen Dank. Der Widerruf für Bestellung " + s.order + " ist eingegangen. Eine Bestätigung folgt per E-Mail an " + s.email + ".",
      goBack: (e) => { if (document.referrer && history.length > 1) { e.preventDefault(); history.back(); } },
      name: s.name, order: s.order, article: s.article, email: s.email,
      sent: s.sent, notSent: !s.sent,
      setName: (e) => this.setState({ name: e.target.value }),
      setOrder: (e) => this.setState({ order: e.target.value }),
      setArticle: (e) => this.setState({ article: e.target.value }),
      setEmail: (e) => this.setState({ email: e.target.value }),
      onSubmit: (e) => {
        e.preventDefault();
        if (!s.name.trim() || !s.order.trim() || !s.article.trim() || !/^\S+@\S+\.\S+$/.test(s.email.trim())) { e.target.reportValidity && e.target.reportValidity(); return; }
        const body = "Hiermit wird der Vertrag über die folgende Bestellung widerrufen.\n\nName: " + s.name + "\nBestellnummer: " + s.order + "\nArtikel: " + s.article + "\nE-Mail: " + s.email + "\nDatum: " + new Date().toLocaleDateString("de-CH");
        window.location.href = "mailto:contact@foedusparaj.com?subject=" + encodeURIComponent("Widerruf Bestellung " + s.order) + "&body=" + encodeURIComponent(body);
        this.setState({ sent: true });
        window.scrollTo(0, 0);
      },
    };
  }
}
