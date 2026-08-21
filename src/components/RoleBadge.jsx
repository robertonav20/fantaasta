import { Box, Tooltip } from '@mui/material';
import { ROLE_COLORS, ROLE_SHORT } from '../constants';

export default function RoleBadge({ role, size = 22 }) {
  return (
    <Tooltip title={ROLE_SHORT[role] || role}>
      <Box component="span" sx={{
        width: size, height: size, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        bgcolor: ROLE_COLORS[role] || 'grey.600', color: '#111', fontWeight: 900, fontSize: Math.max(9, size * .48), flex: '0 0 auto',
      }}>{role}</Box>
    </Tooltip>
  );
}
