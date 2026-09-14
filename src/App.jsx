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
import { getAllItems, saveItem, saveItems } from './utils/db'

function App() {
  const [currentView, setCurrentView] = useState('Staff')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [settingsView, setSettingsView] = useState('Sidebar')
  const [appSettings, setAppSettings] = useState({
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h',
    weekStart: 'Monday',
    timelineExtension: '0',
    sidebarFolded: false,
    sidebar: [
      { id: 'Staff', name: 'Staff', visible: true, default: true },
      { id: 'Month', name: 'Month', visible: true, default: false },
      { id: 'Week', name: 'Week', visible: true, default: false },
    ]
  })
  const [draftSettings, setDraftSettings] = useState({
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h',
    weekStart: 'Monday',
    timelineExtension: '0',
    sidebarFolded: false,
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
    const loadFromDB = async () => {
      try {
        const storedEmployees = await getAllItems('employees').catch(() => {
          console.warn('Employees store not found, might be empty.');
          return {};
        });
        const storedMonths = await getAllItems('months').catch(() => {
          console.warn('Months store not found, might be empty.');
          return [];
        });
        const storedSettings = await getAllItems('settings').catch(() => {
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
      await saveItems('employees', data.employees);
    }
    if (data.months && data.months.length > 0) {
      const updatedMonths = [...months, ...data.months];
      setMonths(updatedMonths);
      // For months, we currently store them as an array in state, 
      // but let's see how they are structured. 
      // TopBar.jsx pushes { name: file.name, data: json } to months array.
      // We'll save them as individual items using their name as key.
      for (const month of data.months) {
        await saveItem('months', month.name, month);
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
    
    await saveItem('settings', 'dateFormat', draftSettings.dateFormat);
    await saveItem('settings', 'timeFormat', draftSettings.timeFormat);
    await saveItem('settings', 'weekStart', draftSettings.weekStart);
    await saveItem('settings', 'timelineExtension', draftSettings.timelineExtension);
    await saveItem('settings', 'sidebarFolded', draftSettings.sidebarFolded);
    await saveItem('settings', 'sidebar', draftSettings.sidebar);
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
        return <WeekView employees={employees} settings={appSettings} />
      default:
        return <StaffView employees={employees} settings={appSettings} />
    }
  }

  const renderSettingsView = () => {
    switch (settingsView) {
      case 'Sidebar':
        return <SidebarView settings={draftSettings} onSettingChange={handleSettingChange} />
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
