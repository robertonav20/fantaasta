# Graph Report - fantaasta  (2026-09-06)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 255 nodes · 686 edges · 13 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a1ac67ac`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- PlayerTable.jsx
- App.jsx
- package.json
- aggiorna_quotazioni.py
- match_player_id
- Any
- UpdateError
- validate-project.mjs
- RosterCompareModal.jsx
- download_understat_browser
- understat_catalog_current
- _parse_understat_variable
- understat_team_fallback_catalog

## God Nodes (most connected - your core abstractions)
1. `UpdateError` - 31 edges
2. `main()` - 20 edges
3. `@mui/material` - 15 edges
4. `money()` - 13 edges
5. `clone()` - 13 edges
6. `ROLE_ORDER` - 12 edges
7. `react` - 12 edges
8. `match_player_id()` - 11 edges
9. `HistoryModal()` - 10 edges
10. `uid()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `AuctionPanel()` --calls--> `clone()`  [EXTRACTED]
  src/components/AuctionPanel.jsx → src/utils/common.js
- `ConfigModal()` --calls--> `clone()`  [EXTRACTED]
  src/components/ConfigModal.jsx → src/utils/common.js
- `App()` --calls--> `useCatalog()`  [EXTRACTED]
  src/App.jsx → src/hooks/useCatalog.js
- `HistoryModal()` --calls--> `formatDateTime()`  [EXTRACTED]
  src/components/HistoryModal.jsx → src/utils/common.js
- `RoleDetail()` --calls--> `money()`  [EXTRACTED]
  src/components/RosterCompareModal.jsx → src/utils/common.js

## Import Cycles
- None detected.

## Communities (13 total, 0 thin omitted)

### Community 0 - "PlayerTable.jsx"
Cohesion: 0.12
Nodes (33): @mui/material, AuctionPanel(), AuctionSummary(), RoleSummary(), actualTone(), AuctionTable(), ConfigModal(), display() (+25 more)

### Community 1 - "App.jsx"
Cohesion: 0.10
Nodes (31): react, App(), AuctionTabs(), HistoryModal(), MainNavigation(), INITIAL_STATE, PROJECT_VERSION, HISTORY_LIMIT (+23 more)

### Community 2 - "package.json"
Cohesion: 0.07
Nodes (27): dependencies, @emotion/react, @emotion/styled, @mui/icons-material, @mui/material, react, react-dom, devDependencies (+19 more)

### Community 3 - "aggiorna_quotazioni.py"
Cohesion: 0.27
Nodes (17): Namespace, Path, count_data_rows(), load_config(), load_existing_enrichment(), load_existing_injuries(), load_existing_set_pieces(), load_existing_stats() (+9 more)

### Community 4 - "match_player_id"
Cohesion: 0.18
Nodes (17): _detect_team_from_token(), _fc_name_signature(), _formation_label(), _formation_parts(), _line_position_labels(), match_player_id(), _name_tokens(), _names_compatible() (+9 more)

### Community 5 - "Any"
Cohesion: 0.22
Nodes (15): Any, build_player_catalog(), download_injury_catalog(), _find_stats_header_row(), _injury_return_text(), _json_number(), _json_value(), _norm_text() (+7 more)

### Community 6 - "UpdateError"
Cohesion: 0.20
Nodes (15): RuntimeError, download_availability_catalog(), download_excel(), download_set_pieces_catalogs(), download_source(), download_stats_catalogs(), download_text(), download_understat_league_json() (+7 more)

### Community 7 - "validate-project.mjs"
Cohesion: 0.15
Nodes (9): builtinPrefixes, declared, forbidden, missing, pkg, players, required, root (+1 more)

### Community 8 - "RosterCompareModal.jsx"
Cohesion: 0.31
Nodes (11): deltaColor(), deltaText(), RoleDetail(), RosterCompareModal(), rowTone(), sourceOptions(), statusChip(), catalogIndex() (+3 more)

### Community 9 - "download_understat_browser"
Cohesion: 0.20
Nodes (12): download_understat_browser(), download_understat_html(), Trova ricorsivamente il blocco giocatori in un payload JSON Understat., Fallback DOM: legge una tabella giocatori gia' renderizzata da Chromium., Fallback browser reale: esegue JavaScript e restituisce l'HTML renderizzato., Prima requests; se manca il payload/challenge, usa Chromium., _understat_find_player_rows_in_json(), _understat_has_payload() (+4 more)

### Community 10 - "understat_catalog_current"
Cohesion: 0.20
Nodes (11): download_advanced_catalogs(), _number_or_text(), parse_understat_players(), Parser Understat corrente con compatibilita' legacy HTML., Carica metriche avanzate opzionali. Qualunque errore della fonte esterna…, Evita di salvare 2025/26 sotto 2026/27 quando Understat fa fallback di stagione., Estrae playersData dal sorgente HTML pubblico di Understat., understat_catalog() (+3 more)

### Community 11 - "_parse_understat_variable"
Cohesion: 0.25
Nodes (8): _decode_understat_js_literal(), _parse_understat_variable(), Restituisce una stringa JS quotata completa e l'indice successivo., Estrae un array/oggetto JSON bilanciando parentesi e stringhe., Decodifica la stringa JS usata da Understat dentro JSON.parse()., Estrae una variabile JS Understat dal sorgente HTML grezzo., _scan_balanced_json(), _scan_js_string_literal()

### Community 12 - "understat_team_fallback_catalog"
Cohesion: 0.33
Nodes (6): parse_understat_team_titles(), Fallback HTML: aggrega playersData dalle pagine delle singole squadre., Estrae i nomi squadra da teamsData per il fallback sulle pagine team., understat_team_fallback_catalog(), _understat_team_slug(), _understat_year()

## Knowledge Gaps
- **32 isolated node(s):** `LABELS`, `columns`, `@emotion/react`, `@emotion/styled`, `@mui/icons-material` (+27 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 69 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@mui/material` connect `PlayerTable.jsx` to `RosterCompareModal.jsx`, `App.jsx`, `package.json`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Why does `react` connect `App.jsx` to `PlayerTable.jsx`, `RosterCompareModal.jsx`, `package.json`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **What connects `LABELS`, `columns`, `@emotion/react` to the rest of the system?**
  _32 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `PlayerTable.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12074829931972789 - nodes in this community are weakly interconnected._
- **Should `App.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10459183673469388 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._