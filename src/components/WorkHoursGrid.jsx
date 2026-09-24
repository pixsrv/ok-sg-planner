import  {useState} from 'react';
import DayHeaderCell from './DayHeaderCell';
import EmployeeRow from './EmployeeRow';
import { formatDuration, parseTimeToMinutes } from '../utils/formatters';

/**
 * @typedef {Object} Term
 * @property {string} validFrom
 * @property {string|null} validTo
 * @property {number} fte
 * @property {string} position
 */

/**
 * @typedef {Object} Employee
 * @property {string} firstName
 * @property {string} lastName
 * @property {Term[]} terms
 */

/**
 * @param {Object} props
 * @param {Array} props.weekDays
 * @param {Array} props.employeesList
 * @param {Object} props.editingCell
 * @param {Function} props.onCellClick
 * @param {Function} props.getCellData
 * @param {Object} props.settings
 * @param {boolean} props.allowOverwrite
 */
const WorkHoursGrid = ({
  weekDays,
  employeesList,
  editingCell,
  onCellClick,
  getCellData,
  settings,
  allowOverwrite,
}) => {
  const [hoveredCell, setHoveredCell] = useState(null); // { employeeId, dayDate }
  const showSummaryRow = settings?.showSummaryRow ?? true;
  const showSummaryCol = settings?.showSummaryCol ?? true;
  const summaryRowPosition = settings?.summaryRowPosition || 'bottom';
  const summaryColPosition = settings?.summaryColPosition || 'right';

  const isColSelected = (dayDate) => {
    return editingCell?.dayDate === dayDate && editingCell?.employeeId === 'ALL';
  };

  const isEditingRow = editingCell?.employeeId !== 'ALL' && editingCell?.dayDate !== 'ALL';
  const isEditingSummaryRow = editingCell?.employeeId === 'ALL' && editingCell?.dayDate !== 'ALL';
  const isEditingSummaryCol = editingCell?.dayDate === 'ALL' && editingCell?.employeeId !== 'ALL';

  const isMultipleSelection = editingCell?.employeeId === 'ALL' || editingCell?.dayDate === 'ALL';

  const getFTEForEmployee = (emp, dateStr) => {
    if (!emp.terms || emp.terms.length === 0) return 1.0;
    const term = emp.terms.find(term => {
      const from = term.validFrom;
      const to = term.validTo || '9999-12-31';
      return dateStr >= from && dateStr <= to;
    }) || emp.terms[emp.terms.length - 1];
    return term?.fte ?? 1.0;
  };

  const getDaySummary = (dayDate) => {
    let totalWorkdayMinutes = 0;
    let totalScheduledMinutes = 0;

    employeesList.forEach(([empId, emp]) => {
      const fte = getFTEForEmployee(emp, dayDate);
      totalWorkdayMinutes += fte * 8 * 60;

      const cellData = getCellData(empId, dayDate);
      if (cellData && cellData[0] && cellData[1]) {
        const startMins = parseTimeToMinutes(cellData[0]);
        const endMins = parseTimeToMinutes(cellData[1]);
        let duration = endMins - startMins;
        if (duration < 0) duration += 24 * 60;
        totalScheduledMinutes += duration;
      }
    });

    return {
      workdayHours: totalWorkdayMinutes / 60,
      scheduledHours: totalScheduledMinutes / 60
    };
  };

  const getTotalSummary = () => {
    let totalWorkdayMinutes = 0;
    let totalScheduledMinutes = 0;

    weekDays.forEach(day => {
      employeesList.forEach(([empId, emp]) => {
        const fte = getFTEForEmployee(emp, day.date);
        totalWorkdayMinutes += fte * 8 * 60;

        const cellData = getCellData(empId, day.date);
        if (cellData && cellData[0] && cellData[1]) {
          const startMins = parseTimeToMinutes(cellData[0]);
          const endMins = parseTimeToMinutes(cellData[1]);
          let duration = endMins - startMins;
          if (duration < 0) duration += 24 * 60;
          totalScheduledMinutes += duration;
        }
      });
    });

    return {
      workdayHours: totalWorkdayMinutes / 60,
      scheduledHours: totalScheduledMinutes / 60
    };
  };

  const totalSummary = getTotalSummary();

  const summaryRow = (
    <tr className={`summary-row ${summaryRowPosition}`}>
      <td className={`employee-name-cell summary-row-header ${summaryRowPosition}`}>
        <div className="employee-info-wrapper">
          <div className="employee-full-name">Summary</div>
          <div className="employee-position">Days</div>
        </div>
      </td>
      {showSummaryCol && summaryColPosition === 'left' && (
        <td
          className={`work-hours-cell summary-cell left total-summary-cell ${isEditingRow ? 'cross-highlight' : ''}`}>
          <div className="summary-values">
            <div className="summary-workday">{formatDuration(totalSummary.workdayHours)}</div>
            <div className="summary-scheduled">{formatDuration(totalSummary.scheduledHours)}</div>
          </div>
        </td>
      )}
      {weekDays.map((day, idx) => {
        const isInEditingCol = editingCell?.dayDate === day.date && editingCell?.employeeId !== 'ALL';
        const { workdayHours, scheduledHours } = getDaySummary(day.date);
        return (
          <td key={idx} className={`work-hours-cell summary-cell ${isInEditingCol ? 'cross-highlight' : ''}`}>
            <div className="summary-values">
              <div className="summary-workday">{formatDuration(workdayHours)}</div>
              <div className="summary-scheduled">{formatDuration(scheduledHours)}</div>
            </div>
          </td>
        );
      })}
      {showSummaryCol && summaryColPosition === 'right' && (
        <td
          className={`work-hours-cell summary-cell right total-summary-cell ${isEditingRow ? 'cross-highlight' : ''}`}>
          <div className="summary-values">
            <div className="summary-workday">{formatDuration(totalSummary.workdayHours)}</div>
            <div className="summary-scheduled">{formatDuration(totalSummary.scheduledHours)}</div>
          </div>
        </td>
      )}
    </tr>
  );

  return (
    <div className="work-hours-grid-wrapper">
      <table className="work-hours-grid">
        <thead>
        <tr>
          <th className={`employee-col-header ${isEditingSummaryRow ? 'cross-highlight' : ''}`}>Employee</th>
          {showSummaryCol && summaryColPosition === 'left' && (
            <th
              className={`summary-col-header left ${isEditingSummaryRow || isEditingSummaryCol ? 'cross-highlight' : ''}`}>
              <div className="day-header-content">
                <span className="day-name">Summary</span>
                <span className="week-num">Employees</span>
              </div>
            </th>
          )}
          {weekDays.map((day) => {
            const isSelected = isColSelected(day.date);
            const isDirectHover = hoveredCell?.dayDate === day.date && hoveredCell?.employeeId === 'ALL';
            const isEditingCol = editingCell?.dayDate === day.date && editingCell?.employeeId !== 'ALL';
            const isCrossHover = hoveredCell?.dayDate === day.date && hoveredCell?.employeeId !== 'ALL';

            const isHeaderHovered = isDirectHover || isEditingCol;

            return (
              <DayHeaderCell
                key={day.date}
                day={day}
                isSelected={isSelected}
                isDirectHeaderHovered={isDirectHover}
                isHeaderHovered={isHeaderHovered}
                isCrossHover={isCrossHover}
                onCellClick={onCellClick}
                setHoveredCell={setHoveredCell}
              />
            );
          })}
          {showSummaryCol && summaryColPosition === 'right' && (
            <th
              className={`summary-col-header right ${isEditingSummaryRow || isEditingSummaryCol ? 'cross-highlight' : ''}`}>Summary</th>
          )}
        </tr>
        </thead>
        <tbody>
        {showSummaryRow && summaryRowPosition === 'top' && summaryRow}
        {employeesList.length > 0 ? (
          employeesList.map(([empId, emp]) => {
            const isSelected = editingCell?.employeeId === empId && editingCell?.dayDate === 'ALL';
            const isDirectHover = hoveredCell?.employeeId === empId && hoveredCell?.dayDate === 'ALL';
            const isEmpEditingRow = editingCell?.employeeId === empId && editingCell?.dayDate !== 'ALL';
            const isCrossHover = hoveredCell?.employeeId === empId && hoveredCell?.dayDate !== 'ALL';

            return (
              <EmployeeRow
                key={empId}
                empId={empId}
                emp={emp}
                weekDays={weekDays}
                isSelected={isSelected}
                isDirectHover={isDirectHover}
                isEditingRow={isEmpEditingRow}
                isCrossHover={isCrossHover}
                hoveredCell={hoveredCell}
                editingCell={editingCell}
                onCellClick={onCellClick}
                setHoveredCell={setHoveredCell}
                getCellData={getCellData}
                settings={settings}
                allowOverwrite={allowOverwrite}
                isMultipleSelection={isMultipleSelection}
                showSummaryCol={showSummaryCol}
                summaryColPosition={summaryColPosition}
              />
            );
          })
        ) : (
          <tr>
            <td colSpan={weekDays.length + 1 + (showSummaryCol ? 1 : 0) + (showSummaryCol ? 1 : 0)}
              className="empty-state">No employees available
            </td>
          </tr>
        )}
        {showSummaryRow && summaryRowPosition === 'bottom' && summaryRow}
        </tbody>
      </table>
    </div>
  );
};

export default WorkHoursGrid;
