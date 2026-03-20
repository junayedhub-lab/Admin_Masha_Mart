import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useUIStore } from '../../store/uiStore';

export default function AdminShell() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div
        className="transition-all duration-300"
        style={{ marginLeft: collapsed ? 72 : 256 }}
      >
        <Topbar />
        <main className="p-6 fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
