import { useCallback, useState } from 'react';
import { loadHistory, saveHistory } from '../services/storage';

export default function useRosterHistory() {
  const [history, setHistoryState] = useState(() => loadHistory());

  const updateHistory = useCallback((updater) => {
    setHistoryState((current) => {
      const next = typeof updater === 'function' ? updater(current) : updater;
      saveHistory(next);
      return next;
    });
  }, []);

  const add = useCallback((item) => updateHistory((current) => [item, ...current]), [updateHistory]);
  const addMany = useCallback((items) => updateHistory((current) => [...items, ...current]), [updateHistory]);
  const remove = useCallback((id) => updateHistory((current) => current.filter((item) => item.id !== id)), [updateHistory]);
  const update = useCallback((id, updater) => updateHistory((current) => current.map((item) => item.id === id ? (typeof updater === 'function' ? updater(item) : updater) : item)), [updateHistory]);

  return { history, updateHistory, add, addMany, remove, update };
}
