import { useState } from 'react';
import { GripVertical } from 'lucide-react';

const SidebarView = ({ settings, onSettingChange }) => {
  const sidebarSettings = settings.sidebar || [
    { id: 'Staff', name: 'Staff', visible: true, default: true },
    { id: 'Month', name: 'Month', visible: true, default: false },
    { id: 'Week', name: 'Week', visible: true, default: false },
  ];

  const [draggedItemIndex, setDraggedItemIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Add a ghost image or just let the default happen
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index) return;

    const newList = [...sidebarSettings];
    const draggedItem = newList[draggedItemIndex];
    newList.splice(draggedItemIndex, 1);
    newList.splice(index, 0, draggedItem);
    
    setDraggedItemIndex(index);
    onSettingChange('sidebar', newList);
  };

  const handleDragEnd = () => {
    setDraggedItemIndex(null);
  };

  const updateItem = (id, key, value) => {
    const newList = sidebarSettings.map(item => {
      if (item.id === id) {
        if (key === 'default' && value === true) {
          // If setting a new default, others must be false
          return { ...item, [key]: value, visible: true }; // Default must be visible
        }
        return { ...item, [key]: value };
      }
      if (key === 'default' && value === true) {
        return { ...item, default: false };
      }
      return item;
    });
    onSettingChange('sidebar', newList);
  };

  const handleToggleVisible = (id, currentVisible, isDefault) => {
    if (isDefault && currentVisible) {
      // Cannot hide the default view
      return;
    }
    updateItem(id, 'visible', !currentVisible);
  };

  return (
    <div className="view-container">
      <h2>Sidebar Settings</h2>
      <div className="settings-panel">
        <table className="sidebar-grid">
          <thead>
            <tr>
              <th className="col-dnd"></th>
              <th className="col-visible">Visible</th>
              <th className="col-default">Default</th>
              <th className="col-name">Name</th>
            </tr>
          </thead>
          <tbody>
            {sidebarSettings.map((item, index) => (
              <tr 
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={draggedItemIndex === index ? 'dragging' : ''}
              >
                <td className="col-dnd">
                  <div className="dnd-handle">
                    <GripVertical size={18} />
                  </div>
                </td>
                <td className="col-visible">
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={item.visible} 
                      disabled={item.default}
                      onChange={() => handleToggleVisible(item.id, item.visible, item.default)}
                    />
                    <span className="slider round"></span>
                  </label>
                </td>
                <td className="col-default">
                  <input 
                    type="radio" 
                    name="defaultView"
                    checked={item.default}
                    onChange={() => updateItem(item.id, 'default', true)}
                  />
                </td>
                <td className="col-name">
                  {item.name}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SidebarView;
