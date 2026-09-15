import 'react';

const OmniboxView = ({ settings, onSettingChange }) => {
  const employeeFilterImmediate = settings.employeeFilterImmediate !== false;

  return (
    <div className="view-container">
      <div className="settings-panel">
        <h3>Date Omnibox</h3>
        <p className="text-sm text-[var(--text-muted)] mb-3">
          Configure settings for the date navigation omnibox.
        </p>
      </div>

      <div className="settings-panel">
        <h3>Employee Omnibox</h3>
        <p className="text-sm text-[var(--text-muted)] mb-3">
          Configure settings for the employee search omnibox.
        </p>
        <div className="flex items-center gap-4">
          <label className="switch">
            <input
              type="checkbox"
              checked={employeeFilterImmediate}
              onChange={(e) => onSettingChange('employeeFilterImmediate', e.target.checked)}
            />
            <span className="slider round"></span>
          </label>
          <div>
            <div className="font-semibold text-[var(--text-h)]">Immediate filtering</div>
            <div className="text-sm text-[var(--text-light)]">
              If disabled, filtering will only occur after selecting an employee from the dropdown.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OmniboxView;
