import 'react';
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

  return (
    <div className="work-hours-grid-wrapper">
      <table className="work-hours-grid">
        <thead>
          <tr>
            <th className="employee-col-header">Employee</th>
            {weekDays.map((day, index) => (
              <th key={index} className="day-col-header">
                <div className="day-header-content">
                  <span className="day-name">{day.dayName}</span>
                  <span className="day-date">{day.date}</span>
                  <span className="week-num">Week {day.weekData.weekNum}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {employeesList.length > 0 ? (
            employeesList.map(([empId, emp], idx) => (
              <tr key={idx} className="employee-row">
                <td className="employee-name-cell">
                  <div className="employee-info-wrapper">
                    <div className="employee-full-name">{emp.firstName} {emp.lastName}</div>
                    <div className="employee-position">{getCurrentPosition(emp)}</div>
                  </div>
                </td>
                {weekDays.map((day, dayIdx) => {
                  const cellData = getCellData(empId, day.date);
                  const isEditing = editingCell?.employeeId === empId && editingCell?.dayDate === day.date;
                  
                  return (
                    <td 
                      key={dayIdx} 
                      className={`work-hours-cell ${isEditing ? 'editing' : ''}`}
                      onClick={() => onCellClick(empId, day.date)}
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
            ))
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
