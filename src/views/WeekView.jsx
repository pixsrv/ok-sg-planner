import {useState} from 'react';
import {formatDate, formatTime} from '../utils/formatters';
import Timeline from '../components/Timeline';

const WeekView = ({ employees, settings }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [referenceDate, setReferenceDate] = useState(new Date());

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
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
  };

  const startOfWeek = getStartOfWeek(referenceDate);
  const currentWeekNumber = getWeekNumber(startOfWeek);
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
      weekNumber: getWeekNumber(date)
    });
  }

  const handleYearChange = (year) => {
    const yearNum = parseInt(year, 10);
    setSelectedYear(yearNum);
    
    // If we change year, we should also update referenceDate to stay within that year
    // Try to keep the same month and day, but in the new year
    const newDate = new Date(referenceDate);
    newDate.setFullYear(yearNum);
    setReferenceDate(newDate);
  };

  const handleWeekClick = (weekNum) => {
    // Find a date in the selected year that corresponds to weekNum
    // Simple way to find a date in a given ISO week:
    // 1. Start at Jan 4th (which is always in week 1)
    const d = new Date(selectedYear, 0, 4);
    // 2. Adjust to the Monday of that week
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    // 3. Add (weekNum - 1) * 7 days
    d.setDate(d.getDate() + (weekNum - 1) * 7);
    setReferenceDate(d);
  };

  const handleMonthClick = (monthIndex) => {
    // monthIndex is 1-12
    const d = new Date(selectedYear, monthIndex - 1, 1);
    setReferenceDate(d);
  };

  const employeeList = Object.values(employees || {});

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
        year={selectedYear} 
        selectedWeek={currentWeekNumber}
        onWeekClick={handleWeekClick}
        onMonthClick={handleMonthClick}
      />
      <div className="week-view-header">
        <div className="flex items-center gap-4">
          <select 
            className="year-selector bg-[var(--bg)] border border-[var(--border)] rounded px-2 py-1 text-sm font-semibold"
            value={selectedYear}
            onChange={(e) => handleYearChange(e.target.value)}
          >
            {[selectedYear - 2, selectedYear - 1, selectedYear, selectedYear + 1, selectedYear + 2].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div className="week-info">
          Week {weekDays[0]?.weekNumber} ({weekDays[0]?.date} - {weekDays[6]?.date})
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
                    <span className="week-num">Week {day.weekNumber}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employeeList.length > 0 ? (
              employeeList.map((emp, idx) => (
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
