import {
  COORDINATE_ORDER_EMPLOYEE_DATE,
  COORDINATE_ORDERS,
  SUMMARY_COL_POSITION_RIGHT,
  SUMMARY_COL_POSITIONS,
  SUMMARY_ROW_POSITION_BOTTOM,
  SUMMARY_ROW_POSITIONS,
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

const GridSettingsTab = ({settings, onSettingChange}) => {
  const currentCoordinateOrder = settings.coordinateOrder || COORDINATE_ORDER_EMPLOYEE_DATE;
  const currentHoursStripReverseSecond = settings.hoursStripReverseSecond ?? true;
  const currentWorkLengthMinichartType = settings.workLengthMinichartType || WORK_LENGTH_MINICHART_SEGMENTED;
  const currentShowSummaryRow = settings.showSummaryRow ?? true;
  const currentShowSummaryCol = settings.showSummaryCol ?? true;
  const currentSummaryRowPosition = settings.summaryRowPosition || SUMMARY_ROW_POSITION_BOTTOM;
  const currentSummaryColPosition = settings.summaryColPosition || SUMMARY_COL_POSITION_RIGHT;

  return (
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
  );
};

export default GridSettingsTab;
