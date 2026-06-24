import { useState } from 'react';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-canvas-white">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} />
      <div
        className="flex-1 flex flex-col min-h-screen transition-all duration-300"
        style={{ marginLeft: collapsed ? '72px' : '256px' }}
      >
        <main className="flex-1 p-10">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;