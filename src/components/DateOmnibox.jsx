import  { useState, useEffect, useRef } from 'react';
import { ArrowLeftRight, X, ArrowDownToDot } from 'lucide-react';
import { getMonthName, getOrdinalSuffix, getDateFromWeek } from '../utils/dateUtils';
import { parseDateQuery } from '../utils/parseDateQuery';
import { useJumpHistory } from '../hooks/useJumpHistory';
import DateDropdownItem from './DateDropdownItem';

const DateOmnibox = ({ selectedWeek, selectedYear, onDateSelect, settings }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef(null);

  const { historyList, addJumpToHistory, clearHistory } = useJumpHistory(settings, selectedWeek, selectedYear);

  const handleTodayClick = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    addJumpToHistory(today);
    onDateSelect({ date: today });
  };

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
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  const handleClearHistory = () => {
    clearHistory();
    setResults([]);
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      if (isOpen) {
        setIsOpen(false);
      } else if (query) {
        handleClear();
      }
    }
    if (isOpen && results.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSelect(results[selectedIndex]);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch(query);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleSearch(query);
    }
  };

  const handleSearch = (text) => {
    setQuery(text);

    if (!text.trim()) {
      if (historyList.length > 0) {
        const recentJumps = [...historyList]
          .reverse()
          .map(d => ({
            type: 'date',
            label: `${getMonthName(d.getMonth())} ${d.getDate()}${getOrdinalSuffix(d.getDate())}, ${d.getFullYear()}`,
            value: d,
            isHistory: true
          }));

        const uniqueHistory = [];
        const seenHistory = new Set();
        recentJumps.forEach(mj => {
          const key = mj.value.getTime();
          if (!seenHistory.has(key)) {
            uniqueHistory.push(mj);
            seenHistory.add(key);
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

    const contextDate = getDateFromWeek(selectedWeek, selectedYear);
    const uniqueMatches = parseDateQuery(text, contextDate);

    setResults(uniqueMatches.slice(0, 8));
    setSelectedIndex(0);
    setIsOpen(uniqueMatches.length > 0);
  };

  const handleSelect = (result) => {
    if (result.type === 'clear-history') {
      handleClearHistory();
      return;
    }
    let targetDate = null;
    if (result.type === 'date') {
      targetDate = result.value;
      addJumpToHistory(targetDate);
      onDateSelect({ date: targetDate });
    } else if (result.type === 'week') {
      const date = getDateFromWeek(result.weekNum, result.year);
      addJumpToHistory(date);
      onDateSelect({ weekNum: result.weekNum, year: result.year });
    } else if (result.type === 'month') {
      const date = new Date(result.year, result.monthIndex, 1);
      addJumpToHistory(date);
      onDateSelect({ monthIndex: result.monthIndex, year: result.year });
    } else if (result.type === 'year') {
      const date = new Date(result.year, 0, 1);
      addJumpToHistory(date);
      onDateSelect({ type: 'year', year: result.year });
    } else if (result.type === 'today') {
      addJumpToHistory(result.value);
      onDateSelect({ date: result.value });
    } else if (result.type === 'move') {
      const contextDate = getDateFromWeek(selectedWeek, selectedYear);
      
      if (result.unit === 'days') {
        targetDate = new Date(contextDate);
        targetDate.setDate(contextDate.getDate() + result.amount);
      } else if (result.unit === 'weeks') {
        targetDate = new Date(contextDate);
        targetDate.setDate(contextDate.getDate() + (result.amount * 7));
      } else if (result.unit === 'months') {
        targetDate = new Date(contextDate);
        targetDate.setMonth(contextDate.getMonth() + result.amount);
      } else if (result.unit === 'years') {
        targetDate = new Date(contextDate);
        targetDate.setFullYear(contextDate.getFullYear() + result.amount);
      }
      
      if (targetDate) {
        addJumpToHistory(targetDate);
        onDateSelect({ date: targetDate });
      }
    }

    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="flex items-center gap-2" ref={containerRef}>
      <div className="relative">
        <ArrowLeftRight className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-light)]" />
        <input
          type="text"
          placeholder="Jump to date, week or month..."
          className="pl-10 pr-10 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] w-64"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => handleSearch(query)}
          onClick={() => !isOpen && handleSearch(query)}
          onKeyDown={handleKeyDown}
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-light)] hover:text-[var(--text)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        
        {isOpen && (
          <div className="absolute z-50 mt-1 w-full bg-[var(--bg)] border border-[var(--border)] rounded-md shadow-lg overflow-hidden max-h-60 overflow-y-auto">
            {results.length > 0 ? (
              results.map((result, idx) => (
                <DateDropdownItem
                  key={idx}
                  result={result}
                  index={idx}
                  isSelected={idx === selectedIndex}
                  onSelect={handleSelect}
                  onMouseEnter={setSelectedIndex}
                />
              ))
            ) : (
               <div className="px-4 py-2 text-sm text-[var(--text-light)] italic">
                 No recent jumps found
               </div>
            )}
          </div>
        )}
      </div>
      {settings?.showTodayButton !== false && (
        <div className="flex items-center border border-[var(--border)] rounded-md overflow-hidden">
          <button
            onClick={handleTodayClick}
            className="p-2 bg-[var(--bg)] text-[var(--text)] hover:bg-[var(--accent-bg)] transition-colors"
            title="Go to today"
          >
            <ArrowDownToDot className="w-4 h-4 text-[var(--accent)]" />
          </button>
        </div>
      )}
    </div>
  );
};

export default DateOmnibox;
