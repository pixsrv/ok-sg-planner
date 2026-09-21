import { getStorageItem, setStorageItem, removeStorageItem, STORES } from './db';

const MAX_HISTORY = 50;

export const getUndoHistory = () => {
  const stored = getStorageItem(STORES.UNDO, { list: [], pointer: -1 });
  
  if (Array.isArray(stored.list)) {
    return {
      list: stored.list,
      pointer: typeof stored.pointer === 'number' ? stored.pointer : stored.list.length - 1
    };
  }
  
  return { list: [], pointer: -1 };
};

export const saveUndoHistory = (history) => setStorageItem(STORES.UNDO, history);

export const pushAction = (action) => {
  const history = getUndoHistory();
  
  // Prevent duplicate consecutive actions (especially for React StrictMode)
  if (history.pointer >= 0) {
    const lastAction = history.list[history.pointer];
    if (JSON.stringify(lastAction) === JSON.stringify(action)) {
      return history;
    }
  }

  // Remove any "redo" actions if we're in the middle of the list
  const newList = history.list.slice(0, history.pointer + 1);
  newList.push(action);
  
  if (newList.length > MAX_HISTORY) {
    newList.shift();
  }
  
  const newHistory = {
    list: newList,
    pointer: newList.length - 1
  };
  
  saveUndoHistory(newHistory);
  return newHistory;
};

export const clearUndoHistory = () => {
  removeStorageItem(STORES.UNDO);
};
