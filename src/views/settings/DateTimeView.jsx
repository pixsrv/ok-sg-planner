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
  const currentTimeResolution = settings.timeResolution || 1;
  const currentTimeInputControl = settings.timeInputControl || 'system';
  const currentWorkDayLength = settings.workDayLength || '08:00';
  const currentAutoSetEndHourMode = settings.autoSetEndHourMode || 'none';
  const currentTimelineStartHour = settings.timelineStartHour ?? 0;
  const currentTimelineEndHour = settings.timelineEndHour ?? 23;
  const currentWeekStart = settings.weekStart || 'Monday';
  const currentTimelineExtension = settings.timelineExtension || '0';
  const currentCoordinateOrder = settings.coordinateOrder || 'employee-date';
  const currentStartOnMode = settings.startOnMode || 'recent';
  const currentFixedStartDate = settings.fixedStartDate || new Date().toISOString().split('T')[0];

  const coordinateOrders = [
    { id: 'employee-date', label: 'Employee (row) : Date (col)' },
    { id: 'date-employee', label: 'Date (col) : Employee (row)' }
  ];

  const timelineExtensions = [
    { id: '0', label: 'None' },
    { id: '1', label: '1 Month' },
    { id: '2', label: '2 Months' },
    { id: '3', label: '3 Months' },
  ];

  const timeResolutions = [
    { id: 1, label: '1 minute' },
    { id: 5, label: '5 minutes' },
    { id: 10, label: '10 minutes' },
    { id: 15, label: '15 minutes' },
    { id: 30, label: '30 minutes' },
    { id: 60, label: '60 minutes' },
  ];

  const timeInputControls = [
    { id: 'system', label: 'System' },
    { id: 'linear', label: 'Linear' },
    { id: 'circular', label: 'Circular' },
  ];

  const autoSetModes = [
    { id: 'none', label: 'None' },
    { id: 'fixed', label: 'Fixed Workday Length' },
    { id: 'calculated', label: 'Calculated (from FTE)' },
  ];

  const startOnModes = [
    { id: 'recent', label: 'Recent Date' },
    { id: 'today', label: 'Today' },
    { id: 'fixed', label: 'Fixed Date' },
  ];

  return (
    <div className="view-container">
      
      <div className="settings-panel">
        <h3>Start On (New Session)</h3>
        <p className="text-sm text-[var(--text-muted)] mb-3">Choose which date will be shown by default when starting a new session.</p>
        <div className="radio-list mb-4">
          {startOnModes.map((mode) => (
            <label key={mode.id} className="radio-item">
              <input
                type="radio"
                name="startOnMode"
                value={mode.id}
                checked={currentStartOnMode === mode.id}
                onChange={(e) => onSettingChange('startOnMode', e.target.value)}
              />
              <span>{mode.label}</span>
            </label>
          ))}
        </div>
        {currentStartOnMode === 'fixed' && (
          <div className="flex flex-col gap-2 pl-6 border-l-2 border-[var(--accent)]">
            <span className="text-xs font-semibold uppercase text-[var(--text-muted)]">Select Fixed Date</span>
            <input 
              type="date" 
              value={currentFixedStartDate}
              onChange={(e) => onSettingChange('fixedStartDate', e.target.value)}
              className="w-48 bg-[var(--bg)] border border-[var(--border)] rounded px-2 py-1 text-sm text-[var(--text)] focus:ring-1 focus:ring-[var(--accent)] outline-none"
            />
          </div>
        )}
      </div>

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
        <h3>Input Time Resolution</h3>
        <p className="text-sm text-[var(--text-muted)] mb-3">Reduce visual/input noise by rounding time to the selected resolution.</p>
        <div className="radio-list">
          {timeResolutions.map((res) => (
            <label key={res.id} className="radio-item">
              <input
                type="radio"
                name="timeResolution"
                value={res.id}
                checked={currentTimeResolution === res.id}
                onChange={(e) => onSettingChange('timeResolution', parseInt(e.target.value))}
              />
              <span>{res.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="settings-panel">
        <h3>Time Input Control</h3>
        <p className="text-sm text-[var(--text-muted)] mb-3">Choose the control used to input time in cells.</p>
        <div className="radio-list">
          {timeInputControls.map((ctrl) => (
            <label key={ctrl.id} className="radio-item">
              <input
                type="radio"
                name="timeInputControl"
                value={ctrl.id}
                checked={currentTimeInputControl === ctrl.id}
                onChange={(e) => onSettingChange('timeInputControl', e.target.value)}
              />
              <span>{ctrl.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="settings-panel border-t border-[var(--border)] pt-6">
        <h3 className="mb-2">Hours Timeline Auto-Set</h3>
        <p className="text-sm text-[var(--text-muted)] mb-6">Configure how the end hour is automatically set when you select a start hour.</p>
        
        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase text-[var(--text-muted)]">Work Day Length (Etat)</span>
            <input 
              type="time" 
              value={currentWorkDayLength}
              onChange={(e) => onSettingChange('workDayLength', e.target.value)}
              className="w-32 bg-[var(--bg)] border border-[var(--border)] rounded px-2 py-1 text-sm text-[var(--text)] focus:ring-1 focus:ring-[var(--accent)] outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase text-[var(--text-muted)]">Auto Set End Hour Mode</span>
            <div className="radio-list">
              {autoSetModes.map((mode) => (
                <label key={mode.id} className="radio-item">
                  <input
                    type="radio"
                    name="autoSetEndHourMode"
                    value={mode.id}
                    checked={currentAutoSetEndHourMode === mode.id}
                    onChange={(e) => onSettingChange('autoSetEndHourMode', e.target.value)}
                  />
                  <span>{mode.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="settings-panel">
        <h3>Hours Timeline Range</h3>
        <p className="text-sm text-[var(--text-muted)] mb-3">Set the earliest and latest hour displayed on the linear timeline.</p>
        <div className="flex gap-4 items-center">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold">Start Hour</span>
            <select 
              value={currentTimelineStartHour} 
              onChange={(e) => onSettingChange('timelineStartHour', parseInt(e.target.value))}
              className="bg-[var(--bg)] border border-[var(--border)] rounded px-2 py-1 text-sm text-[var(--text)]"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>{i}:00</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold">End Hour</span>
            <select 
              value={currentTimelineEndHour} 
              onChange={(e) => onSettingChange('timelineEndHour', parseInt(e.target.value))}
              className="bg-[var(--bg)] border border-[var(--border)] rounded px-2 py-1 text-sm text-[var(--text)]"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>{i}:00</option>
              ))}
            </select>
          </div>
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

      <div className="settings-panel">
        <h3>Coordinate Display Order</h3>
        <p className="text-sm text-[var(--text-muted)] mb-3">Choose the order of coordinates in the bottom hours timeline panel.</p>
        <div className="radio-list">
          {coordinateOrders.map((order) => (
            <label key={order.id} className="radio-item">
              <input
                type="radio"
                name="coordinateOrder"
                value={order.id}
                checked={currentCoordinateOrder === order.id}
                onChange={(e) => onSettingChange('coordinateOrder', e.target.value)}
              />
              <span>{order.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="settings-panel">
        <h3>Timeline Extension</h3>
        <p className="text-sm text-[var(--text-muted)] mb-3">Show additional months before and after currently displayed year.</p>
        <div className="radio-list">
          {timelineExtensions.map((ext) => (
            <label key={ext.id} className="radio-item">
              <input
                type="radio"
                name="timelineExtension"
                value={ext.id}
                checked={currentTimelineExtension === ext.id}
                onChange={(e) => onSettingChange('timelineExtension', e.target.value)}
              />
              <span>{ext.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DateTimeView;
