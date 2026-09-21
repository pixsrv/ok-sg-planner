import React from 'react';
import { Search, X } from 'lucide-react';

const OmniboxDropdownItem = React.memo(({ item, index, isSelected, onSelect, onMouseEnter }) => {
  const handleClick = () => onSelect(item);
  const handleMouseEnter = () => onMouseEnter(index);

  const renderContent = () => {
    switch (item.type) {
      case 'history':
        return (
          <>
            <Search className="w-4 h-4 text-[var(--accent)] flex-shrink-0" />
            <span className="text-[var(--text)]">{item.label}</span>
          </>
        );
      case 'clear-history':
        return (
          <>
            <X className="w-4 h-4 text-[var(--text-light)] flex-shrink-0" />
            <span className="text-[var(--text-light)] italic">{item.label}</span>
          </>
        );
      case 'employee':
        return (
          <div className="flex flex-col">
            <div className="font-medium text-[var(--text)]">
              {item.data.firstName} {item.data.lastName}
            </div>
            <div className="text-xs text-[var(--text-light)]">
              {item.id}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`px-4 py-2 cursor-pointer text-sm flex items-center gap-3 ${
        isSelected ? 'bg-[var(--accent-bg)]' : 'hover:bg-[var(--accent-bg)]'
      }`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
    >
      {renderContent()}
    </div>
  );
});

OmniboxDropdownItem.displayName = 'OmniboxDropdownItem';

export default OmniboxDropdownItem;
