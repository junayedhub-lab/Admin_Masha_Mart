import { Bell, Search, LogOut, User, Menu } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAdminAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { getInitials } from '../../lib/utils';

export default function Topbar() {
  const { admin, signOut } = useAdminAuthStore();
  const toggleCollapsed = useUIStore((s) => s.toggleCollapsed);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roleLabel = admin?.role === 'super_admin'
    ? 'Super Admin'
    : admin?.role === 'operations'
    ? 'Operations'
    : 'Support';

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleCollapsed}
          className="btn-icon btn-ghost text-slate-500 hover:text-slate-700 lg:hidden"
        >
          <Menu size={20} />
        </button>

        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 w-72 border border-slate-100">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search orders, products, customers..."
            className="bg-transparent border-none outline-none text-sm flex-1 text-slate-700 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Profile */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-800 leading-tight">
                {admin?.full_name || admin?.email}
              </p>
              <p className="text-[10px] font-medium text-slate-400">{roleLabel}</p>
            </div>
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #E91E63, #FF6F00)' }}
            >
              {getInitials(admin?.full_name || admin?.email || 'A')}
            </div>
          </button>

          {profileOpen && (
            <div className="dropdown fade-in">
              <div className="p-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-800">{admin?.full_name}</p>
                <p className="text-xs text-slate-500">{admin?.email}</p>
              </div>
              <button className="dropdown-item">
                <User size={16} />
                <span>Profile</span>
              </button>
              <button
                onClick={() => signOut()}
                className="dropdown-item text-red-500 hover:bg-red-50"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
