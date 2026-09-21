import { useState } from 'react';
import { formatTime } from '../utils/formatters';

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
 */
const WorkHoursGrid = ({
  weekDays, 
  employeesList, 
  editingCell, 
  onCellClick, 
  getCellData, 
  settings 
}) => {
  const [hoveredCell, setHoveredCell] = useState(null); // { employeeId, dayDate }

  /**
   * @param {Employee} emp
   */
  const getCurrentPosition = (emp) => {
    if (!emp.terms || emp.terms.length === 0) return '';

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const currentTerm = emp.terms.find(term => {
      const from = term.validFrom;
      const to = term.validTo || '9999-12-31';

      return todayStr >= from && todayStr <= to;
    }) || emp.terms[emp.terms.length - 1];

    return currentTerm?.position || '';
  };

  const isCellSelected = (empId, dayDate) => {
    if (!editingCell) return false;
    if (editingCell.employeeId === 'ALL' && editingCell.dayDate === dayDate) return true;
    if (editingCell.dayDate === 'ALL' && editingCell.employeeId === empId) return true;
    return editingCell.employeeId === empId && editingCell.dayDate === dayDate;
  };

  const isRowSelected = (empId) => {
    return editingCell?.employeeId === empId && editingCell?.dayDate === 'ALL';
  };

  const isColSelected = (dayDate) => {
    return editingCell?.dayDate === dayDate && editingCell?.employeeId === 'ALL';
  };

  const isCellHovered = (empId, dayDate) => {
    if (!hoveredCell) return false;
    return hoveredCell.employeeId === empId || hoveredCell.dayDate === dayDate;
  };

  return (
    <div className="work-hours-grid-wrapper">
      <table className="work-hours-grid">
        <thead>
          <tr>
            <th className="employee-col-header">Employee</th>
            {weekDays.map((day, index) => {
              const isSelected = isColSelected(day.date);
              const isDirectHover = hoveredCell?.dayDate === day.date && hoveredCell?.employeeId === 'ALL';
              const isEditingCol = editingCell?.dayDate === day.date && editingCell?.employeeId !== 'ALL';
              const isCrossHover = hoveredCell?.dayDate === day.date && hoveredCell?.employeeId !== 'ALL';
              
              const isHeaderHovered = isDirectHover || isEditingCol;
              const isDirectHeaderHovered = hoveredCell?.dayDate === day.date && hoveredCell?.employeeId === 'ALL';
              
              const classes = ['day-col-header'];
              if (isDirectHeaderHovered) classes.push('hovered');
              else if (isHeaderHovered) classes.push('hovered');
              else if (isCrossHover) classes.push('hover-highlight');
              
              if (isSelected) classes.push('selected');

              return (
                <th 
                  key={index} 
                  className={classes.join(' ')}
                  onClick={() => onCellClick('ALL', day.date)}
                  onMouseEnter={() => setHoveredCell({ employeeId: 'ALL', dayDate: day.date })}
                  onMouseLeave={() => setHoveredCell(null)}
                >
                  <div className="day-header-content">
                    <span className="day-name">{day.dayName}</span>
                    <span className="day-date">{day.date}</span>
                    <span className="week-num">Week {day.weekData.weekNum}</span>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {employeesList.length > 0 ? (
            employeesList.map(([empId, emp], idx) => {
              const isRowSel = isRowSelected(empId);
              const isDirectRowHov = hoveredCell?.employeeId === empId && hoveredCell?.dayDate === 'ALL';
              const isEditingRow = editingCell?.employeeId === empId && editingCell?.dayDate !== 'ALL';
              const isCrossRowHov = hoveredCell?.employeeId === empId && hoveredCell?.dayDate !== 'ALL';
              
              const isNameCellHovered = isDirectRowHov || isEditingRow;
              const isDirectNameHovered = hoveredCell?.employeeId === empId && hoveredCell?.dayDate === 'ALL';
              
              const classes = ['employee-name-cell'];
              if (isDirectNameHovered) classes.push('hovered');
              else if (isNameCellHovered) classes.push('hovered');
              else if (isCrossRowHov) classes.push('hover-highlight');
              
              if (isRowSel) classes.push('selected');

              return (
                <tr key={idx} className={`employee-row ${isRowSel ? 'selected' : ''}`}>
                  <td 
                    className={classes.join(' ')}
                    onClick={() => onCellClick(empId, 'ALL')}
                    onMouseEnter={() => setHoveredCell({ employeeId: empId, dayDate: 'ALL' })}
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    <div className="employee-info-wrapper">
                      <div className="employee-full-name">{emp.firstName} {emp.lastName}</div>
                      <div className="employee-position">{getCurrentPosition(emp)}</div>
                    </div>
                  </td>
                  {weekDays.map((day, dayIdx) => {
                    const cellData = getCellData(empId, day.date);
                    const isSelected = isCellSelected(empId, day.date);
                    
                    // Cross highlight if hovered OR if it's in the same row/col as editingCell
                    const isInEditingRow = editingCell?.employeeId === empId && editingCell?.dayDate !== 'ALL';
                    const isInEditingCol = editingCell?.dayDate === day.date && editingCell?.employeeId !== 'ALL';
                    const isEditingCross = isInEditingRow || isInEditingCol;
                    
                    const isHovered = hoveredCell?.employeeId === empId || hoveredCell?.dayDate === day.date;
                    const isDirectHover = hoveredCell?.employeeId === empId && hoveredCell?.dayDate === day.date;

                    const classes = ['work-hours-cell'];
                    if (isDirectHover) classes.push('focused-cell');
                    else if (isHovered) classes.push('hover-highlight');
                    
                    if (isSelected) classes.push('editing');
                    else if (isEditingCross) classes.push('cross-highlight');
                    
                    return (
                      <td 
                        key={dayIdx} 
                        className={classes.join(' ')}
                        onClick={() => onCellClick(empId, day.date)}
                        onMouseEnter={() => setHoveredCell({ employeeId: empId, dayDate: day.date })}
                        onMouseLeave={() => setHoveredCell(null)}
                        data-employee-id={empId}
                        data-date={day.date}
                      >
                        <div className="work-hours-display">
                          {cellData ? (
                            <div className="work-hours-values">
                              <div className="work-hours-field">
                                <span>{formatTime(cellData[0], settings?.timeFormat)}</span>
                              </div>
                              <div className="work-hours-field">
                                <span>{formatTime(cellData[1], settings?.timeFormat)}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="empty-cell-placeholder">&nbsp;</div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={weekDays.length + 1} className="empty-state">No employees available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default WorkHoursGrid;
