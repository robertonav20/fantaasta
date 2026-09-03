import { normalizeText } from './common';

export function selectedPlayer(catalog, role, slot) {
  const list = catalog?.[role] || [];
  if (slot?.playerId !== null && slot?.playerId !== undefined) {
    const byId = list.find((player) => String(player.id) === String(slot.playerId));
    if (byId) return byId;
  }
  const name = normalizeText(slot?.player);
  return name ? list.find((player) => normalizeText(player.name) === name) || null : null;
}
