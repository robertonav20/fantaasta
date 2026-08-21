import { HISTORY_LIMIT } from '../constants';
import { normalizeAuctionState } from './auction';
import { clone, uid } from './common';

export function defaultRosterName() {
  return `Rosa ${new Date().toLocaleString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`;
}

export function downloadJson(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function rosterExportPackage(items) {
  return { format: 'fantacalcio-asta-rosters', version: 1, exportedAt: new Date().toISOString(), rosters: clone(items) };
}

export function extractImportedRosters(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object' && Array.isArray(payload.rosters)) return payload.rosters;
  if (payload && typeof payload === 'object' && payload.state) return [payload];
  return [];
}

export function normalizeImportedRoster(item, sourceName = '') {
  if (!item?.state || typeof item.state !== 'object') return null;
  const now = new Date().toISOString();
  return {
    id: uid(),
    name: String(item.name || sourceName || defaultRosterName()).trim(),
    createdAt: item.createdAt || now,
    updatedAt: now,
    state: normalizeAuctionState(item.state),
  };
}

export function clampHistory(items) {
  return items.slice(0, HISTORY_LIMIT);
}
