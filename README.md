# Fantacalcio Asta

SPA React + Material UI per consultare il catalogo Fantacalcio e gestire più aste contemporaneamente.

## Struttura

```text
.
├── public/
│   ├── .nojekyll
│   └── players.json
├── src/
│   ├── components/
│   │   ├── AuctionPanel.jsx
│   │   ├── AuctionSummary.jsx
│   │   ├── AuctionTable.jsx
│   │   ├── AuctionTabs.jsx
│   │   ├── ConfigModal.jsx
│   │   ├── HistoryModal.jsx
│   │   ├── MainNavigation.jsx
│   │   ├── PlayerModal.jsx
│   │   ├── PlayerTable.jsx
│   │   └── RoleBadge.jsx
│   ├── constants/
│   │   ├── auction.js
│   │   ├── project.js
│   │   ├── storage.js
│   │   └── index.js
│   ├── hooks/
│   │   ├── useAuctionWorkspace.js
│   │   ├── useCatalog.js
│   │   └── useRosterHistory.js
│   ├── pages/
│   │   ├── AuctionsPage.jsx
│   │   └── PlayersPage.jsx
│   ├── services/
│   │   ├── players.js
│   │   └── storage.js
│   ├── utils/
│   │   ├── auction.js
│   │   ├── budget.js
│   │   ├── common.js
│   │   ├── exportImport.js
│   │   ├── playerUtils.js
│   │   └── index.js
│   ├── App.jsx
│   ├── main.jsx
│   └── theme.js
├── scripts/
│   ├── aggiorna_quotazioni.py
│   └── validate-project.mjs
├── .github/workflows/
│   ├── deploy-pages.yml
│   └── update-data.yml
├── config.github.json
├── requirements.txt
├── package.json
└── vite.config.js
```

## Frontend

Requisito: Node.js 22.12+.

```bash
npm install
npm run dev
```

Validazione struttura:

```bash
npm run validate
```

Build statica:

```bash
npm run build
```

La build viene prodotta in `dist/`. GitHub Pages pubblica solo questa directory.

## Dati

`public/players.json` è l'unico dataset persistente del frontend. Il listone XLSX remoto viene letto temporaneamente dallo script Python e non viene versionato.

Esecuzione locale:

```bash
python -m pip install -r requirements.txt
export FANTACALCIO_COOKIE='cookie...'
python scripts/aggiorna_quotazioni.py --config config.github.json
```

Su Windows PowerShell:

```powershell
$env:FANTACALCIO_COOKIE='cookie...'
python scripts/aggiorna_quotazioni.py --config config.github.json
```

## GitHub Actions

### `update-data.yml`

Parte quando:

- ogni giorno alle **09:00 Europe/Rome**;
- viene modificato un file `scripts/**/*.py`;
- cambia `config.github.json`;
- cambia `requirements.txt`;
- viene avviato manualmente.

Aggiorna `public/players.json` e crea un commit solo se il catalogo cambia. Se crea un nuovo catalogo, richiama direttamente il workflow di build/deploy passando il nuovo commit.

Questo passaggio esplicito è necessario perché un push effettuato con il `GITHUB_TOKEN` del workflow non deve essere usato come trigger implicito per un secondo workflow.

### `deploy-pages.yml`

Parte quando cambia il frontend:

- `src/**`;
- `public/**`;
- `index.html`;
- `package.json`;
- `vite.config.js`;
- il workflow stesso.

Esegue:

```text
validate -> npm install -> npm run build -> upload dist -> GitHub Pages
```

È anche un workflow riutilizzabile: `update-data.yml` lo richiama quando `players.json` viene aggiornato automaticamente.

## Secret GitHub

Configurare:

```text
FANTACALCIO_COOKIE
```

in `Settings -> Secrets and variables -> Actions`.

Il cookie non viene inserito in `players.json`, nella build React o nell'artefatto GitHub Pages.

## Persistenza browser

- workspace multi-asta: `fantacalcio-react-workspace-v1`
- storico rose: `fantacalcio-asta-rosters-v1`
- migrazione automatica dalla precedente `fantacalcio-asta-v1`

Lo storico supporta import/export JSON singolo e multiplo.
