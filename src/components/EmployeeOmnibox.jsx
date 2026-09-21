import {useState, useEffect, useRef} from 'react';
import {Search, X, FilterX} from 'lucide-react';
import {filterEmployees} from '../utils/employeeFilter';
import useOmniboxHistory from '../hooks/useOmniboxHistory';
import useDropdownKeyboard from '../hooks/useDropdownKeyboard';
import OmniboxDropdownItem from './OmniboxDropdownItem';

const EmployeeOmnibox = ({value, onChange, employees, settings, placeholder = "Search employees..."}) => {
  const [localQuery, setLocalQuery] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef(null);

  // Synchronize localQuery when the value prop changes from the outside.
  // Using the "update state during render" pattern instead of useEffect to avoid
  // cascading renders and satisfy the react-hooks/set-state-in-effect lint rule.
  if (value !== prevValue) {
    setLocalQuery(value);
    setPrevValue(value);
  }

  const isImmediate = settings?.employeeFilterImmediate !== false;

  const { historyList, addTermToHistory, clearHistory } = useOmniboxHistory(settings);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClear = () => {
    setLocalQuery('');
    onChange('');
    setResults([]);
    setIsOpen(false);
  };

  const handleClearHistory = () => {
    clearHistory();
    setResults([]);
    setIsOpen(false);
  };

  const handleSearch = (text) => {
    setLocalQuery(text);

    if (isImmediate) {
      onChange(text);
      if (text.trim()) {
        addTermToHistory(text);
      }
    }

    if (!text.trim()) {
      if (historyList.length > 0) {
        const recentFilters = [...historyList]
          .reverse()
          .map(term => ({
            type: 'history',
            label: term,
            value: term
          }));

        const uniqueHistory = [];
        const seenHistory = new Set();
        recentFilters.forEach(rf => {
          if (!seenHistory.has(rf.value)) {
            uniqueHistory.push(rf);
            seenHistory.add(rf.value);
          }
        });

        const finalResults = [
          { type: 'clear-history', label: 'Clear cached items' },
          ...uniqueHistory.slice(0, 8)
        ];

        setResults(finalResults);
        setSelectedIndex(finalResults.length > 1 ? 1 : 0);
        setIsOpen(true);
      } else {
        setResults([]);
        setIsOpen(false);
      }
      return;
    }

    if (!isImmediate) {
      const matches = filterEmployees(employees, text, settings).map(emp => ({
        type: 'employee',
        label: `${emp[1].firstName} ${emp[1].lastName}`,
        id: emp[0],
        data: emp[1],
        original: emp
      }));

      setResults(matches);
      setSelectedIndex(0);
      setIsOpen(matches.length > 0);
    }
  };

  const handleSelect = (item) => {
    if (item.type === 'clear-history') {
      handleClearHistory();
    } else if (item.type === 'history') {
      setLocalQuery(item.value);
      onChange(item.value);
      addTermToHistory(item.value);
      setIsOpen(false);
    } else {
      const empData = item.original;
      const [, data] = empData;
      const fullName = `${data.firstName} ${data.lastName}`;

      setLocalQuery(fullName);
      onChange(fullName);
      addTermToHistory(fullName);
      setIsOpen(false);
    }
  };

  const handleKeyDown = useDropdownKeyboard({
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
  });

  const handleInputChange = (e) => handleSearch(e.target.value);
  const handleInputFocus = () => handleSearch(localQuery);
  const handleInputClick = () => !isOpen && handleSearch(localQuery);

  return (
    <div className="flex items-center gap-2">
      <div className="relative" ref={containerRef}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-light)]"/>
        <input
          type="text"
          placeholder={placeholder}
          className="pl-10 pr-10 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] w-64"
          value={localQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onClick={handleInputClick}
        />
        {localQuery && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-light)] hover:text-[var(--text)] transition-colors"
            title="Clear search"
          >
            <X className="w-4 h-4"/>
          </button>
        )}

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--bg)] border border-[var(--border)] rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
            {results.length > 0 ? (
              results.map((item, index) => (
                <OmniboxDropdownItem
                  key={item.type === 'history' ? `hist-${index}` : (item.type === 'clear-history' ? 'clear-hist' : item.id)}
                  item={item}
                  index={index}
                  isSelected={index === selectedIndex}
                  onSelect={handleSelect}
                  onMouseEnter={setSelectedIndex}
                />
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-[var(--text-light)] italic">
                No results found
              </div>
            )}
          </div>
        )}
      </div>
      {settings?.showClearFilterButton !== false && (
        <button
          onClick={handleClear}
          className="p-2 bg-[var(--bg)] border border-[var(--border)] rounded-md text-[var(--text-light)] hover:text-[var(--text)] hover:bg-[var(--accent-bg)] hover:border-[var(--accent-border)] transition-colors flex items-center justify-center"
          title="Clear employee filter"
        >
          <FilterX className="w-4 h-4"/>
        </button>
      )}
    </div>
  );
};

export default EmployeeOmnibox;
