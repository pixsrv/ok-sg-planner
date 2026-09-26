import { useState, useEffect, useCallback } from 'react';
import { getStorageItem, setStorageItem, removeStorageItem, STORES } from '../utils/db';
import { getDateFromWeek } from '../utils/dateUtils';

export const useJumpHistory = (settings, selectedWeek, selectedYear) => {
  const [history, setHistory] = useState(() => {
    if (settings?.jumpHistoryCache === false) return { list: [], pointer: -1 };
    
    const stored = getStorageItem(STORES.JUMPS);
    if (stored) {
      if (Array.isArray(stored.list) && stored.list.length > 0) {
        const list = stored.list.map(d => {
          const parts = d.split('-');
          if (parts.length === 3) {
            return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
          }
          return new Date(d);
        });
        const pointer = (typeof stored.pointer === 'number' && stored.pointer >= 0) ? stored.pointer : 0;
        return { list, pointer };
      }
    }
    
    const contextDate = getDateFromWeek(selectedWeek, selectedYear, settings?.weekStart);
    contextDate.setHours(0, 0, 0, 0);
    return { list: [contextDate], pointer: 0 };
  });

  // Sync to storage whenever history changes
  useEffect(() => {
    if (settings?.jumpHistoryCache === false) return;
    
    setStorageItem(STORES.JUMPS, {
      list: history.list.map(d => {
        if (!d || typeof d.getFullYear !== 'function') return null;
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      }).filter(Boolean),
      pointer: history.pointer
    });
  }, [history, settings?.jumpHistoryCache]);

  const addJumpToHistory = useCallback((date) => {
    if (settings?.jumpHistoryCache === false) return;
    if (!date || typeof date.getTime !== 'function') return;

    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    setHistory(prev => {
      // Don't add if the date is the same as the current history pointer
      if (prev.pointer >= 0 && prev.list[prev.pointer]?.getTime() === normalizedDate.getTime()) {
        return prev;
      }
      
      // New entry: truncate forward history if we were navigating back/forth
      const newList = prev.list.slice(0, prev.pointer + 1);
      newList.push(normalizedDate);
      
      // Limit history size
      if (newList.length > 50) {
        newList.shift();
      }
      
      return {
        list: newList,
        pointer: newList.length - 1
      };
    });
  }, [settings?.jumpHistoryCache]);

  const clearHistory = useCallback(() => {
    setHistory({ list: [], pointer: -1 });
    removeStorageItem(STORES.JUMPS);
  }, []);

  return {
    historyList: history.list,
    addJumpToHistory,
    clearHistory
  };
};
