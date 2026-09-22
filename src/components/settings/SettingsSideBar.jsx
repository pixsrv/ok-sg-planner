import {
  VIEW_SETTINGS_SIDEBAR,
  VIEW_SETTINGS_OMNIBOX,
  VIEW_SETTINGS_PROFILE,
  VIEW_SETTINGS_DATE_TIME,
  VIEW_SETTINGS_NOTIFICATIONS,
  VIEW_SETTINGS_SECURITY
} from '../../constants/views';
import { getViewInfo } from '../../utils/viewUtils';

const SettingsSideBar = ({ currentView, onViewChange }) => {
  const items = [
    VIEW_SETTINGS_SIDEBAR,
    VIEW_SETTINGS_OMNIBOX,
    VIEW_SETTINGS_DATE_TIME,
    VIEW_SETTINGS_PROFILE,
    VIEW_SETTINGS_NOTIFICATIONS,
    VIEW_SETTINGS_SECURITY
  ].map(id => {
    const info = getViewInfo(id);
    const Icon = info.icon;
    return {
      id,
      icon: Icon ? <Icon size={20} /> : null,
      text: info.name
    };
  });

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
