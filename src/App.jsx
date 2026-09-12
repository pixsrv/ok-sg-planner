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
import { getAllItems, saveItem, saveItems } from './utils/db'

function App() {
  const [currentView, setCurrentView] = useState('Staff')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [settingsView, setSettingsView] = useState('Profile')
  const [appSettings, setAppSettings] = useState({
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h'
  })
  const [draftSettings, setDraftSettings] = useState({
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h'
  })
  
  const [employees, setEmployees] = useState({})
  const [months, setMonths] = useState([])

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
        }
      } catch (error) {
        console.error('Failed to load data from IndexedDB:', error);
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
    console.log('Data loaded and saved to IndexedDB:', data);
  };

  const handleSettingChange = (key, value) => {
    setDraftSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async () => {
    setAppSettings(draftSettings);
    await saveItem('settings', 'dateFormat', draftSettings.dateFormat);
    await saveItem('settings', 'timeFormat', draftSettings.timeFormat);
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
