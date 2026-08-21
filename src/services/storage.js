import { HISTORY_LIMIT, STORAGE } from '../constants';
import { INITIAL_STATE } from '../constants/auction';
import { createBlankAuctionState, normalizeAuctionState } from '../utils/auction';
import { uid } from '../utils/common';

function readJson(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || 'null');
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

export function loadHistory() {
  const value = readJson(STORAGE.history, []);
  return Array.isArray(value) ? value : [];
}

export function saveHistory(items) {
  localStorage.setItem(STORAGE.history, JSON.stringify(items.slice(0, HISTORY_LIMIT)));
}

export function saveWorkspace(workspace) {
  localStorage.setItem(STORAGE.workspace, JSON.stringify(workspace));
}

export function loadWorkspace() {
  const existing = readJson(STORAGE.workspace, null);
  if (existing?.auctions?.length) {
    const auctions = existing.auctions.map((auction, index) => ({
      id: auction.id || uid(),
      name: auction.name || `Asta ${index + 1}`,
      historyId: auction.historyId || '',
      state: normalizeAuctionState(auction.state),
    }));
    return {
      activeMain: existing.activeMain === 'auctions' ? 'auctions' : 'players',
      activeAuctionId: auctions.some((a) => a.id === existing.activeAuctionId) ? existing.activeAuctionId : auctions[0].id,
      auctions,
    };
  }

  const legacyState = readJson(STORAGE.legacyCurrent, null);
  const legacyHistoryId = localStorage.getItem(STORAGE.legacyActiveHistory) || '';
  const historyItem = legacyHistoryId ? loadHistory().find((item) => item.id === legacyHistoryId) : null;
  const auction = {
    id: uid(),
    name: historyItem?.name || 'Asta 1',
    historyId: historyItem?.id || '',
    state: normalizeAuctionState(legacyState || INITIAL_STATE),
  };
  return { activeMain: 'players', activeAuctionId: auction.id, auctions: [auction] };
}

export function createBlankAuction(name = 'Asta 1') {
  return { id: uid(), name, historyId: '', state: createBlankAuctionState() };
}
