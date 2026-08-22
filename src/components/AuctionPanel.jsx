import { useEffect, useMemo, useState } from 'react';
import { Box, ButtonGroup, Chip, IconButton, InputAdornment, Paper, Stack, TextField, Tooltip, Typography } from '@mui/material';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import SettingsIcon from '@mui/icons-material/Settings';
import SaveIcon from '@mui/icons-material/Save';
import HistoryIcon from '@mui/icons-material/History';
import AuctionSummary from './AuctionSummary';
import AuctionTable from './AuctionTable';
import ConfigModal from './ConfigModal';
import PlayerModal from './PlayerModal';
import { ROLE_ORDER } from '../constants';
import { clone, estimate, selectedPlayer } from '../utils';

export default function AuctionPanel({ auction, catalog, canUndo, canRedo, onMutate, onUndo, onRedo, onSaveOrUpdate, onOpenHistory, onOpenCompare, catalogUpdatedAt }) {
  const state = auction.state;
  const [configOpen, setConfigOpen] = useState(false);
  const [infoPlayer, setInfoPlayer] = useState(null);
  const [budgetInput, setBudgetInput] = useState(String(state.totalBudget));
  useEffect(() => setBudgetInput(String(state.totalBudget)), [state.totalBudget]);

  const metrics = useMemo(() => {
    let totalSpent = 0;
    let totalPlayers = 0;
    const role = {};
    ROLE_ORDER.forEach((currentRole) => {
      const slots = state.slots[currentRole];
      const estimated = slots.reduce((sum, slot) => sum + estimate(state, currentRole, slot.tier), 0);
      const spent = slots.reduce((sum, slot) => sum + Number(slot.actual || 0), 0);
      const filled = slots.filter((slot) => selectedPlayer(catalog, currentRole, slot)).length;
      role[currentRole] = { estimated, spent, filled };
      totalSpent += spent;
      totalPlayers += filled;
    });
    return { role, totalSpent, totalPlayers, remain: Number(state.totalBudget) - totalSpent };
  }, [state, catalog]);

  const teamCounts = useMemo(() => {
    const counts = {};
    ROLE_ORDER.forEach((role) => state.slots[role].forEach((slot) => {
      const player = selectedPlayer(catalog, role, slot);
      if (player) counts[player.team] = (counts[player.team] || 0) + 1;
    }));
    return Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'it'));
  }, [state, catalog]);

  const allocatedBudget = ROLE_ORDER.reduce((sum, role) => sum + Number(state.roleBudgets[role] || 0), 0);
  const patchSlot = (role, index, patch) => onMutate((next) => { next.slots[role][index] = { ...next.slots[role][index], ...patch }; });

  return (
    <Stack spacing={1.1}>
      <Paper variant="outlined" sx={{ px: { xs: .75, sm: 1 }, py: .65 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" gap={.75} flexWrap="wrap">
          <Box sx={{ minWidth: 0, flex: '1 1 220px' }}>
            <Stack direction="row" alignItems="baseline" spacing={.75} flexWrap="wrap">
              <Typography variant="h6" noWrap>{auction.name}</Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                Catalogo {catalogUpdatedAt || '—'}{auction.historyId ? ' · storico' : ''}
              </Typography>
            </Stack>
          </Box>

          <Stack direction="row" gap={.5} alignItems="center" sx={{ ml: 'auto' }}>
            <Tooltip title={Number(budgetInput || 0) < allocatedBudget ? 'Budget inferiore alla somma dei reparti' : 'Budget totale'}>
              <TextField
                size="small"
                type="number"
                value={budgetInput}
                error={Number(budgetInput || 0) < allocatedBudget}
                onChange={(event) => setBudgetInput(event.target.value)}
                onBlur={() => {
                  const value = Number(budgetInput || 0);
                  if (value >= allocatedBudget) onMutate((next) => { next.totalBudget = value; });
                  else setBudgetInput(String(state.totalBudget));
                }}
                slotProps={{
                  htmlInput: { style: { textAlign: 'center', padding: '5px 26px 5px 8px' } },
                  input: { endAdornment: <InputAdornment position="end">cr</InputAdornment> },
                }}
                sx={{ width: 104, '& .MuiInputAdornment-root': { ml: -.25 }, '& .MuiInputAdornment-root .MuiTypography-root': { fontSize: '.65rem', color: 'text.secondary' } }}
              />
            </Tooltip>

            <ButtonGroup
              variant="outlined"
              size="small"
              sx={{
                bgcolor: 'background.default',
                '& .MuiIconButton-root': { borderRadius: 0, p: .55, width: 30, height: 30 },
                '& .MuiSvgIcon-root': { fontSize: 17 },
              }}
            >
              <Tooltip title="Undo"><span><IconButton disabled={!canUndo} onClick={onUndo}><UndoIcon /></IconButton></span></Tooltip>
              <Tooltip title="Redo"><span><IconButton disabled={!canRedo} onClick={onRedo}><RedoIcon /></IconButton></span></Tooltip>
              <Tooltip title="Configura"><IconButton onClick={() => setConfigOpen(true)}><SettingsIcon /></IconButton></Tooltip>
              <Tooltip title={auction.historyId ? 'Aggiorna rosa nello storico' : 'Salva rosa nello storico'}><IconButton color={auction.historyId ? 'primary' : 'default'} onClick={onSaveOrUpdate}><SaveIcon /></IconButton></Tooltip>
              <Tooltip title="Confronta rose"><IconButton onClick={onOpenCompare}><Box component="span" sx={{ fontWeight: 900, fontSize: 16, lineHeight: 1 }}>⇄</Box></IconButton></Tooltip>
              <Tooltip title="Gestione rose"><IconButton onClick={onOpenHistory}><HistoryIcon /></IconButton></Tooltip>
            </ButtonGroup>
          </Stack>
        </Stack>
      </Paper>

      <AuctionSummary state={state} catalog={catalog} metrics={metrics} />
      <AuctionTable state={state} catalog={catalog} metrics={metrics} onPatchSlot={patchSlot} onShowPlayer={setInfoPlayer} />

      <Stack direction="row" gap={.5} flexWrap="wrap" alignItems="center">
        <Typography variant="caption" color="text.secondary">Giocatori per squadra:</Typography>
        {teamCounts.length ? teamCounts.map(([team, count]) => <Chip key={team} size="small" color={count > 4 ? 'error' : 'default'} variant="outlined" label={`${team}: ${count}`} />) : <Typography variant="caption" color="text.secondary">nessuno</Typography>}
      </Stack>

      <ConfigModal
        open={configOpen}
        state={state}
        onClose={() => setConfigOpen(false)}
        onApply={(draft) => {
          onMutate((next) => {
            next.totalBudget = draft.totalBudget;
            next.roleBudgets = clone(draft.roleBudgets);
            next.costs = clone(draft.costs);
          });
          setConfigOpen(false);
        }}
      />
      <PlayerModal player={infoPlayer} open={Boolean(infoPlayer)} onClose={() => setInfoPlayer(null)} />
    </Stack>
  );
}