import {Search, X} from 'lucide-react';

const EmployeeOmnibox = ({ value, onChange, placeholder = "Search employees..." }) => {
  const handleClear = () => {
    onChange('');
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-light)]"/>
      <input
        type="text"
        placeholder={placeholder}
        className="pl-10 pr-10 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] w-64"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            handleClear();
          }
        }}
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-light)] hover:text-[var(--text)] transition-colors"
          title="Clear search"
        >
          <X className="w-4 h-4"/>
        </button>
      )}
    </div>
  );
};

export default EmployeeOmnibox;
