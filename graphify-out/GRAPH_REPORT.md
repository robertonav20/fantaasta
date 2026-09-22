# Graph Report - fantaasta  (2026-09-22)

## Corpus Check
- 43 files · ~225,917 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 2 file(s) not represented in the graph (top: (none) 2)

## Summary
- 281 nodes · 710 edges · 18 communities (17 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `cde07a32`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- PlayerTable.jsx
- package.json
- App.jsx
- UpdateError
- match_player_id
- aggiorna_quotazioni.py
- main
- validate-project.mjs
- Fantacalcio Asta
- download_understat_browser
- exportImport.js
- understat_catalog_current
- Any
- setup-graphify-lmstudio.sh
- update-graphify-lmstudio.sh
- rosterCompare.js
- copilot-instructions.md
- _understat_find_player_rows_in_json

## God Nodes (most connected - your core abstractions)
1. `UpdateError` - 31 edges
2. `main()` - 19 edges
3. `@mui/material` - 15 edges
4. `clone()` - 13 edges
5. `money()` - 13 edges
6. `react` - 12 edges
7. `ROLE_ORDER` - 12 edges
8. `match_player_id()` - 11 edges
9. `download_understat_browser()` - 11 edges
10. `download_text()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `App()` --calls--> `useCatalog()`  [EXTRACTED]
  src/App.jsx → src/hooks/useCatalog.js
- `HistoryModal()` --calls--> `formatDateTime()`  [EXTRACTED]
  src/components/HistoryModal.jsx → src/utils/common.js
- `RosterCompareModal()` --calls--> `compareRosterStates()`  [EXTRACTED]
  src/components/RosterCompareModal.jsx → src/utils/rosterCompare.js
- `useAuctionWorkspace()` --calls--> `clone()`  [EXTRACTED]
  src/hooks/useAuctionWorkspace.js → src/utils/common.js
- `AuctionsPage()` --calls--> `uid()`  [EXTRACTED]
  src/pages/AuctionsPage.jsx → src/utils/common.js

## Import Cycles
- None detected.

## Communities (18 total, 1 thin omitted)

### Community 0 - "PlayerTable.jsx"
Cohesion: 0.09
Nodes (45): @mui/material, react, AuctionPanel(), AuctionSummary(), RoleSummary(), actualTone(), AuctionTable(), AuctionTabs() (+37 more)

### Community 1 - "package.json"
Cohesion: 0.07
Nodes (27): dependencies, @emotion/react, @emotion/styled, @mui/icons-material, @mui/material, react, react-dom, devDependencies (+19 more)

### Community 2 - "App.jsx"
Cohesion: 0.16
Nodes (18): App(), MainNavigation(), PROJECT_VERSION, HISTORY_LIMIT, STORAGE, useAuctionWorkspace(), useRosterHistory(), PlayersPage() (+10 more)

### Community 3 - "UpdateError"
Cohesion: 0.14
Nodes (21): RuntimeError, _decode_understat_js_literal(), _number_or_text(), parse_understat_players(), parse_understat_team_titles(), _parse_understat_variable(), Fallback HTML: aggrega playersData dalle pagine delle singole squadre., Restituisce una stringa JS quotata completa e l'indice successivo. (+13 more)

### Community 4 - "match_player_id"
Cohesion: 0.18
Nodes (18): _detect_team_from_token(), _fc_name_signature(), _formation_label(), _formation_parts(), _line_position_labels(), match_player_id(), _name_tokens(), _names_compatible() (+10 more)

### Community 5 - "aggiorna_quotazioni.py"
Cohesion: 0.21
Nodes (16): build_player_catalog(), count_data_rows(), download_stats_catalogs(), _find_stats_header_row(), _injury_return_text(), _json_number(), _json_value(), _norm_text() (+8 more)

### Community 6 - "main"
Cohesion: 0.24
Nodes (15): Namespace, Path, load_config(), load_existing_enrichment(), load_existing_injuries(), load_existing_set_pieces(), load_existing_stats(), load_player_identities() (+7 more)

### Community 7 - "validate-project.mjs"
Cohesion: 0.15
Nodes (11): builtinPrefixes, collectSources(), declared, forbidden, missing, pkg, players, required (+3 more)

### Community 8 - "Fantacalcio Asta"
Cohesion: 0.18
Nodes (10): Dati, `deploy-pages.yml`, Fantacalcio Asta, Frontend, GitHub Actions, Graphify Integration with LM Studio, Persistenza browser, Secret GitHub (+2 more)

### Community 9 - "download_understat_browser"
Cohesion: 0.22
Nodes (10): download_understat_browser(), download_understat_html(), Fallback DOM: legge una tabella giocatori gia' renderizzata da Chromium., Fallback browser reale: esegue JavaScript e restituisce l'HTML renderizzato., Prima requests; se manca il payload/challenge, usa Chromium., _understat_has_payload(), _understat_inject_players(), _understat_is_challenge() (+2 more)

### Community 10 - "exportImport.js"
Cohesion: 0.40
Nodes (8): HistoryModal(), rosterMeta(), safeFilePart(), defaultRosterName(), downloadJson(), extractImportedRosters(), normalizeImportedRoster(), rosterExportPackage()

### Community 11 - "understat_catalog_current"
Cohesion: 0.20
Nodes (10): download_advanced_catalogs(), download_understat_league_json(), Costruisce l'endpoint JSON usato dal sito Understat corrente., Scarica il JSON usato dal frontend Understat corrente. Understat non incorpora…, Parser Understat corrente con compatibilita' legacy HTML., Carica metriche avanzate opzionali. Qualunque errore della fonte esterna…, Evita di salvare 2025/26 sotto 2026/27 quando Understat fa fallback di stagione., _understat_api_url() (+2 more)

### Community 12 - "Any"
Cohesion: 0.39
Nodes (9): Any, download_availability_catalog(), download_excel(), download_injury_catalog(), download_set_pieces_catalogs(), download_source(), download_text(), get_cookie() (+1 more)

### Community 13 - "setup-graphify-lmstudio.sh"
Cohesion: 0.40
Nodes (4): OPENAI_API_KEY, OPENAI_BASE_URL, OPENAI_MODEL, setup-graphify-lmstudio.sh script

### Community 14 - "update-graphify-lmstudio.sh"
Cohesion: 0.40
Nodes (4): OPENAI_API_KEY, OPENAI_BASE_URL, OPENAI_MODEL, update-graphify-lmstudio.sh script

### Community 15 - "rosterCompare.js"
Cohesion: 0.80
Nodes (4): catalogIndex(), compareRosterStates(), normalizeName(), rosterEntries()

### Community 17 - "_understat_find_player_rows_in_json"
Cohesion: 0.67
Nodes (3): Trova ricorsivamente il blocco giocatori in un payload JSON Understat., _understat_find_player_rows_in_json(), walk()

## Knowledge Gaps
- **50 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+45 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 87 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@mui/material` connect `PlayerTable.jsx` to `package.json`, `App.jsx`, `exportImport.js`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Why does `react` connect `PlayerTable.jsx` to `package.json`, `App.jsx`, `exportImport.js`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _50 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `PlayerTable.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09407507914970602 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._
- **Should `UpdateError` be split into smaller, more focused modules?**
  _Cohesion score 0.1380952380952381 - nodes in this community are weakly interconnected._