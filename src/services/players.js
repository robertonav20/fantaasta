import { ROLE_ORDER } from '../constants';

export const EMPTY_CATALOG = { P: [], D: [], C: [], A: [], _meta: {} };

export async function fetchCatalog(signal) {
  const response = await fetch(`${import.meta.env.BASE_URL}players.json?v=${Date.now()}`, { cache: 'no-store', signal });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  ROLE_ORDER.forEach((role) => {
    if (!Array.isArray(data[role])) throw new Error(`Ruolo ${role} mancante`);
  });
  return data;
}
