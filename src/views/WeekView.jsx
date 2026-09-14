import {useState, useEffect} from 'react';
import {Calendar, Search, X} from 'lucide-react';
import {formatDate, formatTime} from '../utils/formatters';
import { getISOWeek, getDateFromWeek } from '../utils/dateUtils';
import Timeline from '../components/Timeline';
import DateOmnibox from '../components/DateOmnibox';

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
  };

  const handleWeekClick = (weekNum, weekYear) => {
    const yearToUse = weekYear || currentWeekYear;
    setReferenceDate(getDateFromWeek(weekNum, yearToUse));
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

  const handleTodayClick = () => {
    setReferenceDate(new Date());
  };

  const handleClearEmployeeSearch = () => {
    setEmployeeSearchQuery('');
  };

  const employeeList = Object.entries(employees || {});

  const filteredEmployees = employeeList.filter(([id, data]) => {
    if (!employeeSearchQuery) return true;

    const terms = employeeSearchQuery.toLowerCase().split(/\s+/).filter(term => term.length > 0);
    if (terms.length === 0) return true;

    // Every term must be found in at least one field
    return terms.every(term => {
      // Check ID
      if (id.toLowerCase().includes(term)) return true;

      // Check top-level employee data
      if (data.firstName?.toLowerCase().includes(term)) return true;
      if (data.lastName?.toLowerCase().includes(term)) return true;

      // Check terms
      return data.terms?.some(t =>
        t.position?.toLowerCase().includes(term) ||
        t.fte?.toString().toLowerCase().includes(term) ||
        formatDate(t.validFrom, settings?.dateFormat)?.toLowerCase().includes(term) ||
        (t.validTo ? formatDate(t.validTo, settings?.dateFormat) : 'present').toLowerCase().includes(term),
      );
    });
  });

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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-light)]"/>
            <input
              type="text"
              placeholder="Search employees..."
              className="pl-10 pr-10 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] w-64"
              value={employeeSearchQuery}
              onChange={(e) => setEmployeeSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  handleClearEmployeeSearch();
                }
              }}
            />
            {employeeSearchQuery && (
              <button
                onClick={handleClearEmployeeSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-light)] hover:text-[var(--text)] transition-colors"
                title="Clear search"
              >
                <X className="w-4 h-4"/>
              </button>
            )}
          </div>
          <DateOmnibox 
            selectedWeek={currentWeekNumber}
            selectedYear={currentWeekYear}
            onDateSelect={handleDateSelect}
            settings={settings}
          />
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
