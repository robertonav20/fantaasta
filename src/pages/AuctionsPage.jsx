import { useState } from 'react';
import { Stack } from '@mui/material';
import AuctionPanel from '../components/AuctionPanel';
import AuctionTabs from '../components/AuctionTabs';
import HistoryModal from '../components/HistoryModal';
import RosterCompareModal from '../components/RosterCompareModal';
import { clone, uid } from '../utils';

export default function AuctionsPage({ workspaceApi, historyApi, catalog, catalogUpdatedAt, onNotify }) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const { workspace, activeAuction } = workspaceApi;
  const { history } = historyApi;

  const saveNewHistory = (name) => {
    if (!activeAuction) return;
    const now = new Date().toISOString();
    const item = { id: uid(), name, createdAt: now, updatedAt: now, state: clone(activeAuction.state) };
    historyApi.add(item);
    workspaceApi.bindActiveToHistory(item);
    onNotify('Rosa salvata nello storico');
  };

  const saveOrUpdate = () => {
    if (!activeAuction) return;
    const item = history.find((candidate) => candidate.id === activeAuction.historyId);
    if (!item) {
      setHistoryOpen(true);
      onNotify('Assegna un nome alla rosa per salvarla');
      return;
    }
    historyApi.update(item.id, (current) => ({ ...current, updatedAt: new Date().toISOString(), state: clone(activeAuction.state) }));
    onNotify(`Aggiornata: ${item.name}`);
  };

  const loadHistoryIntoCurrent = (item) => {
    workspaceApi.loadHistoryIntoCurrent(item);
    setHistoryOpen(false);
    onNotify(`Caricata: ${item.name}`);
  };

  const openHistoryInNewAuction = (item) => {
    const result = workspaceApi.openHistoryInNewAuction(item);
    setHistoryOpen(false);
    if (!result.openedExisting) onNotify(`Aperta nuova asta: ${item.name}`);
  };

  const deleteHistoryItem = (item) => {
    if (!window.confirm(`Eliminare "${item.name}" dallo storico?`)) return;
    historyApi.remove(item.id);
    workspaceApi.detachHistory(item.id);
  };

  const importHistory = (items) => {
    historyApi.addMany(items);
    onNotify(`${items.length} ${items.length === 1 ? 'rosa importata' : 'rose importate'}`);
  };

  if (!activeAuction) return null;

  return (
    <Stack spacing={1}>
      <AuctionTabs
        auctions={workspace.auctions}
        activeAuctionId={activeAuction.id}
        onSelect={workspaceApi.setActiveAuction}
        onAdd={workspaceApi.addAuction}
        onClose={workspaceApi.closeAuction}
      />

      <AuctionPanel
        auction={activeAuction}
        catalog={catalog}
        canUndo={workspaceApi.canUndo}
        canRedo={workspaceApi.canRedo}
        onMutate={(mutator) => workspaceApi.mutateAuction(activeAuction.id, mutator)}
        onUndo={() => workspaceApi.undoAuction(activeAuction.id)}
        onRedo={() => workspaceApi.redoAuction(activeAuction.id)}
        onSaveOrUpdate={saveOrUpdate}
        onOpenHistory={() => setHistoryOpen(true)}
        onOpenCompare={() => setCompareOpen(true)}
        catalogUpdatedAt={catalogUpdatedAt}
      />

      <RosterCompareModal
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        auctions={workspace.auctions}
        history={history}
        activeAuctionId={activeAuction.id}
        catalog={catalog}
      />

      <HistoryModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={history}
        activeAuction={activeAuction}
        onSaveNew={saveNewHistory}
        onLoadCurrent={loadHistoryIntoCurrent}
        onOpenNew={openHistoryInNewAuction}
        onDelete={deleteHistoryItem}
        onImport={importHistory}
      />
    </Stack>
  );
}