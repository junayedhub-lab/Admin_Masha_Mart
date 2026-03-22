import { Bell, Search, LogOut, User, Menu, Package, XCircle, Info } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { useNotificationStore, startNotificationListenerWithCleanup } from '../../store/notificationStore';
import { getInitials, cn, formatRelativeTime } from '../../lib/utils';

export default function Topbar() {
  const { admin, signOut } = useAdminAuthStore();
  const toggleCollapsed = useUIStore((s) => s.toggleCollapsed);
  const { notifications, unreadCount, markAllRead } = useNotificationStore();
  const navigate = useNavigate();
  
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // startNotificationListener now returns a cleanup function
    const cleanup = startNotificationListenerWithCleanup();
    return cleanup;
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotifClick = () => {
    setNotifOpen(!notifOpen);
    if (!notifOpen) markAllRead();
  };

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
        <div className="relative" ref={notifRef}>
          <button 
            onClick={handleNotifClick}
            className={cn(
              "p-2 rounded-xl text-slate-500 hover:text-slate-700 transition-all",
              notifOpen ? "bg-slate-100 text-pink-600 shadow-inner" : "hover:bg-slate-50"
            )}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="dropdown w-80 max-h-[480px] overflow-hidden flex flex-col fade-in right-0">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Recent Alerts</span>
                <span className="text-[10px] text-slate-400 font-bold tracking-tighter uppercase">{notifications.length} Total</span>
              </div>
              <div className="overflow-y-auto flex-1 divide-y divide-slate-50">
                {notifications.length === 0 ? (
                  <div className="p-10 text-center flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
                      <Bell size={24} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">Everything is quiet<br/>no alerts right now</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      onClick={() => {
                        setNotifOpen(false);
                        if (n.type === 'order' && (n as any).data?.order_id) {
                          navigate(`/orders/${(n as any).data.order_id}`);
                        }
                      }}
                      className="p-4 hover:bg-slate-50 transition-colors cursor-pointer group"
                    >
                      <div className="flex gap-3">
                        <div className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110",
                          n.type === 'order' ? 'bg-emerald-50 text-emerald-600' :
                          n.type === 'cancel' ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-500'
                        )}>
                          {n.type === 'order' ? <Package size={18} /> : 
                           n.type === 'cancel' ? <XCircle size={18} /> : <Info size={18} />}
                        </div>
                        <div className="space-y-1 overflow-hidden">
                          <p className="text-xs font-black text-slate-800 tracking-tight leading-tight">{n.title}</p>
                          <p className="text-[11px] text-slate-500 leading-normal line-clamp-2">{n.message}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{formatRelativeTime(n.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

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
