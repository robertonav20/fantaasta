import { ROLE_ORDER } from '../constants';

function normalizeName(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function catalogIndex(catalog, role) {
  const byId = new Map();
  const byName = new Map();
  (catalog?.[role] || []).forEach((player) => {
    if (player?.id !== undefined && player?.id !== null) byId.set(String(player.id), player);
    byName.set(normalizeName(player?.name), player);
  });
  return { byId, byName };
}

function rosterEntries(state, catalog, role) {
  const index = catalogIndex(catalog, role);
  const result = new Map();
  (state?.slots?.[role] || []).forEach((slot) => {
    if (!slot?.player && slot?.playerId === null) return;
    const id = slot?.playerId;
    const player = id !== undefined && id !== null
      ? index.byId.get(String(id))
      : index.byName.get(normalizeName(slot?.player));
    const name = player?.name || String(slot?.player || '').trim();
    if (!name) return;
    const key = id !== undefined && id !== null ? `id:${id}` : `name:${normalizeName(name)}`;
    result.set(key, {
      key,
      role,
      id: id ?? player?.id ?? null,
      name,
      team: player?.team || '',
      cost: Number(slot?.actual || 0),
      tier: slot?.tier || '',
    });
  });
  return result;
}

export function compareRosterStates(stateA, stateB, catalog) {
  const roles = {};
  let totalSame = 0;
  let totalOnlyA = 0;
  let totalOnlyB = 0;
  let totalSpentA = 0;
  let totalSpentB = 0;

  ROLE_ORDER.forEach((role) => {
    const mapA = rosterEntries(stateA, catalog, role);
    const mapB = rosterEntries(stateB, catalog, role);
    const keys = new Set([...mapA.keys(), ...mapB.keys()]);
    const rows = [...keys].map((key) => {
      const a = mapA.get(key) || null;
      const b = mapB.get(key) || null;
      const status = a && b ? 'same' : a ? 'onlyA' : 'onlyB';
      return {
        key,
        status,
        name: a?.name || b?.name || '',
        team: a?.team || b?.team || '',
        costA: a?.cost ?? null,
        costB: b?.cost ?? null,
        costDelta: a && b ? Number(b.cost || 0) - Number(a.cost || 0) : null,
        tierA: a?.tier || '',
        tierB: b?.tier || '',
      };
    }).sort((left, right) => {
      const rank = { same: 0, onlyA: 1, onlyB: 2 };
      return rank[left.status] - rank[right.status] || left.name.localeCompare(right.name, 'it');
    });

    const same = rows.filter((row) => row.status === 'same').length;
    const onlyA = rows.filter((row) => row.status === 'onlyA').length;
    const onlyB = rows.filter((row) => row.status === 'onlyB').length;
    const spentA = [...mapA.values()].reduce((sum, item) => sum + item.cost, 0);
    const spentB = [...mapB.values()].reduce((sum, item) => sum + item.cost, 0);
    const budgetA = Number(stateA?.roleBudgets?.[role] || 0);
    const budgetB = Number(stateB?.roleBudgets?.[role] || 0);

    roles[role] = {
      rows,
      playersA: mapA.size,
      playersB: mapB.size,
      same,
      onlyA,
      onlyB,
      spentA,
      spentB,
      spentDelta: spentB - spentA,
      budgetA,
      budgetB,
      budgetDelta: budgetB - budgetA,
      remainingA: budgetA - spentA,
      remainingB: budgetB - spentB,
    };

    totalSame += same;
    totalOnlyA += onlyA;
    totalOnlyB += onlyB;
    totalSpentA += spentA;
    totalSpentB += spentB;
  });

  return {
    roles,
    totalSame,
    totalOnlyA,
    totalOnlyB,
    totalSpentA,
    totalSpentB,
    totalSpentDelta: totalSpentB - totalSpentA,
  };
}