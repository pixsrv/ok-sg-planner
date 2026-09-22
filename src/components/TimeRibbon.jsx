import 'react';

const TimeRibbon = ({ 
  items, 
  activeValue, 
  onItemClick, 
  type = 'hours' // 'hours' or 'minutes'
}) => {
  const isHours = type === 'hours';
  
  return (
    <div className="flex gap-1">
      {items.map(val => {
        const isActive = activeValue === val;
        
        const itemClasses = [
          'time-ribbon-item',
          isHours ? 'hours' : 'minutes',
          isActive ? 'active' : ''
        ].filter(Boolean).join(' ');

        return (
          <div
            key={val}
            onClick={() => onItemClick(val)}
            className={itemClasses}
          >
            {isHours ? val : String(val).padStart(2, '0')}
          </div>
        );
      })}
    </div>
  );
};

export default TimeRibbon;
