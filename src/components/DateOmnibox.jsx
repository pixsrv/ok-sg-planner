import  { useState, useEffect, useRef } from 'react';
import { ArrowLeftRight, X, Calendar, ArrowDownToDot } from 'lucide-react';
import { getMonthName, getOrdinalSuffix, getDateFromWeek, MONTH_NAMES } from '../utils/dateUtils';

const DateOmnibox = ({ selectedWeek, selectedYear, onDateSelect, settings }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef(null);

  const [history, setHistory] = useState(() => {
    if (settings?.jumpHistoryCache === false) return { list: [], pointer: -1 };
    try {
      const stored = localStorage.getItem('ok-sg-jumps');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed.list) && parsed.list.length > 0) {
          const list = parsed.list.map(d => {
            const parts = d.split('-');
            if (parts.length === 3) {
              return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
            }
            return new Date(d);
          });
          const pointer = (typeof parsed.pointer === 'number' && parsed.pointer >= 0) ? parsed.pointer : 0;
          return { list, pointer };
        }
      }
    } catch (e) {
      console.error('Failed to parse ok-sg-jumps from localStorage', e);
    }
    const contextDate = getDateFromWeek(selectedWeek, selectedYear);
    contextDate.setHours(0, 0, 0, 0);
    return { list: [contextDate], pointer: 0 };
  });

  const [isNavigatingHistory, setIsNavigatingHistory] = useState(false);

  useEffect(() => {
    if (settings?.jumpHistoryCache === false) return;
    
    // We only want to push to history if this is a "real" change,
    // not just the initial component mount or a navigation within history.
    const contextDate = getDateFromWeek(selectedWeek, selectedYear);
    contextDate.setHours(0, 0, 0, 0);

    if (isNavigatingHistory) {
      setTimeout(() => setIsNavigatingHistory(false), 0);
      return;
    }

    // Don't add if the date is the same as the current history pointer
    if (history.pointer >= 0 && history.list[history.pointer]?.getTime() === contextDate.getTime()) {
      return;
    }

    setTimeout(() => {
      setHistory(prev => {
        // Re-verify under lock/updater just in case
        if (prev.pointer >= 0 && prev.list[prev.pointer]?.getTime() === contextDate.getTime()) {
          return prev;
        }
        
        // New entry from external source (like Timeline)
        const newList = prev.list.slice(0, prev.pointer + 1);
        newList.push(contextDate);
        
        if (newList.length > 50) {
          newList.shift();
        }
        return {
          list: newList,
          pointer: newList.length - 1
        };
      });
    }, 0);
  }, [selectedWeek, selectedYear, settings?.jumpHistoryCache, isNavigatingHistory, history.pointer, history.list]);

  useEffect(() => {
    if (settings?.jumpHistoryCache === false) return;
    try {
      localStorage.setItem('ok-sg-jumps', JSON.stringify({
        list: history.list.map(d => {
          if (!d || typeof d.getFullYear !== 'function') return null;
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${y}-${m}-${day}`;
        }).filter(Boolean),
        pointer: history.pointer
      }));
    } catch (e) {
      console.error('Failed to save ok-sg-jumps to localStorage', e);
    }
  }, [history, settings?.jumpHistoryCache]);

  const handleTodayClick = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
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
    setHistory({ list: [], pointer: -1 });
    try {
      localStorage.removeItem('ok-sg-jumps');
    } catch (e) {
      console.error('Failed to clear ok-sg-jumps from localStorage', e);
    }
    setResults([]);
    setIsOpen(false);
  };

  const handleSearch = (text) => {
    setQuery(text);

    if (!text.trim()) {
      if (history.list.length > 0) {
        // Show recent jumps (reverse history, excluding current one if it's the very last jump)
        // Actually, showing all unique recent jumps in reverse order is best
        const recentJumps = [...history.list]
          .reverse()
          .map(d => ({
            type: 'date',
            label: `${getMonthName(d.getMonth())} ${d.getDate()}${getOrdinalSuffix(d.getDate())}, ${d.getFullYear()}`,
            value: d,
            isHistory: true
          }));

        // Deduplicate
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

    const matches = [];
    const input = text.trim().toLowerCase();
    
    // Get context from currently selected week
    const contextDate = getDateFromWeek(selectedWeek, selectedYear);
    const contextMonth = contextDate.getMonth();
    const contextYear = selectedYear;

    // 1. Prefix-based parsing
    // "d" with a number
    const dMatch = input.match(/^d(\d+)$/);

    if (dMatch) {
      const day = parseInt(dMatch[1], 10);

      if (day >= 1 && day <= 31) {
        // "17th (of the current month)"
        const date1 = new Date(contextYear, contextMonth, day);

        if (date1.getMonth() === contextMonth) {
          matches.push({
            type: 'date',
            label: `${getMonthName(contextMonth)} ${day}${getOrdinalSuffix(day)}`,
            value: date1
          });
        }

        // "December 17th"
        const date2 = new Date(contextYear, 11, day);
        matches.push({
          type: 'date',
          label: `December ${day}${getOrdinalSuffix(day)}`,
          value: date2
        });
      }
    }

    // "w" with a number
    const wMatch = input.match(/^w(\d+)$/);

    if (wMatch) {
      const week = parseInt(wMatch[1], 10);

      if (week >= 1 && week <= 53) {
        matches.push({
          type: 'week',
          label: `Week ${week}`,
          weekNum: week,
          year: contextYear
        });
      }
    }

    // "m" with a number
    const mMatch = input.match(/^m(\d+)$/);

    if (mMatch) {
      const month = parseInt(mMatch[1], 10);

      if (month >= 1 && month <= 12) {
        matches.push({
          type: 'month',
          label: getMonthName(month - 1),
          monthIndex: month,
          year: contextYear
        });
      }
    }

    // "y" with a number
    const yMatch = input.match(/^y(\d+)$/);

    if (yMatch) {
      let year = parseInt(yMatch[1], 10);

      if (year < 100) year += 2000;

      matches.push({
        type: 'year',
        label: `${year}`,
        year: year
      });
    }

    // Relative movement: "-2", "+3", "+2m", "-1w", etc.
    const relMatch = input.match(/^([-+])(\d+)([dwmy]?)$/);

    if (relMatch) {
      const sign = relMatch[1];
      const amount = parseInt(relMatch[2], 10);
      const unit = relMatch[3];
      const isBack = sign === '-';
      const labelPrefix = isBack ? 'Move back' : 'Move forward';
      
      if (!unit || unit === 'd') {
        matches.push({
          type: 'move',
          unit: 'days',
          amount: isBack ? -amount : amount,
          label: `${labelPrefix} ${amount} day${amount !== 1 ? 's' : ''}`
        });
      }

      if (!unit || unit === 'w') {
        matches.push({
          type: 'move',
          unit: 'weeks',
          amount: isBack ? -amount : amount,
          label: `${labelPrefix} ${amount} week${amount !== 1 ? 's' : ''}`
        });
      }

      if (!unit || unit === 'm') {
        matches.push({
          type: 'move',
          unit: 'months',
          amount: isBack ? -amount : amount,
          label: `${labelPrefix} ${amount} month${amount !== 1 ? 's' : ''}`
        });
      }

      if (!unit || unit === 'y') {
        matches.push({
          type: 'move',
          unit: 'years',
          amount: isBack ? -amount : amount,
          label: `${labelPrefix} ${amount} year${amount !== 1 ? 's' : ''}`
        });
      }
    }

    // Space separator: "m7 d24"
    const mdMatch = input.match(/^m(\d+)\s+d(\d+)$/);

    if (mdMatch) {
      const month = parseInt(mdMatch[1], 10);
      const day = parseInt(mdMatch[2], 10);

      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        const date = new Date(contextYear, month - 1, day);

        if (date.getMonth() === month - 1) {
          matches.push({
            type: 'date',
            label: `${getMonthName(month - 1)} ${day}${getOrdinalSuffix(day)}`,
            value: date
          });
        }
      }
    }

    // 2. Try to parse as single number (Legacy/Fallback)
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

    // 3. Today recognition
    if ('today'.startsWith(input)) {
      matches.push({
        type: 'today',
        label: 'Today',
        value: new Date()
      });
    }

    // 4. Month name recognition
    const monthNamesLower = MONTH_NAMES.map(m => m.toLowerCase());
    
    monthNamesLower.forEach((name, index) => {
      if (name.startsWith(input)) {
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
    if (result.type === 'clear-history') {
      handleClearHistory();
      return;
    }
    let targetDate = null;
    if (result.type === 'date') {
      targetDate = result.value;
      onDateSelect({ date: targetDate });
    } else if (result.type === 'week') {
      onDateSelect({ weekNum: result.weekNum, year: result.year });
    } else if (result.type === 'month') {
      onDateSelect({ monthIndex: result.monthIndex, year: result.year });
    } else if (result.type === 'year') {
      onDateSelect({ type: 'year', year: result.year });
    } else if (result.type === 'today') {
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
          onKeyDown={(e) => {
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
          }}
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
                <div
                  key={idx}
                  className={`px-4 py-2 cursor-pointer text-sm flex items-center gap-3 ${
                    idx === selectedIndex ? 'bg-[var(--accent-bg)]' : 'hover:bg-[var(--accent-bg)]'
                  }`}
                  onClick={() => handleSelect(result)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  {result.type === 'clear-history' ? (
                    <>
                      <X className="w-4 h-4 text-[var(--text-light)] flex-shrink-0" />
                      <span className="text-[var(--text-light)] italic">{result.label}</span>
                    </>
                  ) : result.isHistory ? (
                    <ArrowLeftRight className="w-4 h-4 text-[var(--accent)]" />
                  ) : (
                    <Calendar className="w-4 h-4 text-[var(--text-light)]" />
                  )}
                  {result.type !== 'clear-history' && <span>{result.label}</span>}
                </div>
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
