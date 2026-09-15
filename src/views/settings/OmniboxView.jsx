import 'react';

const OmniboxView = ({ settings, onSettingChange }) => {
  const showOmnibox = settings.showOmnibox !== false; // Default to true if undefined

  return (
    <div className="view-container">
      <div className="settings-panel">
        <h3>Omnibox Visibility</h3>
        <p className="text-sm text-[var(--text-muted)] mb-3">
          Configure whether the date omnibox is visible in the main views.
        </p>
        <div className="checkbox-list">
          <label className="checkbox-item flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showOmnibox}
              onChange={(e) => onSettingChange('showOmnibox', e.target.checked)}
            />
            <span>Show Omnibox</span>
          </label>
        </div>
      </div>

      <div className="settings-panel">
        <h3>Omnibox behavior</h3>
        <p className="text-sm text-[var(--text-muted)] mb-3">
          Further settings for the omnibox could be added here.
        </p>
      </div>
    </div>
  );
};

export default OmniboxView;
