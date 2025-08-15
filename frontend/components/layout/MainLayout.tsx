import React from 'react';
import GlobalSidebar from './GlobalSidebar';
import GlobalHeader from './GlobalHeader';
import ProjectSidebar from './ProjectSidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-blue-900/50 to-pink-900/30 text-white">
      <GlobalSidebar />
      <ProjectSidebar />
      <div className="flex flex-col flex-grow">
        <GlobalHeader />
        <main className="flex-grow overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
