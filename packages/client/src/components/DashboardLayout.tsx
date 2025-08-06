import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

/**
 * Main layout for the application dashboard, including the sidebar and content area.
 */
function DashboardLayout() {
  return (
    <div className="flex h-screen w-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 p-4 overflow-auto">
        <Outlet /> {/* Child routes will be rendered here */}
      </main>
    </div>
  );
}

export default DashboardLayout;