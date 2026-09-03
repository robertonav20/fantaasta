import { DEFAULT_COSTS, INITIAL_STATE, LIMITS, ROLE_ORDER, TIERS } from '../constants';
import { clone } from './common';

export function blankSlot() {
  return { tier: 'Basso', player: '', playerId: null, actual: 0 };
}

export function normalizeAuctionState(raw = {}) {
  const source = raw && typeof raw === 'object' ? raw : {};
  const state = {
    totalBudget: Number(source.totalBudget ?? INITIAL_STATE.totalBudget),
    roleBudgets: { ...INITIAL_STATE.roleBudgets, ...(source.roleBudgets || {}) },
    costs: clone(DEFAULT_COSTS),
    slots: {},
  };
  ROLE_ORDER.forEach((role) => {
    state.costs[role] = { ...DEFAULT_COSTS[role], ...(source.costs?.[role] || {}) };
    const current = Array.isArray(source.slots?.[role]) ? source.slots[role] : [];
    state.slots[role] = Array.from({ length: LIMITS[role] }, (_, index) => {
      const slot = current[index] || {};
      return {
        tier: TIERS.includes(slot.tier) ? slot.tier : 'Basso',
        player: String(slot.player || ''),
        playerId: slot.playerId ?? null,
        actual: Number(slot.actual || 0),
      };
    });
  });
  return state;
}

export const createBlankAuctionState = () => normalizeAuctionState(INITIAL_STATE);
