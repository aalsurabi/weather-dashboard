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
* **Responsive Grid-Layout**: Anpassung der UI an Desktop-, Tablet- und Mobil-Bildschirmgrößen.
* **Theme-Wechsel**: Umschalter zwischen Light- und Dark-Mode. Die bevorzugte Einstellung wird im `localStorage` gespeichert.
* **7-Tage-Vorhersageliste**: Visualisierung der Wochentage mit Wettersymbolen, Regenwahrscheinlichkeit und einem horizontalen Balken für den täglichen Min/Max-Bereich relativ zur gesamten Woche (inklusive Punktmarkierung der aktuellen Temperatur am heutigen Tag).

### 📍 Ortssuche & Geolocation
* **Standort-Erkennung**: Ermittlung der Koordinaten über die HTML5 Geolocation-API und anschließende Namensauflösung (Reverse Geocoding) über OpenStreetMap Nominatim.
* **Ortssuche**: Textsuche nach Stadtnamen sowie deutschen Postleitzahlen über die Zippopotam.us API.
* **Favoriten-System**: Abspeichern von Orten in einer Favoritenliste, die persistent über den `localStorage` des Browsers verwaltet wird.

### 🤖 Chatbot "rumbleAI"
* **Datenintegration**: Übergabe der aktuellen Wetterdaten und Prognosen an das Sprachmodell zur Beantwortung von Anfragen mit lokalem Kontext.
* **Anfragenklassifizierung**: Erkennung und Filterung anwendungsfremder Eingaben (z. B. mathematische Aufgaben). Diese werden mit einer vordefinierten Standardantwort abgewiesen.
* **Vorschlagsfragen**: Schaltflächen für vorkonfigurierte Fragen zur schnellen Interaktion.

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
