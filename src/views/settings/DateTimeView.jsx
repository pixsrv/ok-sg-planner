import {useEffect, useState} from 'react';
import DateSettingsTab from './DateSettingsTab';
import TimeSettingsTab from './TimeSettingsTab';
import GridSettingsTab from './GridSettingsTab';

const DateTimeView = ({settings, onSettingChange}) => {
  const [activeTab, setActiveTab] = useState('date'); // 'date', 'time', 'grid'

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({behavior: 'smooth'});
      }
    }
  }, []);

  const TABS = {
    date: DateSettingsTab,
    time: TimeSettingsTab,
    grid: GridSettingsTab,
  };

  const ActiveTabComponent = TABS[activeTab];

  return (
    <div className="view-container">
      <div className="tabs-container">
        {Object.keys(TABS).map((tab) => (
          <div
            key={tab}
            className={`tab-item ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </div>
        ))}
      </div>

      {ActiveTabComponent && (
        <ActiveTabComponent settings={settings} onSettingChange={onSettingChange} />
      )}
    </div>
  );
};

export default DateTimeView;
