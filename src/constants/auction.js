export const ROLE_ORDER = ['P', 'D', 'C', 'A'];
export const ROLE_NAMES = {
  P: 'PORTIERI',
  D: 'DIFENSORI',
  C: 'CENTROCAMPISTI',
  A: 'ATTACCANTI',
};
export const ROLE_SHORT = { P: 'Portiere', D: 'Difensore', C: 'Centrocampista', A: 'Attaccante' };
export const ROLE_COLORS = {
  P: '#facc15',
  D: '#86efac',
  C: '#7dd3fc',
  A: '#ef4444',
};
export const LIMITS = { P: 3, D: 8, C: 8, A: 6 };
export const TIERS = ['Alto', 'Medio Alto', 'Medio', 'Medio Basso', 'Basso'];
export const TIER_COLORS = {
  Alto: '#7f1d1d',
  'Medio Alto': '#9a3412',
  Medio: '#854d0e',
  'Medio Basso': '#3f6212',
  Basso: '#166534',
};

export const DEFAULT_COSTS = {
  P: { Alto: 150, 'Medio Alto': 80, Medio: 1, 'Medio Basso': 1, Basso: 1 },
  D: { Alto: 80, 'Medio Alto': 50, Medio: 30, 'Medio Basso': 15, Basso: 1 },
  C: { Alto: 120, 'Medio Alto': 80, Medio: 40, 'Medio Basso': 25, Basso: 1 },
  A: { Alto: 350, 'Medio Alto': 100, Medio: 60, 'Medio Basso': 15, Basso: 1 },
};

export const INITIAL_STATE = {
  totalBudget: 1000,
  roleBudgets: { P: 150, D: 120, C: 270, A: 460 },
  costs: DEFAULT_COSTS,
  slots: { P: [], D: [], C: [], A: [] },
};
