import { DEFAULT_SETTINGS } from '../constants/settings';

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const DAY_NAMES_FULL = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

export const DAY_NAMES_SHORT = [
  'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
];

export const getMonthName = (monthIndex) => {
  return MONTH_NAMES[monthIndex];
};

export const getOrdinalSuffix = (day) => {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
};

export const getISOWeek = (d, weekStart = 'Monday') => {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);

  // If Sunday is start of week, and current date is Sunday, 
  // it should belong to the NEXT week compared to ISO (where Sunday is the end of the previous week).
  if (weekStart === 'Sunday') {
    date.setDate(date.getDate() + 1);
  }

  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const weekYear = date.getFullYear();
  const week1 = new Date(weekYear, 0, 4);
  const weekNum = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  return { weekNum, weekYear };
};

export const getDateFromWeek = (week, year, weekStart = 'Monday') => {
  const d = new Date(year, 0, 4);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff + (week - 1) * 7);
  
  if (weekStart === 'Sunday') {
    d.setDate(d.getDate() - 1);
  }
  
  return d;
};

/**
 * Checks if a given date string or Date object is a Sunday.
 * @param {string|Date} date
 * @returns {boolean}
 */
export const isSunday = (date) => {
  return new Date(date).getDay() === 0;
};

/**
 * Checks if a given date is in the working Sundays list.
 * @param {string} date - Date string in YYYY-MM-DD format.
 * @param {string} [workingSundays] - Comma-separated string of YYYY-MM-DD dates. If ommited, uses DEFAULT_SETTINGS.
 * @returns {boolean}
 */
export const isWorkingSunday = (date, workingSundays) => {
  const ws = workingSundays ?? DEFAULT_SETTINGS.workingSundays;
  if (!ws) return false;
  const list = ws.split(',').map(d => d.trim());
  return list.includes(date);
};
