import { DEFAULT_COSTS, ROLE_ORDER } from '../constants';

export const estimate = (state, role, tier) => Number(state.costs?.[role]?.[tier] ?? DEFAULT_COSTS[role]?.[tier] ?? 0);

export function rosterMeta(state) {
  let players = 0;
  let spent = 0;
  ROLE_ORDER.forEach((role) => {
    (state?.slots?.[role] || []).forEach((slot) => {
      if (slot?.player) players += 1;
      spent += Number(slot?.actual || 0);
    });
  });
  return { players, spent };
}
