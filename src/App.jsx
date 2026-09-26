import { useState, useEffect } from 'react'
import './App.css'
import MainLayout from './components/MainLayout'
import SettingsLayout from './components/settings/SettingsLayout'
import StaffView from './views/StaffView'
import MonthView from './views/MonthView'
import WeekView from './views/WeekView'
import DaysOffView from './views/DaysOffView'
import ProfileView from './views/settings/ProfileView.jsx'
import DateTimeView from './views/settings/DateTimeView.jsx'
import NotificationsView from './views/settings/NotificationsView.jsx'
import SecurityView from './views/settings/SecurityView.jsx'
import SidebarView from './views/settings/SidebarView.jsx'
import OmniboxView from './views/settings/OmniboxView.jsx'
import {
  START_ON_MODE_RECENT,
  DEFAULT_SETTINGS
} from './constants/settings'
import {
  VIEW_STAFF,
  VIEW_MONTH,
  VIEW_WEEK,
  VIEW_DAYS_OFF,
  VIEW_SETTINGS_SIDEBAR,
  VIEW_SETTINGS_OMNIBOX,
  VIEW_SETTINGS_PROFILE,
  VIEW_SETTINGS_DATE_TIME,
  VIEW_SETTINGS_NOTIFICATIONS,
  VIEW_SETTINGS_SECURITY
} from './constants/views'
import { getAllItems, saveItem, saveItems, STORES, getSessionItem, setSessionItem } from './utils/db'

function App() {
  const [currentView, setCurrentView] = useState(VIEW_STAFF)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [settingsView, setSettingsView] = useState(VIEW_SETTINGS_SIDEBAR)
  const [appSettings, setAppSettings] = useState(DEFAULT_SETTINGS)
  const [draftSettings, setDraftSettings] = useState(DEFAULT_SETTINGS)
  
  const [employees, setEmployees] = useState({})
  const [months, setMonths] = useState([])
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  useEffect(() => {
    // Session identification
    if (!getSessionItem('session-active')) {
      setSessionItem('session-active', 'true');
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
        const mergedSettings = { ...DEFAULT_SETTINGS, ...storedSettings };

        // Ensure sidebar contains all views from DEFAULT_SETTINGS, but keep user's visibility/order
        if (storedSettings.sidebar) {
          const storedSidebarIds = new Set(storedSettings.sidebar.map(item => item.id));
          const missingViews = DEFAULT_SETTINGS.sidebar.filter(item => !storedSidebarIds.has(item.id));
          if (missingViews.length > 0) {
            mergedSettings.sidebar = [...storedSettings.sidebar, ...missingViews];
          }
        }

        setAppSettings(mergedSettings);
        setDraftSettings(mergedSettings);

        if (storedSettings.sidebarFolded !== undefined) {
          setIsSidebarCollapsed(storedSettings.sidebarFolded);
        }

        const defaultView = mergedSettings.sidebar?.find(item => item.default);
        if (defaultView) {
          setCurrentView(defaultView.id);
        }
      } else {
        // No stored settings, but we might want to set the currentView to default from DEFAULT_SETTINGS
        const defaultView = DEFAULT_SETTINGS.sidebar.find(item => item.default);
        if (defaultView) {
          setCurrentView(defaultView.id);
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
    await saveItem(STORES.SETTINGS, 'hoursStripReverseSecond', draftSettings.hoursStripReverseSecond);
    await saveItem(STORES.SETTINGS, 'workLengthMinichartType', draftSettings.workLengthMinichartType);
    await saveItem(STORES.SETTINGS, 'showSummaryRow', draftSettings.showSummaryRow);
    await saveItem(STORES.SETTINGS, 'showSummaryCol', draftSettings.showSummaryCol);
    await saveItem(STORES.SETTINGS, 'summaryRowPosition', draftSettings.summaryRowPosition);
    await saveItem(STORES.SETTINGS, 'summaryColPosition', draftSettings.summaryColPosition);
    await saveItem(STORES.SETTINGS, 'greyOutSundays', draftSettings.greyOutSundays);
    await saveItem(STORES.SETTINGS, 'workingSundays', draftSettings.workingSundays);
    await saveItem(STORES.SETTINGS, 'sidebar', draftSettings.sidebar);
    window.location.hash = '';
    setIsSettingsOpen(false);
  };

  const handleCancelSettings = () => {
    window.location.hash = '';
    setDraftSettings(appSettings);
    setIsSettingsOpen(false);
  };

  const renderView = () => {
    switch (currentView) {
      case VIEW_STAFF:
        return <StaffView employees={employees} settings={appSettings} />
      case VIEW_MONTH:
        return <MonthView months={months} />
      case VIEW_WEEK:
        return (
          <WeekView 
            employees={employees} 
            settings={appSettings} 
            onOpenSettingsView={(view, sectionId) => {
              if (sectionId) {
                window.location.hash = sectionId;
              } else {
                window.location.hash = '';
              }
              setSettingsView(view);
              setDraftSettings(appSettings);
              setIsSettingsOpen(true);
            }}
          />
        )
      case VIEW_DAYS_OFF:
        return <DaysOffView employees={employees} settings={appSettings} />
      default:
        return <StaffView employees={employees} settings={appSettings} />
    }
  }

  const renderSettingsView = () => {
    switch (settingsView) {
      case VIEW_SETTINGS_SIDEBAR:
        return <SidebarView settings={draftSettings} onSettingChange={handleSettingChange} />
      case VIEW_SETTINGS_OMNIBOX:
        return <OmniboxView settings={draftSettings} onSettingChange={handleSettingChange} />
      case VIEW_SETTINGS_PROFILE:
        return <ProfileView />
      case VIEW_SETTINGS_DATE_TIME:
        return <DateTimeView settings={draftSettings} onSettingChange={handleSettingChange} />
      case VIEW_SETTINGS_NOTIFICATIONS:
        return <NotificationsView />
      case VIEW_SETTINGS_SECURITY:
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
