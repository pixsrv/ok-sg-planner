import { Users, Calendar, Columns } from 'lucide-react';

const SideBar = ({ currentView, onViewChange }) => {
  const items = [
    { id: 'Staff', icon: <Users size={20} />, text: 'Staff' },
    { id: 'Month', icon: <Calendar size={20} />, text: 'Month' },
    { id: 'Week', icon: <Columns size={20} />, text: 'Week' },
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

export default SideBar;
