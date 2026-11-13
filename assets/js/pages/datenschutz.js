class Component extends DCLogic {
  state = { lang: "de" };
  componentDidMount() {
    this._map = {};
    fetch("content/datenschutz-texts.json?" + Date.now(), { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).then((j) => { this._map = j || {}; this._bind(); }).catch(() => this._bind());
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
  renderVals() { return {
      lang: this.state.lang, isEn: this.state.lang === "en", isDe: this.state.lang !== "en",
      enColor: this.state.lang === "en" ? "#16140F" : "#9a9485", deColor: this.state.lang !== "en" ? "#16140F" : "#9a9485",
      setEn: () => { try { localStorage.setItem("fp-lang", "en"); } catch (e) {} this.setState({ lang: "en" }); },
      setDe: () => { try { localStorage.setItem("fp-lang", "de"); } catch (e) {} this.setState({ lang: "de" }); }, goBack: (e) => { if (document.referrer && history.length > 1) { e.preventDefault(); history.back(); } }, }; }
}
