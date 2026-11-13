class Component extends DCLogic {
  state = { tab: location.hash === "#agb" ? "agb" : "impressum", lang: "de" };
  componentDidMount() {
    this._map = {};
    fetch("content/impressum-texts.json?" + Date.now(), { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).then((j) => { this._map = j || {}; this._bind(); }).catch(() => this._bind());
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
    const t = this.state.tab;
    const active = "#16140F", dim = "#9a9485";
    return {
      lang: this.state.lang, isEn: this.state.lang === "en", isDe: this.state.lang !== "en",
      enColor: this.state.lang === "en" ? "#16140F" : "#9a9485", deColor: this.state.lang !== "en" ? "#16140F" : "#9a9485",
      setEn: () => { try { localStorage.setItem("fp-lang", "en"); } catch (e) {} this.setState({ lang: "en" }); },
      setDe: () => { try { localStorage.setItem("fp-lang", "de"); } catch (e) {} this.setState({ lang: "de" }); },
      tabImpressum: this.state.lang === "en" ? "Legal Notice" : "Impressum", tabAgb: this.state.lang === "en" ? "Terms" : "AGB",
      goBack: (e) => { if (document.referrer && history.length > 1) { e.preventDefault(); history.back(); } },
      isImpressum: t === "impressum",
      isAgb: t === "agb",
      showImpressum: () => { this.setState({ tab: "impressum" }); window.scrollTo(0, 0); },
      showAgb: () => { this.setState({ tab: "agb" }); window.scrollTo(0, 0); },
      impressumColor: t === "impressum" ? active : dim,
      agbColor: t === "agb" ? active : dim,
      impressumBorder: t === "impressum" ? active : "transparent",
      agbBorder: t === "agb" ? active : "transparent",
      agbSections: [
        { title: "1. Geltungsbereich", body: "Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Bestellungen, die über den Onlineshop von foedus paraj getätigt werden. Mit der Bestellung erklärt sich die Kundin bzw. der Kunde mit diesen AGB einverstanden." },
        { title: "2. Vertragspartner", body: "Der Kaufvertrag kommt zustande mit:\nParaj Foedus Kkult, Inhaber Gerrit Ruben Paraipan, Stationsstrasse 62, 3204 Bern, Schweiz.\nKontakt: contact@foedusparaj.com" },
        { title: "3. Vertragsabschluss", body: "Die Darstellung der Produkte im Onlineshop stellt kein rechtlich bindendes Angebot dar. Durch das Absenden der Bestellung gibt die Kundin bzw. der Kunde ein verbindliches Angebot ab. Der Vertrag kommt mit der Bestellbestätigung per E-Mail zustande." },
        { title: "4. Preise", body: "Alle Preise verstehen sich in Schweizer Franken (CHF) bzw. Euro (EUR) inklusive der gesetzlichen Mehrwertsteuer, sofern anwendbar. Versandkosten werden im Bestellvorgang gesondert ausgewiesen." },
        { title: "5. Zahlung", body: "Die Zahlung erfolgt über die im Bestellvorgang angebotenen Zahlungsmethoden (z. B. Kredit-/Debitkarte, TWINT, PayPal). Die Belastung erfolgt bei Bestellabschluss." },
        { title: "6. Lieferung", body: "Artikel werden in der Schweiz gefertigt. Die Lieferzeit beträgt in der Regel 3–4 Wochen (Made to order). Verzögerungen werden per E-Mail mitgeteilt. Das Lieferrisiko trägt der Verkäufer bis zur Übergabe an die Kundin bzw. den Kunden." },
        { title: "7. Widerruf & Rückgabe", body: "Artikel können innerhalb von 14 Tagen nach Erhalt in ungetragenem, originalem Zustand zurückgegeben werden. Sonderanfertigungen sind von der Rückgabe ausgeschlossen. Die Rücksendekosten trägt [der Verkäufer / die Kundin bzw. der Kunde]." },
        { title: "8. Gewährleistung", body: "Es gelten die gesetzlichen Gewährleistungsrechte. Offensichtliche Mängel sind innert angemessener Frist nach Erhalt zu melden." },
        { title: "9. Anwendbares Recht & Gerichtsstand", body: "Es gilt ausschliesslich Schweizer Recht unter Ausschluss des UN-Kaufrechts. Gerichtsstand ist, soweit gesetzlich zulässig, [Ort]." },
      ],
    };
  }
}
