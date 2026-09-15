import 'react';

const OmniboxView = ({ settings, onSettingChange }) => {
  const employeeFilterImmediate = settings.employeeFilterImmediate !== false;

  return (
    <div className="view-container">
      <div className="settings-panel">
        <h3>Jump to date</h3>
        <p className="text-sm text-[var(--text-muted)] mb-3">
          Configure settings for the date navigation.
        </p>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <label className="switch">
              <input
                type="checkbox"
                checked={settings.jumpHistoryCache !== false}
                onChange={(e) => onSettingChange('jumpHistoryCache', e.target.checked)}
              />
              <span className="slider round"></span>
            </label>
            <div>
              <div className="font-semibold text-[var(--text-h)]">Jump history cache</div>
              <div className="text-sm text-[var(--text-light)]">
                If enabled, the date omnibox will remember your navigation history and show back/forward buttons.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="switch">
              <input
                type="checkbox"
                checked={settings.showTodayButton !== false}
                onChange={(e) => onSettingChange('showTodayButton', e.target.checked)}
              />
              <span className="slider round"></span>
            </label>
            <div>
              <div className="font-semibold text-[var(--text-h)]">Show Today button</div>
              <div className="text-sm text-[var(--text-light)]">
                If enabled, the today button will be shown in the date omnibox.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-panel">
        <h3>Search employee</h3>
        <p className="text-sm text-[var(--text-muted)] mb-3">
          Configure settings for the employee search.
        </p>
        <div className="flex flex-col gap-4">
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

          <div className="flex items-center gap-4">
            <label className="switch">
              <input
                type="checkbox"
                checked={settings.showClearFilterButton !== false}
                onChange={(e) => onSettingChange('showClearFilterButton', e.target.checked)}
              />
              <span className="slider round"></span>
            </label>
            <div>
              <div className="font-semibold text-[var(--text-h)]">Show clear filter button</div>
              <div className="text-sm text-[var(--text-light)]">
                Show a button next to the omnibox to clear the current filter.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OmniboxView;
