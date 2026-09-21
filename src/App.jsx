import { useState, useEffect } from 'react'
import './App.css'
import MainLayout from './components/MainLayout'
import SettingsLayout from './components/settings/SettingsLayout'
import StaffView from './views/StaffView'
import MonthView from './views/MonthView'
import WeekView from './views/WeekView'
import ProfileView from './views/settings/ProfileView.jsx'
import DateTimeView from './views/settings/DateTimeView.jsx'
import NotificationsView from './views/settings/NotificationsView.jsx'
import SecurityView from './views/settings/SecurityView.jsx'
import SidebarView from './views/settings/SidebarView.jsx'
import OmniboxView from './views/settings/OmniboxView.jsx'
import {
  DATE_FORMAT_YYYY_MM_DD_ISO,
  TIME_FORMAT_24H,
  WEEK_START_MONDAY,
  TIMELINE_EXTENSION_NONE,
  COORDINATE_ORDER_EMPLOYEE_DATE,
  TIME_INPUT_CONTROL_SYSTEM,
  AUTO_SET_MODE_NONE,
  START_ON_MODE_RECENT,
  TIME_RESOLUTION_1MI
} from './constants/settings'
import { getAllItems, saveItem, saveItems, STORES } from './utils/db'

function App() {
  const [currentView, setCurrentView] = useState('Staff')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [settingsView, setSettingsView] = useState('Sidebar')
  const [appSettings, setAppSettings] = useState({
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
      { id: 'Staff', name: 'Staff', visible: true, default: true },
      { id: 'Month', name: 'Month', visible: true, default: false },
      { id: 'Week', name: 'Week', visible: true, default: false },
    ]
  })
  const [draftSettings, setDraftSettings] = useState({
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
      { id: 'Staff', name: 'Staff', visible: true, default: true },
      { id: 'Month', name: 'Month', visible: true, default: false },
      { id: 'Week', name: 'Week', visible: true, default: false },
    ]
  })
  
  const [employees, setEmployees] = useState({})
  const [months, setMonths] = useState([])
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  useEffect(() => {
    // Session identification
    if (!sessionStorage.getItem('ok-sg-session-active')) {
      sessionStorage.setItem('ok-sg-session-active', 'true');
    }

    const loadFromDB = async () => {
      try {
        const storedEmployees = await getAllItems(STORES.EMPLOYEES).catch(() => {
          console.warn('Employees store not found, might be empty.');

          return {};
        });

        const storedMonths = await getAllItems(STORES.MONTHS).catch(() => {
          console.warn('Months store not found, might be empty.');

          return [];
        });

        const storedSettings = await getAllItems(STORES.SETTINGS).catch(() => {
          console.warn('Settings store not found, might be empty.');

          return {};
        });
        
        if (storedEmployees && Object.keys(storedEmployees).length > 0) {
          setEmployees(storedEmployees);
        }

        if (storedMonths && storedMonths.length > 0) {
          setMonths(storedMonths);
        }

        if (storedSettings && Object.keys(storedSettings).length > 0) {
          setAppSettings(prev => ({ ...prev, ...storedSettings }));
          setDraftSettings(prev => ({ ...prev, ...storedSettings }));
          
          if (storedSettings.startOnMode === undefined) {
             setAppSettings(prev => ({ ...prev, startOnMode: START_ON_MODE_RECENT, fixedStartDate: new Date().toISOString().split('T')[0] }));
             setDraftSettings(prev => ({ ...prev, startOnMode: START_ON_MODE_RECENT, fixedStartDate: new Date().toISOString().split('T')[0] }));
          }
          
          if (storedSettings.sidebarFolded !== undefined) {
            setIsSidebarCollapsed(storedSettings.sidebarFolded);
          }
          
          if (storedSettings.sidebar) {
            const defaultView = storedSettings.sidebar.find(item => item.default);

            if (defaultView) {
              setCurrentView(defaultView.id);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load data from localStorage:', error);
      }
    };

    loadFromDB();
  }, []);

  const handleDataLoaded = async (data) => {
    if (data.employees) {
      setEmployees(data.employees);

      await saveItems(STORES.EMPLOYEES, data.employees);
    }
    if (data.months && data.months.length > 0) {
      const updatedMonths = [...months, ...data.months];

      setMonths(updatedMonths);
      // For months, we currently store them as an array in state, 
      // but let's see how they are structured. 
      // TopBar.jsx pushes { name: file.name, data: json } to months array.
      // We'll save them as individual items using their name as key.
      for (const month of data.months) {
        await saveItem(STORES.MONTHS, month.name, month);
      }
    }
    console.log('Data loaded and saved to localStorage:', data);
  };

  const handleSettingChange = (key, value) => {
    setDraftSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async () => {
    setAppSettings(draftSettings);
    
    // Update live sidebar state if it changed in settings
    setIsSidebarCollapsed(draftSettings.sidebarFolded);
    
    // Apply default view if it changed (matches initial load behavior)
    if (draftSettings.sidebar) {
      const defaultView = draftSettings.sidebar.find(item => item.default);

      if (defaultView) {
        setCurrentView(defaultView.id);
      }
    }
    
    await saveItem(STORES.SETTINGS, 'dateFormat', draftSettings.dateFormat);
    await saveItem(STORES.SETTINGS, 'timeFormat', draftSettings.timeFormat);
    await saveItem(STORES.SETTINGS, 'timeResolution', draftSettings.timeResolution);
    await saveItem(STORES.SETTINGS, 'timeInputControl', draftSettings.timeInputControl);
    await saveItem(STORES.SETTINGS, 'workDayLength', draftSettings.workDayLength);
    await saveItem(STORES.SETTINGS, 'autoSetEndHourMode', draftSettings.autoSetEndHourMode);
    await saveItem(STORES.SETTINGS, 'timelineStartHour', draftSettings.timelineStartHour);
    await saveItem(STORES.SETTINGS, 'timelineEndHour', draftSettings.timelineEndHour);
    await saveItem(STORES.SETTINGS, 'weekStart', draftSettings.weekStart);
    await saveItem(STORES.SETTINGS, 'timelineExtension', draftSettings.timelineExtension);
    await saveItem(STORES.SETTINGS, 'coordinateOrder', draftSettings.coordinateOrder);
    await saveItem(STORES.SETTINGS, 'employeeFilterImmediate', draftSettings.employeeFilterImmediate);
    await saveItem(STORES.SETTINGS, 'showClearFilterButton', draftSettings.showClearFilterButton);
    await saveItem(STORES.SETTINGS, 'employeeFilterHistoryCache', draftSettings.employeeFilterHistoryCache);
    await saveItem(STORES.SETTINGS, 'jumpHistoryCache', draftSettings.jumpHistoryCache);
    await saveItem(STORES.SETTINGS, 'showTodayButton', draftSettings.showTodayButton);
    await saveItem(STORES.SETTINGS, 'sidebarFolded', draftSettings.sidebarFolded);
    await saveItem(STORES.SETTINGS, 'startOnMode', draftSettings.startOnMode);
    await saveItem(STORES.SETTINGS, 'fixedStartDate', draftSettings.fixedStartDate);
    await saveItem(STORES.SETTINGS, 'sidebar', draftSettings.sidebar);
    setIsSettingsOpen(false);
  };

  const handleCancelSettings = () => {
    setDraftSettings(appSettings);
    setIsSettingsOpen(false);
  };

  const renderView = () => {
    switch (currentView) {
      case 'Staff':
        return <StaffView employees={employees} settings={appSettings} />
      case 'Month':
        return <MonthView months={months} />
      case 'Week':
        return (
          <WeekView 
            employees={employees} 
            settings={appSettings} 
            onOpenSettingsView={(view) => {
              setSettingsView(view);
              setDraftSettings(appSettings);
              setIsSettingsOpen(true);
            }}
          />
        )
      default:
        return <StaffView employees={employees} settings={appSettings} />
    }
  }

  const renderSettingsView = () => {
    switch (settingsView) {
      case 'Sidebar':
        return <SidebarView settings={draftSettings} onSettingChange={handleSettingChange} />
      case 'Omnibox':
        return <OmniboxView settings={draftSettings} onSettingChange={handleSettingChange} />
      case 'Profile':
        return <ProfileView />
      case 'DateTime':
        return <DateTimeView settings={draftSettings} onSettingChange={handleSettingChange} />
      case 'Notifications':
        return <NotificationsView />
      case 'Security':
        return <SecurityView />
      default:
        return <ProfileView />
    }
  }

  if (isSettingsOpen) {
    return (
      <SettingsLayout 
        currentView={settingsView} 
        onViewChange={setSettingsView}
        onSave={handleSaveSettings}
        onCancel={handleCancelSettings}
      >
        {renderSettingsView()}
      </SettingsLayout>
    )
  }

  return (
    <MainLayout 
      currentView={currentView} 
      onViewChange={setCurrentView}
      sidebarSettings={appSettings.sidebar}
      isSidebarCollapsed={isSidebarCollapsed}
      onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      onSettingsClick={() => {
        setDraftSettings(appSettings)
        setIsSettingsOpen(true)
      }}
      onDataLoaded={handleDataLoaded}
    >
      {renderView()}
    </MainLayout>
  )
}

export default App
