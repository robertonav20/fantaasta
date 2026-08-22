import { useMemo, useState } from 'react';
import {
  Box, Chip, FormControl, IconButton, InputLabel, MenuItem, Paper, Popover, Select, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TablePagination, TableRow, TableSortLabel, TextField, Tooltip, Typography,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import RoleBadge from './RoleBadge';
import PlayerModal from './PlayerModal';
import { ROLE_NAMES, ROLE_ORDER } from '../constants';
import { formatDateTime, money, normalizeText, number } from '../utils';

function probabilityChip(value) {
  if (value === null || value === undefined || value === '') return <Typography color="text.secondary">—</Typography>;
  const n = Number(value);
  const color = n >= 75 ? 'success' : n >= 50 ? 'warning' : 'error';
  return <Chip size="small" color={color} label={`${Math.round(n)}%`} sx={{ minWidth: 52 }} />;
}

function InjuryStatusChip({ injury }) {
  const [anchorEl, setAnchorEl] = useState(null);

  if (injury?.injured !== true) {
    return <Chip size="small" color="success" variant="outlined" label="Disponibile" />;
  }

  const cause = injury.description || injury.status || 'Dettaglio non disponibile';
  const returnText = injury.returnText || 'Rientro non disponibile';
  const details = (
    <Box sx={{ maxWidth: 320 }}>
      <Typography variant="caption" display="block"><b>Causa:</b> {cause}</Typography>
      <Typography variant="caption" display="block" sx={{ mt: .25 }}><b>Rientro:</b> {returnText}</Typography>
    </Box>
  );

  return (
    <>
      <Tooltip title={details} arrow enterTouchDelay={250}>
        <Chip
          size="small"
          color="error"
          label="Infortunato"
          onClick={(event) => setAnchorEl(event.currentTarget)}
          sx={{ cursor: 'pointer' }}
        />
      </Tooltip>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <Box sx={{ p: 1.25, maxWidth: 340 }}>
          <Typography variant="subtitle2" sx={{ mb: .5 }}>Infortunio</Typography>
          {details}
        </Box>
      </Popover>
    </>
  );
}

function statFor(player, key) {
  const current = player.stats?.['2026/27'];
  const previous = player.stats?.['2025/26'];
  return current?.[key] ?? previous?.[key] ?? null;
}

const columns = [
  ['role', 'Ruolo'], ['name', 'Giocatore'], ['team', 'Squadra'], ['tacticalRole', 'Posizione / modulo'], ['injury', 'Stato'],
  ['playProbability', 'Prob. prossima partita'], ['fvm', 'FVM'],
  ['presenze', 'Presenze'], ['mv', 'MV'], ['fm', 'FM'], ['gol', 'Gol'], ['assist', 'Assist'],
];

export default function PlayerTable({ catalog, meta }) {
  const [filters, setFilters] = useState({ query: '', role: '', team: '', injury: '', minFvm: '', maxFvm: '' });
  const [sort, setSort] = useState({ key: 'fvm', dir: 'desc' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [infoPlayer, setInfoPlayer] = useState(null);

  const rows = useMemo(() => ROLE_ORDER.flatMap((role) => (catalog?.[role] || []).map((player) => ({
    role,
    player,
    name: player.name || '',
    team: player.team || '',
    tacticalRole: player.availability?.posizione || '',
    formation: player.availability?.modulo || '',
    injury: player.injury || {},
    playProbability: player.availability?.titolarita ?? null,
    fvm: Number(player.fvm || 0),
    presenze: statFor(player, 'Pv'),
    mv: statFor(player, 'Mv'),
    fm: statFor(player, 'Fm'),
    gol: statFor(player, 'Gf'),
    assist: statFor(player, 'Ass'),
  }))), [catalog]);

  const teams = useMemo(() => [...new Set(rows.map((r) => r.team).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'it')), [rows]);

  const filtered = useMemo(() => {
    const q = normalizeText(filters.query);
    const min = filters.minFvm === '' ? null : Number(filters.minFvm);
    const max = filters.maxFvm === '' ? null : Number(filters.maxFvm);
    const result = rows.filter((row) => {
      if (q && !normalizeText(row.name).includes(q)) return false;
      if (filters.role && row.role !== filters.role) return false;
      if (filters.team && row.team !== filters.team) return false;
      if (filters.injury === 'injured' && row.injury?.injured !== true) return false;
      if (filters.injury === 'available' && row.injury?.injured === true) return false;
      if (min !== null && row.fvm < min) return false;
      if (max !== null && row.fvm > max) return false;
      return true;
    });
    result.sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      let cmp;
      if (sort.key === 'role') cmp = ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role);
      else if (sort.key === 'injury') cmp = Number(Boolean(a.injury?.injured)) - Number(Boolean(b.injury?.injured));
      else if (typeof av === 'number' || typeof bv === 'number') cmp = Number(av ?? -Infinity) - Number(bv ?? -Infinity);
      else cmp = String(av ?? '').localeCompare(String(bv ?? ''), 'it', { sensitivity: 'base' });
      return sort.dir === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [rows, filters, sort]);

  const visible = rowsPerPage < 0 ? filtered : filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const setFilter = (key, value) => { setFilters((old) => ({ ...old, [key]: value })); setPage(0); };
  const toggleSort = (key) => setSort((old) => old.key === key ? { key, dir: old.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: key === 'fvm' ? 'desc' : 'asc' });
  const reset = () => { setFilters({ query: '', role: '', team: '', injury: '', minFvm: '', maxFvm: '' }); setSort({ key: 'fvm', dir: 'desc' }); setPage(0); };

  return (
    <Stack spacing={1.25}>
      <Paper variant="outlined" sx={{ p: { xs: 1, sm: 1.25 } }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" gap={1}>
          <Box>
            <Typography variant="h6">Catalogo giocatori</Typography>
            <Typography variant="caption" color="text.secondary">{filtered.length} risultati · Ultimo aggiornamento: {formatDateTime(meta?.catalogUpdatedAt)}</Typography>
          </Box>
          <Tooltip title="Reset filtri"><IconButton onClick={reset}><RestartAltIcon /></IconButton></Tooltip>
        </Stack>
        <Box sx={{ mt: 1, display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '2fr 1fr 1.4fr 1.3fr 1fr 1fr' }, gap: .75 }}>
          <TextField size="small" label="Cerca nome" value={filters.query} onChange={(e) => setFilter('query', e.target.value)} placeholder="LIKE %nome%" sx={{ gridColumn: { xs: '1 / -1', sm: 'auto' } }} />
          <FormControl size="small"><InputLabel>Ruolo</InputLabel><Select label="Ruolo" value={filters.role} onChange={(e) => setFilter('role', e.target.value)}><MenuItem value="">Tutti</MenuItem>{ROLE_ORDER.map((r) => <MenuItem key={r} value={r}>{ROLE_NAMES[r]}</MenuItem>)}</Select></FormControl>
          <FormControl size="small"><InputLabel>Squadra</InputLabel><Select label="Squadra" value={filters.team} onChange={(e) => setFilter('team', e.target.value)}><MenuItem value="">Tutte</MenuItem>{teams.map((team) => <MenuItem key={team} value={team}>{team}</MenuItem>)}</Select></FormControl>
          <FormControl size="small"><InputLabel>Stato</InputLabel><Select label="Stato" value={filters.injury} onChange={(e) => setFilter('injury', e.target.value)}><MenuItem value="">Tutti</MenuItem><MenuItem value="injured">Infortunati</MenuItem><MenuItem value="available">Disponibili</MenuItem></Select></FormControl>
          <TextField size="small" type="number" label="FVM min" value={filters.minFvm} onChange={(e) => setFilter('minFvm', e.target.value)} />
          <TextField size="small" type="number" label="FVM max" value={filters.maxFvm} onChange={(e) => setFilter('maxFvm', e.target.value)} />
        </Box>
      </Paper>

      <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
        <TableContainer sx={{ overflowX: 'auto', maxHeight: 'calc(100vh - 255px)' }}>
          <Table stickyHeader size="small" sx={{ minWidth: 1120 }}>
            <TableHead><TableRow>
              {columns.map(([key, label]) => <TableCell key={key} align={['fvm','presenze','mv','fm','gol','assist'].includes(key) ? 'right' : 'left'}><TableSortLabel active={sort.key === key} direction={sort.key === key ? sort.dir : 'asc'} onClick={() => toggleSort(key)}>{label}</TableSortLabel></TableCell>)}
              <TableCell align="center">Operazioni</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {visible.map((row) => (
                <TableRow key={`${row.role}-${row.player.id}`} hover sx={{ '&:nth-of-type(even)': { bgcolor: 'rgba(88,166,255,.035)' } }}>
                  <TableCell><RoleBadge role={row.role} /></TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>{row.name}</TableCell>
                  <TableCell>{row.team}</TableCell>
                  <TableCell>{row.tacticalRole ? <Box><b>{row.tacticalRole}</b> - <Typography variant="caption" display="block" color="text.secondary">{row.formation || '—'}</Typography></Box> : '—'}</TableCell>
                  <TableCell><InjuryStatusChip injury={row.injury} /></TableCell>
                  <TableCell align="center">{probabilityChip(row.playProbability)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800 }}>{money(row.fvm)}</TableCell>
                  <TableCell align="right">{number(row.presenze)}</TableCell>
                  <TableCell align="right">{number(row.mv)}</TableCell>
                  <TableCell align="right">{number(row.fm)}</TableCell>
                  <TableCell align="right">{number(row.gol)}</TableCell>
                  <TableCell align="right">{number(row.assist)}</TableCell>
                  <TableCell align="center"><Tooltip title="Informazioni"><IconButton onClick={() => setInfoPlayer(row.player)}><InfoOutlinedIcon fontSize="small" /></IconButton></Tooltip></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination component="div" count={filtered.length} page={Math.min(page, Math.max(0, Math.ceil(filtered.length / Math.max(rowsPerPage, 1)) - 1))} onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(0); }} rowsPerPageOptions={[25, 50, 100, { label: 'Tutti', value: -1 }]} labelRowsPerPage="Righe" />
      </Paper>
      <PlayerModal player={infoPlayer} open={Boolean(infoPlayer)} onClose={() => setInfoPlayer(null)} />
    </Stack>
  );
}