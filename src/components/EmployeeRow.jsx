import React from 'react';
import WorkHoursCell from './WorkHoursCell';

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
 * Helper to get current position of an employee based on terms.
 * @param {Employee} emp
 * @param {string} todayStr
 * @returns {string}
 */
const getCurrentPosition = (emp, todayStr) => {
  if (!emp.terms || emp.terms.length === 0) return '';

  const currentTerm = emp.terms.find(term => {
    const from = term.validFrom;
    const to = term.validTo || '9999-12-31';

    return todayStr >= from && todayStr <= to;
  }) || emp.terms[emp.terms.length - 1];

  return currentTerm?.position || '';
};

/**
 * Employee row component for the WorkHoursGrid.
 * 
 * @param {Object} props
 * @param {string} props.empId
 * @param {Employee} props.emp
 * @param {Array} props.weekDays
 * @param {boolean} props.isSelected
 * @param {boolean} props.isDirectHover
 * @param {boolean} props.isEditingRow
 * @param {boolean} props.isCrossHover
 * @param {Object} props.editingCell
 * @param {Object} props.hoveredCell
 * @param {Function} props.onCellClick
 * @param {Function} props.setHoveredCell
 * @param {Function} props.getCellData
 * @param {Object} props.settings
 * @param {boolean} props.allowOverwrite
 */
const EmployeeRow = React.memo(({
  empId,
  emp,
  weekDays,
  isSelected,
  isDirectHover,
  isEditingRow,
  isCrossHover,
  editingCell,
  hoveredCell,
  onCellClick,
  setHoveredCell,
  getCellData,
  settings,
  allowOverwrite,
  isMultipleSelection
}) => {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const isNameCellHovered = isDirectHover || isEditingRow;
  
  const classes = ['employee-name-cell'];
  if (isDirectHover || isNameCellHovered) {
    classes.push('hovered');
  } else if (isCrossHover) {
    classes.push('hover-highlight');
  }
  
  if (isSelected) {
    classes.push('selected');
  }

  const handleClick = () => onCellClick(empId, 'ALL');
  const handleMouseEnter = () => setHoveredCell({ employeeId: empId, dayDate: 'ALL' });
  const handleMouseLeave = () => setHoveredCell(null);

  const isCellSelected = (dayDate) => {
    if (!editingCell) return false;
    if (editingCell.employeeId === 'ALL' && editingCell.dayDate === dayDate) return true;
    if (editingCell.dayDate === 'ALL' && editingCell.employeeId === empId) return true;
    return editingCell.employeeId === empId && editingCell.dayDate === dayDate;
  };

  return (
    <tr className={`employee-row ${isSelected ? 'selected' : ''}`}>
      <td 
        className={classes.join(' ')}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="employee-info-wrapper">
          <div className="employee-full-name">{emp.firstName} {emp.lastName}</div>
          <div className="employee-position">{getCurrentPosition(emp, todayStr)}</div>
        </div>
      </td>
      {weekDays.map((day, dayIdx) => {
        const cellData = getCellData(empId, day.date);
        const isSelected = isCellSelected(day.date);
        
        const isInEditingRow = editingCell?.employeeId === empId && editingCell?.dayDate !== 'ALL';
        const isInEditingCol = editingCell?.dayDate === day.date && editingCell?.employeeId !== 'ALL';
        const isEditingCross = isInEditingRow || isInEditingCol;
        
        const isHovered = hoveredCell?.employeeId === empId || hoveredCell?.dayDate === day.date;
        const isDirectHover = hoveredCell?.employeeId === empId && hoveredCell?.dayDate === day.date;

        return (
          <WorkHoursCell
            key={dayIdx}
            empId={empId}
            dayDate={day.date}
            cellData={cellData}
            settings={settings}
            isSelected={isSelected}
            allowOverwrite={allowOverwrite}
            isMultipleSelection={isMultipleSelection}
            isEditingCross={isEditingCross}
            isHovered={isHovered}
            isDirectHover={isDirectHover}
            onCellClick={onCellClick}
            setHoveredCell={setHoveredCell}
          />
        );
      })}
    </tr>
  );
});

EmployeeRow.displayName = 'EmployeeRow';

export default EmployeeRow;
