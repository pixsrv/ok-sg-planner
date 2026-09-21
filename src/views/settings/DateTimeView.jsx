import { useState, useEffect } from 'react';
import { formatDate, formatTime } from '../../utils/formatters';
import {
  DATE_FORMATS,
  DATE_FORMAT_YYYY_MM_DD_ISO,
  TIME_FORMATS,
  TIME_FORMAT_24H,
  WEEK_START_DAYS,
  WEEK_START_MONDAY,
  COORDINATE_ORDERS,
  COORDINATE_ORDER_EMPLOYEE_DATE,
  TIMELINE_EXTENSIONS,
  TIMELINE_EXTENSION_NONE,
  TIME_RESOLUTIONS,
  TIME_RESOLUTION_1MI,
  TIME_INPUT_CONTROLS,
  TIME_INPUT_CONTROL_SYSTEM,
  AUTO_SET_MODES,
  AUTO_SET_MODE_NONE,
  START_ON_MODES,
  START_ON_MODE_RECENT,
  START_ON_MODE_FIXED
} from '../../constants/settings';

const DateTimeView = ({ settings, onSettingChange }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);

    return () => clearInterval(timer);
  }, []);

  const currentDateFormat = settings.dateFormat || DATE_FORMAT_YYYY_MM_DD_ISO;
  const currentTimeFormat = settings.timeFormat || TIME_FORMAT_24H;
  const currentTimeResolution = settings.timeResolution || TIME_RESOLUTION_1MI;
  const currentTimeInputControl = settings.timeInputControl || TIME_INPUT_CONTROL_SYSTEM;
  const currentWorkDayLength = settings.workDayLength || '08:00';
  const currentAutoSetEndHourMode = settings.autoSetEndHourMode || AUTO_SET_MODE_NONE;
  const currentTimelineStartHour = settings.timelineStartHour ?? 0;
  const currentTimelineEndHour = settings.timelineEndHour ?? 23;
  const currentWeekStart = settings.weekStart || WEEK_START_MONDAY;
  const currentTimelineExtension = settings.timelineExtension || TIMELINE_EXTENSION_NONE;
  const currentCoordinateOrder = settings.coordinateOrder || COORDINATE_ORDER_EMPLOYEE_DATE;
  const currentStartOnMode = settings.startOnMode || START_ON_MODE_RECENT;
  const currentFixedStartDate = settings.fixedStartDate || new Date().toISOString().split('T')[0];

  return (
    <div className="view-container">
      
      <div className="settings-panel">
        <h3>Start On (New Session)</h3>
        <p className="text-sm text-[var(--text-muted)] mb-3">Choose which date will be shown by default when starting a new session.</p>
        <div className="radio-list mb-4">
          {START_ON_MODES.map((mode) => (
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
        {currentStartOnMode === START_ON_MODE_FIXED && (
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
          {DATE_FORMATS.map((format) => (
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
          {TIME_FORMATS.map((format) => (
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
          {TIME_RESOLUTIONS.map((res) => (
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
          {TIME_INPUT_CONTROLS.map((ctrl) => (
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
              {AUTO_SET_MODES.map((mode) => (
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
          {WEEK_START_DAYS.map((day) => (
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
          {COORDINATE_ORDERS.map((order) => (
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
          {TIMELINE_EXTENSIONS.map((ext) => (
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
