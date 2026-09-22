import { useState, useEffect, useCallback, useMemo } from 'react';
import { formatDate } from '../utils/formatters';
import { getISOWeek, getDateFromWeek, DAY_NAMES_SHORT } from '../utils/dateUtils';
import { getStorageItem, setStorageItem, getSessionItem, setSessionItem } from '../utils/db';
import {
  WEEK_START_SUNDAY,
  START_ON_MODE_RECENT,
  START_ON_MODE_TODAY,
  START_ON_MODE_FIXED,
} from '../constants/settings';

export const useWeekNavigation = (settings, STORES) => {
  const [referenceDate, setReferenceDate] = useState(() => {
    // Check if this is a fresh start or a refresh
    const isRefresh = getSessionItem('session-initialized') === 'true';

    if (!isRefresh) {
      // Mark as initialized so refresh won't trigger this again
      setSessionItem('session-initialized', 'true');

      // Use settings to determine start date
      const mode = settings?.startOnMode || START_ON_MODE_RECENT;

      if (mode === START_ON_MODE_TODAY) {
        return new Date();
      } else if (mode === START_ON_MODE_FIXED && settings?.fixedStartDate) {
        const d = new Date(settings.fixedStartDate);
        if (!isNaN(d.getTime())) {
          return d;
        }
      }
      // 'recent' mode falls through to legacy logic below
    }

    // Legacy logic for 'recent' mode or refresh
    const stored = getStorageItem(STORES.CURRENT_STATE);
    if (stored?.selectedWeek) {
      const year = stored.selectedYear || new Date().getFullYear();
      return getDateFromWeek(stored.selectedWeek, year);
    }

    return new Date();
  });

  // Helper to get start of current week
  const getStartOfWeek = useCallback((date) => {
    const d = new Date(date);
    const day = d.getDay();
    const isSundayStart = settings?.weekStart === WEEK_START_SUNDAY;
    let diff;

    if (isSundayStart) {
      diff = d.getDate() - day;
    } else {
      // Monday start (ISO)
      diff = d.getDate() - day + (day === 0 ? -6 : 1);
    }
    
    const newDate = new Date(d.setDate(diff));
    newDate.setHours(0, 0, 0, 0);

    return newDate;
  }, [settings?.weekStart]);

  // Helper to get week number
  const getWeekNumber = useCallback((d) => {
    return getISOWeek(d);
  }, []);

  const startOfWeek = useMemo(() => {
    return getStartOfWeek(referenceDate);
  }, [referenceDate, getStartOfWeek]);

  const { weekNum: currentWeekNumber, weekYear: currentWeekYear } = useMemo(() => {
      return getWeekNumber(startOfWeek);
  }, [startOfWeek, getWeekNumber]);

  // Save selected week to localStorage
  useEffect(() => {
    const currentData = getStorageItem(STORES.CURRENT_STATE, {});
    currentData.selectedWeek = currentWeekNumber;
    currentData.selectedYear = currentWeekYear;
    setStorageItem(STORES.CURRENT_STATE, currentData);
  }, [currentWeekNumber, currentWeekYear, STORES.CURRENT_STATE]);

  const weekDays = useMemo(() => {
    const days = [];
    const dayNames = settings?.weekStart === WEEK_START_SUNDAY
      ? [...DAY_NAMES_SHORT]
      : [...DAY_NAMES_SHORT.slice(1), DAY_NAMES_SHORT[0]];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);

      date.setDate(startOfWeek.getDate() + i);
      days.push({
        date: formatDate(date, settings?.dateFormat),
        dayName: dayNames[i],
        weekData: getWeekNumber(date)
      });
    }
    return days;
  }, [startOfWeek, settings?.weekStart, settings?.dateFormat, getWeekNumber]);

  const handleYearChange = useCallback((year) => {
    const yearNum = parseInt(year, 10);
    
    // If we change year, we should also update referenceDate to stay within that year
    // Try to keep the same month and day, but in the new year
    setReferenceDate(prevDate => {
        const newDate = new Date(prevDate);
        newDate.setFullYear(yearNum);
        return newDate;
    });
  }, []);

  const handleWeekClick = useCallback((weekNum, weekYear) => {
    const yearToUse = weekYear || currentWeekYear;
    const newDate = getDateFromWeek(weekNum, yearToUse);

    setReferenceDate(newDate);
  }, [currentWeekYear]);

  const handleMonthClick = useCallback((monthIndex, monthYear) => {
    const yearToUse = monthYear || currentWeekYear;
    
    // monthIndex is 1-12
    const d = new Date(yearToUse, monthIndex - 1, 1);

    setReferenceDate(d);
  }, [currentWeekYear]);

  const handleDateSelect = useCallback((selection) => {
    if (selection.date) {
      setReferenceDate(selection.date);
    } else if (selection.type === 'year') {
      handleYearChange(selection.year);
    } else if (selection.weekNum) {
      handleWeekClick(selection.weekNum, selection.year);
    } else if (selection.monthIndex) {
      handleMonthClick(selection.monthIndex, selection.year);
    }
  }, [handleYearChange, handleWeekClick, handleMonthClick]);

  return {
    referenceDate,
    setReferenceDate,
    currentWeekNumber,
    currentWeekYear,
    weekDays,
    handleYearChange,
    handleWeekClick,
    handleMonthClick,
    handleDateSelect,
    getStartOfWeek,
    getWeekNumber,
    startOfWeek
  };
};
