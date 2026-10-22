## Om appen

Min dag är en React-applikation där användaren, målgrupp barn/unga, kan skapa profiler och organisera dagliga uppgifter efter morgon, dag och kväll.

## Tekniker

- React
- TypeScript
- Vite
- Node.js och Express
- Fetch API
- CSS
- Jest och React Testing Library

## Installation

Installera beroenden i både backend och frontend:

```bash
cd backend
npm install
```

```bash
cd frontend
npm install
```

## Starta projektet lokalt

Starta backend i en terminal:

```bash
cd backend
node server.js
```

Starta frontend i en annan terminal:

```bash
cd frontend
npm run dev
```

Öppna adressen som Vite visar i terminalen.

## Viktiga funktioner

- Skapa och ta bort profiler.
- Skapa egna uppgifter eller välja bland förslag.
- Koppla uppgifter till morgon, dag och kväll.
- Markera uppgifter som klara och ångra markeringar.
- Ta bort uppgifter.
- Starta en ny dag och återställa uppgifternas status.

## Miljövariabler

Frontend kan använda `VITE_API_URL` för backendens adress. Om variabeln inte anges används `http://localhost:3000` som standard.

## Publicerad app

Appen körs för närvarande lokalt och är ännu inte publicerad.

## Tester

Kör frontendens tester från `frontend`-mappen:

```bash
npm test
```

## Kända begränsningar och framtida utveckling

- Utveckla CSS-variablerna i `:root` för mer enhetlig styling.
- Göra det möjligt att redigera befintliga uppgifter, exempelvis ändra tidpunkt.
- Publicera appen på internet.
