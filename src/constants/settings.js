import {
  VIEW_STAFF,
  VIEW_MONTH,
  VIEW_WEEK
} from './views'

export const DATE_FORMAT_YYYY_MM_DD_ISO = 'YYYY-MM-DD';
export const DATE_FORMAT_DD_MM_YYYY_DASH = 'DD-MM-YYYY';
export const DATE_FORMAT_MM_DD_YYYY_SLASH = 'MM/DD/YYYY';
export const DATE_FORMAT_YYYY_MM_DD_SLASH = 'YYYY/MM/DD';
export const DATE_FORMAT_DD_MM_YYYY_DOT = 'DD.MM.YYYY';

export const DATE_FORMATS = [
  { id: DATE_FORMAT_YYYY_MM_DD_ISO, label: 'YYYY-MM-DD (ISO)' },
  { id: DATE_FORMAT_DD_MM_YYYY_DASH, label: 'DD-MM-YYYY' },
  { id: DATE_FORMAT_MM_DD_YYYY_SLASH, label: 'MM/DD/YYYY' },
  { id: DATE_FORMAT_YYYY_MM_DD_SLASH, label: 'YYYY/MM/DD' },
  { id: DATE_FORMAT_DD_MM_YYYY_DOT, label: 'DD.MM.YYYY' }
];

export const TIME_FORMAT_24H = '24h';
export const TIME_FORMAT_12H = '12h';

export const TIME_FORMATS = [
  { id: TIME_FORMAT_24H, label: '24 Hours' },
  { id: TIME_FORMAT_12H, label: '12 Hours (AM/PM)' }
];

export const WEEK_START_MONDAY = 'Monday';
export const WEEK_START_SUNDAY = 'Sunday';

export const WEEK_START_DAYS = [
  { id: WEEK_START_MONDAY, label: 'Monday (ISO)' },
  { id: WEEK_START_SUNDAY, label: 'Sunday' }
];

export const COORDINATE_ORDER_EMPLOYEE_DATE = 'employee-date';
export const COORDINATE_ORDER_DATE_EMPLOYEE = 'date-employee';

export const COORDINATE_ORDERS = [
  { id: COORDINATE_ORDER_EMPLOYEE_DATE, label: 'Employee (row) : Date (col)' },
  { id: COORDINATE_ORDER_DATE_EMPLOYEE, label: 'Date (col) : Employee (row)' }
];

export const TIMELINE_EXTENSION_NONE = '0';
export const TIMELINE_EXTENSION_1MO = '1';
export const TIMELINE_EXTENSION_2MO = '2';
export const TIMELINE_EXTENSION_3MO = '3';

export const TIMELINE_EXTENSIONS = [
  { id: TIMELINE_EXTENSION_NONE, label: 'None' },
  { id: TIMELINE_EXTENSION_1MO, label: '1 Month' },
  { id: TIMELINE_EXTENSION_2MO, label: '2 Months' },
  { id: TIMELINE_EXTENSION_3MO, label: '3 Months' }
];

export const TIME_RESOLUTION_1MI = 1;
export const TIME_RESOLUTION_5MI = 5;
export const TIME_RESOLUTION_10MI = 10;
export const TIME_RESOLUTION_15MI = 15;
export const TIME_RESOLUTION_30MI = 30;
export const TIME_RESOLUTION_60MI = 60;

export const TIME_RESOLUTIONS = [
  { id: TIME_RESOLUTION_1MI, label: '1 minute' },
  { id: TIME_RESOLUTION_5MI, label: '5 minutes' },
  { id: TIME_RESOLUTION_10MI, label: '10 minutes' },
  { id: TIME_RESOLUTION_15MI, label: '15 minutes' },
  { id: TIME_RESOLUTION_30MI, label: '30 minutes' },
  { id: TIME_RESOLUTION_60MI, label: '60 minutes' }
];

export const TIME_INPUT_CONTROL_SYSTEM = 'system';
export const TIME_INPUT_CONTROL_LINEAR = 'linear';
export const TIME_INPUT_CONTROL_CIRCULAR = 'circular';

export const TIME_INPUT_CONTROLS = [
  { id: TIME_INPUT_CONTROL_SYSTEM, label: 'System' },
  { id: TIME_INPUT_CONTROL_LINEAR, label: 'Linear' },
  { id: TIME_INPUT_CONTROL_CIRCULAR, label: 'Circular' }
];

export const AUTO_SET_MODE_NONE = 'none';
export const AUTO_SET_MODE_FIXED = 'fixed';
export const AUTO_SET_MODE_CALCULATED = 'calculated';

export const AUTO_SET_MODES = [
  { id: AUTO_SET_MODE_NONE, label: 'None' },
  { id: AUTO_SET_MODE_FIXED, label: 'Fixed Workday Length' },
  { id: AUTO_SET_MODE_CALCULATED, label: 'Calculated (from FTE)' }
];

export const START_ON_MODE_RECENT = 'recent';
export const START_ON_MODE_TODAY = 'today';
export const START_ON_MODE_FIXED = 'fixed';

export const START_ON_MODES = [
  { id: START_ON_MODE_RECENT, label: 'Recent Date' },
  { id: START_ON_MODE_TODAY, label: 'Today' },
  { id: START_ON_MODE_FIXED, label: 'Fixed Date' }
];

export const DEFAULT_SETTINGS = {
  dateFormat: DATE_FORMAT_YYYY_MM_DD_ISO,
  timeFormat: TIME_FORMAT_24H,
  timeResolution: TIME_RESOLUTION_1MI,
  timeInputControl: TIME_INPUT_CONTROL_SYSTEM,
  workDayLength: '08:00',
  autoSetEndHourMode: AUTO_SET_MODE_NONE,
  timelineStartHour: 0,
  timelineEndHour: 23,
  weekStart: WEEK_START_MONDAY,
  timelineExtension: TIMELINE_EXTENSION_NONE,
  coordinateOrder: COORDINATE_ORDER_EMPLOYEE_DATE,
  employeeFilterImmediate: true,
  showClearFilterButton: true,
  employeeFilterHistoryCache: true,
  jumpHistoryCache: true,
  showTodayButton: true,
  sidebarFolded: false,
  startOnMode: START_ON_MODE_RECENT,
  fixedStartDate: new Date().toISOString().split('T')[0],
  sidebar: [
    { id: VIEW_STAFF, name: 'Staff', visible: true, default: true },
    { id: VIEW_MONTH, name: 'Month', visible: true, default: false },
    { id: VIEW_WEEK, name: 'Week', visible: true, default: false },
  ]
};
