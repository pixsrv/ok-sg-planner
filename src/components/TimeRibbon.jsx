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
        
        const activeClasses = isActive 
          ? (isHours 
            ? 'bg-[var(--accent)] text-white border-[var(--accent)]' 
            : 'bg-[var(--accent-light)] text-[var(--accent)] border-[var(--accent)]')
          : 'bg-[var(--bg)] border-[var(--border)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent)]';

        const sizeClasses = isHours ? 'w-8 h-8 text-xs' : 'w-8 h-6 text-[10px]';

        return (
          <div
            key={val}
            onClick={() => onItemClick(val)}
            className={`flex-shrink-0 flex items-center justify-center border rounded cursor-pointer transition-colors ${sizeClasses} ${activeClasses}`}
          >
            {isHours ? val : String(val).padStart(2, '0')}
          </div>
        );
      })}
    </div>
  );
};

export default TimeRibbon;
