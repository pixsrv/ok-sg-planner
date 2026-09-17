import {useState, useEffect} from 'react';
import {formatDate, formatTime} from '../utils/formatters';
import { getISOWeek, getDateFromWeek } from '../utils/dateUtils';
import Timeline from '../components/Timeline';
import DateOmnibox from '../components/DateOmnibox';
import EmployeeOmnibox from '../components/EmployeeOmnibox';
import SystemTimeInput from '../components/SystemTimeInput';
import HoursTimeline from '../components/HoursTimeline';
import { filterEmployees } from '../utils/employeeFilter';

const WeekView = ({ employees, settings, onOpenSettingsView }) => {
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState('');
  const [initialTime, setInitialTime] = useState(null);
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

  const [editingCell, setEditingCell] = useState(null); // { employeeId, dateKey }
  const [workRecords, setWorkRecords] = useState({});

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
  }, [referenceDate, settings?.dateFormat, weekDays.map(d => d.date).join(',')]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && editingCell) {
        handleCancelEdit(editingCell.employeeId, editingCell.dayDate);
      }
      if (e.key === 'Enter' && editingCell) {
        setEditingCell(null);
        setInitialTime(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingCell]);

  const handleCellClick = (employeeId, dayDate) => {
    setInitialTime(getCellData(employeeId, dayDate));
    setEditingCell({ employeeId, dayDate });
  };

  const handleCancelEdit = (employeeId, dayDate) => {
    if (initialTime !== null) {
      // Restore initial time
      const [year, month, day] = dayDate.split('-');
      const ymKey = `${year}-${month}`;
      const dayNum = parseInt(day, 10).toString();

      setWorkRecords(prev => {
        const newRecords = { ...prev };
        const newMonthData = { ...newRecords[ymKey] };
        const newDayData = { ...newMonthData[dayNum] };
        newDayData[employeeId] = initialTime;
        newMonthData[dayNum] = newDayData;
        newRecords[ymKey] = newMonthData;

        // Save to localStorage
        try {
          localStorage.setItem(`ok-sg-${ymKey}`, JSON.stringify(newMonthData));
        } catch (e) {
          console.error('Failed to save record to localStorage', e);
        }

        return newRecords;
      });
    }
    setEditingCell(null);
    setInitialTime(null);
  };

  const handleClearCell = (employeeId, dayDate) => {
    const [year, month, day] = dayDate.split('-');
    const ymKey = `${year}-${month}`;
    const dayNum = parseInt(day, 10).toString();

    setWorkRecords(prev => {
      const newRecords = { ...prev };
      if (!newRecords[ymKey] || !newRecords[ymKey][dayNum]) return prev;

      const newMonthData = { ...newRecords[ymKey] };
      const newDayData = { ...newMonthData[dayNum] };
      
      delete newDayData[employeeId];
      
      newMonthData[dayNum] = newDayData;
      newRecords[ymKey] = newMonthData;

      // Save to localStorage
      try {
        localStorage.setItem(`ok-sg-${ymKey}`, JSON.stringify(newMonthData));
      } catch (e) {
        console.error('Failed to save record to localStorage', e);
      }

      return newRecords;
    });
    setEditingCell(null);
    setInitialTime(null);
  };

  const handleTimeChange = (employeeId, dayDate, type, value) => {
    const [year, month, day] = dayDate.split('-');
    const ymKey = `${year}-${month}`;
    const dayNum = parseInt(day, 10).toString();

    let roundedValue = value;
    if (value && settings?.timeResolution && settings.timeResolution > 1) {
      const [hours, minutes] = value.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes;
      const roundedMinutes = Math.round(totalMinutes / settings.timeResolution) * settings.timeResolution;
      
      const newHours = Math.floor(roundedMinutes / 60) % 24;
      const newMinutes = roundedMinutes % 60;
      
      roundedValue = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
    }

    setWorkRecords(prev => {
      const newRecords = { ...prev };
      if (!newRecords[ymKey]) newRecords[ymKey] = {};
      
      const newMonthData = { ...newRecords[ymKey] };
      if (!newMonthData[dayNum]) newMonthData[dayNum] = {};
      
      const newDayData = { ...newMonthData[dayNum] };
      if (!newDayData[employeeId]) newDayData[employeeId] = ['', ''];
      
      const currentHours = [...newDayData[employeeId]];
      if (type === 'start') currentHours[0] = roundedValue;
      else currentHours[1] = roundedValue;
      
      newDayData[employeeId] = currentHours;
      newMonthData[dayNum] = newDayData;
      newRecords[ymKey] = newMonthData;

      // Save to localStorage
      try {
        localStorage.setItem(`ok-sg-${ymKey}`, JSON.stringify(newMonthData));
      } catch (e) {
        console.error('Failed to save record to localStorage', e);
      }

      return newRecords;
    });
  };

  const getCellData = (employeeId, dayDate) => {
    const [year, month, day] = dayDate.split('-');
    const ymKey = `${year}-${month}`;
    const dayNum = parseInt(day, 10).toString();
    return workRecords[ymKey]?.[dayNum]?.[employeeId];
  };

  const filteredEmployeesList = filterEmployees(employees, employeeSearchQuery, settings);

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
                        onClick={() => !isEditing && handleCellClick(empId, day.date)}
                      >
                        {isEditing ? (
                          settings?.timeInputControl === 'linear' ? (
                            <HoursTimeline
                              value={cellData}
                              onChange={(type, value) => handleTimeChange(empId, day.date, type, value)}
                              onDone={() => setEditingCell(null)}
                              onClear={() => handleClearCell(empId, day.date)}
                              onCancel={() => handleCancelEdit(empId, day.date)}
                              onOpenSettings={() => onOpenSettingsView?.('DateTime')}
                              settings={settings}
                              employee={emp}
                              dayDate={day.date}
                            />
                          ) : settings?.timeInputControl === 'circular' ? (
                            <div className="time-inputs-edit p-4 bg-[var(--code-bg)] border border-[var(--border)] rounded shadow-lg">
                              <p className="text-xs italic">Circular input not implemented yet</p>
                              <button onClick={() => setEditingCell(null)} className="mt-2 text-xs px-2 py-1 bg-[var(--accent)] text-white rounded">Close</button>
                            </div>
                          ) : (
                            <SystemTimeInput
                              value={cellData}
                              onChange={(type, value) => handleTimeChange(empId, day.date, type, value)}
                              onDone={() => setEditingCell(null)}
                              autoFocus
                            />
                          )
                        ) : (
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
                        )}
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
    </div>
  );
};

export default WeekView;
