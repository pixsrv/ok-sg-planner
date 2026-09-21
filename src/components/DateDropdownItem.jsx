import React, { useCallback } from 'react';
import { ArrowLeftRight, X, Calendar } from 'lucide-react';

const DateDropdownItem = React.memo(({ result, index, isSelected, onSelect, onMouseEnter }) => {
  const handleClick = useCallback(() => {
    onSelect(result);
  }, [onSelect, result]);

  const handleMouseEnter = useCallback(() => {
    onMouseEnter(index);
  }, [onMouseEnter, index]);

  const className = `px-4 py-2 cursor-pointer text-sm flex items-center gap-3 ${
    isSelected ? 'bg-[var(--accent-bg)]' : 'hover:bg-[var(--accent-bg)]'
  }`;

  if (result.type === 'clear-history') {
    return (
      <div
        className={className}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
      >
        <X className="w-4 h-4 text-[var(--text-light)] flex-shrink-0" />
        <span className="text-[var(--text-light)] italic">{result.label}</span>
      </div>
    );
  }

  const Icon = result.isHistory ? ArrowLeftRight : Calendar;
  const iconClass = result.isHistory ? "w-4 h-4 text-[var(--accent)]" : "w-4 h-4 text-[var(--text-light)]";

  return (
    <div
      className={className}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
    >
      <Icon className={iconClass} />
      <span>{result.label}</span>
    </div>
  );
});

DateDropdownItem.displayName = 'DateDropdownItem';

export default DateDropdownItem;
