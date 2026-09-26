import { useState, useEffect, useCallback } from 'react';
import { getStorageItem, setStorageItem, STORES } from '../utils/db';

/**
 * Hook for managing employee days off (vacations, bank holidays, etc.)
 * Store structure:
 * {
 *   [employeeId]: {
 *     vacations: [],
 *     bankHolidays: [],
 *     excused: [],
 *     compensations: []
 *   }
 * }
 */
export const useDaysOff = () => {
  const [daysOff, setDaysOff] = useState({});

  useEffect(() => {
    const data = getStorageItem(STORES.DAYS_OFF, {});
    setDaysOff(data);
  }, []);

  const saveDaysOff = useCallback((newData) => {
    setDaysOff(newData);
    setStorageItem(STORES.DAYS_OFF, newData);
  }, []);

  const getEmployeeDaysOff = useCallback((employeeId) => {
    return daysOff[employeeId] || {
      vacations: [],
      bankHolidays: [],
      excused: [],
      compensations: []
    };
  }, [daysOff]);

  const updateEmployeeDaysOff = useCallback((employeeId, type, items) => {
    const current = getEmployeeDaysOff(employeeId);
    const updated = {
      ...daysOff,
      [employeeId]: {
        ...current,
        [type]: items
      }
    };
    saveDaysOff(updated);
  }, [daysOff, getEmployeeDaysOff, saveDaysOff]);

  return {
    daysOff,
    getEmployeeDaysOff,
    updateEmployeeDaysOff,
    saveDaysOff
  };
};
