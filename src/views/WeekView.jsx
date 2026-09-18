import {useState, useEffect, useCallback, useMemo} from 'react';
import {formatDate, formatTime} from '../utils/formatters';
import { getISOWeek, getDateFromWeek, DAY_NAMES_SHORT } from '../utils/dateUtils';
import { getUndoHistory, saveUndoHistory, pushAction } from '../utils/undoUtils';
import Timeline from '../components/Timeline';
import DateOmnibox from '../components/DateOmnibox';
import EmployeeOmnibox from '../components/EmployeeOmnibox';
import HoursTimeline from '../components/HoursTimeline';
import {
  WEEK_START_SUNDAY,
  START_ON_MODE_RECENT,
  START_ON_MODE_TODAY,
  START_ON_MODE_FIXED,
  TIME_RESOLUTION_1MIN
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
  const [workRecords, setWorkRecords] = useState({});

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
        const cell = document.querySelector(`.day-cell.editing`);
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
    const [year, month, day] = dayDate.split('-');
    const ymKey = `${year}-${month}`;
    const dayNum = parseInt(day, 10).toString();

    const roundValue = (val) => {
      if (val && settings?.timeResolution && settings.timeResolution > TIME_RESOLUTION_1MIN) {
        const [hours, minutes] = val.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes;
        const roundedMinutes = Math.round(totalMinutes / settings.timeResolution) * settings.timeResolution;
        
        const newHours = Math.floor(roundedMinutes / 60) % 24;
        const newMinutes = roundedMinutes % 60;
        
        return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
      }
      return val;
    };

    if (type === 'both') {
      const roundedStart = roundValue(value[0]);
      const roundedEnd = roundValue(value[1]);
      updateWorkRecord(ymKey, dayNum, employeeId, [roundedStart, roundedEnd]);
    } else {
      const roundedValue = roundValue(value);
      
      updateWorkRecord(ymKey, dayNum, employeeId, (current) => {
        const newData = [...(current || ['', ''])];
        if (type === 'start') newData[0] = roundedValue;
        else newData[1] = roundedValue;
        return newData;
      });
    }
  };

  const handleClearCell = (employeeId, dayDate) => {
    const [year, month, day] = dayDate.split('-');
    const ymKey = `${year}-${month}`;
    const dayNum = parseInt(day, 10).toString();

    updateWorkRecord(ymKey, dayNum, employeeId, null);
  };

  const getCellData = (employeeId, dayDate) => {
    const [year, month, day] = dayDate.split('-');
    const ymKey = `${year}-${month}`;
    const dayNum = parseInt(day, 10).toString();
    return workRecords[ymKey]?.[dayNum]?.[employeeId];
  };

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

  /**
   * @param {Employee} emp
   */
  const getCurrentPosition = (emp) => {
    if (!emp.terms || emp.terms.length === 0) return '';

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const currentTerm = emp.terms.find(term => {
      const from = term.validFrom;
      const to = term.validTo || '9999-12-31';

      return todayStr >= from && todayStr <= to;
    }) || emp.terms[emp.terms.length - 1];

    return currentTerm?.position || '';
  };

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

      <div className="week-grid-wrapper">
        <table className="week-grid">
          <thead>
            <tr>
              <th className="employee-col-header">Employee</th>
              {weekDays.map((day, index) => (
                <th key={index} className="day-col-header">
                  <div className="day-header-content">
                    <span className="day-name">{day.dayName}</span>
                    <span className="day-date">{day.date}</span>
                    <span className="week-num">Week {day.weekData.weekNum}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredEmployeesList.length > 0 ? (
              filteredEmployeesList.map(([empId, emp], idx) => (
                <tr key={idx} className="employee-row">
                  <td className="employee-name-cell">
                    <div className="employee-info-wrapper">
                      <div className="employee-full-name">{emp.firstName} {emp.lastName}</div>
                      <div className="employee-position">{getCurrentPosition(emp)}</div>
                    </div>
                  </td>
                  {weekDays.map((day, dayIdx) => {
                    const cellData = getCellData(empId, day.date);
                    const isEditing = editingCell?.employeeId === empId && editingCell?.dayDate === day.date;
                    
                    return (
                      <td 
                        key={dayIdx} 
                        className={`day-cell ${isEditing ? 'editing' : ''}`}
                        onClick={() => handleCellClick(empId, day.date)}
                        data-employee-id={empId}
                        data-date={day.date}
                      >
                        <div className="time-display">
                          {cellData ? (
                            <div className="time-values">
                              <div className="time-field">
                                <span>{formatTime(cellData[0], settings?.timeFormat)}</span>
                              </div>
                              <div className="time-field">
                                <span>{formatTime(cellData[1], settings?.timeFormat)}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="empty-cell-placeholder">&nbsp;</div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="empty-state">No employees available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className={`hours-timeline-panel ${editingCell ? 'visible' : ''}`}>
        {editingCell && (
          <HoursTimeline
            value={getCellData(editingCell.employeeId, editingCell.dayDate)}
            onChange={(type, value) => handleTimeChange(editingCell.employeeId, editingCell.dayDate, type, value)}
            onDone={() => setEditingCell(null)}
            onClear={() => handleClearCell(editingCell.employeeId, editingCell.dayDate)}
            onCancel={() => handleCancelEdit()}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onOpenSettings={() => onOpenSettingsView?.('DateTime')}
            onCoordinateDoubleClick={handleCoordinateDoubleClick}
            settings={settings}
            employee={employees[editingCell.employeeId]}
            dayDate={editingCell.dayDate}
          />
        )}
      </div>
    </div>
  );
};

export default WeekView;
