import { useEffect, useState } from 'react';
import { Box, Button, ButtonGroup, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip } from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import RoleBadge from './RoleBadge';
import { DEFAULT_COSTS, INITIAL_STATE, ROLE_NAMES, ROLE_ORDER, TIERS } from '../constants';
import { clone, money } from '../utils';

export default function ConfigModal({ open, state, onClose, onApply }) {
  const [draft, setDraft] = useState(() => ({ totalBudget: state.totalBudget, roleBudgets: clone(state.roleBudgets), costs: clone(state.costs) }));

  useEffect(() => {
    if (open) setDraft({ totalBudget: state.totalBudget, roleBudgets: clone(state.roleBudgets), costs: clone(state.costs) });
  }, [open, state]);

  const allocated = ROLE_ORDER.reduce((sum, role) => sum + Number(draft.roleBudgets[role] || 0), 0);
  const invalid = allocated > Number(draft.totalBudget || 0);
  const updateBudget = (role, value) => setDraft((current) => ({ ...current, roleBudgets: { ...current.roleBudgets, [role]: Number(value || 0) } }));
  const updateCost = (role, tier, value) => setDraft((current) => ({ ...current, costs: { ...current.costs, [role]: { ...current.costs[role], [tier]: Number(value || 0) } } }));

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Configura</DialogTitle>
      <DialogContent>
        <Stack spacing={1.25} sx={{ pt: .5 }}>
          <TextField size="small" type="number" label="Budget totale" value={draft.totalBudget} onChange={(e) => setDraft((current) => ({ ...current, totalBudget: Number(e.target.value || 0) }))} inputProps={{ style: { textAlign: 'center' } }} />
          <Paper variant="outlined" sx={{ p: 1, borderColor: invalid ? 'error.main' : 'success.main', color: invalid ? 'error.main' : 'success.main', textAlign: 'center' }}>
            {invalid ? `Budget reparti superiore di ${money(allocated - draft.totalBudget)} crediti` : `Budget assegnato ${money(allocated)} / ${money(draft.totalBudget)}`}
          </Paper>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 720 }}>
              <TableHead><TableRow><TableCell>Reparto</TableCell><TableCell>Budget</TableCell>{TIERS.map((tier) => <TableCell key={tier} align="center">{tier}</TableCell>)}</TableRow></TableHead>
              <TableBody>
                {ROLE_ORDER.map((role) => (
                  <TableRow key={role}>
                    <TableCell><Stack direction="row" alignItems="center" spacing={.5}><RoleBadge role={role} size={18} /><b>{ROLE_NAMES[role]}</b></Stack></TableCell>
                    <TableCell><TextField size="small" type="number" value={draft.roleBudgets[role]} error={invalid} onChange={(e) => updateBudget(role, e.target.value)} sx={{ width: 90 }} inputProps={{ style: { textAlign: 'center' } }} /></TableCell>
                    {TIERS.map((tier) => <TableCell key={tier} align="center"><TextField size="small" type="number" value={draft.costs[role][tier]} onChange={(e) => updateCost(role, tier, e.target.value)} sx={{ width: 78 }} inputProps={{ style: { textAlign: 'center' } }} /></TableCell>)}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </DialogContent>
      <DialogActions>
        <ButtonGroup><Tooltip title="Ripristina valori predefiniti"><IconButton onClick={() => setDraft({ totalBudget: INITIAL_STATE.totalBudget, roleBudgets: clone(INITIAL_STATE.roleBudgets), costs: clone(DEFAULT_COSTS) })}><RestartAltIcon /></IconButton></Tooltip></ButtonGroup>
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose}>Chiudi</Button>
        <Button variant="contained" disabled={invalid} onClick={() => onApply(draft)}>Applica</Button>
      </DialogActions>
    </Dialog>
  );
}
