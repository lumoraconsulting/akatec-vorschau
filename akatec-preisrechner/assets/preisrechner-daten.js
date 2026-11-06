/*
 * Akatec Preisrechner: Preise, Entfernungen und Kontaktwege.
 *
 * Alle Preise in Euro inkl. MwSt. (Stand 05.11.2026, Preisliste von Shaher).
 * Nach einer Änderung lädt WordPress die Datei automatisch neu, die
 * Plugin-Version muss dafür nicht angefasst werden.
 *
 * Felder einer Leistung:
 *   preis       Betrag in Euro
 *   ab          true: Ab-Preis, der genaue Preis hängt vom Aufwand ab
 *   proStunde   true: Stundensatz, im Gesamtpreis ist eine Stunde eingerechnet
 *   aufAnfrage  true: kein Preis, Akatec nennt ihn nach Rücksprache
 */
window.AkatecPreisrechnerDaten = {
	telefon: { anzeige: '06181 1896143', wahl: '+4961811896143' },
	whatsapp: { nummer: '491784437359' },
	datenschutzUrl: 'https://akatec-umwelttechnik.de/datenschutzhinweise/',

	entfernungen: [
		{ id: 'bis-15', titel: 'bis 15 km', anfahrt: 20 },
		{ id: 'bis-30', titel: 'bis 30 km', anfahrt: 35 },
		{ id: 'bis-40', titel: 'bis 40 km', anfahrt: 50 },
		{ id: 'ueber-40', titel: 'über 40 km', ausserhalb: true },
	],

	gruppen: [
		{ id: 'rohr', titel: 'Rohrreinigung' },
		{ id: 'kamera', titel: 'Kamera und Sonstiges' },
	],

	leistungen: [
		{ id: 'kueche', gruppe: 'rohr', icon: 'kueche', titel: 'Küche', preis: 189 },
		{ id: 'wc', gruppe: 'rohr', icon: 'wc', titel: 'WC', preis: 219 },
		{ id: 'grundleitung', gruppe: 'rohr', icon: 'rohr', titel: 'Grundleitung', preis: 319 },
		{ id: 'dusche', gruppe: 'rohr', icon: 'dusche', titel: 'Dusche', preis: 189 },
		{ id: 'bodenablauf', gruppe: 'rohr', icon: 'bodenablauf', titel: 'Bodenablauf', preis: 189 },
		{ id: 'hofablauf', gruppe: 'rohr', icon: 'hofablauf', titel: 'Hofablauf', preis: 259 },
		{ id: 'regenleitung', gruppe: 'rohr', icon: 'regen', titel: 'Regenleitung / Regenrohr', preis: 300, ab: true },
		{ id: 'tv-inspektion', gruppe: 'kamera', icon: 'kamera', titel: 'TV-Inspektion', untertitel: 'Kamerainspektion', preis: 185, proStunde: true },
		{ id: 'tv-kontrolle', gruppe: 'kamera', icon: 'auge', titel: 'TV-Kontrolle', untertitel: 'Kamerakontrolle', preis: 115, proStunde: true },
		{ id: 'anderes', gruppe: 'kamera', icon: 'frage', titel: 'Anderes', untertitel: 'Etwas, das nicht in der Liste steht', aufAnfrage: true },
	],
};
