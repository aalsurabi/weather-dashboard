# rumble Weather Dashboard 🌦️

Eine Next.js-Webanwendung zur Visualisierung von Wetterdaten der Bright Sky API mit integriertem KI-Chatbot ("rumbleAI") basierend auf OpenRouter.

Dieses Projekt wurde im Rahmen von **Thema A: Wetter-Dashboard** entwickelt.

---

## 1. Kurzbeschreibung des Projekts
Das **rumble Weather Dashboard** visualisiert aktuelle Wetterdaten und Prognosen für Standorte in Deutschland. Die Anwendung nutzt ein Glassmorphism-UI mit Dark- und Light-Theme-Unterstützung. Der integrierte Chatbot **rumbleAI** beantwortet auf Basis eines über OpenRouter angebundenen LLMs (Gemini-Modell) Fragen zum Wetter unter Einbeziehung der aktuellen lokalen Wetterdaten.

---

## 2. Anleitung zum lokalen Setup

### Voraussetzungen
Stelle sicher, dass du [Node.js](https://nodejs.org/) (v18+) und `npm` installiert hast.

### Installationsschritte

1. **Repository klonen / herunterladen** und in das Verzeichnis wechseln:
   ```bash
   cd weather-dashboard
   ```

2. **Abhängigkeiten installieren**:
   ```bash
   npm install
   ```

3. **Umgebungsvariablen einrichten**:
   Erstelle eine Datei namens `.env` im Stammverzeichnis des Projekts und füge deinen OpenRouter-API-Key hinzu:
   ```env
   OPENROUTER_API_KEY=dein_api_key_hier
   ```

4. **Entwicklungsserver starten**:
   ```bash
   npm run dev -- -p 3001
   ```
   Die Anwendung läuft unter [http://localhost:3001](http://localhost:3001).

5. **Produktions-Build erstellen** (optional):
   ```bash
   npm run build
   ```

---

## 3. Beschreibung der implementierten Features
 
 ### 💻 Benutzeroberfläche & Design
 * **Responsive Grid-Layout**: Dynamische Ausrichtung auf Desktop-, Tablet- und Mobilgeräten.
 * **Theme-Wechsel**: Umschalter zwischen Light- und Dark-Mode (gespeichert in `localStorage`).
 * **Premium Skeleton Loading**: Ein maßgeschneidertes Shimmer-Layout (`WeatherSkeleton.tsx`), das während des Ladevorgangs das genaue Layout der Dashboard-Widgets nachahmt und Ladeverzögerungen kaschiert.
 * **7-Tage-Vorhersage**: Anzeige der Min/Max-Temperaturen mit horizontalen Balken relativ zur gesamten Woche. Ein präziser Rundungs-Bugfix sorgt für die perfekte visuelle Ausrichtung aller Wochentage.
 * **Interaktiver Scroll-Indikator**: Ein schwebender Pfeil-Button ("Mehr entdecken") am unteren Rand des Viewports führt den Benutzer durch weiches Scrollen tiefer in die Seite und blendet sich bei Scrollbewegungen selbstständig aus.
 
 ### 📍 Ortssuche & Geolocation
 * **Standort-Erkennung**: GPS-basierte Standorterkennung mit Reverse-Geocoding über OSM Nominatim.
 * **Ortssuche & PLZ**: Volltextsuche nach Stadtnamen und deutschen Postleitzahlen (via Zippopotam.us API).
 * **Favoriten-System**: Persistentes Speichern von Lieblingsorten im `localStorage`.
 
 ### ⚡ DWD Unwetterwarnungen
 * **Real-Time Integration**: Direktes Abrufen von amtlichen Unwetterwarnungen des Deutschen Wetterdienstes (DWD) über den `/alerts`-Endpunkt der Bright Sky API.
 * **Dynamische Visualisierung**: Einstufung nach Schweregraden (`minor`, `moderate`, `severe`, `extreme`) mit farblich angepassten Warn-Bannern, ausklappbaren Details (Beschreibung & offizielle Verhaltensregeln) und animierten Warn-Bounces.
 
 ### 📍 Lokale Insider-Tipps (Overpass API)
 * **Intelligente API Route**: Ein Serverless Handler (`/api/recommend-activity`) liest das aktuelle Wetter und steuert eine räumliche Abfrage an die OpenStreetMap Overpass-API.
 * **Wetterabhängiges Mapping**: 
   * **Schlechtes Wetter**: Schlägt Indoor-POIs vor (Museen, Kinos, Bibliotheken, Theater, Hallencafés).
   * **Gutes Wetter**: Schlägt Outdoor-POIs vor (Parks, Gärten, Schlösser/Burgen, Zoos, Aussichtspunkte).
 * **Effizienz & Randomisierung**: Ergebnisse sind auf 15 Elemente limitiert (optimierter Payload) und werden per Fisher-Yates-Algorithmus gemischt, um genau 6 wechselnde, wetterbezogene Vorschläge anzuzeigen.
 * **Caching**: Next.js-ISR-Caching (`revalidate: 10800` für 3 Stunden) auf allen Geocoding-, Wetter- und Overpass-Abfragen zur Lastreduktion.
 
 ### 🤖 Chatbot "rumbleAI"
 * **Kontext-Integration**: Beantwortung von Wetter-Fragen auf Basis der echten aktuellen Daten und Vorhersagen.
 * **Sicherheitsfilter**: Blockieren von anwendungsfremden Anfragen (z.B. Rechenaufgaben) mittels einer System-Prompt-Klassifizierung.
 * **Vorschlagsfragen**: Klickbare Kurzwahlen zur schnellen Interaktion.

---

## 4. Dokumentation des Agentic-Engineering-Ansatzes

Die Entwicklung dieses Projekts erfolgte in Zusammenarbeit mit dem autonomen KI-Codierassistenten **Antigravity (Google DeepMind)**. Der Entwicklungsprozess gliedert sich in folgende Phasen:

1. **Planungsphase**:
   Vor größeren Code-Änderungen analysierte der Agent die Struktur der Next.js-Anwendung und erstellte einen Implementierungsplan (`implementation_plan.md`). Hierin wurden die Zielarchitektur, Dateimodifikationen und offene Fragen zur Abstimmung festgehalten.
2. **Implementierung**:
   Nach der Freigabe führte der Agent die Anpassungen direkt im Quellcode durch. Dies umfasst unter anderem das responsive Layout, den Datenfluss für den Chatbot und das CSS-Styling der Vorhersagebalken.
3. **Automatisierte Validierung**:
   Durchführung von Build-Vorgängen (`npm run build`) durch den Agenten zur Überprüfung der TypeScript-Konformität und Behebung von Compilierungsfehlern.
4. **Feinabstimmung**:
   Iterative Optimierung von UI-Details (z. B. Entfernung von Pulse-Animationen und Textanpassungen) auf Basis von Benutzer-Feedback.
