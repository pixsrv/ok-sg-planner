import React from 'react';
import { isSunday, isWorkingSunday } from '../utils/dateUtils';

/**
 * Individual header cell for the work hours grid.
 * Wrapped in React.memo to prevent unnecessary re-renders.
 * 
 * @param {Object} props
 * @param {Object} props.day
 * @param {boolean} props.isSelected
 * @param {boolean} props.isDirectHeaderHovered
 * @param {boolean} props.isHeaderHovered
 * @param {boolean} props.isCrossHover
 * @param {Object} props.settings
 * @param {Function} props.onCellClick
 * @param {Function} props.setHoveredCell
 */
const DayHeaderCell = React.memo(({
  day,
  isSelected,
  isDirectHeaderHovered,
  isHeaderHovered,
  isCrossHover,
  settings,
  onCellClick,
  setHoveredCell
}) => {
  const handleClick = () => {
    onCellClick('ALL', day.date);
  };

  const handleMouseEnter = () => {
    setHoveredCell({ employeeId: 'ALL', dayDate: day.date });
  };

  const handleMouseLeave = () => {
    setHoveredCell(null);
  };

  const isEditingCrossHighlight = isCrossHover || isHeaderHovered;
  
  const classes = ['day-col-header'];
  if (isDirectHeaderHovered) {
    classes.push('hovered');
  } else if (isHeaderHovered) {
    classes.push('hovered');
  } else if (isCrossHover) {
    classes.push('hover-highlight');
  }

  if (isSelected) {
    classes.push('selected');
  } else if (isEditingCrossHighlight) {
    classes.push('cross-highlight');
  }

  if (isSunday(day.date) && settings?.greyOutSundays) {
    if (!isWorkingSunday(day.date, settings?.workingSundays)) {
      classes.push('sunday-greyed-out');
    }
  }

  return (
    <th
      className={classes.join(' ')}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="day-header-content">
        <span className="day-name">{day.dayName}</span>
        <span className="day-date">{day.date}</span>
        <span className="week-num">Week {day.weekData.weekNum}</span>
      </div>
    </th>
  );
});

DayHeaderCell.displayName = 'DayHeaderCell';

export default DayHeaderCell;
