import { useState } from 'react';
import { Alert, Box, Container, Snackbar, Stack, Typography } from '@mui/material';
import MainNavigation from './components/MainNavigation';
import PlayersPage from './pages/PlayersPage';
import AuctionsPage from './pages/AuctionsPage';
import useCatalog from './hooks/useCatalog';
import useAuctionWorkspace from './hooks/useAuctionWorkspace';
import useRosterHistory from './hooks/useRosterHistory';
import { PROJECT_VERSION } from './constants';

export default function App() {
  const catalogApi = useCatalog();
  const workspaceApi = useAuctionWorkspace();
  const historyApi = useRosterHistory();
  const [snack, setSnack] = useState('');

  return (
    <Container maxWidth={false} sx={{ maxWidth: 1600, py: { xs: 1, sm: 1.5 }, px: { xs: 1, sm: 1.5 } }}>
      <Stack spacing={1.25}>
        <Stack direction="column" gap={.5}>
            <Typography variant="h5">Fantacalcio</Typography>
            <Typography variant="caption" color="text.secondary">{PROJECT_VERSION}</Typography>
            <Typography variant="caption" color="text.secondary">{catalogApi.count} Giocatori · dati {catalogApi.updatedAt}</Typography>
        </Stack>

        {catalogApi.error && <Alert severity="warning">{catalogApi.error}</Alert>}

        <MainNavigation
          value={workspaceApi.workspace.activeMain || 'players'}
          auctionCount={workspaceApi.workspace.auctions.length}
          onChange={workspaceApi.setMainTab}
        />

        {workspaceApi.workspace.activeMain === 'players' && <PlayersPage catalog={catalogApi.catalog} />}
        {workspaceApi.workspace.activeMain === 'auctions' && (
          <AuctionsPage
            workspaceApi={workspaceApi}
            historyApi={historyApi}
            catalog={catalogApi.catalog}
            catalogUpdatedAt={catalogApi.updatedAt}
            onNotify={setSnack}
          />
        )}
      </Stack>

      <Snackbar open={Boolean(snack)} autoHideDuration={1800} onClose={() => setSnack('')} message={snack} />
    </Container>
  );
}
