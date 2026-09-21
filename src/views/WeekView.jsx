import {useState, useEffect, useCallback, useMemo} from 'react';
import {formatDate} from '../utils/formatters';
import { getISOWeek, getDateFromWeek, DAY_NAMES_SHORT } from '../utils/dateUtils';
import { getUndoHistory, saveUndoHistory, pushAction } from '../utils/undoUtils';
import Timeline from '../components/Timeline';
import DateOmnibox from '../components/DateOmnibox';
import EmployeeOmnibox from '../components/EmployeeOmnibox';
import HoursTimeline from '../components/HoursTimeline';
import WorkHoursGrid from '../components/WorkHoursGrid.jsx';
import {
  WEEK_START_SUNDAY,
  START_ON_MODE_RECENT,
  START_ON_MODE_TODAY,
  START_ON_MODE_FIXED,
  TIME_RESOLUTION_1MI
} from '../constants/settings';
import { filterEmployees } from '../utils/employeeFilter';

/**
 * @typedef {Object} Term
 * @property {string} validFrom
 * @property {string|null} validTo
 * @property {number} fte
 * @property {string} position
 */

/**
 * @typedef {Object} Employee
 * @property {string} firstName
 * @property {string} lastName
 * @property {Term[]} terms
 */

/**
 * @param {Object} props
 * @param {Object.<string, Employee>} props.employees
 * @param {Object} props.settings
 * @param {Function} props.onOpenSettingsView
 */
