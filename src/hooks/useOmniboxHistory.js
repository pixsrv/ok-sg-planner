import { useState, useEffect, useCallback } from 'react';
import { getStorageItem, setStorageItem, removeStorageItem, STORES } from '../utils/db';

const useOmniboxHistory = (settings) => {
  const [history, setHistory] = useState(() => {
    if (settings?.employeeFilterHistoryCache === false) {
      return { list: [], pointer: -1 };
    }

    const stored = getStorageItem(STORES.FILTERS);
    if (stored && Array.isArray(stored.list)) {
      return {
        list: stored.list,
        pointer: (typeof stored.pointer === 'number') ? stored.pointer : stored.list.length - 1
      };
    }
    return { list: [], pointer: -1 };
  });

  useEffect(() => {
    if (settings?.employeeFilterHistoryCache === false) return;

    setStorageItem(STORES.FILTERS, {
      list: history.list,
      pointer: history.pointer
    });
  }, [history.list, history.pointer, settings?.employeeFilterHistoryCache]);

  const addTermToHistory = useCallback((term) => {
    if (settings?.employeeFilterHistoryCache === false) return;
    if (!term || !term.trim()) return;

    setHistory(prev => {
      // Don't add if the same as current pointer
      if (prev.pointer >= 0 && prev.list[prev.pointer] === term) {
        return prev;
      }

      const newList = prev.list.slice(0, prev.pointer + 1);
      newList.push(term);

      if (newList.length > 50) {
        newList.shift();
      }

      return {
        list: newList,
        pointer: newList.length - 1
      };
    });
  }, [settings?.employeeFilterHistoryCache]);

  const clearHistory = useCallback(() => {
    setHistory({ list: [], pointer: -1 });
    removeStorageItem(STORES.FILTERS);
  }, []);

  return {
    historyList: history.list,
    addTermToHistory,
    clearHistory
  };
};

export default useOmniboxHistory;
