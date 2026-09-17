const UNDO_KEY = 'ok-sg-undo';
const MAX_HISTORY = 50;

export const getUndoHistory = () => {
  try {
    const stored = localStorage.getItem(UNDO_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed.list)) {
        return {
          list: parsed.list,
          pointer: typeof parsed.pointer === 'number' ? parsed.pointer : parsed.list.length - 1
        };
      }
    }
  } catch (e) {
    console.error('Failed to parse ok-sg-undo from localStorage', e);
  }
  return { list: [], pointer: -1 };
};

export const saveUndoHistory = (history) => {
  try {
    localStorage.setItem(UNDO_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save ok-sg-undo to localStorage', e);
  }
};

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
  localStorage.removeItem(UNDO_KEY);
};