const WeekView = ({ employees, settings, onOpenSettingsView }) => {
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState('');
  const [referenceDate, setReferenceDate] = useState(() => {
    // Check if this is a fresh start or a refresh
    const isRefresh = sessionStorage.getItem('ok-sg-session-initialized') === 'true';

    if (!isRefresh) {
      // Mark as initialized so refresh won't trigger this again
      sessionStorage.setItem('ok-sg-session-initialized', 'true');

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
    try {
      const stored = localStorage.getItem('ok-sg-current');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.selectedWeek) {
          const year = parsed.selectedYear || new Date().getFullYear();
          return getDateFromWeek(parsed.selectedWeek, year);
        }
      }
    } catch (e) {
      console.error('Failed to parse ok-sg-current from localStorage', e);
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
  const getWeekNumber = (d) => {
    return getISOWeek(d);
  };

  const startOfWeek = useMemo(() => {
    return getStartOfWeek(referenceDate);
  }, [referenceDate, getStartOfWeek]);
  const { weekNum: currentWeekNumber, weekYear: currentWeekYear } = getWeekNumber(startOfWeek);

  // Save selected week to localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('ok-sg-current');
      let currentData = stored ? JSON.parse(stored) : {};

      currentData.selectedWeek = currentWeekNumber;
      currentData.selectedYear = currentWeekYear;
      localStorage.setItem('ok-sg-current', JSON.stringify(currentData));
    } catch (e) {
      console.error('Failed to save ok-sg-current to localStorage', e);
    }
  }, [currentWeekNumber, currentWeekYear]);

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
  }, [startOfWeek, settings?.weekStart, settings?.dateFormat]);

  const handleYearChange = (year) => {
    const yearNum = parseInt(year, 10);
    
    // If we change year, we should also update referenceDate to stay within that year
    // Try to keep the same month and day, but in the new year
    const newDate = new Date(referenceDate);

    newDate.setFullYear(yearNum);
    setReferenceDate(newDate);
  };

  const handleWeekClick = (weekNum, weekYear) => {
    const yearToUse = weekYear || currentWeekYear;
    const newDate = getDateFromWeek(weekNum, yearToUse);

    setReferenceDate(newDate);
  };

  const handleMonthClick = (monthIndex, monthYear) => {
    const yearToUse = monthYear || currentWeekYear;
    
    // monthIndex is 1-12
    const d = new Date(yearToUse, monthIndex - 1, 1);

    setReferenceDate(d);
  };

  const handleDateSelect = (selection) => {
    if (selection.date) {
      setReferenceDate(selection.date);
    } else if (selection.type === 'year') {
      handleYearChange(selection.year);
    } else if (selection.weekNum) {
      handleWeekClick(selection.weekNum, selection.year);
    } else if (selection.monthIndex) {
      handleMonthClick(selection.monthIndex, selection.year);
    }
  };

  const [editingCell, setEditingCell] = useState(null); // { employeeId, dayDate }
  const [allowOverwrite, setAllowOverwrite] = useState(false);
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
      try {
        localStorage.setItem(`ok-sg-${ymKey}`, JSON.stringify(newMonthData));
      } catch (e) {
        console.error('Failed to save record to localStorage', e);
      }

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

  const handleCoordinateDoubleClick = useCallback(() => {
    if (!editingCell) return;
    
    // 1. Select proper week
    const dateObj = new Date(editingCell.dayDate);
    if (!isNaN(dateObj.getTime())) {
      setReferenceDate(dateObj);
    }

    // 2. Ensure visible
    setTimeout(() => {
      const cell = document.querySelector(
        `[data-employee-id="${editingCell.employeeId}"][data-date="${editingCell.dayDate}"]`
      );
      if (cell) {
        cell.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        
        // Brief highlight effect
        cell.classList.add('highlight-flash');
        setTimeout(() => cell.classList.remove('highlight-flash'), 2000);
      }
    }, 50);
  }, [editingCell]);

  const handleCellClick = (employeeId, dayDate) => {
    setEditingCell({ employeeId, dayDate });
  };

  useEffect(() => {
    if (editingCell) {
      // Small timeout to ensure the 'editing' class is applied and panel animation starts
      setTimeout(() => {
        const cell = document.querySelector(`.work-hours-cell.editing`);
        if (cell) {
          const panelHeight = 250;
          const viewportHeight = window.innerHeight;
          const rect = cell.getBoundingClientRect();
          
          if (rect.bottom > viewportHeight - panelHeight) {
            cell.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, 100);
    }
  }, [editingCell]);

  const handleCancelEdit = () => {
    setEditingCell(null);
  };

  const handleTimeChange = (employeeId, dayDate, type, value) => {
    const roundValue = (val) => {
      if (val && settings?.timeResolution && settings.timeResolution > TIME_RESOLUTION_1MI) {
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
  };

  const handleClearCell = (employeeId, dayDate) => {
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
  };

  const hasSelectedData = useMemo(() => {
    if (!editingCell) return false;
    
    if (editingCell.employeeId === 'ALL' && editingCell.dayDate !== 'ALL') {
      return Object.keys(employees).some(empId => {
        const data = getCellData(empId, editingCell.dayDate);
        return data !== undefined && data !== null;
      });
    } else if (editingCell.dayDate === 'ALL' && editingCell.employeeId !== 'ALL') {
      return weekDays.some(day => {
        const data = getCellData(editingCell.employeeId, day.date);
        return data !== undefined && data !== null;
      });
    }
    return false;
  }, [editingCell, employees, weekDays, getCellData]);

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
        const key = `ok-sg-${ym}`;
        try {
          const data = localStorage.getItem(key);
          if (data) {
            records[ym] = JSON.parse(data);
          } else {
            records[ym] = {};
          }
        } catch (e) {
          console.error(`Failed to load records for ${key}`, e);
          records[ym] = {};
        }
      });
      setWorkRecords(records);
    };

    loadRecords();
  }, [weekDays]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && editingCell) {
        handleCancelEdit();
      }
      if (e.key === 'Enter' && editingCell) {
        setEditingCell(null);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingCell, handleUndo, handleRedo]);

  const filteredEmployeesList = filterEmployees(employees, employeeSearchQuery, settings);

  return (
    <div className={`view-container ${editingCell ? 'has-panel' : ''}`}>
      <Timeline 
        year={currentWeekYear} 
        selectedWeek={currentWeekNumber}
        onWeekClick={handleWeekClick}
        onMonthClick={handleMonthClick}
        settings={settings}
      />
      <div className="week-view-header">
        <div className="flex items-center gap-4">
          <EmployeeOmnibox 
            value={employeeSearchQuery} 
            onChange={setEmployeeSearchQuery} 
            employees={employees}
            settings={settings}
          />
          <DateOmnibox 
            key={settings?.jumpHistoryCache}
            selectedWeek={currentWeekNumber}
            selectedYear={currentWeekYear}
            onDateSelect={handleDateSelect}
            settings={settings}
          />
        </div>
        <div className="week-info">
          Week {weekDays[0]?.weekData.weekNum} ({weekDays[0]?.date} - {weekDays[6]?.date})
        </div>
      </div>

      <WorkHoursGrid
        weekDays={weekDays}
        employeesList={filteredEmployeesList}
        editingCell={editingCell}
        onCellClick={handleCellClick}
        getCellData={getCellData}
        settings={settings}
      />
      <div className={`hours-timeline-panel ${editingCell ? 'visible' : ''}`}>
        {editingCell && (
          <HoursTimeline
            value={commonSelectedValue}
            onChange={(type, value) => handleTimeChange(editingCell.employeeId, editingCell.dayDate, type, value)}
            onDone={() => setEditingCell(null)}
            onClear={() => handleClearCell(editingCell.employeeId, editingCell.dayDate)}
            onCancel={() => handleCancelEdit()}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onOpenSettings={() => onOpenSettingsView?.('DateTime')}
            onCoordinateDoubleClick={handleCoordinateDoubleClick}
            settings={settings}
            employee={editingCell.employeeId === 'ALL' ? null : employees[editingCell.employeeId]}
            dayDate={editingCell.dayDate}
            weekRange={weekDays.length > 0 ? `${weekDays[0].date} - ${weekDays[weekDays.length - 1].date}` : ''}
            allowOverwrite={allowOverwrite}
            onAllowOverwriteChange={setAllowOverwrite}
            hasSelectedData={hasSelectedData}
          />
        )}
      </div>
    </div>
  );
};

export default WeekView;
