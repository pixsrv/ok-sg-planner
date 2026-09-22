import { Settings } from 'lucide-react';
import { getViewInfo } from '../../utils/viewUtils';

const SettingsTopBar = ({ onSave, onCancel, currentView }) => {

  return (
    <header className="flex justify-between items-center px-4 h-[60px] border-b border-[var(--border)] bg-[var(--bg)]">
      <div className="flex items-center gap-3">
        <Settings className="text-[var(--accent)]" />
        <div className="flex items-center text-xl">
          <span className="font-semibold text-[var(--text-h)]">SG Planner</span>
          <span className="mx-2 text-[var(--text-light)] font-normal">&gt;</span>
          <span className="text-[var(--text)] font-normal">Settings</span>
          {currentView && (
            <>
              <span className="mx-2 text-[var(--text-light)] font-normal">&gt;</span>
              <span className="text-[var(--text)] font-normal">{getViewInfo(currentView).name}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex gap-3">
        <button 
          onClick={onCancel}
          className="px-4 py-2 border border-[var(--border)] rounded-md cursor-pointer hover:bg-[var(--accent-bg)] transition-colors text-[var(--text)]"
        >
          Cancel
        </button>
        <button 
          onClick={onSave}
          className="px-4 py-2 bg-[var(--accent)] text-white rounded-md cursor-pointer hover:opacity-90 transition-opacity"
        >
          Save
        </button>
      </div>
    </header>
  );
};

export default SettingsTopBar;
