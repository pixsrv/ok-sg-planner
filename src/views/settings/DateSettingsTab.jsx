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
  WEEK_START_SUNDAY,
  WEEKDAYS_SHORT,
  WEEKDAYS_SHORT_SUNDAY,
} from '../../constants/settings';

const PREVIEW_DATE = new Date('2026-11-15T15:30:00');

const TimelineExtensionPreview = ({extensionMonths}) => {
  const months = parseInt(extensionMonths);
  const maxExtension = 3;
  const totalSlots = 12 + (maxExtension * 2);

  return (
    <div className="week-schema flex gap-1">
      {Array.from({length: totalSlots}, (_, i) => {
        const slotIndex = i - maxExtension; // -3 to 14
        const isMainMonth = slotIndex >= 0 && slotIndex < 12;
        const isPreExtension = slotIndex < 0 && slotIndex >= -months;
        const isPostExtension = slotIndex >= 12 && slotIndex < 12 + months;

        if (!isMainMonth && !isPreExtension && !isPostExtension) {
          return <div key={i} className="w-8 h-8" />; // Empty slot for alignment (2rem = w-8)
        }

        let monthNum;
        if (isMainMonth) {
          monthNum = slotIndex + 1;
        } else if (isPreExtension) {
          monthNum = 12 + slotIndex + 1;
        } else {
          monthNum = slotIndex - 12 + 1;
        }

        return (
          <div
            key={i}
            className={`time-ribbon-item hours text-[0.65rem] w-8 h-8 cursor-default ${!isMainMonth ? 'timeline-schema-extension' : ''}`}
          >
            {monthNum}
          </div>
        );
      })}
    </div>
  );
};

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
        <div className="radio-list date-format-list">
          {DATE_FORMATS.map((format) => (
            <label key={format.id} className="radio-item settings-grid">
              <input
                type="radio"
                name="dateFormat"
                value={format.id}
                checked={currentDateFormat === format.id}
                onChange={(e) => onSettingChange('dateFormat', e.target.value)}
              />
              <span className="format-label">{format.label}</span>
              <span className="format-example">{formatDate(PREVIEW_DATE, format.id)}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="settings-panel">
        <h3>Week Start</h3>
        <p className="text-sm text-[var(--text-muted)] mb-4">Choose when the week starts</p>
        <div className="radio-list week-start-list">
          {WEEK_START_DAYS.map((day) => {
            const displayDays = day.id === WEEK_START_SUNDAY 
              ? WEEKDAYS_SHORT_SUNDAY 
              : WEEKDAYS_SHORT;

            return (
              <label key={day.id} className="radio-item settings-grid">
                <input
                  type="radio"
                  name="weekStart"
                  value={day.id}
                  checked={currentWeekStart === day.id}
                  onChange={(e) => onSettingChange('weekStart', e.target.value)}
                />
                <span className="format-label">{day.label}</span>
                <div className="week-schema flex gap-1">
                  {displayDays.map((d, i) => {
                    const isSunday = d === 'S';
                    return (
                      <div
                        key={i}
                        className={`time-ribbon-item hours text-[0.65rem] w-8 h-8 cursor-default ${isSunday ? 'week-schema-sunday' : ''}`}
                      >
                        {d}
                      </div>
                    );
                  })}
                </div>
              </label>
            );
          })}
        </div>
      </div>

      <div className="settings-panel" id="timeline-extension-panel">
        <h3>Timeline Extension</h3>
        <p className="text-sm text-[var(--text-muted)] mb-3">Show additional months before and after currently
          displayed year.</p>
        <div className="radio-list">
          {TIMELINE_EXTENSIONS.map((ext) => (
            <label key={ext.id} className="radio-item settings-grid">
              <input
                type="radio"
                name="timelineExtension"
                value={ext.id}
                checked={currentTimelineExtension === ext.id}
                onChange={(e) => onSettingChange('timelineExtension', e.target.value)}
              />
              <span className="format-label">{ext.label}</span>
              <TimelineExtensionPreview extensionMonths={ext.id} />
            </label>
          ))}
        </div>
      </div>
    </>
  );
};

export default DateSettingsTab;
