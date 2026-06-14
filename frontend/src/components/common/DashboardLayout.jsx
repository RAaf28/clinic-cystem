import Sidebar from './Sidebar';

/**
 * Layout wrapper untuk semua halaman yang membutuhkan sidebar
 * Menggantikan Navbar untuk halaman dashboard/feature
 */
const DashboardLayout = ({ children }) => (
  <div className="flex min-h-screen bg-canvas-white">
    <Sidebar />
    <div className="ml-64 flex-1 flex flex-col min-h-screen">
      <main className="flex-1 p-10">
        {children}
      </main>
    </div>
  </div>
);

export default DashboardLayout;
