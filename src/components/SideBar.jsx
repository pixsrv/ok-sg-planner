import { ChevronLeft, ChevronRight } from 'lucide-react';
import { VIEW_STAFF, VIEW_MONTH, VIEW_WEEK, VIEW_DAYS_OFF } from '../constants/views';
import { getViewInfo } from '../utils/viewUtils';

const SideBar = ({ currentView, onViewChange, sidebarSettings, isCollapsed, onToggle }) => {

  const items = (sidebarSettings || [
    { id: VIEW_STAFF, visible: true, default: true },
    { id: VIEW_MONTH, visible: true, default: false },
    { id: VIEW_WEEK, visible: true, default: false },
    { id: VIEW_DAYS_OFF, visible: true, default: false },
  ])
    .filter(item => item.visible)
    .map(item => {
      const info = getViewInfo(item.id);
      const Icon = info.icon;
      return {
        id: item.id,
        icon: Icon ? <Icon size={20} /> : null,
        text: info.name
      };
    });

  return (
    <aside className={`side-bar ${isCollapsed ? 'collapsed' : ''}`}>
      <nav>
        <ul>
          {items.map((item) => (
            <li 
              key={item.id} 
              className={currentView === item.id ? 'active' : ''}
              onClick={() => onViewChange(item.id)}
              title={isCollapsed ? item.text : ''}
            >
              {item.icon}
              {!isCollapsed && <span>{item.text}</span>}
            </li>
          ))}
        </ul>
      </nav>
      <div className="toggle-container">
        <button 
          className="toggle-button" 
          onClick={onToggle} 
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
    </aside>
  );
};

export default SideBar;
