# Graph Report - fantaasta  (2026-09-22)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 109 nodes · 328 edges · 7 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 890 input · 1,296 output

## Graph Freshness
- Built from commit: `cde07a32`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- services/storage.js
- AuctionPanel.jsx
- PlayerTable.jsx
- App.jsx
- constants/index.js
- RosterCompareModal.jsx
- AuctionsPage.jsx

## God Nodes (most connected - your core abstractions)
1. `clone()` - 13 edges
2. `money()` - 13 edges
3. `ROLE_ORDER` - 12 edges
4. `uid()` - 10 edges
5. `HistoryModal()` - 10 edges
6. `useAuctionWorkspace()` - 9 edges
7. `normalizeAuctionState()` - 9 edges
8. `formatDateTime()` - 9 edges
9. `selectedPlayer()` - 8 edges
10. `PlayerTable()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `App()` --calls--> `useAuctionWorkspace()`  [EXTRACTED]
  App.jsx → hooks/useAuctionWorkspace.js
- `useRosterHistory()` --calls--> `loadHistory()`  [EXTRACTED]
  hooks/useRosterHistory.js → services/storage.js
- `AuctionPanel()` --calls--> `clone()`  [EXTRACTED]
  components/AuctionPanel.jsx → utils/common.js
- `ConfigModal()` --calls--> `clone()`  [EXTRACTED]
  components/ConfigModal.jsx → utils/common.js
- `PlayerTable()` --calls--> `money()`  [EXTRACTED]
  components/PlayerTable.jsx → utils/common.js

## Import Cycles
- None detected.

## Communities (7 total, 0 thin omitted)

### Community 0 - "services/storage.js"
Cohesion: 0.24
Nodes (14): INITIAL_STATE, HISTORY_LIMIT, STORAGE, useAuctionWorkspace(), AuctionsPage(), createBlankAuction(), loadHistory(), loadWorkspace() (+6 more)

### Community 1 - "AuctionPanel.jsx"
Cohesion: 0.26
Nodes (14): AuctionPanel(), AuctionSummary(), RoleSummary(), actualTone(), AuctionTable(), ConfigModal(), LIMITS, ROLE_NAMES (+6 more)

### Community 2 - "PlayerTable.jsx"
Cohesion: 0.24
Nodes (11): display(), InfoGrid(), LABELS, PlayerModal(), columns, PlayerTable(), probabilityChip(), statFor() (+3 more)

### Community 3 - "App.jsx"
Cohesion: 0.22
Nodes (7): App(), MainNavigation(), PROJECT_VERSION, useRosterHistory(), PlayersPage(), saveHistory(), theme

### Community 4 - "constants/index.js"
Cohesion: 0.28
Nodes (7): DEFAULT_COSTS, ROLE_COLORS, ROLE_ORDER, ROLE_SHORT, useCatalog(), EMPTY_CATALOG, fetchCatalog()

### Community 5 - "RosterCompareModal.jsx"
Cohesion: 0.31
Nodes (11): deltaColor(), deltaText(), RoleDetail(), RosterCompareModal(), rowTone(), sourceOptions(), statusChip(), catalogIndex() (+3 more)

### Community 6 - "AuctionsPage.jsx"
Cohesion: 0.32
Nodes (9): AuctionTabs(), HistoryModal(), rosterMeta(), safeFilePart(), defaultRosterName(), downloadJson(), extractImportedRosters(), normalizeImportedRoster() (+1 more)

## Knowledge Gaps
- **2 isolated node(s):** `LABELS`, `columns`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 6 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `money()` connect `AuctionPanel.jsx` to `services/storage.js`, `PlayerTable.jsx`, `RosterCompareModal.jsx`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Why does `ROLE_ORDER` connect `constants/index.js` to `services/storage.js`, `AuctionPanel.jsx`, `PlayerTable.jsx`, `RosterCompareModal.jsx`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Why does `formatDateTime()` connect `PlayerTable.jsx` to `services/storage.js`, `constants/index.js`, `AuctionsPage.jsx`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **What connects `LABELS`, `columns` to the rest of the system?**
  _2 weakly-connected nodes found - possible documentation gaps or missing edges._