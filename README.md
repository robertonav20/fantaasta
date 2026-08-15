# Fantacalcio Quotazioni Updater

Aggiorna automaticamente il workbook `Quotazioni_Fantacalcio_Stagione_2026_27.xlsx` scaricando le quotazioni da Fantacalcio.

Lo script modifica esclusivamente questi fogli:

- `Tutti`
- `Portieri`
- `Difensori`
- `Centrocampisti`
- `Attaccanti`
- `Ceduti`

Gli altri fogli del workbook non vengono aggiornati dallo script.

## File del repository

- `aggiorna_quotazioni.py`: download e aggiornamento Excel.
- `config.github.json`: configurazione usata da GitHub Actions.
- `requirements.txt`: dipendenze Python.
- `Quotazioni_Fantacalcio_Stagione_2026_27.xlsx`: workbook versionato e aggiornato dal workflow.
- `.github/workflows/update-quotazioni.yml`: esecuzione automatica giornaliera.

## Configurazione GitHub

Il cookie Fantacalcio non deve essere salvato nel repository.

Nel repository GitHub aprire:

`Settings` -> `Secrets and variables` -> `Actions` -> `New repository secret`

Creare il secret:

- Name: `FANTACALCIO_COOKIE`
- Secret: il valore completo dell'header `Cookie` necessario per scaricare il file.

Esempio di valore del secret:

```text
cookie1=valore1; cookie2=valore2
```

## Esecuzione automatica

Il workflow viene eseguito ogni giorno alle **06:17 Europe/Rome** e può essere avviato anche manualmente dalla pagina `Actions` del repository.

Se il workbook non cambia, non viene creato alcun commit. Se cambia, GitHub Actions aggiorna e committa solo:

`Quotazioni_Fantacalcio_Stagione_2026_27.xlsx`

## Esecuzione locale

Creare un file `config.json` locale oppure usare `config.github.json`, quindi impostare il cookie come variabile d'ambiente.

Linux/macOS:

```bash
export FANTACALCIO_COOKIE='cookie1=valore1; cookie2=valore2'
python -m pip install -r requirements.txt
python aggiorna_quotazioni.py --config config.github.json
```

PowerShell:

```powershell
$env:FANTACALCIO_COOKIE='cookie1=valore1; cookie2=valore2'
python -m pip install -r requirements.txt
python aggiorna_quotazioni.py --config config.github.json
```

## Nota sul cookie

Se Fantacalcio invalida o fa scadere il cookie, il workflow fallisce con HTTP `401`/`403`. In quel caso aggiornare il repository secret `FANTACALCIO_COOKIE`.
