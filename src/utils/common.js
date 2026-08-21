export const clone = (value) => JSON.parse(JSON.stringify(value));
export const uid = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
export const money = (value) => Number(value || 0).toLocaleString('it-IT', { maximumFractionDigits: 0 });
export const number = (value, digits = 2) => value === null || value === undefined || value === '' ? '—' : Number(value).toLocaleString('it-IT', { maximumFractionDigits: digits });
export const normalizeText = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
export const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' });
};
export const safeFilePart = (value) => String(value || 'rosa').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'rosa';
