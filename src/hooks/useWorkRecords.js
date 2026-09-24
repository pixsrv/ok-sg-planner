import { useState, useEffect, useCallback, useMemo } from 'react';
import { getStorageItem, setStorageItem } from '../utils/db';
import { getUndoHistory, saveUndoHistory, pushAction } from '../utils/undoUtils';
import { TIME_RESOLUTION_5MI } from '../constants/settings';

/**
 * Custom hook for managing work records, data mutation, and undo/redo logic.
 * 
 * @param {Array} weekDays
 * @param {Object} employees
 * @param {Object} settings
 * @param {boolean} allowOverwrite
 * @param {Object} editingCell - Current cell being edited { employeeId, dayDate }
 * @returns {Object}
 */
export const useWorkRecords = (weekDays, employees, settings, allowOverwrite, editingCell) => {
  const [workRecords, setWorkRecords] = useState({});

  const getCellData = useCallback((employeeId, dayDate) => {
    const [year, month, day] = dayDate.split('-');
    const ymKey = `${year}-${month}`;
    const dayNum = parseInt(day, 10).toString();
    return workRecords[ymKey]?.[dayNum]?.[employeeId];
  }, [workRecords]);

  // Track overwritable cells
  const overwritableCells = useMemo(() => {
    if (!editingCell) {
      return new Set();
    }

    const newOverwritable = new Set();
    const { employeeId, dayDate } = editingCell;

    if (employeeId === 'ALL' && dayDate !== 'ALL') {
      // Column selection
      Object.keys(employees).forEach(empId => {
        const data = getCellData(empId, dayDate);
        const isEmpty = data === undefined || data === null;
        if (allowOverwrite || isEmpty) {
          newOverwritable.add(`${empId}|${dayDate}`);
        }
      });
    } else if (dayDate === 'ALL' && employeeId !== 'ALL') {
      // Row selection
      weekDays.forEach(day => {
        const data = getCellData(employeeId, day.date);
        const isEmpty = data === undefined || data === null;
        if (allowOverwrite || isEmpty) {
          newOverwritable.add(`${employeeId}|${day.date}`);
        }
      });
    } else if (employeeId !== 'ALL' && dayDate !== 'ALL') {
      // Single cell - always overwritable if selected
      newOverwritable.add(`${employeeId}|${dayDate}`);
    }

    return newOverwritable;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingCell, allowOverwrite, weekDays, employees]); // Removed getCellData to keep cells remembered during data changes

  const updateWorkRecord = useCallback((ymKey, dayNum, employeeId, newValueOrUpdater, shouldPushHistory = true, oldVal = null) => {
    setWorkRecords(prev => {
      const newRecords = { ...prev };
      const currentMonthData = newRecords[ymKey] || {};
      const currentDayData = currentMonthData[dayNum] || {};
      
      const currentValue = currentDayData[employeeId] || null;
      const finalOldValue = oldVal !== null ? oldVal : currentValue;
      let finalNewValue;

      if (typeof newValueOrUpdater === 'function') {
        finalNewValue = newValueOrUpdater(currentValue);
      } else {
        finalNewValue = newValueOrUpdater;
      }

      const newMonthData = { ...currentMonthData };
      const newDayData = { ...currentDayData };

      if (finalNewValue === null) {
        delete newDayData[employeeId];
      } else {
        newDayData[employeeId] = finalNewValue;
      }

      newMonthData[dayNum] = newDayData;
      newRecords[ymKey] = newMonthData;

      // Save to localStorage
      setStorageItem(ymKey, newMonthData);

      if (shouldPushHistory) {
        // Use a timeout to move side effect out of the render/updater phase
        // and reduce risk of double-pushing during React StrictMode re-renders
        setTimeout(() => {
          pushAction({
            coordinate: { yearMonth: ymKey, day: parseInt(dayNum, 10), employeeId },
            oldValue: finalOldValue,
            newValue: finalNewValue
          });
        }, 0);
      }

      return newRecords;
    });
  }, []);

  const handleUndo = useCallback(() => {
    const history = getUndoHistory();
    if (history.pointer < 0) return;

    const action = history.list[history.pointer];
    const { coordinate, oldValue } = action;
    const { yearMonth, day, employeeId } = coordinate;

    updateWorkRecord(yearMonth, day.toString(), employeeId, oldValue, false);
    
    saveUndoHistory({
      ...history,
      pointer: history.pointer - 1
    });
  }, [updateWorkRecord]);

  const handleRedo = useCallback(() => {
    const history = getUndoHistory();
    if (history.pointer >= history.list.length - 1) return;

    const newPointer = history.pointer + 1;
    const action = history.list[newPointer];
    const { coordinate, newValue } = action;
    const { yearMonth, day, employeeId } = coordinate;

    updateWorkRecord(yearMonth, day.toString(), employeeId, newValue, false);

    saveUndoHistory({
      ...history,
      pointer: newPointer
    });
  }, [updateWorkRecord]);

  const handleTimeChange = useCallback((employeeId, dayDate, type, value) => {
    const roundValue = (val) => {
      if (val && settings?.timeResolution) {
        const [hours, minutes] = val.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes;
        const roundedMinutes = Math.round(totalMinutes / settings.timeResolution) * settings.timeResolution;
        
        const newHours = Math.floor(roundedMinutes / 60) % 24;
        const newMinutes = roundedMinutes % 60;
        
        return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
      }
      return val;
    };

    const processUpdate = (empId, date) => {
      if (!overwritableCells.has(`${empId}|${date}`)) {
        return;
      }

      const [year, month, day] = date.split('-');
      const ymKey = `${year}-${month}`;
      const dayNum = parseInt(day, 10).toString();

      if (type === 'both') {
        const roundedStart = roundValue(value[0]);
        const roundedEnd = roundValue(value[1]);
        updateWorkRecord(ymKey, dayNum, empId, [roundedStart, roundedEnd]);
      } else {
        const roundedValue = roundValue(value);
        updateWorkRecord(ymKey, dayNum, empId, (current) => {
          const newData = [...(current || ['', ''])];
          if (type === 'start') newData[0] = roundedValue;
          else newData[1] = roundedValue;
          return newData;
        });
      }
    };

    if (employeeId === 'ALL' && dayDate !== 'ALL') {
      // All employees for a specific day
      Object.keys(employees).forEach(empId => {
        processUpdate(empId, dayDate);
      });
    } else if (dayDate === 'ALL' && employeeId !== 'ALL') {
      // All days for a specific employee
      weekDays.forEach(day => {
        processUpdate(employeeId, day.date);
      });
    } else if (employeeId !== 'ALL' && dayDate !== 'ALL') {
      // Single cell
      processUpdate(employeeId, dayDate);
    }
  }, [overwritableCells, employees, weekDays, settings, updateWorkRecord]);

  const handleClearCell = useCallback((employeeId, dayDate) => {
    const processClear = (empId, date) => {
      if (!overwritableCells.has(`${empId}|${date}`)) {
        return;
      }

      const [year, month, day] = date.split('-');
      const ymKey = `${year}-${month}`;
      const dayNum = parseInt(day, 10).toString();

      updateWorkRecord(ymKey, dayNum, empId, null);
    };

    if (employeeId === 'ALL' && dayDate !== 'ALL') {
      Object.keys(employees).forEach(empId => {
        processClear(empId, dayDate);
      });
    } else if (dayDate === 'ALL' && employeeId !== 'ALL') {
      weekDays.forEach(day => {
        processClear(employeeId, day.date);
      });
    } else if (employeeId !== 'ALL' && dayDate !== 'ALL') {
      processClear(employeeId, dayDate);
    }
  }, [overwritableCells, employees, weekDays, updateWorkRecord]);

  const commonSelectedValue = useMemo(() => {
    if (!editingCell || overwritableCells.size === 0) return null;

    let commonStart = undefined;
    let commonEnd = undefined;
    let first = true;
    let mismatch = false;

    for (const coord of overwritableCells) {
      const [empId, date] = coord.split('|');
      const data = getCellData(empId, date);
      
      const start = data?.[0] || '';
      const end = data?.[1] || '';

      if (first) {
        commonStart = start;
        commonEnd = end;
        first = false;
      } else {
        if (start !== commonStart || end !== commonEnd) {
          mismatch = true;
          break;
        }
      }
    }

    if (mismatch || first) return null;
    return [commonStart, commonEnd];
  }, [editingCell, overwritableCells, getCellData]);

  useEffect(() => {
    const loadRecords = () => {
      const records = {};
      const yearMonths = new Set();
      
      weekDays.forEach(day => {
        const [year, month] = day.date.split('-'); // Assumes YYYY-MM-DD
        yearMonths.add(`${year}-${month}`);
      });

      yearMonths.forEach(ym => {
        records[ym] = getStorageItem(ym, {});
      });
      setWorkRecords(records);
    };

    loadRecords();
  }, [weekDays]);

  return {
    workRecords,
    handleUndo,
    handleRedo,
    handleTimeChange,
    handleClearCell,
    getCellData,
    overwritableCells,
    commonSelectedValue,
    updateWorkRecord
  };
};
