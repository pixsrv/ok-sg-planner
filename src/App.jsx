import { useState } from 'react'
import './App.css'
import MainLayout from './components/MainLayout'
import SettingsLayout from './components/settings/SettingsLayout'
import StaffView from './views/StaffView'
import MonthView from './views/MonthView'
import WeekView from './views/WeekView'
import ProfileView from './views/settings/ProfileView.jsx'
import NotificationsView from './views/settings/NotificationsView.jsx'
import SecurityView from './views/settings/SecurityView.jsx'

function App() {
  const [currentView, setCurrentView] = useState('Staff')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [settingsView, setSettingsView] = useState('Profile')
  
  const [employees, setEmployees] = useState({})
  const [months, setMonths] = useState([])

  const handleDataLoaded = (data) => {
    if (data.employees) {
      setEmployees(data.employees);
    }
    if (data.months && data.months.length > 0) {
      setMonths((prevMonths) => [...prevMonths, ...data.months]);
    }
    console.log('Data loaded:', data);
  };

  const renderView = () => {
    switch (currentView) {
      case 'Staff':
        return <StaffView employees={employees} />
      case 'Month':
        return <MonthView months={months} />
      case 'Week':
        return <WeekView />
      default:
        return <StaffView employees={employees} />
    }
  }

  const renderSettingsView = () => {
    switch (settingsView) {
      case 'Profile':
        return <ProfileView />
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
        onSave={() => setIsSettingsOpen(false)}
        onCancel={() => setIsSettingsOpen(false)}
      >
        {renderSettingsView()}
      </SettingsLayout>
    )
  }

  return (
    <MainLayout 
      currentView={currentView} 
      onViewChange={setCurrentView}
      onSettingsClick={() => setIsSettingsOpen(true)}
      onDataLoaded={handleDataLoaded}
    >
      {renderView()}
    </MainLayout>
  )
}

export default App
