#!/usr/bin/env python3
"""Aggiorna i fogli quotazioni Fantacalcio di un workbook esistente.

Fogli modificati esclusivamente:
- Tutti
- Portieri
- Difensori
- Centrocampisti
- Attaccanti
- Ceduti

Il file sorgente viene scaricato dall'endpoint Fantacalcio usando un header Cookie
configurabile. Tutti gli altri fogli del workbook destinazione restano invariati.
"""

from __future__ import annotations

import argparse
import copy
import io
import json
import os
import shutil
import sys
import tempfile
from pathlib import Path
from typing import Any

import requests
from openpyxl import load_workbook
from openpyxl.cell.cell import MergedCell
from openpyxl.utils import get_column_letter

SHEETS_TO_UPDATE = (
    "Tutti",
    "Portieri",
    "Difensori",
    "Centrocampisti",
    "Attaccanti",
    "Ceduti",
)

EXPECTED_HEADERS = (
    "Id",
    "R",
    "RM",
    "Nome",
    "Squadra",
    "Qt.A",
    "Qt.I",
    "Diff.",
    "Qt.A M",
    "Qt.I M",
    "Diff.M",
    "FVM",
    "FVM M",
)

DATA_FIRST_COL = 1
DATA_LAST_COL = 13  # A:M
HEADER_ROW = 2


class UpdateError(RuntimeError):
    pass


def load_config(path: Path) -> dict[str, Any]:
    if not path.exists():
        raise UpdateError(f"File di configurazione non trovato: {path}")

    try:
        config = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise UpdateError(f"JSON non valido in {path}: {exc}") from exc

    required = ("source_url", "target_file")
    missing = [key for key in required if not config.get(key)]
    if missing:
        raise UpdateError("Parametri mancanti nel config: " + ", ".join(missing))

    return config


def resolve_path(value: str, config_dir: Path) -> Path:
    path = Path(value).expanduser()
    if not path.is_absolute():
        path = config_dir / path
    return path.resolve()


def get_cookie(config: dict[str, Any]) -> str:
    # La variabile d'ambiente evita di salvare il cookie su disco.
    env_name = str(config.get("cookie_env", "FANTACALCIO_COOKIE"))
    cookie = os.environ.get(env_name) or str(config.get("cookie", ""))
    cookie = cookie.strip()
    if not cookie:
        raise UpdateError(
            f"Cookie mancante. Imposta '{env_name}' oppure il parametro 'cookie' nel config."
        )
    return cookie


