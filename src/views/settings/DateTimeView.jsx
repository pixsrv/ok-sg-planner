import 'react';

const DateTimeView = ({ settings, onSettingChange }) => {
  const dateFormats = [
    'YYYY-MM-DD',
    'DD-MM-YYYY',
    'MM/DD/YYYY',
    'YYYY/MM/DD',
    'DD.MM.YYYY'
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
      <h2>Date and Time Settings</h2>
      
      <div className="settings-panel">
        <h3>Date Format</h3>
        <div className="radio-list">
          {dateFormats.map((format) => (
            <label key={format} className="radio-item">
              <input
                type="radio"
                name="dateFormat"
                value={format}
                checked={currentDateFormat === format}
                onChange={(e) => onSettingChange('dateFormat', e.target.value)}
              />
              <span>{format}</span>
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
              <span>{format.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="settings-panel">
        <h3>Week Format</h3>
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
