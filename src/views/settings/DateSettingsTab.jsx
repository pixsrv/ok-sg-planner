import {formatDate} from '../../utils/formatters';
import {
  DATE_FORMAT_YYYY_MM_DD_ISO,
  DATE_FORMATS,
  START_ON_MODE_FIXED,
  START_ON_MODES,
  TIMELINE_EXTENSION_NONE,
  TIMELINE_EXTENSIONS,
  WEEK_START_DAYS,
  WEEK_START_MONDAY,
} from '../../constants/settings';

const PREVIEW_DATE = new Date('2026-11-15T15:30:00');

const DateSettingsTab = ({settings, onSettingChange}) => {
  const currentDateFormat = settings.dateFormat || DATE_FORMAT_YYYY_MM_DD_ISO;
  const currentWeekStart = settings.weekStart || WEEK_START_MONDAY;
  const currentTimelineExtension = settings.timelineExtension || TIMELINE_EXTENSION_NONE;
  const currentStartOnMode = settings.startOnMode || 'recent';
  const currentFixedStartDate = settings.fixedStartDate || new Date().toISOString().split('T')[0];

  return (
    <>
      <div className="settings-panel">
        <h3>Start On (New Session)</h3>
        <p className="text-sm text-[var(--text-muted)] mb-4">Choose which date will be shown by default when
          starting a new session</p>
        <div className="radio-list">
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
          <div className="flex flex-col gap-2 pl-6 border-l-2 border-[var(--selection-g1)]">
            <span className="text-xs font-semibold uppercase text-[var(--text-muted)]">Select Fixed Date</span>
            <input
              type="date"
              value={currentFixedStartDate}
              onChange={(e) => onSettingChange('fixedStartDate', e.target.value)}
              className="w-48 bg-[var(--bg)] border border-[var(--border)] rounded px-2 py-1 text-sm text-[var(--text)] focus:ring-1 focus:ring-[var(--selection-g2)] outline-none"
            />
          </div>
        )}
      </div>

      <div className="settings-panel">
        <h3>Date Format</h3>
        <p className="text-sm text-[var(--text-muted)] mb-4">Choose which date date format is to be used across the
          whole app</p>
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
              <span>{format.label} ({formatDate(PREVIEW_DATE, format.id)})</span>
            </label>
          ))}
        </div>
      </div>

      <div className="settings-panel">
        <h3>Week Start</h3>
        <p className="text-sm text-[var(--text-muted)] mb-4">Choose when the week starts</p>
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

      <div className="settings-panel" id="timeline-extension-panel">
        <h3>Timeline Extension</h3>
        <p className="text-sm text-[var(--text-muted)] mb-3">Show additional months before and after currently
          displayed year.</p>
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
    </>
  );
};

export default DateSettingsTab;
