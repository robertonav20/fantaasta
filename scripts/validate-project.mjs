import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const required = [
  'index.html', 'package.json', 'vite.config.js', 'public/players.json',
  'src/main.jsx', 'src/App.jsx', 'src/theme.js',
  'src/pages/PlayersPage.jsx', 'src/pages/AuctionsPage.jsx',
  'src/hooks/useCatalog.js', 'src/hooks/useAuctionWorkspace.js', 'src/hooks/useRosterHistory.js',
  'src/services/players.js', 'src/services/storage.js',
  'src/components/PlayerTable.jsx', 'src/components/PlayerModal.jsx', 'src/components/AuctionPanel.jsx', 'src/components/AuctionTable.jsx', 'src/components/AuctionSummary.jsx', 'src/components/ConfigModal.jsx', 'src/components/HistoryModal.jsx',
];

const missing = required.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length) throw new Error(`File obbligatori mancanti: ${missing.join(', ')}`);

const players = JSON.parse(fs.readFileSync(path.join(root, 'public/players.json'), 'utf8'));
for (const role of ['P', 'D', 'C', 'A']) {
  if (!Array.isArray(players[role])) throw new Error(`public/players.json: ruolo ${role} mancante`);
}

const forbidden = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', 'dist', '.git'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.xlsx$/i.test(entry.name)) forbidden.push(path.relative(root, full));
  }
}
walk(root);
if (forbidden.length) throw new Error(`Excel non ammessi nel progetto: ${forbidden.join(', ')}`);

const sourceFiles = [];
function collectSources(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collectSources(full);
    else if (/\.(js|jsx|mjs)$/.test(entry.name)) sourceFiles.push(full);
  }
}
collectSources(path.join(root, 'src'));

const importPattern = /(?:import|export)\s+(?:[^'";]+?\s+from\s+)?['"](\.{1,2}\/[^'"]+)['"]/g;
for (const file of sourceFiles) {
  const text = fs.readFileSync(file, 'utf8');
  for (const match of text.matchAll(importPattern)) {
    const spec = match[1];
    const base = path.resolve(path.dirname(file), spec);
    const candidates = [base, `${base}.js`, `${base}.jsx`, `${base}.mjs`, path.join(base, 'index.js'), path.join(base, 'index.jsx')];
    if (!candidates.some((candidate) => fs.existsSync(candidate))) {
      throw new Error(`Import locale non risolto in ${path.relative(root, file)}: ${spec}`);
    }
  }
}


const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const declared = new Set([...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.devDependencies || {})]);
const builtinPrefixes = new Set(['node:']);
const externalPattern = /(?:import|export)\s+(?:[^'";]+?\s+from\s+)?['"]([^.'"][^'"]*)['"]/g;
function packageName(spec) {
  if ([...builtinPrefixes].some((prefix) => spec.startsWith(prefix))) return null;
  if (spec.startsWith('@')) return spec.split('/').slice(0, 2).join('/');
  return spec.split('/')[0];
}
for (const file of sourceFiles) {
  const text = fs.readFileSync(file, 'utf8');
  for (const match of text.matchAll(externalPattern)) {
    const name = packageName(match[1]);
    if (name && !declared.has(name)) throw new Error(`Dipendenza non dichiarata in ${path.relative(root, file)}: ${name}`);
  }
}

console.log(`Struttura valida: ${sourceFiles.length} moduli sorgente, catalogo ${['P','D','C','A'].reduce((sum, role) => sum + players[role].length, 0)} giocatori.`);
