import { useEffect } from 'react';

/**
 * Custom hook for global keyboard shortcuts in the WeekView.
 * 
 * @param {Object} callbacks
 * @param {Function} callbacks.onEscape
 * @param {Function} callbacks.onEnter
 * @param {Function} callbacks.onUndo
 * @param {Function} callbacks.onRedo
 * @param {boolean} isActive - Whether the shortcuts should be active (e.g. when a cell is being edited)
 */
export const useKeyboardShortcuts = ({ onEscape, onEnter, onUndo, onRedo }, isActive) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Escape and Enter shortcuts are context-aware (only if isActive)
      if (isActive) {
        if (e.key === 'Escape') {
          onEscape?.();
        }
        if (e.key === 'Enter') {
          onEnter?.();
        }
      }

      // Undo/Redo shortcuts (usually global, but we can respect isActive if needed, 
      // however the requirement says "prevent unnecessary event triggering when no cell is focused" 
      // for the listener, but specifically mentions isActive mapping to editingCell.
      // Actually, if isActive is false, we might still want Undo/Redo to work?
      // In the original code, handleUndo/Redo were called regardless of editingCell, 
      // but Escape/Enter check editingCell.
      
      // Original logic:
      // if (e.key === 'Escape' && editingCell) { ... }
      // if (e.key === 'Enter' && editingCell) { ... }
      // if ((e.ctrlKey || e.metaKey) && e.key === 'z') { ... }
      // if ((e.ctrlKey || e.metaKey) && e.key === 'y') { ... }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          onRedo?.();
        } else {
          onUndo?.();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        onRedo?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, onEscape, onEnter, onUndo, onRedo]);
};
