import {useCallback} from 'react';

const useDropdownKeyboard = ({
  isOpen,
  results,
  selectedIndex,
  setSelectedIndex,
  setIsOpen,
  handleSelect,
  handleSearch,
  handleClear,
  localQuery,
  addTermToHistory
}) => {
  return useCallback((e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      if (isOpen) {
        setIsOpen(false);
      } else if (localQuery) {
        handleClear();
      }
    } else if (e.key === 'ArrowDown') {
      if (isOpen && results.length > 0) {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % results.length);
      } else if (!isOpen) {
        e.preventDefault();
        handleSearch(localQuery);
      }
    } else if (e.key === 'ArrowUp' && isOpen) {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      if (isOpen && results.length > 0) {
        e.preventDefault();
        handleSelect(results[selectedIndex]);
      } else if (!isOpen) {
        e.preventDefault();
        handleSearch(localQuery);
        if (localQuery.trim()) {
          addTermToHistory(localQuery);
        }
      }
    }
  }, [
    isOpen,
    results,
    selectedIndex,
    setSelectedIndex,
    setIsOpen,
    handleSelect,
    handleSearch,
    handleClear,
    localQuery,
    addTermToHistory
  ]);
};

export default useDropdownKeyboard;
