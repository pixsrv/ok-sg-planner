import 'react';
import {formatDate, formatTime} from '../utils/formatters';

const WeekView = ({ employees, settings }) => {
  // Helper to get start of current week (Monday)
  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
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

  const today = new Date();
  const startOfWeek = getStartOfWeek(today);
  const weekDays = [];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    weekDays.push({
      date: formatDate(date, settings?.dateFormat),
      dayName: dayNames[i],
      weekNumber: getWeekNumber(date)
    });
  }

  const employeeList = Object.values(employees || {});

  return (
    <div className="view-container">
      <div className="week-view-header">
        <h1>Week View</h1>
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
                    {emp.firstName} {emp.lastName}
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
