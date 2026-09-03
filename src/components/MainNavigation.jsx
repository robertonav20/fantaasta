import { Paper, Tab, Tabs } from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';

export default function MainNavigation({ value, auctionCount, onChange }) {
  return (
    <Paper variant="outlined">
      <Tabs value={value} onChange={(_, next) => onChange(next)} variant="fullWidth">
        <Tab value="players" icon={<GroupsIcon />} iconPosition="start" label="Giocatori" />
        <Tab value="auctions" icon={<SportsSoccerIcon />} iconPosition="start" label={`Aste (${auctionCount})`} />
      </Tabs>
    </Paper>
  );
}
