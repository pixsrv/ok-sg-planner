import { getMonthName, getOrdinalSuffix, MONTH_NAMES } from './dateUtils';

/**
 * Parses a search query for dates, weeks, months, or years.
 *
 * @param {string} query The search query string.
 * @param {Date} contextDate The reference date for relative or contextual parsing.
 * @returns {Array} An array of unique match objects.
 */
export function parseDateQuery(query, contextDate) {
  const matches = [];
  const input = query.trim().toLowerCase();
  
  if (!input) return [];

  const contextMonth = contextDate.getMonth();
  const contextYear = contextDate.getFullYear();

  // 1. Prefix-based parsing
  // "d" with a number
  const dMatch = input.match(/^d(\d+)$/);
  if (dMatch) {
    const day = parseInt(dMatch[1], 10);
    if (day >= 1 && day <= 31) {
      const date1 = new Date(contextYear, contextMonth, day);
      if (date1.getMonth() === contextMonth) {
        matches.push({
          type: 'date',
          label: `${getMonthName(contextMonth)} ${day}${getOrdinalSuffix(day)}`,
          value: date1
        });
      }
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
    if (num >= 1 && num <= 53) {
      matches.push({
        type: 'week',
        label: `Week ${num}`,
        weekNum: num,
        year: contextYear
      });
    }
    if (num >= 1 && num <= 12) {
      matches.push({
        type: 'month',
        label: getMonthName(num - 1),
        monthIndex: num,
        year: contextYear
      });
    }
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
      const yearMatch = p2 < 100 ? 2000 + p2 : p2;
      if (yearMatch >= 2000 && yearMatch <= 2100) {
          if (p1 >= 1 && p1 <= 12) {
              matches.push({
                type: 'month',
                label: `1st ${getMonthName(p1 - 1)} ${yearMatch}`,
                monthIndex: p1,
                year: yearMatch
              });
          }
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

  return uniqueMatches;
}
