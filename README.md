# Fantacalcio - Asta

Repository per aggiornare automaticamente le quotazioni Fantacalcio e pubblicare l'asta tramite GitHub Pages.

## Pagina pubblica

GitHub Pages pubblica esclusivamente ed il sito è disponibile qui https://robertonav20.github.io/fantaasta/:

- `index.html`
- `players.json`

Il workbook, gli script Python e i file di configurazione non vengono pubblicati nel sito.

`index.html` contiene:

- rosa vuota 3 portieri, 8 difensori, 8 centrocampisti, 6 attaccanti;
- budget totale e budget per reparto;
- fasce costo configurabili;
- costo effettivo e crediti residui;
- ricerca giocatori con squadra e FVM;
- undo/redo;
- salvataggio dell'asta in `localStorage` del browser.

Il catalogo giocatori viene letto a runtime da `players.json`.

## Aggiornamento dati

`aggiorna_quotazioni.py` scarica l'Excel Fantacalcio e modifica esclusivamente:

- `Tutti`
- `Portieri`
- `Difensori`
- `Centrocampisti`
- `Attaccanti`
- `Ceduti`

Dopo l'aggiornamento genera `players.json` dai quattro fogli ruolo. I giocatori presenti solo in `Ceduti` non vengono proposti nella pagina.

Lo stesso workflow scarica anche gli Excel statistiche Fantacalcio usando lo stesso secret `FANTACALCIO_COOKIE` e li associa ai giocatori tramite `Id` Fantacalcio. Configurazione corrente:

- `2026/27`: statistiche stagione corrente, opzionali finché non sono disponibili;
- `2025/26`: storico stagione precedente, usato come supporto all'asta.

Se una fonte opzionale non è temporaneamente disponibile, gli ultimi dati già salvati in `players.json` vengono mantenuti.

### Dati aggiuntivi

Il workflow prova inoltre a integrare:

- **Probabili formazioni Fantacalcio.it**: percentuale di titolarità e stato del giocatore (`Infortunato`, `In dubbio`, `Squalificato`, `Diffidato`). La fonte viene ignorata se l'ultimo aggiornamento ha più di 21 giorni, per evitare dati obsoleti.
- **Understat**: minuti, partite, gol, assist, xG, xA, tiri, key pass, npxG, xGChain, xGBuildup e metriche calcolate xG/90, xA/90 e xG+xA/90.
- **Guide Fantacalcio.it**: gerarchia rigoristi e calci da fermo, salvata con la stagione di riferimento per non confondere dati storici e correnti.

Il matching delle fonti esterne è conservativo: i dati vengono collegati solo quando il giocatore è identificato in modo univoco. I dati avanzati sono opzionali e non bloccano l'aggiornamento delle quotazioni.

## Secret GitHub

Creare in:

`Settings -> Secrets and variables -> Actions -> New repository secret`

il secret:

`FANTACALCIO_COOKIE`

Il valore deve essere il contenuto completo dell'header HTTP `Cookie`.

Non inserire il cookie in `config.github.json`, `index.html` o `players.json`.

## GitHub Pages

Repository pubblico se si usa GitHub Free.

In:

`Settings -> Pages -> Build and deployment -> Source`

selezionare:

`GitHub Actions`

Workflow:

- `.github/workflows/update-quotazioni.yml`: ogni giorno aggiorna Excel + `players.json`, committa le variazioni e pubblica GitHub Pages;
- `.github/workflows/pages.yml`: pubblica Pages quando modifichi manualmente `index.html` o `players.json` su `main`.

L'URL sarà normalmente:

`https://USERNAME.github.io/NOME-REPOSITORY/`

## Esecuzione locale

Configurazione dipendenze

```bash
python -m venv venv
source venv/bin/activate
python -m pip install -r requirements.txt
```

Per aggiornare i dati:

```bash
export FANTACALCIO_COOKIE='fantacalcio.it=;'
python -m pip install -r requirements.txt
python aggiorna_quotazioni.py --config config.github.json
```

Per provare la pagina localmente serve un server HTTP perché `index.html` carica `players.json` con `fetch`:

```bash
python -m http.server 8000
```

Aprire quindi `http://localhost:8000/`.

## Asta web

La pagina `index.html`:

- salva automaticamente la rosa e i budget nel `localStorage` del browser;
- mostra i dettagli completi del giocatore tramite il pulsante info;
- mostra nel modale le statistiche Fantacalcio disponibili, separate per stagione;
- mostra disponibilità/titolarità dalle probabili formazioni quando il dato è recente;
- mostra le metriche avanzate Understat (xG/xA e indicatori per 90 minuti) quando disponibili;
- mostra gerarchie di rigori e calci da fermo Fantacalcio con indicazione della stagione;
- mostra indicatori asta calcolati: costo vs stima e costo vs FVM;
- esporta la rosa compilata in CSV con costo di acquisto;
- legge il catalogo aggiornato da `players.json`.

`players.json` viene rigenerato dal workflow a partire dai fogli Portieri, Difensori, Centrocampisti e Attaccanti e contiene tutte le colonne informative A:M del workbook, le statistiche Fantacalcio associate per `Id`, le metriche avanzate eventualmente collegate e i dati recenti di disponibilità/titolarità.

### Understat: primo caricamento

Il file `players.json` iniziale puo avere `advanced: {}`. I dati Understat vengono popolati dal workflow GitHub.
Per la stagione 2025/26 il primo caricamento e obbligatorio: se la pagina lega non espone `playersData`, lo script prova automaticamente lo scraping HTML delle pagine delle singole squadre. Se anche il fallback fallisce, il workflow termina con errore invece di pubblicare silenziosamente un catalogo senza dati avanzati. Dopo il primo caricamento riuscito, eventuali errori temporanei mantengono gli ultimi dati Understat disponibili.
