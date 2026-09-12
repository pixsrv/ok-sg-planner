import TopBar from './TopBar';
import SideBar from './SideBar';

const MainLayout = ({ children, currentView, onViewChange, sidebarSettings, onSettingsClick, onDataLoaded }) => {
  return (
    <div className="flex flex-col h-screen w-full">
      <TopBar onSettingsClick={onSettingsClick} onDataLoaded={onDataLoaded} />
      <div className="main-layout">
        <SideBar currentView={currentView} onViewChange={onViewChange} sidebarSettings={sidebarSettings} />
        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
