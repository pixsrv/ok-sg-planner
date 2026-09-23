import React from 'react';
import { formatTime, formatWorkDuration } from '../utils/formatters';
import HoursStrip from './HoursStrip';

/**
 * Individual data cell for the work hours grid.
 * Wrapped in React.memo to prevent unnecessary re-renders.
 * 
 * @param {Object} props
 * @param {string} props.empId
 * @param {string} props.dayDate
 * @param {Array|null} props.cellData
 * @param {Object} props.settings
 * @param {number} props.fte
 * @param {boolean} props.isSelected
 * @param {boolean} props.allowOverwrite
 * @param {boolean} props.isMultipleSelection
 * @param {boolean} props.isEditingCross
 * @param {boolean} props.isHovered
 * @param {boolean} props.isDirectHover
 * @param {Function} props.onCellClick
 * @param {Function} props.setHoveredCell
 */
const WorkHoursCell = React.memo(({
  empId,
  dayDate,
  cellData,
  settings,
  fte,
  isSelected,
  allowOverwrite,
  isMultipleSelection,
  isEditingCross,
  isHovered,
  isDirectHover,
  onCellClick,
  setHoveredCell
}) => {
  const [hadDataOnSelection, setHadDataOnSelection] = React.useState(null);

  React.useEffect(() => {
    if (isSelected) {
      setHadDataOnSelection(prev => {
        // Only set it when it FIRST becomes selected
        if (prev === null) return !!cellData;
        return prev;
      });
    } else {
      setHadDataOnSelection(null);
    }
  }, [isSelected, cellData]);
  const handleClick = () => {
    onCellClick(empId, dayDate);
  };

  const handleMouseEnter = () => {
    setHoveredCell({ employeeId: empId, dayDate: dayDate });
  };

  const handleMouseLeave = () => {
    setHoveredCell(null);
  };

  const classes = ['work-hours-cell'];
  if (isDirectHover) {
    classes.push('focused-cell');
  } else if (isHovered) {
    classes.push('hover-highlight');
  }

  if (isSelected) {
    if (isMultipleSelection && !allowOverwrite && hadDataOnSelection) {
      classes.push('editing-dimmed');
    } else {
      classes.push('editing');
    }
  } else if (isEditingCross) {
    classes.push('cross-highlight');
  }

  return (
    <td
      className={classes.join(' ')}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-employee-id={empId}
      data-date={dayDate}
    >
      <div className="work-hours-display">
        {cellData && (
          <div className="work-hours-values">
            <div className="work-hours-field">
              <span>{formatTime(cellData[0], settings?.timeFormat)}</span>
            </div>
            <div className="work-hours-field">
              <span>{formatTime(cellData[1], settings?.timeFormat)}</span>
              <span className="work-duration"> ({formatWorkDuration(cellData[0], cellData[1])})</span>
            </div>
          </div>
        )}
        {cellData && (
          <HoursStrip 
            startTime={cellData[0]} 
            endTime={cellData[1]} 
            fte={fte} 
            timeResolution={settings?.timeResolution} 
            reverseSecond={settings?.hoursStripReverseSecond}
          />
        )}
      </div>
    </td>
  );
});

WorkHoursCell.displayName = 'WorkHoursCell';

export default WorkHoursCell;
