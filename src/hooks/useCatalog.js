import { useEffect, useMemo, useState } from 'react';
import { ROLE_ORDER } from '../constants';
import { EMPTY_CATALOG, fetchCatalog } from '../services/players';
import { formatDateTime } from '../utils';

export default function useCatalog() {
  const [catalog, setCatalog] = useState(EMPTY_CATALOG);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    fetchCatalog(controller.signal)
      .then((data) => { setCatalog(data); setError(''); })
      .catch((reason) => {
        if (reason?.name === 'AbortError') return;
        console.error(reason);
        setError('Catalogo giocatori non disponibile.');
      });
    return () => controller.abort();
  }, []);

  const count = useMemo(() => ROLE_ORDER.reduce((sum, role) => sum + (catalog[role]?.length || 0), 0), [catalog]);
  const updatedAt = formatDateTime(catalog._meta?.catalogUpdatedAt);

  return { catalog, error, count, updatedAt };
}
