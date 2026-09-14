import { useState, useRef, useEffect } from 'react';
import { Settings, MoreVertical, Layout, Upload } from 'lucide-react';
import { parseJsonFile } from '../utils/fileUtils';

const TopBar = ({ onSettingsClick, onDataLoaded, currentView }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileChange = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const loadedData = {
      employees: null,
      months: []
    };

    try {
      for (const file of files) {
        const json = await parseJsonFile(file);
        if (file.name.includes('employees')) {
          loadedData.employees = json;
        } else {
          loadedData.months.push({
            name: file.name,
            data: json
          });
        }
      }
      
      if (onDataLoaded) {
        onDataLoaded(loadedData);
      }
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Error loading files:', error);
      alert('Error loading files. Please ensure they are valid JSON.');
    }
    
    // Reset file input
    event.target.value = '';
  };

  const getHumanReadableName = (view) => {
    switch (view) {
      case 'Staff': return 'Staff';
      case 'Month': return 'Months';
      case 'Week': return 'Weeks';
      default: return view;
    }
  };

  return (
    <header className="flex justify-between items-center px-4 h-[60px] border-b border-[var(--border)] bg-[var(--bg)] relative">
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".json"
        multiple
        onChange={handleFileChange}
      />
      <div className="flex items-center gap-3">
        <Layout className="text-[var(--accent)]" />
        <div className="flex items-center text-xl">
          <span className="font-semibold text-[var(--text-h)]">SG Planner</span>
          {currentView && (
            <>
              <span className="mx-2 text-[var(--text-light)] font-normal">&gt;</span>
              <span className="text-[var(--text)] font-normal">{getHumanReadableName(currentView)}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <button 
          onClick={onSettingsClick}
          className="bg-none border-none p-2 cursor-pointer text-[var(--text)] hover:bg-[var(--accent-bg)] rounded-md transition-colors"
        >
          <Settings size={20} />
        </button>
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="bg-none border-none p-2 cursor-pointer text-[var(--text)] hover:bg-[var(--accent-bg)] rounded-md transition-colors"
          >
            <MoreVertical size={20} />
          </button>
          
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[var(--bg)] border border-[var(--border)] rounded-md shadow-[var(--shadow)] z-50 py-1">
              <button
                className="w-full text-left px-4 py-2 text-sm text-[var(--text)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent)] flex items-center gap-2 transition-colors border-none bg-none cursor-pointer"
                onClick={() => {
                  fileInputRef.current?.click();
                }}
              >
                <Upload size={16} />
                <span>Load Data</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
