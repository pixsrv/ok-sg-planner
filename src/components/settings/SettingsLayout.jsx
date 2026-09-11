import SettingsTopBar from './SettingsTopBar';
import SettingsSideBar from './SettingsSideBar';

const SettingsLayout = ({ children, currentView, onViewChange, onSave, onCancel }) => {
  return (
    <div className="flex flex-col h-screen w-full">
      <SettingsTopBar onSave={onSave} onCancel={onCancel} />
      <div className="main-layout">
        <SettingsSideBar currentView={currentView} onViewChange={onViewChange} />
        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SettingsLayout;
