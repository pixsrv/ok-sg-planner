import {useEffect, useState} from 'react';
import {formatDate, formatTime} from '../../utils/formatters';
import {
  AUTO_SET_MODE_FIXED,
  AUTO_SET_MODE_NONE,
  AUTO_SET_MODES,
  COORDINATE_ORDER_EMPLOYEE_DATE,
  COORDINATE_ORDERS,
  DATE_FORMAT_YYYY_MM_DD_ISO,
  DATE_FORMATS,
  START_ON_MODE_FIXED,
  START_ON_MODE_RECENT,
  START_ON_MODES,
  SUMMARY_COL_POSITION_RIGHT,
  SUMMARY_COL_POSITIONS,
  SUMMARY_ROW_POSITION_BOTTOM,
  SUMMARY_ROW_POSITIONS,
  TIME_FORMAT_24H,
  TIME_FORMATS,
  TIME_RESOLUTION_5MI,
  TIME_RESOLUTIONS,
  TIMELINE_EXTENSION_NONE,
  TIMELINE_EXTENSIONS,
  WEEK_START_DAYS,
  WEEK_START_MONDAY,
  WORK_LENGTH_MINICHART_COLORING,
  WORK_LENGTH_MINICHART_NONE,
  WORK_LENGTH_MINICHART_SEGMENTED,
  WORK_LENGTH_MINICHART_TYPES,
} from '../../constants/settings';
import HoursStrip from '../../components/HoursStrip';

const ChartPreview = ({type, reverseSecond}) => {
  if (type === WORK_LENGTH_MINICHART_NONE) {
    return (
      <>
        <div className="flex-1"/>
        <div className="flex-1"/>
        <div className="flex-1"/>
      </>
    );
  }

  if (type === WORK_LENGTH_MINICHART_COLORING) {
    return (
      <>
        <div className="w-full relative h-8 rounded-sm overflow-hidden flex-1 work-hours-cell fte-under"
          style={{backgroundColor: 'var(--cell-bg-lt-fte)'}}/>
        <div className="w-full relative h-8 rounded-sm overflow-hidden flex-1 work-hours-cell fte-equal"
          style={{backgroundColor: 'var(--cell-bg-eq-fte)'}}/>
        <div className="w-full relative h-8 rounded-sm overflow-hidden flex-1 work-hours-cell fte-over"
          style={{backgroundColor: 'var(--cell-bg-gt-fte)'}}/>
      </>
    );
  }

  return (
    <>
      <div
        className="w-full relative h-8 flex items-center justify-center bg-[var(--hours-strip-bg)] rounded-sm overflow-hidden flex-1">
        <HoursStrip type={type} startTime="08:00" endTime="14:00" fte={1} reverseSecond={reverseSecond}/>
      </div>
      <div
        className="w-full relative h-8 flex items-center justify-center bg-[var(--hours-strip-bg)] rounded-sm overflow-hidden flex-1">
        <HoursStrip type={type} startTime="08:00" endTime="16:00" fte={1} reverseSecond={reverseSecond}/>
      </div>
      <div
        className="w-full relative h-8 flex items-center justify-center bg-[var(--hours-strip-bg)] rounded-sm overflow-hidden flex-1">
        <HoursStrip type={type} startTime="08:00" endTime="18:00" fte={1} reverseSecond={reverseSecond}/>
      </div>
    </>
  );
};

