import { Divider, IconButton, Paper, Stack, Tab, Tabs, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

export default function AuctionTabs({ auctions, activeAuctionId, onSelect, onAdd, onClose }) {
  return (
    <Paper variant="outlined" sx={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
      <Tabs value={activeAuctionId} onChange={(_, value) => onSelect(value)} variant="scrollable" scrollButtons="auto" sx={{ flex: 1, minWidth: 0 }}>
        {auctions.map((auction) => (
          <Tab key={auction.id} value={auction.id} label={
            <Stack direction="row" alignItems="center" spacing={.25}>
              <span>{auction.name}</span>
              {auction.historyId && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', opacity: .8 }} />}
              <Tooltip title="Chiudi asta"><IconButton component="span" size="small" onClick={(event) => { event.preventDefault(); event.stopPropagation(); onClose(auction.id); }} sx={{ p: .15 }}><CloseIcon sx={{ fontSize: 14 }} /></IconButton></Tooltip>
            </Stack>
          } />
        ))}
      </Tabs>
      <Divider orientation="vertical" flexItem />
      <Tooltip title="Nuova asta"><IconButton onClick={onAdd} sx={{ mx: .5 }}><AddIcon /></IconButton></Tooltip>
    </Paper>
  );
}
