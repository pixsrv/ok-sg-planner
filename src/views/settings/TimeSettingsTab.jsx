import {formatTime} from '../../utils/formatters';
import TimeRibbon from '../../components/TimeRibbon';
import {
  AUTO_SET_MODE_FIXED,
  AUTO_SET_MODE_NONE,
  AUTO_SET_MODES,
  TIME_FORMAT_24H,
  TIME_FORMATS,
  TIME_RESOLUTION_5MI,
  TIME_RESOLUTIONS,
} from '../../constants/settings';

const PREVIEW_DATE = new Date('2026-11-15T15:30:00');

const TimeSettingsTab = ({settings, onSettingChange}) => {
  const currentTimeFormat = settings.timeFormat || TIME_FORMAT_24H;
  const currentTimeResolution = settings.timeResolution || TIME_RESOLUTION_5MI;
  const currentWorkDayLength = settings.workDayLength || '08:00';
  const currentAutoSetEndHourMode = settings.autoSetEndHourMode || AUTO_SET_MODE_NONE;
  const currentTimelineStartHour = settings.timelineStartHour ?? 0;
  const currentTimelineEndHour = settings.timelineEndHour ?? 23;

  return (
    <>
      <div className="settings-panel">
        <h3>Time Format</h3>
        <p className="text-sm text-[var(--text-muted)] mb-4">Choose how the time should be displayed</p>
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
              <span>{format.label} ({formatTime(PREVIEW_DATE, format.id)})</span>
            </label>
          ))}
        </div>
      </div>

      <div className="settings-panel">
        <h3>Input Time Resolution</h3>
        <p className="text-sm text-[var(--text-muted)] mb-3">Reduce visual/input noise by rounding time to the
          selected resolution.</p>
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

      <div className="settings-panel border-t border-[var(--border)] pt-6">
        <h3 className="mb-2">Hours Timeline Auto-Set</h3>
        <p className="text-sm text-[var(--text-muted)] mb-6">Configure how the end hour is automatically set when
          you select a start hour.</p>

        <div className="space-y-6">
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

                  {mode.id === AUTO_SET_MODE_FIXED && (
                    <input
                      type="time"
                      value={currentWorkDayLength}
                      onChange={(e) => onSettingChange('workDayLength', e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-32 bg-[var(--bg)] border border-[var(--border)] rounded px-2 py-1 text-sm text-[var(--text)] focus:ring-1 focus:ring-[var(--selection-g2)] outline-none"
                    />
                  )}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="settings-panel">
        <h3>Hours Timeline Range</h3>
        <p className="text-sm text-[var(--text-muted)] mb-3">Set the earliest and latest hour displayed on the
          linear timeline.</p>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase text-[var(--text-muted)]">Start Hour</span>
            <div className="overflow-x-auto pb-2">
              <TimeRibbon
                items={Array.from({length: 24}, (_, i) => i)}
                activeValue={currentTimelineStartHour}
                onItemClick={(h) => onSettingChange('timelineStartHour', h)}
                type="hours"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase text-[var(--text-muted)]">End Hour</span>
            <div className="overflow-x-auto pb-2">
              <TimeRibbon
                items={Array.from({length: 24}, (_, i) => i)}
                activeValue={currentTimelineEndHour}
                onItemClick={(h) => onSettingChange('timelineEndHour', h)}
                type="hours"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TimeSettingsTab;
