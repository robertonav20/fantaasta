import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createBlankAuction, loadWorkspace, saveWorkspace } from '../services/storage';
import { clone, normalizeAuctionState, uid } from '../utils';

export default function useAuctionWorkspace() {
  const [workspace, setWorkspace] = useState(() => loadWorkspace());
  const undoRef = useRef({});
  const redoRef = useRef({});

  const activeAuction = useMemo(
    () => workspace.auctions.find((auction) => auction.id === workspace.activeAuctionId) || workspace.auctions[0],
    [workspace],
  );

  useEffect(() => saveWorkspace(workspace), [workspace]);

  const updateAuction = useCallback((auctionId, updater) => {
    setWorkspace((current) => ({
      ...current,
      auctions: current.auctions.map((auction) => auction.id === auctionId ? (typeof updater === 'function' ? updater(auction) : updater) : auction),
    }));
  }, []);

  const mutateAuction = useCallback((auctionId, mutator) => {
    setWorkspace((currentWorkspace) => {
      const current = currentWorkspace.auctions.find((auction) => auction.id === auctionId);
      if (!current) return currentWorkspace;
      undoRef.current[auctionId] = [...(undoRef.current[auctionId] || []), clone(current.state)].slice(-100);
      redoRef.current[auctionId] = [];
      const nextState = clone(current.state);
      mutator(nextState);
      return {
        ...currentWorkspace,
        auctions: currentWorkspace.auctions.map((auction) => auction.id === auctionId ? { ...auction, state: normalizeAuctionState(nextState) } : auction),
      };
    });
  }, []);

  const undoAuction = useCallback((auctionId) => {
    setWorkspace((currentWorkspace) => {
      const stack = undoRef.current[auctionId] || [];
      const previous = stack.at(-1);
      const current = currentWorkspace.auctions.find((auction) => auction.id === auctionId);
      if (!previous || !current) return currentWorkspace;
      undoRef.current[auctionId] = stack.slice(0, -1);
      redoRef.current[auctionId] = [...(redoRef.current[auctionId] || []), clone(current.state)].slice(-100);
      return {
        ...currentWorkspace,
        auctions: currentWorkspace.auctions.map((auction) => auction.id === auctionId ? { ...auction, state: normalizeAuctionState(previous) } : auction),
      };
    });
  }, []);

  const redoAuction = useCallback((auctionId) => {
    setWorkspace((currentWorkspace) => {
      const stack = redoRef.current[auctionId] || [];
      const next = stack.at(-1);
      const current = currentWorkspace.auctions.find((auction) => auction.id === auctionId);
      if (!next || !current) return currentWorkspace;
      redoRef.current[auctionId] = stack.slice(0, -1);
      undoRef.current[auctionId] = [...(undoRef.current[auctionId] || []), clone(current.state)].slice(-100);
      return {
        ...currentWorkspace,
        auctions: currentWorkspace.auctions.map((auction) => auction.id === auctionId ? { ...auction, state: normalizeAuctionState(next) } : auction),
      };
    });
  }, []);

  useEffect(() => {
    const handler = (event) => {
      if (workspace.activeMain !== 'auctions' || !activeAuction) return;
      const target = event.target;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable) return;
      if (!(event.ctrlKey || event.metaKey)) return;
      const key = event.key.toLowerCase();
      if (key === 'z' && !event.shiftKey) { event.preventDefault(); undoAuction(activeAuction.id); }
      else if ((key === 'z' && event.shiftKey) || key === 'y') { event.preventDefault(); redoAuction(activeAuction.id); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [workspace.activeMain, activeAuction, undoAuction, redoAuction]);

  const setMainTab = useCallback((activeMain) => setWorkspace((current) => ({ ...current, activeMain })), []);
  const setActiveAuction = useCallback((activeAuctionId) => setWorkspace((current) => ({ ...current, activeMain: 'auctions', activeAuctionId })), []);

  const nextAuctionName = useCallback(() => {
    const used = new Set(workspace.auctions.map((auction) => auction.name));
    let index = 1;
    while (used.has(`Asta ${index}`)) index += 1;
    return `Asta ${index}`;
  }, [workspace.auctions]);

  const addAuction = useCallback(() => {
    const auction = createBlankAuction(nextAuctionName());
    setWorkspace((current) => ({ ...current, activeMain: 'auctions', activeAuctionId: auction.id, auctions: [...current.auctions, auction] }));
  }, [nextAuctionName]);

  const closeAuction = useCallback((id) => {
    const auction = workspace.auctions.find((item) => item.id === id);
    if (!auction || !window.confirm(`Chiudere il tab "${auction.name}"? Lo storico non verrà eliminato.`)) return;
    setWorkspace((current) => {
      const remaining = current.auctions.filter((item) => item.id !== id);
      if (!remaining.length) {
        const blank = createBlankAuction('Asta 1');
        return { ...current, auctions: [blank], activeAuctionId: blank.id };
      }
      return { ...current, auctions: remaining, activeAuctionId: current.activeAuctionId === id ? remaining[0].id : current.activeAuctionId };
    });
    delete undoRef.current[id];
    delete redoRef.current[id];
  }, [workspace.auctions]);

  const bindActiveToHistory = useCallback((item) => {
    if (!activeAuction) return;
    updateAuction(activeAuction.id, (auction) => ({ ...auction, name: item.name, historyId: item.id }));
  }, [activeAuction, updateAuction]);

  const detachHistory = useCallback((historyId) => {
    setWorkspace((current) => ({
      ...current,
      auctions: current.auctions.map((auction) => auction.historyId === historyId ? { ...auction, historyId: '' } : auction),
    }));
  }, []);

  const loadHistoryIntoCurrent = useCallback((item) => {
    if (!activeAuction) return;
    undoRef.current[activeAuction.id] = [...(undoRef.current[activeAuction.id] || []), clone(activeAuction.state)].slice(-100);
    redoRef.current[activeAuction.id] = [];
    updateAuction(activeAuction.id, (auction) => ({ ...auction, name: item.name, historyId: item.id, state: normalizeAuctionState(item.state) }));
    setWorkspace((current) => ({ ...current, activeMain: 'auctions' }));
  }, [activeAuction, updateAuction]);

  const openHistoryInNewAuction = useCallback((item) => {
    const alreadyOpen = workspace.auctions.find((auction) => auction.historyId === item.id);
    if (alreadyOpen) {
      setActiveAuction(alreadyOpen.id);
      return { openedExisting: true, auction: alreadyOpen };
    }
    const auction = { id: uid(), name: item.name, historyId: item.id, state: normalizeAuctionState(item.state) };
    setWorkspace((current) => ({ ...current, activeMain: 'auctions', activeAuctionId: auction.id, auctions: [...current.auctions, auction] }));
    return { openedExisting: false, auction };
  }, [workspace.auctions, setActiveAuction]);

  const canUndo = activeAuction ? Boolean((undoRef.current[activeAuction.id] || []).length) : false;
  const canRedo = activeAuction ? Boolean((redoRef.current[activeAuction.id] || []).length) : false;
  return {
    workspace,
    activeAuction,
    setMainTab,
    setActiveAuction,
    addAuction,
    closeAuction,
    updateAuction,
    mutateAuction,
    undoAuction,
    redoAuction,
    canUndo,
    canRedo,
    bindActiveToHistory,
    detachHistory,
    loadHistoryIntoCurrent,
    openHistoryInNewAuction,
  };
}
