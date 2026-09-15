import 'react';

const OmniboxView = ({ settings, onSettingChange }) => {
  const showDateOmnibox = settings.showDateOmnibox !== false;
  const showEmployeeOmnibox = settings.showEmployeeOmnibox !== false;

  return (
    <div className="view-container">
      <div className="settings-panel">
        <h3>Date Omnibox</h3>
        <p className="text-sm text-[var(--text-muted)] mb-3">
          Configure whether the date navigation omnibox is visible in the main views.
        </p>
        <div className="checkbox-list">
          <label className="checkbox-item flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showDateOmnibox}
              onChange={(e) => onSettingChange('showDateOmnibox', e.target.checked)}
            />
            <span>Show Date Omnibox</span>
          </label>
        </div>
      </div>

      <div className="settings-panel">
        <h3>Employee Omnibox</h3>
        <p className="text-sm text-[var(--text-muted)] mb-3">
          Configure whether the employee search omnibox is visible in the main views.
        </p>
        <div className="checkbox-list">
          <label className="checkbox-item flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showEmployeeOmnibox}
              onChange={(e) => onSettingChange('showEmployeeOmnibox', e.target.checked)}
            />
            <span>Show Employee Omnibox</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default OmniboxView;
