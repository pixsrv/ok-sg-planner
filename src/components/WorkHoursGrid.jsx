import { useState } from 'react';
import DayHeaderCell from './DayHeaderCell';
import EmployeeRow from './EmployeeRow';

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
  allowOverwrite
}) => {
  const [hoveredCell, setHoveredCell] = useState(null); // { employeeId, dayDate }

  const isColSelected = (dayDate) => {
    return editingCell?.dayDate === dayDate && editingCell?.employeeId === 'ALL';
  };

  const isMultipleSelection = editingCell?.employeeId === 'ALL' || editingCell?.dayDate === 'ALL';

  return (
    <div className="work-hours-grid-wrapper">
      <table className="work-hours-grid">
        <thead>
          <tr>
            <th className="employee-col-header">Employee</th>
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
          </tr>
        </thead>
        <tbody>
          {employeesList.length > 0 ? (
            employeesList.map(([empId, emp]) => {
              const isSelected = editingCell?.employeeId === empId && editingCell?.dayDate === 'ALL';
              const isDirectHover = hoveredCell?.employeeId === empId && hoveredCell?.dayDate === 'ALL';
              const isEditingRow = editingCell?.employeeId === empId && editingCell?.dayDate !== 'ALL';
              const isCrossHover = hoveredCell?.employeeId === empId && hoveredCell?.dayDate !== 'ALL';

              return (
                <EmployeeRow
                  key={empId}
                  empId={empId}
                  emp={emp}
                  weekDays={weekDays}
                  isSelected={isSelected}
                  isDirectHover={isDirectHover}
                  isEditingRow={isEditingRow}
                  isCrossHover={isCrossHover}
                  hoveredCell={hoveredCell}
                  editingCell={editingCell}
                  onCellClick={onCellClick}
                  setHoveredCell={setHoveredCell}
                  getCellData={getCellData}
                  settings={settings}
                  allowOverwrite={allowOverwrite}
                  isMultipleSelection={isMultipleSelection}
                />
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
