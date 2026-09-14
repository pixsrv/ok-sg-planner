import  { useState, useEffect, useRef } from 'react';
import { Search, X, Calendar } from 'lucide-react';

const DateOmnibox = ({ selectedWeek, selectedYear, onDateSelect}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getMonthName = (monthIndex) => {
    return new Date(2000, monthIndex).toLocaleString('default', { month: 'long' });
  };

  const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  // Helper to get year/month of a specific week
  const getDateFromWeek = (week, year) => {
    const d = new Date(year, 0, 4);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff + (week - 1) * 7);
    return d;
  };

  const handleSearch = (text) => {
    setQuery(text);
    if (!text.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const matches = [];
    const input = text.trim().toLowerCase();
    
    // Get context from currently selected week
    const contextDate = getDateFromWeek(selectedWeek, selectedYear);
    const contextMonth = contextDate.getMonth();
    const contextYear = selectedYear;

    // 1. Try to parse as single number
    if (/^\d+$/.test(input)) {
      const num = parseInt(input, 10);
      
      // Could be a day in current context month
      if (num >= 1 && num <= 31) {
        const date = new Date(contextYear, contextMonth, num);
        if (date.getMonth() === contextMonth) {
          matches.push({
            type: 'date',
            label: `${getMonthName(contextMonth)}, ${num}${getOrdinalSuffix(num)}`,
            value: date
          });
        }
      }

      // Could be a week number
      if (num >= 1 && num <= 53) {
        matches.push({
          type: 'week',
          label: `Week ${num}`,
          weekNum: num,
          year: contextYear
        });
      }

      // Could be a month number (though text months are better)
      if (num >= 1 && num <= 12) {
        matches.push({
          type: 'month',
          label: getMonthName(num - 1),
          monthIndex: num, // 1-12
          year: contextYear
        });
      }

      // 1a. Try to parse as year
      // Suggest jumping to year if it's within +/- 3 years of current context year
      const fullYear = num < 100 ? 2000 + num : num;
      if (Math.abs(fullYear - contextYear) <= 3) {
        matches.push({
          type: 'year',
          label: `${fullYear}`,
          year: fullYear
        });
      }
    }
    
    // 2. Try to parse as Month-Day or similar (12-26)
    const parts = input.split(/[-/ .]/).filter(p => p.length > 0);
    if (parts.length === 2) {
      const p1 = parseInt(parts[0], 10);
      const p2 = parseInt(parts[1], 10);

      if (!isNaN(p1) && !isNaN(p2)) {
        // Example 12-26: December, 26th
        if (p1 >= 1 && p1 <= 12 && p2 >= 1 && p2 <= 31) {
           const date = new Date(contextYear, p1 - 1, p2);
           if (date.getMonth() === p1 - 1) {
             matches.push({
               type: 'date',
               label: `${getMonthName(p1 - 1)}, ${p2}${getOrdinalSuffix(p2)}`,
               value: date
             });
           }
        }
        
        // Example 12-26: 1st December 2026 (interpreting p2 as year)
        // If p2 looks like a short year (e.g. 26) or full year (2026)
        const yearMatch = p2 < 100 ? 2000 + p2 : p2;
        if (yearMatch >= 2000 && yearMatch <= 2100) {
            // interpretation: p1 is month?
            if (p1 >= 1 && p1 <= 12) {
                matches.push({
                  type: 'month',
                  label: `1st ${getMonthName(p1 - 1)} ${yearMatch}`,
                  monthIndex: p1,
                  year: yearMatch
                });
            }
            // interpretation: p1 is week?
            if (p1 >= 1 && p1 <= 53) {
                matches.push({
                  type: 'week',
                  label: `Week ${p1} in ${yearMatch}`,
                  weekNum: p1,
                  year: yearMatch
                });
            }
        }
      }
    }

    // 3. Month name matches
    const monthNames = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ];
    
    monthNames.forEach((name, index) => {
      if (name.startsWith(input) || (input.length >= 3 && name.includes(input))) {
        matches.push({
          type: 'month',
          label: getMonthName(index),
          monthIndex: index + 1,
          year: contextYear
        });
      }
    });

    // Remove duplicates based on label
    const uniqueMatches = [];
    const seenLabels = new Set();
    matches.forEach(m => {
      if (!seenLabels.has(m.label)) {
        uniqueMatches.push(m);
        seenLabels.add(m.label);
      }
    });

    setResults(uniqueMatches.slice(0, 8)); // Limit to 8 matches
    setSelectedIndex(0);
    setIsOpen(uniqueMatches.length > 0);
  };

  const handleSelect = (result) => {
    if (result.type === 'date') {
      onDateSelect({ date: result.value });
    } else if (result.type === 'week') {
      onDateSelect({ weekNum: result.weekNum, year: result.year });
    } else if (result.type === 'month') {
      onDateSelect({ monthIndex: result.monthIndex, year: result.year });
    } else if (result.type === 'year') {
      onDateSelect({ type: 'year', year: result.year });
    }
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-light)]" />
        <input
          type="text"
          placeholder="Jump to date, week or month..."
          className="pl-10 pr-10 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] w-64"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => query && results.length > 0 && setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setQuery('');
              setResults([]);
              setIsOpen(false);
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
            } else if (e.key === 'Enter' && results.length > 0) {
              handleSelect(results[0]);
            }
          }}
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults([]); setIsOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-light)] hover:text-[var(--text)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-[var(--bg)] border border-[var(--border)] rounded-md shadow-lg overflow-hidden max-h-60 overflow-y-auto">
          {results.map((result, idx) => (
            <div
              key={idx}
              className={`px-4 py-2 cursor-pointer text-sm flex items-center gap-3 ${
                idx === selectedIndex ? 'bg-[var(--accent-bg)]' : 'hover:bg-[var(--accent-bg)]'
              }`}
              onClick={() => handleSelect(result)}
              onMouseEnter={() => setSelectedIndex(idx)}
            >
              <Calendar className="w-4 h-4 text-[var(--text-light)]" />
              <span>{result.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DateOmnibox;
