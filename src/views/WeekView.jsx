import {useState, useEffect} from 'react';
import {Calendar, ArrowLeft, ArrowRight} from 'lucide-react';
import {formatDate, formatTime} from '../utils/formatters';
import { getISOWeek, getDateFromWeek } from '../utils/dateUtils';
import Timeline from '../components/Timeline';
import DateOmnibox from '../components/DateOmnibox';
import EmployeeOmnibox from '../components/EmployeeOmnibox';
import { filterEmployees } from '../utils/employeeFilter';

const WeekView = ({ employees, settings }) => {
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState('');
  const [referenceDate, setReferenceDate] = useState(() => {
    // Try to load from localStorage
    try {
      const stored = localStorage.getItem('ok-sg-current');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.selectedWeek) {
          // Use stored year if available, otherwise current year
          const year = parsed.selectedYear || new Date().getFullYear();
          return getDateFromWeek(parsed.selectedWeek, year);
        }
      }
    } catch (e) {
      console.error('Failed to parse ok-sg-current from localStorage', e);
    }
    return new Date();
  });

  const [jumps, setJumps] = useState(() => {
    try {
      const stored = localStorage.getItem('ok-sg-jumps');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed.list) && parsed.list.length > 0) {
          return parsed.list.map(d => {
            const parts = d.split('-');
            if (parts.length === 3) {
              return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
            }
            return new Date(d);
          });
        }
      }
    } catch (e) {
      console.error('Failed to parse ok-sg-jumps from localStorage', e);
    }
    
    // Initialize with current reference date if history is empty
    const initialDate = new Date(referenceDate);
    initialDate.setHours(0, 0, 0, 0);
    return [initialDate];
  });

  const [jumpPointer, setJumpPointer] = useState(() => {
    try {
      const stored = localStorage.getItem('ok-sg-jumps');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed.pointer === 'number' && parsed.pointer >= 0) {
          return parsed.pointer;
        }
      }
      // eslint-disable-next-line no-unused-vars
    } catch (e) { /* empty */ }
    
    // If we have an initial jump (from above), pointer should be 0
    return 0;
  });

  // Track if we are navigating history to avoid adding the navigation itself to history
  const [isNavigatingHistory, setIsNavigatingHistory] = useState(false);

  // Helper to get start of current week
  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const isSundayStart = settings?.weekStart === 'Sunday';
    
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
  };

  // Helper to get week number
  const getWeekNumber = (d) => {
    return getISOWeek(d);
  };

  const startOfWeek = getStartOfWeek(referenceDate);
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

  // Save jumps to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ok-sg-jumps', JSON.stringify({
        list: jumps.map(d => {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${y}-${m}-${day}`;
        }),
        pointer: jumpPointer
      }));
    } catch (e) {
      console.error('Failed to save ok-sg-jumps to localStorage', e);
    }
  }, [jumps, jumpPointer]);


  const pushJump = (newDate) => {
    if (isNavigatingHistory) {
      setIsNavigatingHistory(false);
      return;
    }

    const dateToStore = new Date(newDate);
    dateToStore.setHours(0, 0, 0, 0);

    // Don't record if it's the same as the current jump (e.g. clicking same week)
    if (jumpPointer >= 0 && jumps[jumpPointer]?.getTime() === dateToStore.getTime()) {
      return;
    }

    const newJumps = jumps.slice(0, jumpPointer + 1);
    newJumps.push(dateToStore);
    
    // Limit history size to e.g. 50
    if (newJumps.length > 50) {
      newJumps.shift();
      setJumps(newJumps);
      setJumpPointer(newJumps.length - 1);
    } else {
      setJumps(newJumps);
      setJumpPointer(newJumps.length - 1);
    }
  };

  const handleBack = () => {
    if (jumpPointer > 0) {
      const newPointer = jumpPointer - 1;
      setIsNavigatingHistory(true);
      setJumpPointer(newPointer);
      setReferenceDate(new Date(jumps[newPointer]));
    }
  };

  const handleForward = () => {
    if (jumpPointer < jumps.length - 1) {
      const newPointer = jumpPointer + 1;
      setIsNavigatingHistory(true);
      setJumpPointer(newPointer);
      setReferenceDate(new Date(jumps[newPointer]));
    }
  };

  const weekDays = [];
  const dayNames = settings?.weekStart === 'Sunday' 
    ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    weekDays.push({
      date: formatDate(date, settings?.dateFormat),
      dayName: dayNames[i],
      weekData: getWeekNumber(date)
    });
  }

  const handleYearChange = (year) => {
    const yearNum = parseInt(year, 10);
    
    // If we change year, we should also update referenceDate to stay within that year
    // Try to keep the same month and day, but in the new year
    const newDate = new Date(referenceDate);
    newDate.setFullYear(yearNum);
    setReferenceDate(newDate);
    pushJump(newDate);
  };

  const handleWeekClick = (weekNum, weekYear) => {
    const yearToUse = weekYear || currentWeekYear;
    const newDate = getDateFromWeek(weekNum, yearToUse);
    setReferenceDate(newDate);
    pushJump(newDate);
  };

  const handleMonthClick = (monthIndex, monthYear) => {
    const yearToUse = monthYear || currentWeekYear;
    
    // monthIndex is 1-12
    const d = new Date(yearToUse, monthIndex - 1, 1);
    setReferenceDate(d);
    pushJump(d);
  };

  const handleDateSelect = (selection) => {
    let newDate = null;
    if (selection.date) {
      newDate = selection.date;
      setReferenceDate(newDate);
    } else if (selection.type === 'year') {
      handleYearChange(selection.year);
      return; // handleYearChange calls pushJump
    } else if (selection.weekNum) {
      handleWeekClick(selection.weekNum, selection.year);
      return; // handleWeekClick calls pushJump
    } else if (selection.monthIndex) {
      handleMonthClick(selection.monthIndex, selection.year);
      return; // handleMonthClick calls pushJump
    }
    
    if (newDate) {
      pushJump(newDate);
    }
  };

  const handleTodayClick = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setReferenceDate(today);
    pushJump(today);
  };

  const employeeList = Object.entries(employees || {});
  const filteredEmployees = filterEmployees(employees, employeeSearchQuery, settings);

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
    <div className="view-container">
      <Timeline 
        year={currentWeekYear} 
        selectedWeek={currentWeekNumber}
        onWeekClick={handleWeekClick}
        onMonthClick={handleMonthClick}
        settings={settings}
      />
      <div className="week-view-header">
        <div className="flex items-center gap-4">
          <EmployeeOmnibox value={employeeSearchQuery} onChange={setEmployeeSearchQuery} />
          {settings?.showOmnibox !== false && (
            <DateOmnibox 
              selectedWeek={currentWeekNumber}
              selectedYear={currentWeekYear}
              onDateSelect={handleDateSelect}
              settings={settings}
            />
          )}
          <div className="flex items-center border border-[var(--border)] rounded-md overflow-hidden">
            <button
              onClick={handleBack}
              disabled={jumpPointer <= 0}
              className="p-2 bg-[var(--bg)] text-[var(--text)] hover:bg-[var(--accent-bg)] disabled:opacity-30 disabled:hover:bg-[var(--bg)] transition-colors border-r border-[var(--border)]"
              title="Go back in history"
            >
              <ArrowLeft className="w-4 h-4"/>
            </button>
            <button
              onClick={handleForward}
              disabled={jumpPointer >= jumps.length - 1}
              className="p-2 bg-[var(--bg)] text-[var(--text)] hover:bg-[var(--accent-bg)] disabled:opacity-30 disabled:hover:bg-[var(--bg)] transition-colors"
              title="Go forward in history"
            >
              <ArrowRight className="w-4 h-4"/>
            </button>
          </div>
          <button 
            className="today-button flex items-center gap-2 px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-md text-sm font-medium text-[var(--text)] hover:bg-[var(--accent-bg)] hover:border-[var(--accent-border)] transition-colors"
            onClick={handleTodayClick}
            title="Go to today"
          >
            <Calendar className="w-4 h-4 text-[var(--accent)]" />
            <span>Today</span>
          </button>
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
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map(([, emp], idx) => (
                <tr key={idx} className="employee-row">
                  <td className="employee-name-cell">
                    <div className="employee-info-wrapper">
                      <div className="employee-full-name">{emp.firstName} {emp.lastName}</div>
                      <div className="employee-position">{getCurrentPosition(emp)}</div>
                    </div>
                  </td>
                  {weekDays.map((_, dayIdx) => (
                    <td key={dayIdx} className="day-cell">
                      <div className="time-inputs">
                        <div className="time-field">
                          <span>{formatTime("08:00", settings?.timeFormat)}</span>
                        </div>
                        <div className="time-field">
                          <span>{formatTime("16:00", settings?.timeFormat)}</span>
                        </div>
                      </div>
                    </td>
                  ))}
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
    </div>
  );
};

export default WeekView;
