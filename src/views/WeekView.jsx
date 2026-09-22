import {useState, useEffect, useCallback, useMemo} from 'react';
import { STORES } from '../utils/db';
import { useWeekNavigation } from '../hooks/useWeekNavigation';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useWorkRecords } from '../hooks/useWorkRecords';
import Timeline from '../components/Timeline';
import DateOmnibox from '../components/DateOmnibox';
import EmployeeOmnibox from '../components/EmployeeOmnibox';
import HoursTimeline from '../components/HoursTimeline';
import WorkHoursGrid from '../components/WorkHoursGrid.jsx';
import { filterEmployees } from '../utils/employeeFilter';
import { VIEW_SETTINGS_DATE_TIME } from '../constants/views';

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
 * Isolated helper to handle DOM manipulations for scrolling and highlighting cells.
 * Used to avoid polluting the declarative component logic with imperative querySelectors.
 * 
 * @param {string} employeeId 
 * @param {string} dayDate 
 * @param {Object} options 
 * @param {boolean} [options.highlight=false]
 * @param {boolean} [options.scroll=true]
 * @param {string} [options.selector] - Optional specific selector (e.g. for .editing class)
 */
const performCellDomActions = (employeeId, dayDate, { highlight = false, scroll = true, selector } = {}) => {
  const query = selector || `[data-employee-id="${employeeId}"][data-date="${dayDate}"]`;
  const cell = document.querySelector(query);
  
  if (cell) {
    if (scroll) {
      // For general scrolling
      if (selector === '.work-hours-cell.editing') {
        const panelHeight = 250;
        const viewportHeight = window.innerHeight;
        const rect = cell.getBoundingClientRect();
        
        if (rect.bottom > viewportHeight - panelHeight) {
          cell.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        cell.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      }
    }
    
    if (highlight) {
      cell.classList.add('highlight-flash');
      setTimeout(() => cell.classList.remove('highlight-flash'), 2000);
    }
  }
};

/**
 * @param {Object} props
 * @param {Object.<string, Employee>} props.employees
 * @param {Object} props.settings
 * @param {Function} props.onOpenSettingsView
 */
const WeekView = ({ employees, settings, onOpenSettingsView }) => {
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState('');
  
  const {
    setReferenceDate,
    currentWeekNumber,
    currentWeekYear,
    weekDays,
    handleWeekClick,
    handleMonthClick,
    handleDateSelect
  } = useWeekNavigation(settings, STORES);

  const [editingCell, setEditingCell] = useState(null); // { employeeId, dayDate }
  const [allowOverwrite, setAllowOverwrite] = useState(false);

  const {
    handleUndo,
    handleRedo,
    handleTimeChange,
    handleClearCell,
    getCellData,
    commonSelectedValue
  } = useWorkRecords(weekDays, employees, settings, allowOverwrite, editingCell);

  const handleCoordinateDoubleClick = useCallback(() => {
    if (!editingCell) return;
    
    // 1. Select proper week
    const dateObj = new Date(editingCell.dayDate);
    if (!isNaN(dateObj.getTime())) {
      setReferenceDate(dateObj);
    }

    // 2. Ensure visible and highlight
    setTimeout(() => {
      performCellDomActions(editingCell.employeeId, editingCell.dayDate, { highlight: true, scroll: true });
    }, 50);
  }, [editingCell, setReferenceDate]);

  const handleCellClick = useCallback((employeeId, dayDate) => {
    setEditingCell({ employeeId, dayDate });
  }, []);

  useEffect(() => {
    if (editingCell) {
      // Small timeout to ensure the 'editing' class is applied and panel animation starts
      setTimeout(() => {
        performCellDomActions(null, null, { 
          scroll: true, 
          selector: '.work-hours-cell.editing' 
        });
      }, 100);
    }
  }, [editingCell]);

  const handleCancelEdit = useCallback(() => {
    setEditingCell(null);
  }, []);

  const handleDoneEdit = useCallback(() => {
    setEditingCell(null);
  }, []);

  const hasSelectedData = useMemo(() => {
    if (!editingCell) return false;
    
    if (editingCell.employeeId === 'ALL' && editingCell.dayDate !== 'ALL') {
      return Object.keys(employees).some(empId => {
        const data = getCellData(empId, editingCell.dayDate);
        return data !== undefined && data !== null;
      });
    } else if (editingCell.dayDate === 'ALL' && editingCell.employeeId !== 'ALL') {
      return weekDays.some(day => {
        const data = getCellData(editingCell.employeeId, day.date);
        return data !== undefined && data !== null;
      });
    }
    return false;
  }, [editingCell, employees, weekDays, getCellData]);

  useKeyboardShortcuts({
    onEscape: handleCancelEdit,
    onEnter: handleDoneEdit,
    onUndo: handleUndo,
    onRedo: handleRedo
  }, !!editingCell);

  const filteredEmployeesList = filterEmployees(employees, employeeSearchQuery, settings);

  return (
    <div className={`view-container ${editingCell ? 'has-panel' : ''}`}>
      <Timeline 
        year={currentWeekYear} 
        selectedWeek={currentWeekNumber}
        onWeekClick={handleWeekClick}
        onMonthClick={handleMonthClick}
        settings={settings}
      />
      <div className="week-view-header">
        <div className="flex items-center gap-4">
          <EmployeeOmnibox 
            value={employeeSearchQuery} 
            onChange={setEmployeeSearchQuery} 
            employees={employees}
            settings={settings}
          />
          <DateOmnibox 
            key={settings?.jumpHistoryCache}
            selectedWeek={currentWeekNumber}
            selectedYear={currentWeekYear}
            onDateSelect={handleDateSelect}
            settings={settings}
          />
        </div>
        <div className="week-info">
          Week {weekDays[0]?.weekData.weekNum} ({weekDays[0]?.date} - {weekDays[6]?.date})
        </div>
      </div>

      <WorkHoursGrid
        weekDays={weekDays}
        employeesList={filteredEmployeesList}
        editingCell={editingCell}
        onCellClick={handleCellClick}
        getCellData={getCellData}
        settings={settings}
      />
      <div className={`hours-timeline-panel ${editingCell ? 'visible' : ''}`}>
        {editingCell && (
          <HoursTimeline
            value={commonSelectedValue}
            onChange={(type, value) => handleTimeChange(editingCell.employeeId, editingCell.dayDate, type, value)}
            onDone={handleDoneEdit}
            onClear={() => handleClearCell(editingCell.employeeId, editingCell.dayDate)}
            onCancel={handleCancelEdit}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onOpenSettings={() => onOpenSettingsView?.(VIEW_SETTINGS_DATE_TIME)}
            onCoordinateDoubleClick={handleCoordinateDoubleClick}
            settings={settings}
            employee={editingCell.employeeId === 'ALL' ? null : employees[editingCell.employeeId]}
            dayDate={editingCell.dayDate}
            weekRange={weekDays.length > 0 ? `${weekDays[0].date} - ${weekDays[weekDays.length - 1].date}` : ''}
            allowOverwrite={allowOverwrite}
            onAllowOverwriteChange={setAllowOverwrite}
            hasSelectedData={hasSelectedData}
          />
        )}
      </div>
    </div>
  );
};

export default WeekView;
