/*
 * Akatec Preisrechner
 *
 * Ablauf: Entfernung, Notfall, Leistungen, Preis, Anfrage.
 * Über 40 km endet der Ablauf mit einem Hinweis, ein Notfall mit dem Anruf-Button.
 * Gezeichnet wird in ein Shadow DOM: Theme- und Elementor-Styles für Buttons und
 * Formularfelder erreichen den Rechner so nicht, und er nichts auf der Seite.
 */
(() => {
	'use strict';

	const DATEN = window.AkatecPreisrechnerDaten;
	const HAUPTSCHRITTE = ['entfernung', 'notfall', 'leistungen', 'preis'];
	const ZURUECK = {
		notfall: 'entfernung',
		ausserhalb: 'entfernung',
		anruf: 'notfall',
		leistungen: 'notfall',
		preis: 'leistungen',
		formular: 'preis',
	};
	const SENDEFEHLER = 'Das Senden hat gerade nicht geklappt. Bitte rufen Sie uns an oder schreiben Sie uns per WhatsApp.';
	const VERTRAUEN = 'Festpreis vor Arbeitsbeginn · Kostenfrei und unverbindlich';

	// Nunito Sans liegt im Plugin (OFL, keine Google-Server). Eigener Familienname, damit
	// die Schrift nur im Rechner greift und der Rest der Seite bleibt, wie er ist.
	const SCHRIFT = 'Akatec Nunito Sans';
	const SCHRIFT_ZEICHEN =
		'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';
	let schriftLaden = null;

	const ICONS = {
		pfeilRechts: '<path d="M5 12h14M13 6l6 6-6 6"/>',
		pfeilLinks: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
		haken: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
		telefon: '<path d="M6.6 3.5h2.6l1.6 4.2-2.1 1.4a11.5 11.5 0 0 0 6.2 6.2l1.4-2.1 4.2 1.6v2.6a2 2 0 0 1-2.2 2A16.8 16.8 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2z"/>',
		mail: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/>',
		warnung: '<path d="M12 3.8 2.8 19.6h18.4L12 3.8z"/><path d="M12 10v4.2M12 17.2v.1"/>',
		kueche: '<path d="M3 13.5h18"/><path d="M4.5 13.5V15A4.5 4.5 0 0 0 9 19.5h6a4.5 4.5 0 0 0 4.5-4.5v-1.5"/><path d="M9 13.5V7.5a3 3 0 0 1 6 0V9"/><path d="M15 11.5v.2"/>',
		wc: '<path d="M7 3.5h10v5H7z"/><path d="M5 8.5h14v.8a7 7 0 0 1-14 0z"/><path d="M9.6 15.6 9 20.5h6l-.6-4.9"/>',
		rohr: '<path d="M2.5 9h3.5M9 9h6M18 9h3.5M2.5 15h3.5M9 15h6M18 15h3.5"/><rect x="6" y="7" width="3" height="10" rx="1"/><rect x="15" y="7" width="3" height="10" rx="1"/>',
		dusche: '<path d="M5 21V8.5a4.5 4.5 0 0 1 9 0"/><path d="M10.5 8.5h7"/><path d="M11.5 12v.6M14 12v.6M16.5 12v.6M12.7 15.5v.6M15.3 15.5v.6M14 19v.6"/>',
		bodenablauf: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8.5 9h7M8.5 12h7M8.5 15h7"/>',
		hofablauf: '<circle cx="12" cy="11" r="7"/><path d="M8.5 8.5h7M7.6 11h8.8M8.5 13.5h7"/><path d="M3 21h18"/>',
		regen: '<path d="M7 15.5a4 4 0 0 1-.5-7.97A5.5 5.5 0 0 1 17 7a4.25 4.25 0 0 1 .5 8.5z"/><path d="M8.5 18.5l-1 2.5M12.5 18.5l-1 2.5M16.5 18.5l-1 2.5"/>',
		kamera: '<rect x="2.5" y="6.5" width="13" height="11" rx="2"/><path d="m15.5 10.5 6-3.5v10l-6-3.5z"/>',
		auge: '<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
		frage: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.3a2.5 2.5 0 1 1 3.6 2.3c-.7.4-1.2 1-1.2 1.8v.4M12 16.8v.2"/>',
		info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.6v.1"/>',
	};
	// WhatsApp-Logo aus Simple Icons (CC0).
	const WHATSAPP_LOGO = '<svg class="icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>';

	const icon = (name) =>
		`<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`;

	const zahl = new Intl.NumberFormat('de-DE');
	const euro = (betrag) => `${zahl.format(betrag)}\u00a0€`;

	const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
	const esc = (text) => String(text).replace(/[&<>"']/g, (zeichen) => ESCAPES[zeichen]);

	const pause = (ms) => new Promise((fertig) => setTimeout(fertig, ms));

	function ladeSchrift(cssUrl) {
		if (!schriftLaden) {
			const datei = new URL('fonts/nunito-sans-latin.woff2', cssUrl).href;
			const schrift = new FontFace(SCHRIFT, `url("${datei}") format("woff2")`, {
				weight: '200 1000',
				display: 'swap',
				unicodeRange: SCHRIFT_ZEICHEN,
			});
			document.fonts.add(schrift);
			schriftLaden = schrift.load().catch(() => {});
		}
		return schriftLaden;
	}

	function preisLabel(leistung) {
		if (leistung.aufAnfrage) return 'auf Anfrage';
		if (leistung.proStunde) return `${euro(leistung.preis)} / Std.`;
		return `${leistung.ab ? 'ab ' : ''}${euro(leistung.preis)}`;
	}

	/*
	 * Gesamtpreis = Leistungen + Anfahrt. Sobald ein Ab-Preis, ein Stundensatz oder
	 * „Anderes“ dabei ist, steht der Gesamtpreis als Ab-Preis da; ist nur „Anderes“
	 * gewählt, gibt es keinen Gesamtpreis.
	 */
	function berechnePreis(entfernung, gewaehlt) {
		const zeilen = gewaehlt.map((leistung) => ({
			text: leistung.proStunde ? `${leistung.titel} (1 Stunde)` : leistung.titel,
			betrag: leistung.aufAnfrage ? 'auf Anfrage' : `${leistung.ab ? 'ab ' : ''}${euro(leistung.preis)}`,
		}));
		zeilen.push({ text: `Anfahrt ${entfernung.titel}`, betrag: euro(entfernung.anfahrt) });

		const nurAufAnfrage = gewaehlt.every((leistung) => leistung.aufAnfrage);
		const offen = gewaehlt.some((leistung) => leistung.ab || leistung.proStunde || leistung.aufAnfrage);
		const summe = gewaehlt.reduce((s, leistung) => s + (leistung.aufAnfrage ? 0 : leistung.preis), entfernung.anfahrt);

		const hinweise = gewaehlt
			.filter((leistung) => leistung.ab || leistung.proStunde || leistung.aufAnfrage)
			.map((leistung) => {
				if (leistung.proStunde) return `${leistung.titel}: ${euro(leistung.preis)} pro Stunde, eine Stunde ist eingerechnet.`;
				if (leistung.ab) return `${leistung.titel}: ab ${euro(leistung.preis)}, der genaue Preis hängt vom Aufwand vor Ort ab.`;
				return `${leistung.titel}: Den Preis nennen wir Ihnen, sobald wir wissen, worum es geht.`;
			});

		return {
			zeilen,
			hinweise,
			gesamt: nurAufAnfrage ? 'auf Anfrage' : `${offen ? 'ab ' : ''}${euro(summe)}`,
			gesamtZusatz: nurAufAnfrage
				? `Anfahrt ${euro(entfernung.anfahrt)} inkl. MwSt., Leistung nach Absprache`
				: 'inkl. MwSt. und Anfahrt',
		};
	}

	class Rechner {
		constructor(host) {
			this.host = host;
			this.endpoint = host.dataset.endpoint;
			this.gestartet = Date.now();
			this.zustand = {
				schritt: 'entfernung',
				entfernung: null,
				notfall: null,
				leistungen: new Set(),
				formular: { name: '', telefon: '', email: '', plz: '', ort: '', nachricht: '', datenschutz: false },
				fehler: {},
				sendefehler: '',
				sendet: false,
			};

			const cssUrl = new URL(host.dataset.css, document.baseURI).href;
			const wurzel = host.attachShadow({ mode: 'open' });
			const stil = document.createElement('link');
			stil.rel = 'stylesheet';
			stil.href = cssUrl;
			this.flaeche = document.createElement('div');
			this.flaeche.className = 'huelle';
			this.flaeche.innerHTML = `<div class="rechner">
				<div class="kopf" hidden>
					<div class="kopf-zeile"><span class="kopf-schritt"></span><span class="kopf-prozent"></span></div>
					<div class="kopf-balken"><span class="kopf-fuellung"></span></div>
				</div>
				<div class="inhalt"></div>
			</div>`;
			this.kopf = this.flaeche.querySelector('.kopf');
			this.inhalt = this.flaeche.querySelector('.inhalt');
			wurzel.append(stil, this.flaeche);

			// Erst zeigen, wenn CSS und Schrift da sind (die Schrift höchstens 1,5 s abwarten),
			// sonst blitzt der Rechner ungestylt oder in der Ersatzschrift auf.
			this.flaeche.hidden = true;
			new Promise((fertig) => {
				stil.addEventListener('load', fertig);
				stil.addEventListener('error', fertig);
			})
				.then(() => Promise.race([ladeSchrift(cssUrl), pause(1500)]))
				.then(() => {
					this.flaeche.hidden = false;
				});

			this.flaeche.addEventListener('click', (ereignis) => this.klick(ereignis));
			this.flaeche.addEventListener('input', (ereignis) => this.eingabe(ereignis));
			this.flaeche.addEventListener('change', (ereignis) => this.eingabe(ereignis));
			this.flaeche.addEventListener('submit', (ereignis) => this.absenden(ereignis));
			this.zeichne(false);
		}

		entfernung() {
			return DATEN.entfernungen.find((entfernung) => entfernung.id === this.zustand.entfernung);
		}

		gewaehlt() {
			return DATEN.leistungen.filter((leistung) => this.zustand.leistungen.has(leistung.id));
		}

		preis() {
			return berechnePreis(this.entfernung(), this.gewaehlt());
		}

		klick(ereignis) {
			const ziel = ereignis.target.closest('[data-aktion]');
			if (!ziel || ziel.disabled) return;
			const { aktion, wert } = ziel.dataset;
			if (aktion === 'entfernung') {
				this.zustand.entfernung = wert;
				this.gehe(this.entfernung().ausserhalb ? 'ausserhalb' : 'notfall');
			} else if (aktion === 'notfall') {
				this.zustand.notfall = wert;
				this.gehe(wert === 'ja' ? 'anruf' : 'leistungen');
			} else if (aktion === 'leistung') {
				this.umschalten(wert, ziel);
			} else if (aktion === 'weiter') {
				this.gehe('preis');
			} else if (aktion === 'formular') {
				this.gehe('formular');
			} else if (aktion === 'zurueck') {
				this.gehe(ZURUECK[this.zustand.schritt]);
			}
		}

		umschalten(id, karte) {
			const { leistungen } = this.zustand;
			if (leistungen.has(id)) leistungen.delete(id);
			else leistungen.add(id);
			karte.setAttribute('aria-pressed', String(leistungen.has(id)));
			this.flaeche.querySelector('[data-aktion="weiter"]').disabled = leistungen.size === 0;
			this.flaeche.querySelector('.zaehler').textContent = this.zaehlerText();
		}

		zaehlerText() {
			const anzahl = this.zustand.leistungen.size;
			if (anzahl === 0) return 'Bitte mindestens eine Leistung wählen.';
			return anzahl === 1 ? '1 Leistung gewählt' : `${anzahl} Leistungen gewählt`;
		}

		eingabe(ereignis) {
			const feld = ereignis.target;
			if (!(feld.name in this.zustand.formular)) return;
			this.zustand.formular[feld.name] = feld.type === 'checkbox' ? feld.checked : feld.value;
			if (this.zustand.fehler[feld.name]) {
				delete this.zustand.fehler[feld.name];
				feld.closest('.feld, .zustimmung').classList.remove('hat-fehler');
				feld.removeAttribute('aria-invalid');
				this.flaeche.querySelector(`#akp-${feld.name}-fehler`)?.remove();
			}
		}

		gehe(schritt) {
			this.zustand.schritt = schritt;
			this.zustand.sendefehler = '';
			this.zeichne(true);
		}

		zeichne(neuerSchritt) {
			const { schritt } = this.zustand;
			const index = HAUPTSCHRITTE.indexOf(schritt);
			this.kopf.hidden = index < 0;
			if (index >= 0) {
				const prozent = Math.round(((index + 1) / HAUPTSCHRITTE.length) * 100);
				this.kopf.querySelector('.kopf-schritt').textContent = `Schritt ${index + 1} von ${HAUPTSCHRITTE.length}`;
				this.kopf.querySelector('.kopf-prozent').textContent = `${prozent}%`;
				this.kopf.querySelector('.kopf-fuellung').style.width = `${prozent}%`;
			}
			this.inhalt.innerHTML = this.ansicht(schritt);
			if (!neuerSchritt) return;

			this.inhalt.querySelector('h2').focus({ preventScroll: true });
			// Nach einem Klick weit unten (lange Leistungsliste) zurück an den Anfang des Rechners.
			if (this.host.getBoundingClientRect().top < 0) {
				const ruhig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
				this.host.scrollIntoView({ behavior: ruhig ? 'auto' : 'smooth', block: 'start' });
			}
		}

		ansicht(schritt) {
			switch (schritt) {
				case 'entfernung': return this.ansichtEntfernung();
				case 'ausserhalb': return this.ansichtAusserhalb();
				case 'notfall': return this.ansichtNotfall();
				case 'anruf': return this.ansichtAnruf();
				case 'leistungen': return this.ansichtLeistungen();
				case 'preis': return this.ansichtPreis();
				case 'formular': return this.ansichtFormular();
				default: return this.ansichtDanke();
			}
		}

		titel(marke, text, unterzeile, warnfarbe = false) {
			return `${marke ? `<span class="marke${warnfarbe ? ' marke-rot' : ''}">${esc(marke)}</span>` : ''}
				<h2 tabindex="-1">${esc(text)}</h2>
				${unterzeile ? `<p class="unterzeile">${esc(unterzeile)}</p>` : ''}`;
		}

		zurueckKnopf() {
			return `<button type="button" class="zurueck" data-aktion="zurueck">${icon('pfeilLinks')}Zurück</button>`;
		}

		vertrauen() {
			return `<p class="vertrauen">${esc(VERTRAUEN)}</p>`;
		}

		anrufLink(klasse, inhalt) {
			return `<a class="knopf ${klasse}" href="tel:${DATEN.telefon.wahl}">${icon('telefon')}${inhalt}</a>`;
		}

		whatsappKnopf(preis) {
			return `<a class="knopf knopf-whatsapp" href="${esc(this.whatsappLink(preis))}" target="_blank" rel="noopener">${WHATSAPP_LOGO}WhatsApp</a>`;
		}

		ansichtEntfernung() {
			const pillen = DATEN.entfernungen
				.map((entfernung) => {
					const gewaehlt = entfernung.id === this.zustand.entfernung ? ' ist-gewaehlt' : '';
					return `<button type="button" class="pille${gewaehlt}" data-aktion="entfernung" data-wert="${entfernung.id}">
						<span class="pille-titel">${esc(entfernung.titel)}</span>
						<span class="pille-unter">${entfernung.ausserhalb ? 'außerhalb' : `Anfahrt ${euro(entfernung.anfahrt)}`}</span>
					</button>`;
				})
				.join('');
			return `${this.titel('Ihr Standort', 'Wie weit wohnen Sie von Hanau entfernt?', 'Danach richten sich die Anfahrtskosten.')}
				<div class="felder-block"><div class="pillen">${pillen}</div></div>
				${this.vertrauen()}`;
		}

		ansichtAusserhalb() {
			return `${this.titel('Einsatzgebiet', 'Leider außerhalb unseres Einsatzgebiets.', 'Wir fahren Einsätze im Umkreis von 40 km um Hanau. Für weiter entfernte Orte können wir leider keinen Termin anbieten.')}
				<div class="fuss">
					<button type="button" class="knopf knopf-primaer" data-aktion="zurueck">${icon('pfeilLinks')}Entfernung ändern</button>
				</div>`;
		}

		ansichtNotfall() {
			const gewaehlt = (wert) => (this.zustand.notfall === wert ? ' ist-gewaehlt' : '');
			return `${this.titel('Dringlichkeit', 'Ist es ein Notfall?', 'Notfall heißt: Es muss sofort jemand kommen, auch nachts oder am Wochenende.')}
				<div class="felder-block zeilen">
					<button type="button" class="zeile zeile-notfall${gewaehlt('ja')}" data-aktion="notfall" data-wert="ja">
						<span class="radio"></span>
						<span class="zeile-text"><strong>Ja, es ist ein Notfall</strong><span class="zeile-unter">Soforteinsatz rund um die Uhr</span><span class="hinweis-rot">Kostet extra: Notfallzuschlag</span></span>
					</button>
					<button type="button" class="zeile${gewaehlt('nein')}" data-aktion="notfall" data-wert="nein">
						<span class="radio"></span>
						<span class="zeile-text"><strong>Nein, kein Notfall</strong><span class="zeile-unter">Termin nach Absprache, Preis sofort online</span></span>
					</button>
				</div>
				<div class="fuss">${this.zurueckKnopf()}</div>
				${this.vertrauen()}`;
		}

		ansichtAnruf() {
			const entfernung = this.entfernung();
			return `${this.titel('Notdienst 24/7', 'Notfall? Rufen Sie direkt an.', 'Wir sind rund um die Uhr erreichbar, auch nachts, am Wochenende und an Feiertagen.', true)}
				<div class="warnung" role="note">
					${icon('warnung')}
					<div>
						<strong>Notfalleinsätze kosten extra.</strong>
						<p>Zum normalen Preis und zur Anfahrt (${esc(entfernung.titel)}: ${euro(entfernung.anfahrt)}) kommt ein Notfallzuschlag. Den Aufpreis nennen wir Ihnen vorab am Telefon.</p>
					</div>
				</div>
				<div class="fuss">
					${this.anrufLink('knopf-primaer knopf-anruf', `<span><small>Jetzt anrufen</small><span class="nummer">${esc(DATEN.telefon.anzeige)}</span></span>`)}
					<button type="button" class="textlink" data-aktion="notfall" data-wert="nein">Doch kein Notfall? Preis online berechnen</button>
					${this.zurueckKnopf()}
				</div>`;
		}

		ansichtLeistungen() {
			const gruppen = DATEN.gruppen
				.map((gruppe) => {
					const karten = DATEN.leistungen
						.filter((leistung) => leistung.gruppe === gruppe.id)
						.map((leistung) => this.leistungKarte(leistung))
						.join('');
					return `<div class="feldgruppe"><p class="label">${esc(gruppe.titel)}</p><div class="karten">${karten}</div></div>`;
				})
				.join('');
			const leer = this.zustand.leistungen.size === 0;
			return `${this.titel('Leistungen', 'Welche Leistung brauchen Sie?', 'Mehrfachauswahl möglich.')}
				<div class="felder-block">${gruppen}</div>
				<div class="fuss">
					<button type="button" class="knopf knopf-primaer" data-aktion="weiter"${leer ? ' disabled' : ''}>Preis anzeigen${icon('pfeilRechts')}</button>
					<p class="zaehler" aria-live="polite">${this.zaehlerText()}</p>
					${this.zurueckKnopf()}
				</div>
				${this.vertrauen()}`;
		}

		leistungKarte(leistung) {
			return `<button type="button" class="karte" data-aktion="leistung" data-wert="${leistung.id}" aria-pressed="${this.zustand.leistungen.has(leistung.id)}">
				<span class="karte-icon">${icon(leistung.icon)}</span>
				<span class="karte-titel">${esc(leistung.titel)}</span>
				${leistung.untertitel ? `<span class="karte-unter">${esc(leistung.untertitel)}</span>` : ''}
				<span class="karte-preis">${preisLabel(leistung)}</span>
				<span class="karte-haken">${icon('haken')}</span>
			</button>`;
		}

		ansichtPreis() {
			const preis = this.preis();
			const posten = preis.zeilen
				.map((zeile) => `<li><span>${esc(zeile.text)}</span><strong>${esc(zeile.betrag)}</strong></li>`)
				.join('');
			const hinweise = preis.hinweise.length
				? `<ul class="hinweise">${preis.hinweise.map((hinweis) => `<li>${esc(hinweis)}</li>`).join('')}</ul>`
				: '';
			const festpreis = DATEN.festpreisHinweis;
			return `${this.titel('Ihr Preis', 'Ihr Preis auf einen Blick.', 'Kostenfrei und unverbindlich. Den Festpreis bestätigen wir vor Arbeitsbeginn.')}
				<div class="beleg">
					<ul class="beleg-posten">${posten}</ul>
					<div class="beleg-gesamt">
						<span class="beleg-gesamt-text">Gesamt<small>${esc(preis.gesamtZusatz)}</small></span>
						<strong>${esc(preis.gesamt)}</strong>
					</div>
				</div>
				${hinweise}
				<div class="festpreis-hinweis" role="note">
					${icon('info')}
					<div>
						<strong>${esc(festpreis.titel)}</strong>
						${festpreis.absaetze.map((absatz) => `<p>${esc(absatz)}</p>`).join('')}
					</div>
				</div>
				<div class="feldgruppe kontakt">
					<p class="label">Wie möchten Sie uns erreichen?</p>
					<div class="kontaktwege">
						<button type="button" class="knopf knopf-primaer knopf-breit" data-aktion="formular">${icon('mail')}Anfrage senden</button>
						${this.anrufLink('knopf-umriss', esc(DATEN.telefon.anzeige))}
						${this.whatsappKnopf(preis)}
					</div>
				</div>
				<div class="fuss fuss-eng">${this.zurueckKnopf()}</div>
				${this.vertrauen()}`;
		}

		whatsappLink(preis) {
			const text = [
				'Hallo Akatec, ich habe gerade den Preisrechner auf Ihrer Webseite genutzt.',
				'',
				`Entfernung: ${this.entfernung().titel}`,
				`Leistungen: ${this.gewaehlt().map((leistung) => leistung.titel).join(', ')}`,
				`Preis laut Rechner: ${preis.gesamt} (${preis.gesamtZusatz})`,
				'',
				'Wann hätten Sie einen Termin frei?',
			].join('\n');
			return `https://wa.me/${DATEN.whatsapp.nummer}?text=${encodeURIComponent(text)}`;
		}

		ansichtFormular() {
			const { formular, fehler, sendet, sendefehler } = this.zustand;
			const preis = this.preis();
			const leistungen = this.gewaehlt().map((leistung) => leistung.titel).join(', ');
			const datenschutzFehler = fehler.datenschutz
				? `<p class="fehlertext" id="akp-datenschutz-fehler">${esc(fehler.datenschutz)}</p>`
				: '';
			const sendefehlerBox = sendefehler
				? `<div class="sendefehler" role="alert">
					<p>${esc(sendefehler)}</p>
					<div class="sendefehler-wege">
						${this.anrufLink('knopf-umriss', esc(DATEN.telefon.anzeige))}
						${this.whatsappKnopf(preis)}
					</div>
				</div>`
				: '';
			return `${this.titel('Anfrage', 'Wie erreichen wir Sie?', 'Ihre Auswahl und der Preis gehen automatisch mit. Wir melden uns in der Regel innerhalb von 2 Stunden während der Geschäftszeiten.')}
				<p class="auswahl-kurz">${esc(leistungen)} · ${esc(this.entfernung().titel)} · <strong>${esc(preis.gesamt)}</strong></p>
				<form novalidate>
					<div class="felder">
						${this.feld('name', 'Name', { autocomplete: 'name', pflicht: true })}
						${this.feld('telefon', 'Telefon', { typ: 'tel', autocomplete: 'tel', pflicht: true })}
						${this.feld('email', 'E-Mail', { typ: 'email', autocomplete: 'email' })}
						<div class="feld-paar">
							${this.feld('plz', 'PLZ', { autocomplete: 'postal-code', inputmode: 'numeric', maxlength: 5, pflicht: true })}
							${this.feld('ort', 'Ort', { autocomplete: 'address-level2', pflicht: true })}
						</div>
						${this.feld('nachricht', 'Nachricht', { mehrzeilig: true, platzhalter: 'Was ist passiert? Haben Sie einen Wunschtermin?' })}
					</div>
					<div class="falle" aria-hidden="true">
						<label>Website <input type="text" name="website" tabindex="-1" autocomplete="off"></label>
					</div>
					<label class="zustimmung${fehler.datenschutz ? ' hat-fehler' : ''}">
						<input type="checkbox" name="datenschutz"${formular.datenschutz ? ' checked' : ''}${fehler.datenschutz ? ' aria-invalid="true" aria-describedby="akp-datenschutz-fehler"' : ''}>
						<span>Ich habe die <a href="${esc(DATEN.datenschutzUrl)}" target="_blank" rel="noopener">Datenschutzerklärung</a> gelesen und stimme der Verarbeitung meiner Daten zur Bearbeitung meiner Anfrage zu. *</span>
					</label>
					${datenschutzFehler}
					${sendefehlerBox}
					<div class="fuss">
						<button type="submit" class="knopf knopf-primaer"${sendet ? ' disabled' : ''}>${sendet ? 'Wird gesendet …' : `Anfrage absenden${icon('pfeilRechts')}`}</button>
						${this.zurueckKnopf()}
					</div>
				</form>`;
		}

		feld(name, beschriftung, optionen) {
			const wert = this.zustand.formular[name];
			const fehler = this.zustand.fehler[name];
			const id = `akp-${name}`;
			const attribute = [
				`id="${id}"`,
				`name="${name}"`,
				optionen.autocomplete ? `autocomplete="${optionen.autocomplete}"` : '',
				optionen.inputmode ? `inputmode="${optionen.inputmode}"` : '',
				optionen.maxlength ? `maxlength="${optionen.maxlength}"` : '',
				optionen.pflicht ? 'required' : '',
				optionen.platzhalter ? `placeholder="${esc(optionen.platzhalter)}"` : '',
				fehler ? `aria-invalid="true" aria-describedby="${id}-fehler"` : '',
			]
				.filter(Boolean)
				.join(' ');
			const eingabe = optionen.mehrzeilig
				? `<textarea ${attribute} rows="3">${esc(wert)}</textarea>`
				: `<input type="${optionen.typ || 'text'}" ${attribute} value="${esc(wert)}">`;
			return `<div class="feld feld-${name}${fehler ? ' hat-fehler' : ''}">
				<label for="${id}">${esc(beschriftung)}${optionen.pflicht ? ' *' : ' <span class="optional">(optional)</span>'}</label>
				${eingabe}
				${fehler ? `<p class="fehlertext" id="${id}-fehler">${esc(fehler)}</p>` : ''}
			</div>`;
		}

		pruefe() {
			const formular = this.zustand.formular;
			const fehler = {};
			if (!formular.name.trim()) fehler.name = 'Bitte geben Sie Ihren Namen an.';
			if ((formular.telefon.match(/\d/g) || []).length < 6) fehler.telefon = 'Bitte geben Sie Ihre Telefonnummer an.';
			if (formular.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formular.email.trim())) fehler.email = 'Bitte prüfen Sie Ihre E-Mail-Adresse.';
			const plz = formular.plz.trim();
			if (!/^\d{5}$/.test(plz)) fehler.plz = plz ? 'Die PLZ hat 5 Ziffern.' : 'Bitte PLZ angeben.';
			if (!formular.ort.trim()) fehler.ort = 'Bitte Ort angeben.';
			if (!formular.datenschutz) fehler.datenschutz = 'Bitte bestätigen Sie die Datenschutzerklärung.';
			return fehler;
		}

		async absenden(ereignis) {
			ereignis.preventDefault();
			if (this.zustand.sendet) return;

			this.zustand.fehler = this.pruefe();
			const ersterFehler = Object.keys(this.zustand.fehler)[0];
			if (ersterFehler) {
				this.zeichne(false);
				this.flaeche.querySelector(`[name="${ersterFehler}"]`).focus();
				return;
			}

			const falle = this.flaeche.querySelector('[name="website"]').value;
			const formular = this.zustand.formular;
			const preis = this.preis();
			this.zustand.sendet = true;
			this.zustand.sendefehler = '';
			this.zeichne(false);

			let meldung = SENDEFEHLER;
			try {
				const antwort = await fetch(this.endpoint, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						name: formular.name.trim(),
						telefon: formular.telefon.trim(),
						email: formular.email.trim(),
						plz: formular.plz.trim(),
						ort: formular.ort.trim(),
						nachricht: formular.nachricht.trim(),
						datenschutz: formular.datenschutz,
						website: falle,
						dauer: Date.now() - this.gestartet,
						seite: window.location.origin + window.location.pathname,
						entfernung: this.entfernung().titel,
						zeilen: preis.zeilen,
						gesamt: preis.gesamt,
						gesamtZusatz: preis.gesamtZusatz,
						hinweise: preis.hinweise,
					}),
				});
				const ergebnis = await antwort.json().catch(() => ({}));
				if (antwort.ok && ergebnis.ok) {
					this.zustand.sendet = false;
					this.gehe('danke');
					return;
				}
				// Nur eigene Meldungen zeigen; fremde (Sicherheits-Plugins, WordPress) sind oft englisch.
				if (ergebnis.code === 'akatec_preisrechner' && ergebnis.message) meldung = ergebnis.message;
			} catch (_) {
				// Netzwerkfehler: Standardmeldung mit Anruf und WhatsApp als Ausweg.
			}
			this.zustand.sendet = false;
			this.zustand.sendefehler = meldung;
			this.zeichne(false);
			this.flaeche.querySelector('.sendefehler').scrollIntoView({ block: 'nearest' });
		}

		ansichtDanke() {
			return `<div class="danke-haken">${icon('haken')}</div>
				${this.titel('', 'Danke, Ihre Anfrage ist angekommen.', 'Wir melden uns in der Regel innerhalb von 2 Stunden während der Geschäftszeiten (Montag bis Freitag, 8 bis 17 Uhr).')}
				<div class="fuss">
					<p class="fuss-hinweis">Eilt es doch? Rufen Sie uns an.</p>
					${this.anrufLink('knopf-umriss', esc(DATEN.telefon.anzeige))}
				</div>`;
		}
	}

	const starte = () => {
		document.querySelectorAll('.akatec-preisrechner').forEach((host) => {
			if (!host.shadowRoot) new Rechner(host);
		});
	};
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', starte);
	else starte();
})();
