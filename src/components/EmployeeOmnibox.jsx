import {useState, useEffect, useRef} from 'react';
import {Search, X} from 'lucide-react';
import {filterEmployees} from '../utils/employeeFilter';

const EmployeeOmnibox = ({value, onChange, employees, settings, placeholder = "Search employees..."}) => {
  const [localQuery, setLocalQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef(null);
  const isImmediate = settings?.employeeFilterImmediate !== false;

  useEffect(() => {
    setLocalQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (text) => {
    setLocalQuery(text);

    if (isImmediate) {
      onChange(text);
    }

    if (!text.trim()) {
      setResults([]);
      setIsOpen(false);

      return;
    }

    if (!isImmediate) {
      const matches = filterEmployees(employees, text, settings);

      setResults(matches);
      setSelectedIndex(0);
      setIsOpen(matches.length > 0);
    }
  };

  const handleSelect = (empData) => {
    const [, data] = empData;
    const fullName = `${data.firstName} ${data.lastName}`;

    setLocalQuery(fullName);
    onChange(fullName);
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      if (isOpen) {
        setIsOpen(false);
      } else {
        setLocalQuery('');
        onChange('');
      }
    } else if (e.key === 'ArrowDown' && isOpen) {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp' && isOpen) {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter' && isOpen) {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    }
  };

  const handleClear = () => {
    setLocalQuery('');
    onChange('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-light)]"/>
      <input
        type="text"
        placeholder={placeholder}
        className="pl-10 pr-10 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] w-64"
        value={localQuery}
        onChange={(e) => handleSearch(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (!isImmediate && localQuery.trim() && results.length > 0) {
            setIsOpen(true);
          }
        }}
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

      {isOpen && !isImmediate && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--bg)] border border-[var(--border)] rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
          {results.map((emp, index) => {
            const [id, data] = emp;
            return (
              <div
                key={id}
                className={`px-4 py-2 cursor-pointer text-sm flex flex-col ${
                  index === selectedIndex ? 'bg-[var(--accent-bg)]' : 'hover:bg-[var(--accent-bg)]'
                }`}
                onClick={() => handleSelect(emp)}
              >
                <div className="font-medium text-[var(--text)]">
                  {data.firstName} {data.lastName}
                </div>
                <div className="text-xs text-[var(--text-light)]">
                  {id}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EmployeeOmnibox;
