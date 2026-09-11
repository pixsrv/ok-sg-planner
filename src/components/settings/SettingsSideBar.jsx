import { User, Bell, Shield } from 'lucide-react';

const SettingsSideBar = ({ currentView, onViewChange }) => {
  const items = [
    { id: 'Profile', icon: <User size={20} />, text: 'Profile' },
    { id: 'Notifications', icon: <Bell size={20} />, text: 'Notifications' },
    { id: 'Security', icon: <Shield size={20} />, text: 'Security' },
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
