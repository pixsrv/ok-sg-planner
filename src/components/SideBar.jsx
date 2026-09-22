import { Users, Calendar, Columns, ChevronLeft, ChevronRight } from 'lucide-react';
import { VIEW_STAFF, VIEW_MONTH, VIEW_WEEK } from '../constants/views';

const SideBar = ({ currentView, onViewChange, sidebarSettings, isCollapsed, onToggle }) => {
  const iconMap = {
    [VIEW_STAFF]: <Users size={20} />,
    [VIEW_MONTH]: <Calendar size={20} />,
    [VIEW_WEEK]: <Columns size={20} />,
  };

  const items = (sidebarSettings || [
    { id: VIEW_STAFF, name: 'Staff', visible: true, default: true },
    { id: VIEW_MONTH, name: 'Month', visible: true, default: false },
    { id: VIEW_WEEK, name: 'Week', visible: true, default: false },
  ])
    .filter(item => item.visible)
    .map(item => ({
      id: item.id,
      icon: iconMap[item.id],
      text: item.name
    }));

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
