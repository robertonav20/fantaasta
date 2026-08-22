import { useEffect, useMemo, useState } from 'react';
import {
  Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, MenuItem, Paper, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import RoleBadge from './RoleBadge';
import { ROLE_NAMES, ROLE_ORDER } from '../constants';
import { compareRosterStates, money } from '../utils';

function sourceOptions(auctions, history) {
  return [
    ...auctions.map((auction) => ({ id: `auction:${auction.id}`, kind: 'Asta aperta', name: auction.name, state: auction.state })),
    ...history.map((item) => ({ id: `history:${item.id}`, kind: 'Storico', name: item.name, state: item.state })),
  ];
}

function deltaText(value, suffix = 'cr') {
  const number = Number(value || 0);
  return `${number > 0 ? '+' : ''}${number}${suffix}`;
}

function deltaColor(value) {
  const number = Number(value || 0);
  if (number > 0) return 'error.main';
  if (number < 0) return 'success.main';
  return 'text.secondary';
}

function rowTone(status) {
  if (status === 'same') return 'rgba(63,185,80,.10)';
  if (status === 'onlyA') return 'rgba(88,166,255,.10)';
  return 'rgba(210,153,34,.12)';
}

function statusChip(status) {
  if (status === 'same') return <Chip size="small" color="success" variant="outlined" label="Comune" />;
  if (status === 'onlyA') return <Chip size="small" color="primary" variant="outlined" label="Solo rosa A" />;
  return <Chip size="small" color="warning" variant="outlined" label="Solo rosa B" />;
}

function RoleDetail({ role, data, labelA, labelB }) {
  if (!data.rows.length) return null;
  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1} sx={{ p: .8, bgcolor: 'rgba(88,166,255,.06)' }}>
        <Stack direction="row" spacing={.7} alignItems="center"><RoleBadge role={role} /><Typography fontWeight={900}>{ROLE_NAMES[role]}</Typography></Stack>
        <Typography variant="caption" color="text.secondary">Comuni {data.same} · Solo A {data.onlyA} · Solo B {data.onlyB}</Typography>
      </Stack>
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 720 }}>
          <TableHead><TableRow><TableCell>Giocatore</TableCell><TableCell>Squadra</TableCell><TableCell>Stato</TableCell><TableCell align="right">{labelA}</TableCell><TableCell align="right">{labelB}</TableCell><TableCell align="right">Δ costo</TableCell></TableRow></TableHead>
          <TableBody>
            {data.rows.map((row) => (
              <TableRow key={row.key} sx={{ bgcolor: rowTone(row.status) }}>
                <TableCell sx={{ fontWeight: 800 }}>{row.name}</TableCell>
                <TableCell>{row.team || '—'}</TableCell>
                <TableCell>{statusChip(row.status)}</TableCell>
                <TableCell align="right">{row.costA === null ? '—' : `${money(row.costA)}cr`}</TableCell>
                <TableCell align="right">{row.costB === null ? '—' : `${money(row.costB)}cr`}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: row.costDelta === null ? 'text.secondary' : deltaColor(row.costDelta) }}>{row.costDelta === null ? '—' : deltaText(row.costDelta)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default function RosterCompareModal({ open, onClose, auctions, history, activeAuctionId, catalog }) {
  const options = useMemo(() => sourceOptions(auctions, history), [auctions, history]);
  const activeSourceId = `auction:${activeAuctionId}`;
  const [sourceA, setSourceA] = useState('');
  const [sourceB, setSourceB] = useState('');

  useEffect(() => {
    if (!open) return;
    const first = options.find((option) => option.id === activeSourceId) || options[0];
    const second = options.find((option) => option.id !== first?.id);
    setSourceA(first?.id || '');
    setSourceB(second?.id || '');
  }, [open, activeSourceId, options]);

  const itemA = options.find((option) => option.id === sourceA);
  const itemB = options.find((option) => option.id === sourceB);
  const comparison = useMemo(() => itemA && itemB && itemA.id !== itemB.id ? compareRosterStates(itemA.state, itemB.state, catalog) : null, [itemA, itemB, catalog]);

  const swap = () => {
    setSourceA(sourceB);
    setSourceB(sourceA);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>Confronta rose</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={1.25}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={.75} alignItems={{ sm: 'center' }}>
            <TextField select size="small" label="Rosa A" value={sourceA} onChange={(event) => setSourceA(event.target.value)} fullWidth>
              {options.map((option) => <MenuItem key={option.id} value={option.id}>{option.name} · {option.kind}</MenuItem>)}
            </TextField>
            <Button variant="outlined" onClick={swap} disabled={!sourceA || !sourceB} sx={{ minWidth: { xs: '100%', sm: 48 } }}>⇄</Button>
            <TextField select size="small" label="Rosa B" value={sourceB} onChange={(event) => setSourceB(event.target.value)} fullWidth>
              {options.map((option) => <MenuItem key={option.id} value={option.id}>{option.name} · {option.kind}</MenuItem>)}
            </TextField>
          </Stack>

          {options.length < 2 && <Alert severity="info">Serve almeno una seconda asta aperta o una rosa salvata nello storico.</Alert>}
          {sourceA && sourceB && sourceA === sourceB && <Alert severity="warning">Seleziona due rose diverse.</Alert>}

          {comparison && (
            <>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,1fr)', md: 'repeat(4,1fr)' }, gap: .75 }}>
                <Paper variant="outlined" sx={{ p: .8, textAlign: 'center' }}><Typography variant="caption" color="text.secondary">Giocatori comuni</Typography><Typography fontWeight={900} fontSize="1.05rem" color="success.main">{comparison.totalSame}</Typography></Paper>
                <Paper variant="outlined" sx={{ p: .8, textAlign: 'center' }}><Typography variant="caption" color="text.secondary">Solo rosa A</Typography><Typography fontWeight={900} fontSize="1.05rem" color="primary.main">{comparison.totalOnlyA}</Typography></Paper>
                <Paper variant="outlined" sx={{ p: .8, textAlign: 'center' }}><Typography variant="caption" color="text.secondary">Solo rosa B</Typography><Typography fontWeight={900} fontSize="1.05rem" color="warning.main">{comparison.totalOnlyB}</Typography></Paper>
                <Paper variant="outlined" sx={{ p: .8, textAlign: 'center' }}><Typography variant="caption" color="text.secondary">Δ spesa B − A</Typography><Typography fontWeight={900} fontSize="1.05rem" color={deltaColor(comparison.totalSpentDelta)}>{deltaText(comparison.totalSpentDelta)}</Typography></Paper>
              </Box>

              <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
                <TableContainer sx={{ overflowX: 'auto' }}>
                  <Table size="small" sx={{ minWidth: 820 }}>
                    <TableHead><TableRow><TableCell>Reparto</TableCell><TableCell align="center">Comuni</TableCell><TableCell align="center">Solo A</TableCell><TableCell align="center">Solo B</TableCell><TableCell align="right">Spesa A</TableCell><TableCell align="right">Spesa B</TableCell><TableCell align="right">Δ spesa</TableCell><TableCell align="right">Residuo A</TableCell><TableCell align="right">Residuo B</TableCell></TableRow></TableHead>
                    <TableBody>
                      {ROLE_ORDER.map((role) => {
                        const data = comparison.roles[role];
                        return (
                          <TableRow key={role}>
                            <TableCell><Stack direction="row" spacing={.6} alignItems="center"><RoleBadge role={role} /><b>{ROLE_NAMES[role]}</b></Stack></TableCell>
                            <TableCell align="center" sx={{ color: 'success.main', fontWeight: 800 }}>{data.same}</TableCell>
                            <TableCell align="center" sx={{ color: 'primary.main', fontWeight: 800 }}>{data.onlyA}</TableCell>
                            <TableCell align="center" sx={{ color: 'warning.main', fontWeight: 800 }}>{data.onlyB}</TableCell>
                            <TableCell align="right">{money(data.spentA)}cr</TableCell>
                            <TableCell align="right">{money(data.spentB)}cr</TableCell>
                            <TableCell align="right" sx={{ color: deltaColor(data.spentDelta), fontWeight: 800 }}>{deltaText(data.spentDelta)}</TableCell>
                            <TableCell align="right">{money(data.remainingA)}cr</TableCell>
                            <TableCell align="right">{money(data.remainingB)}cr</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>

              <Divider />
              <Stack spacing={1}>
                {ROLE_ORDER.map((role) => <RoleDetail key={role} role={role} data={comparison.roles[role]} labelA={itemA.name} labelB={itemB.name} />)}
              </Stack>
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions><Button onClick={onClose}>Chiudi</Button></DialogActions>
    </Dialog>
  );
}