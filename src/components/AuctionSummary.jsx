import { Box, Card, Chip, Paper, Stack, Typography } from '@mui/material';
import RoleBadge from './RoleBadge';
import { LIMITS, ROLE_NAMES, ROLE_ORDER } from '../constants';
import { estimate, money, selectedPlayer } from '../utils';

function RoleSummary({ role, state, catalog }) {
  const slots = state.slots[role];
  const estimated = slots.reduce((sum, slot) => sum + estimate(state, role, slot.tier), 0);
  const spent = slots.reduce((sum, slot) => sum + Number(slot.actual || 0), 0);
  const filled = slots.filter((slot) => selectedPlayer(catalog, role, slot)).length;
  const budget = Number(state.roleBudgets[role] || 0);
  const estimatedRemaining = budget - estimated;
  const actualRemaining = budget - spent;

  return (
    <Paper variant="outlined" sx={{ p: 1, minWidth: 0 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: .75 }}>
        <Stack direction="row" alignItems="center" spacing={.75}><RoleBadge role={role} /><Typography sx={{ fontWeight: 900 }}>{ROLE_NAMES[role]}</Typography></Stack>
        <Chip size="small" label={`${filled}/${LIMITS[role]}`} />
      </Stack>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: .75 }}>
        <Paper variant="outlined" sx={{ p: .65, textAlign: 'center', bgcolor: 'background.default' }}>
          <Typography variant="caption" color="text.secondary">Stimato</Typography><Typography sx={{ fontWeight: 900 }}>{money(estimated)}</Typography>
          <Typography variant="caption" color="text.secondary">Residuo</Typography><Typography sx={{ fontWeight: 800, color: estimatedRemaining < 0 ? 'error.main' : 'success.main' }}>{money(estimatedRemaining)}</Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: .65, textAlign: 'center', bgcolor: 'background.default' }}>
          <Typography variant="caption" color="text.secondary">Speso</Typography><Typography sx={{ fontWeight: 900 }}>{money(spent)}</Typography>
          <Typography variant="caption" color="text.secondary">Residuo</Typography><Typography sx={{ fontWeight: 800, color: actualRemaining < 0 ? 'error.main' : actualRemaining === 0 ? 'warning.main' : 'success.main' }}>{money(actualRemaining)}</Typography>
        </Paper>
      </Box>
    </Paper>
  );
}

export default function AuctionSummary({ state, catalog, metrics }) {
  return (
    <>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4,1fr)' }, gap: .75 }}>
        {ROLE_ORDER.map((role) => <RoleSummary key={role} role={role} state={state} catalog={catalog} />)}
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(3,1fr)', sm: 'repeat(3,minmax(120px,180px))' }, gap: .75 }}>
        <Card variant="outlined" sx={{ p: .75, textAlign: 'center' }}><Typography variant="caption" color="text.secondary">Speso</Typography><Typography sx={{ fontWeight: 900, fontSize: '1.1rem' }}>{money(metrics.totalSpent)}</Typography></Card>
        <Card variant="outlined" sx={{ p: .75, textAlign: 'center' }}><Typography variant="caption" color="text.secondary">Residuo</Typography><Typography sx={{ fontWeight: 900, fontSize: '1.1rem', color: metrics.remain < 0 ? 'error.main' : 'success.main' }}>{money(metrics.remain)}</Typography></Card>
        <Card variant="outlined" sx={{ p: .75, textAlign: 'center' }}><Typography variant="caption" color="text.secondary">Giocatori</Typography><Typography sx={{ fontWeight: 900, fontSize: '1.1rem' }}>{metrics.totalPlayers}/25</Typography></Card>
      </Box>
    </>
  );
}
