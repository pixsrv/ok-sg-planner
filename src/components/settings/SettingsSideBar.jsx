import { User, Bell, Shield, Clock, LayoutPanelLeft, Search } from 'lucide-react';
import {
  VIEW_SETTINGS_SIDEBAR,
  VIEW_SETTINGS_OMNIBOX,
  VIEW_SETTINGS_PROFILE,
  VIEW_SETTINGS_DATE_TIME,
  VIEW_SETTINGS_NOTIFICATIONS,
  VIEW_SETTINGS_SECURITY
} from '../../constants/views';

const SettingsSideBar = ({ currentView, onViewChange }) => {
  const items = [
    { id: VIEW_SETTINGS_SIDEBAR, icon: <LayoutPanelLeft size={20} />, text: 'Sidebar' },
    { id: VIEW_SETTINGS_OMNIBOX, icon: <Search size={20} />, text: 'Omnibox' },
    { id: VIEW_SETTINGS_DATE_TIME, icon: <Clock size={20} />, text: 'Date & Time' },
    { id: VIEW_SETTINGS_PROFILE, icon: <User size={20} />, text: 'Profile' },
    { id: VIEW_SETTINGS_NOTIFICATIONS, icon: <Bell size={20} />, text: 'Notifications' },
    { id: VIEW_SETTINGS_SECURITY, icon: <Shield size={20} />, text: 'Security' },
  ];

  return (
    <aside className="side-bar">
      <nav>
        <ul>
          {items.map((item) => (
            <li 
              key={item.id} 
              className={currentView === item.id ? 'active' : ''}
              onClick={() => onViewChange(item.id)}
            >
              {item.icon}
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default SettingsSideBar;
