import { Autocomplete, Box, ButtonGroup, IconButton, InputAdornment, MenuItem, Paper, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import RoleBadge from './RoleBadge';
import { LIMITS, ROLE_NAMES, ROLE_ORDER, TIER_COLORS, TIERS } from '../constants';
import { estimate, money, selectedPlayer } from '../utils';

function actualTone(actual, expected) {
  if (actual < expected) return 'success.main';
  if (actual === expected) return 'warning.main';
  return 'error.main';
}

export default function AuctionTable({ state, catalog, metrics, onPatchSlot, onShowPlayer, isPlayerSelected }) {
  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 900 }}>
          <TableHead><TableRow><TableCell sx={{ width: 145, textAlign: 'center' }}>Stima</TableCell><TableCell>Giocatore</TableCell><TableCell>Squadra</TableCell><TableCell align="right">FVM</TableCell><TableCell align="center">Costo effettivo</TableCell><TableCell align="center">Operazioni</TableCell></TableRow></TableHead>
          <TableBody>
            {ROLE_ORDER.flatMap((role) => [
              <TableRow key={`${role}-header`} sx={{ bgcolor: 'rgba(88,166,255,.09)' }}>
                <TableCell colSpan={6} sx={{ fontWeight: 900 }}><Stack direction="row" alignItems="center" spacing={.75}><RoleBadge role={role} /><span>{ROLE_NAMES[role]} · {metrics.role[role].filled}/{LIMITS[role]}</span></Stack></TableCell>
              </TableRow>,
              ...state.slots[role].map((slot, index) => {
                const player = selectedPlayer(catalog, role, slot);
                const expected = estimate(state, role, slot.tier);
                return (
                  <TableRow key={`${role}-${index}`} hover sx={{ '&:nth-of-type(even)': { bgcolor: 'rgba(88,166,255,.025)' } }}>
                    <TableCell align="center"><Select size="small" value={slot.tier} onChange={(e) => onPatchSlot(role, index, { tier: e.target.value })} sx={{ width: 135, fontWeight: 800, bgcolor: TIER_COLORS[slot.tier], '& .MuiSelect-select': { textAlign: 'center', py: .55 } }}>{TIERS.map((tier) => <MenuItem key={tier} value={tier} sx={{ bgcolor: TIER_COLORS[tier] }}>{tier} - {money(estimate(state, role, tier))}cr</MenuItem>)}</Select></TableCell>
                    <TableCell sx={{ minWidth: 245 }}><Autocomplete size="small" options={catalog?.[role] || []} value={player} onChange={(_, value) => onPatchSlot(role, index, { player: value?.name || '', playerId: value?.id ?? null })} getOptionLabel={(option) => option?.name || ''} isOptionEqualToValue={(option, value) => String(option?.id) === String(value?.id)} getOptionDisabled={(option) => Boolean(isPlayerSelected?.(option, role, index))} renderOption={(props, option) => <li {...props} key={option.id}><Box sx={{ flex: 1 }}><b>{option.name}</b><Typography variant="caption" color="text.secondary" display="block">{option.team} · FVM {option.fvm}</Typography></Box></li>} renderInput={(params) => <TextField {...params} placeholder="Cerca giocatore" />} /></TableCell>
                    <TableCell>{player?.team || '—'}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800 }}>{player ? money(player.fvm) : '—'}</TableCell>
                    <TableCell align="center"><TextField size="small" type="number" value={slot.actual} onChange={(e) => onPatchSlot(role, index, { actual: Number(e.target.value || 0) })} sx={{ width: 100, '& input': { textAlign: 'center', fontWeight: 900, color: actualTone(Number(slot.actual || 0), expected) }, '& .MuiOutlinedInput-notchedOutline': { borderColor: actualTone(Number(slot.actual || 0), expected) } }} InputProps={{ endAdornment: <InputAdornment position="end">cr</InputAdornment> }} /></TableCell>
                    <TableCell align="center"><ButtonGroup>
                      <Tooltip title="Informazioni"><span><IconButton disabled={!player} onClick={() => onShowPlayer(player)}><InfoOutlinedIcon fontSize="small" /></IconButton></span></Tooltip>
                      <Tooltip title="Reset riga"><IconButton onClick={() => onPatchSlot(role, index, { tier: 'Basso', player: '', playerId: null, actual: 0 })}><RestartAltIcon fontSize="small" /></IconButton></Tooltip>
                    </ButtonGroup></TableCell>
                  </TableRow>
                );
              }),
            ])}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
