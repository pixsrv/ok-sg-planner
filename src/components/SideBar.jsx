import { Users, Calendar, Columns, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const SideBar = ({ currentView, onViewChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const items = [
    { id: 'Staff', icon: <Users size={20} />, text: 'Staff' },
    { id: 'Month', icon: <Calendar size={20} />, text: 'Month' },
    { id: 'Week', icon: <Columns size={20} />, text: 'Week' },
  ];

  return (
    <aside className={`side-bar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="toggle-container">
        <button 
          className="toggle-button" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
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
    </aside>
  );
};

export default SideBar;
