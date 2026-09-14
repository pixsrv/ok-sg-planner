import { useState, useEffect } from 'react';

const DateTimeView = ({ settings, onSettingChange }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date, format) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    switch (format) {
      case 'YYYY-MM-DD': return `${year}-${month}-${day}`;
      case 'DD-MM-YYYY': return `${day}-${month}-${year}`;
      case 'MM/DD/YYYY': return `${month}/${day}/${year}`;
      case 'YYYY/MM/DD': return `${year}/${month}/${day}`;
      case 'DD.MM.YYYY': return `${day}.${month}.${year}`;
      default: return format;
    }
  };

  const formatTime = (date, format) => {
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');

    if (format === '24h') {
      return `${String(hours).padStart(2, '0')}:${minutes}`;
    } else {
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const hours12 = hours % 12 || 12;
      return `${hours12}:${minutes} ${ampm}`;
    }
  };

  const dateFormats = [
    { id: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' },
    { id: 'DD-MM-YYYY', label: 'DD-MM-YYYY' },
    { id: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
    { id: 'YYYY/MM/DD', label: 'YYYY/MM/DD' },
    { id: 'DD.MM.YYYY', label: 'DD.MM.YYYY' }
  ];

  const timeFormats = [
    { id: '24h', label: '24 Hours' },
    { id: '12h', label: '12 Hours (AM/PM)' }
  ];

  const weekStartDays = [
    { id: 'Monday', label: 'Monday (ISO)' },
    { id: 'Sunday', label: 'Sunday' }
  ];

  const currentDateFormat = settings.dateFormat || 'YYYY-MM-DD';
  const currentTimeFormat = settings.timeFormat || '24h';
  const currentWeekStart = settings.weekStart || 'Monday';

  return (
    <div className="view-container">
      
      <div className="settings-panel">
        <h3>Date Format</h3>
        <div className="radio-list">
          {dateFormats.map((format) => (
            <label key={format.id} className="radio-item">
              <input
                type="radio"
                name="dateFormat"
                value={format.id}
                checked={currentDateFormat === format.id}
                onChange={(e) => onSettingChange('dateFormat', e.target.value)}
              />
              <span>{format.label} ({formatDate(now, format.id)})</span>
            </label>
          ))}
        </div>
      </div>

      <div className="settings-panel">
        <h3>Time Format</h3>
        <div className="radio-list">
          {timeFormats.map((format) => (
            <label key={format.id} className="radio-item">
              <input
                type="radio"
                name="timeFormat"
                value={format.id}
                checked={currentTimeFormat === format.id}
                onChange={(e) => onSettingChange('timeFormat', e.target.value)}
              />
              <span>{format.label} ({formatTime(now, format.id)})</span>
            </label>
          ))}
        </div>
      </div>

      <div className="settings-panel">
        <h3>Week Start</h3>
        <div className="radio-list">
          {weekStartDays.map((day) => (
            <label key={day.id} className="radio-item">
              <input
                type="radio"
                name="weekStart"
                value={day.id}
                checked={currentWeekStart === day.id}
                onChange={(e) => onSettingChange('weekStart', e.target.value)}
              />
              <span>{day.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DateTimeView;