def download_source(config: dict[str, Any]) -> bytes:
    url = str(config["source_url"])
    cookie = get_cookie(config)
    timeout = int(config.get("timeout_seconds", 30))

    headers = {
        "Cookie": cookie,
        "Accept": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/octet-stream,*/*",
        "User-Agent": str(
            config.get(
                "user_agent",
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                "(KHTML, like Gecko) Chrome/136.0 Safari/537.36",
            )
        ),
    }

    with requests.Session() as session:
        response = session.get(url, headers=headers, timeout=timeout, allow_redirects=True)

    if response.status_code in (401, 403):
        raise UpdateError(
            f"Download non autorizzato (HTTP {response.status_code}). Verifica/aggiorna il cookie."
        )
    try:
        response.raise_for_status()
    except requests.HTTPError as exc:
        raise UpdateError(f"Download fallito: HTTP {response.status_code}") from exc

    content = response.content
    # XLSX e' un archivio ZIP e normalmente inizia con PK.
    if len(content) < 4 or content[:2] != b"PK":
        content_type = response.headers.get("Content-Type", "sconosciuto")
        raise UpdateError(
            "La risposta non sembra un file XLSX valido "
            f"(Content-Type: {content_type}, {len(content)} byte)."
        )

    return content


def sheet_lookup(workbook) -> dict[str, str]:
    return {name.casefold(): name for name in workbook.sheetnames}


def validate_source_workbook(source_wb) -> dict[str, str]:
    lookup = sheet_lookup(source_wb)
    resolved: dict[str, str] = {}

    for expected_name in SHEETS_TO_UPDATE:
        real_name = lookup.get(expected_name.casefold())
        if real_name is None:
            raise UpdateError(f"Foglio '{expected_name}' mancante nel file sorgente.")

        ws = source_wb[real_name]
        headers = tuple(ws.cell(HEADER_ROW, col).value for col in range(1, DATA_LAST_COL + 1))
        if headers != EXPECTED_HEADERS:
            raise UpdateError(
                f"Struttura inattesa nel foglio '{real_name}'. "
                f"Header atteso: {EXPECTED_HEADERS}; trovato: {headers}"
            )
        resolved[expected_name] = real_name

    return resolved


def comparable_sheet_values(ws) -> tuple[tuple[Any, ...], ...]:
    """Restituisce i valori A:M ignorando solo le righe finali completamente vuote."""
    last_row = ws.max_row
    while last_row > 0 and all(
        ws.cell(row=last_row, column=col).value is None
        for col in range(DATA_FIRST_COL, DATA_LAST_COL + 1)
    ):
        last_row -= 1

    return tuple(
        tuple(
            ws.cell(row=row, column=col).value
            for col in range(DATA_FIRST_COL, DATA_LAST_COL + 1)
        )
        for row in range(1, last_row + 1)
    )


def count_data_rows(ws) -> int:
    return sum(
        1
        for row in range(3, ws.max_row + 1)
        if ws.cell(row=row, column=1).value is not None
    )


def merged_ranges_in_data_area(ws) -> list[str]:
    result = []
    for merged_range in ws.merged_cells.ranges:
        if (
            merged_range.min_col >= DATA_FIRST_COL
            and merged_range.max_col <= DATA_LAST_COL
        ):
            result.append(str(merged_range))
        elif not (
            merged_range.max_col < DATA_FIRST_COL
            or merged_range.min_col > DATA_LAST_COL
        ):
            raise UpdateError(
                f"Merge parziale sull'area A:M non supportato nel foglio '{ws.title}': {merged_range}"
            )
    return result


def clear_target_area(target_ws, max_row: int) -> None:
    # Prima rimuove i merge A:M per rendere tutte le celle scrivibili.
    for merged_range in merged_ranges_in_data_area(target_ws):
        target_ws.unmerge_cells(merged_range)

    for row in range(1, max_row + 1):
        for col in range(DATA_FIRST_COL, DATA_LAST_COL + 1):
            cell = target_ws.cell(row=row, column=col)
            cell.value = None
            cell.comment = None
            cell.hyperlink = None


def copy_cell(source_cell, target_cell) -> None:
    if isinstance(source_cell, MergedCell):
        return

    target_cell.value = source_cell.value
    if source_cell.has_style:
        target_cell._style = copy.copy(source_cell._style)
    target_cell.number_format = source_cell.number_format
    target_cell.font = copy.copy(source_cell.font)
    target_cell.fill = copy.copy(source_cell.fill)
    target_cell.border = copy.copy(source_cell.border)
    target_cell.alignment = copy.copy(source_cell.alignment)
    target_cell.protection = copy.copy(source_cell.protection)
    target_cell.comment = copy.copy(source_cell.comment) if source_cell.comment else None

    if source_cell.hyperlink:
        target_cell._hyperlink = copy.copy(source_cell.hyperlink)


def copy_sheet_data(source_ws, target_ws) -> tuple[int, int]:
    source_max_row = source_ws.max_row
    target_max_row = target_ws.max_row
    clear_to_row = max(source_max_row, target_max_row)

    source_merges = merged_ranges_in_data_area(source_ws)
    clear_target_area(target_ws, clear_to_row)

    for row in range(1, source_max_row + 1):
        for col in range(DATA_FIRST_COL, DATA_LAST_COL + 1):
            copy_cell(source_ws.cell(row=row, column=col), target_ws.cell(row=row, column=col))

    # Copia larghezze A:M e proprieta' di riga usate dal sorgente.
    for col in range(DATA_FIRST_COL, DATA_LAST_COL + 1):
        letter = get_column_letter(col)
        src_dim = source_ws.column_dimensions[letter]
        dst_dim = target_ws.column_dimensions[letter]
        dst_dim.width = src_dim.width
        dst_dim.hidden = src_dim.hidden
        dst_dim.bestFit = src_dim.bestFit
        dst_dim.outlineLevel = src_dim.outlineLevel

    for row in range(1, source_max_row + 1):
        if row in source_ws.row_dimensions:
            target_ws.row_dimensions[row] = copy.copy(source_ws.row_dimensions[row])

    for merged_range in source_merges:
        target_ws.merge_cells(merged_range)

    # Conta le righe dati effettive usando l'Id in colonna A, da riga 3.
    data_rows = sum(
        1 for row in range(3, source_max_row + 1) if source_ws.cell(row=row, column=1).value is not None
    )
    return source_max_row, data_rows


def update_workbook(
    source_bytes: bytes, target_file: Path, output_file: Path
) -> tuple[dict[str, int], bool]:
    if not target_file.exists():
        raise UpdateError(f"Workbook da aggiornare non trovato: {target_file}")

    try:
        source_wb = load_workbook(io.BytesIO(source_bytes), data_only=False)
    except Exception as exc:
        raise UpdateError(f"Impossibile aprire l'XLSX sorgente: {exc}") from exc

    resolved_source_names = validate_source_workbook(source_wb)

    try:
        target_wb = load_workbook(target_file, data_only=False)
    except Exception as exc:
        raise UpdateError(f"Impossibile aprire il workbook destinazione: {exc}") from exc

    target_lookup = sheet_lookup(target_wb)
    for expected_name in SHEETS_TO_UPDATE:
        if expected_name.casefold() not in target_lookup:
            raise UpdateError(f"Foglio '{expected_name}' mancante nel workbook destinazione.")

    stats: dict[str, int] = {}
    changed = False
    for expected_name in SHEETS_TO_UPDATE:
        source_ws = source_wb[resolved_source_names[expected_name]]
        target_ws = target_wb[target_lookup[expected_name.casefold()]]
        data_rows = count_data_rows(source_ws)
        stats[expected_name] = data_rows

        if comparable_sheet_values(source_ws) != comparable_sheet_values(target_ws):
            copy_sheet_data(source_ws, target_ws)
            changed = True

    if not changed:
        source_wb.close()
        target_wb.close()
        if output_file != target_file:
            output_file.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(target_file, output_file)
        return stats, False

    # Forza Excel a ricalcolare formule che dipendono dai sei fogli aggiornati.
    try:
        target_wb.calculation.fullCalcOnLoad = True
        target_wb.calculation.forceFullCalc = True
        target_wb.calculation.calcMode = "auto"
    except AttributeError:
        pass

    output_file.parent.mkdir(parents=True, exist_ok=True)

    # Salvataggio atomico: scrive prima un temporaneo nella cartella di destinazione.
    fd, temp_name = tempfile.mkstemp(
        prefix=f".{output_file.stem}_",
        suffix=".xlsx",
        dir=str(output_file.parent),
    )
    os.close(fd)
    temp_path = Path(temp_name)

    try:
        target_wb.save(temp_path)
        # Verifica minima: il file salvato deve essere riapribile e contenere tutti i fogli.
        verify_wb = load_workbook(temp_path, read_only=True, data_only=False)
        verify_lookup = sheet_lookup(verify_wb)
        missing = [name for name in SHEETS_TO_UPDATE if name.casefold() not in verify_lookup]
        verify_wb.close()
        if missing:
            raise UpdateError("Verifica output fallita. Fogli mancanti: " + ", ".join(missing))

        os.replace(temp_path, output_file)
    finally:
        if temp_path.exists():
            temp_path.unlink()

    source_wb.close()
    target_wb.close()
    return stats, True


def maybe_backup(target_file: Path, config: dict[str, Any]) -> Path | None:
    if not bool(config.get("backup", True)):
        return None

    suffix = target_file.suffix or ".xlsx"
    backup_file = target_file.with_name(f"{target_file.stem}.backup{suffix}")
    shutil.copy2(target_file, backup_file)
    return backup_file


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Aggiorna solo Tutti, Portieri, Difensori, Centrocampisti, Attaccanti e Ceduti."
    )
    parser.add_argument(
        "--config",
        default="config.json",
        help="Percorso del file JSON di configurazione (default: config.json)",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    config_path = Path(args.config).expanduser().resolve()

    try:
        config = load_config(config_path)
        config_dir = config_path.parent

        target_file = resolve_path(str(config["target_file"]), config_dir)
        output_value = str(config.get("output_file") or config["target_file"])
        output_file = resolve_path(output_value, config_dir)

        source_bytes = download_source(config)

        # Backup solo quando si sovrascrive il file originale.
        backup_file = None
        if output_file == target_file:
            backup_file = maybe_backup(target_file, config)

        stats, changed = update_workbook(source_bytes, target_file, output_file)

        if changed:
            print(f"Aggiornamento completato: {output_file}")
        else:
            print(f"Nessuna variazione rilevata: {output_file}")
        if backup_file and changed:
            print(f"Backup: {backup_file}")
        for sheet_name in SHEETS_TO_UPDATE:
            print(f"- {sheet_name}: {stats[sheet_name]} giocatori")
        return 0

    except (UpdateError, requests.RequestException, OSError) as exc:
        print(f"ERRORE: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