const DateTimeView = ({settings, onSettingChange}) => {
  const [now, setNow] = useState(new Date());
  const [activeTab, setActiveTab] = useState('date'); // 'date', 'time', 'grid'

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);

    return () => clearInterval(timer);
  }, []);

  const currentDateFormat = settings.dateFormat || DATE_FORMAT_YYYY_MM_DD_ISO;
  const currentTimeFormat = settings.timeFormat || TIME_FORMAT_24H;
  const currentTimeResolution = settings.timeResolution || TIME_RESOLUTION_5MI;
  const currentWorkDayLength = settings.workDayLength || '08:00';
  const currentAutoSetEndHourMode = settings.autoSetEndHourMode || AUTO_SET_MODE_NONE;
  const currentTimelineStartHour = settings.timelineStartHour ?? 0;
  const currentTimelineEndHour = settings.timelineEndHour ?? 23;
  const currentWeekStart = settings.weekStart || WEEK_START_MONDAY;
  const currentTimelineExtension = settings.timelineExtension || TIMELINE_EXTENSION_NONE;
  const currentCoordinateOrder = settings.coordinateOrder || COORDINATE_ORDER_EMPLOYEE_DATE;
  const currentStartOnMode = settings.startOnMode || START_ON_MODE_RECENT;
  const currentFixedStartDate = settings.fixedStartDate || new Date().toISOString().split('T')[0];
  const currentHoursStripReverseSecond = settings.hoursStripReverseSecond ?? true;
  const currentWorkLengthMinichartType = settings.workLengthMinichartType || WORK_LENGTH_MINICHART_SEGMENTED;
  const currentShowSummaryRow = settings.showSummaryRow ?? true;
  const currentShowSummaryCol = settings.showSummaryCol ?? true;
  const currentSummaryRowPosition = settings.summaryRowPosition || SUMMARY_ROW_POSITION_BOTTOM;
  const currentSummaryColPosition = settings.summaryColPosition || SUMMARY_COL_POSITION_RIGHT;

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({behavior: 'smooth'});
      }
    }
  }, []);

  return (
    <div className="view-container">
      <div className="tabs-container">
        <div
          className={`tab-item ${activeTab === 'date' ? 'active' : ''}`}
          onClick={() => setActiveTab('date')}
        >
          Date
        </div>
        <div
          className={`tab-item ${activeTab === 'time' ? 'active' : ''}`}
          onClick={() => setActiveTab('time')}
        >
          Time
        </div>
        <div
          className={`tab-item ${activeTab === 'grid' ? 'active' : ''}`}
          onClick={() => setActiveTab('grid')}
        >
          Grid
        </div>
      </div>

      {activeTab === 'date' && (
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
                  <span>{format.label} ({formatDate(now, format.id)})</span>
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
      )}

      {activeTab === 'time' && (
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
                  <span>{format.label} ({formatTime(now, format.id)})</span>
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
            <div className="flex gap-4 items-center">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold">Start Hour</span>
                <select
                  value={currentTimelineStartHour}
                  onChange={(e) => onSettingChange('timelineStartHour', parseInt(e.target.value))}
                  className="bg-[var(--bg)] border border-[var(--border)] rounded px-2 py-1 text-sm text-[var(--text)]"
                >
                  {Array.from({length: 24}, (_, i) => (
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
                  {Array.from({length: 24}, (_, i) => (
                    <option key={i} value={i}>{i}:00</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'grid' && (
        <>
          <div className="settings-panel">
            <h3>Coordinate Display Order</h3>
            <p className="text-sm text-[var(--text-muted)] mb-3">Choose the order of coordinates in the bottom hours
              timeline panel.</p>
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
            <h3>Summary Row & Column</h3>
            <p className="text-sm text-[var(--text-muted)] mb-3">Configure visibility of summary information in the grid.</p>

            <div className="space-y-4">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 ml-2">
                  <label className="switch">
                    <input
                      type="checkbox"
                      id="showSummaryRow"
                      checked={currentShowSummaryRow}
                      onChange={(e) => onSettingChange('showSummaryRow', e.target.checked)}
                    />
                    <span className="slider round"></span>
                  </label>
                  <label htmlFor="showSummaryRow" className="text-sm cursor-pointer">
                    Show summary row (all employees in this day)
                  </label>
                </div>

                {currentShowSummaryRow && (
                  <div className="flex flex-col gap-2 mb-2 ml-8">
                    <div className="radio-list">
                      {SUMMARY_ROW_POSITIONS.map((pos) => (
                        <label key={pos.id} className="radio-item">
                          <input
                            type="radio"
                            name="summaryRowPosition"
                            value={pos.id}
                            checked={currentSummaryRowPosition === pos.id}
                            onChange={(e) => onSettingChange('summaryRowPosition', e.target.value)}
                          />
                          <span>{pos.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 ml-2">
                  <label className="switch">
                    <input
                      type="checkbox"
                      id="showSummaryCol"
                      checked={currentShowSummaryCol}
                      onChange={(e) => onSettingChange('showSummaryCol', e.target.checked)}
                    />
                    <span className="slider round"></span>
                  </label>
                  <label htmlFor="showSummaryCol" className="text-sm cursor-pointer">
                    Show summary column (all days for this employee)
                  </label>
                </div>

                {currentShowSummaryCol && (
                  <div className="flex flex-col gap-2 ml-8">
                    <div className="radio-list">
                      {SUMMARY_COL_POSITIONS.map((pos) => (
                        <label key={pos.id} className="radio-item">
                          <input
                            type="radio"
                            name="summaryColPosition"
                            value={pos.id}
                            checked={currentSummaryColPosition === pos.id}
                            onChange={(e) => onSettingChange('summaryColPosition', e.target.value)}
                          />
                          <span>{pos.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="settings-panel">
            <h3>Work Hours Visualization</h3>
            <p className="text-sm text-[var(--text-muted)] mb-3">Configure how work hours strips are displayed.</p>

            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <div
                  className="visualization-grid-header uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-1">
                  <div/>
                  <div>Name</div>
                  <div className="text-center">&lt;FTE</div>
                  <div className="text-center">=FTE</div>
                  <div className="text-center">&gt;FTE</div>
                  <div/>
                </div>
                <div className="radio-list">
                  {WORK_LENGTH_MINICHART_TYPES.map((type) => (
                    <label key={type.id} className="radio-item visualization-grid-item">
                      <input
                        type="radio"
                        name="workLengthMinichartType"
                        value={type.id}
                        checked={currentWorkLengthMinichartType === type.id}
                        onChange={(e) => onSettingChange('workLengthMinichartType', e.target.value)}
                      />
                      <span className="text-sm">{type.label}</span>
                      <ChartPreview type={type.id} reverseSecond={currentHoursStripReverseSecond}/>
                      <div/>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hoursStripReverseSecond"
                  checked={currentHoursStripReverseSecond}
                  onChange={(e) => onSettingChange('hoursStripReverseSecond', e.target.checked)}
                  className="w-4 h-4 accent-[var(--selection-g1)]"
                />
                <label htmlFor="hoursStripReverseSecond" className="text-sm cursor-pointer">
                  Reverse second strip (exceeding FTE)
                </label>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DateTimeView;
