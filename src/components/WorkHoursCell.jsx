import React from 'react';
import { formatTime, formatWorkDuration } from '../utils/formatters';
import HoursStrip from './HoursStrip';
import { WORK_LENGTH_MINICHART_COLORING } from '../constants/settings';

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

  // Parse work hours for coloring
  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + (minutes || 0);
  };

  const isCellColoringEnabled = settings?.workLengthMinichartType === WORK_LENGTH_MINICHART_COLORING;
  
  if (isCellColoringEnabled && cellData) {
    const startMins = parseTimeToMinutes(cellData[0]);
    const endMins = parseTimeToMinutes(cellData[1]);
    const workLengthHours = (endMins - startMins) / 60;
    const fteHours = (fte || 1) * 8;

    const isEqualFTE = Math.abs(workLengthHours - fteHours) < 0.001;
    const isUnderFTE = workLengthHours < fteHours;

    if (isEqualFTE) {
      classes.push('fte-equal');
    } else if (isUnderFTE) {
      classes.push('fte-under');
    } else {
      classes.push('fte-over');
    }
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
            type={settings?.workLengthMinichartType}
          />
        )}
      </div>
    </td>
  );
});

WorkHoursCell.displayName = 'WorkHoursCell';

export default WorkHoursCell;
