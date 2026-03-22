import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, FolderTree, ShoppingCart,
  Users, Tag, BarChart3, Settings, ChevronLeft,
  Image, Zap, MessageSquare, Star
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useUIStore } from '../../store/uiStore';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Products', icon: Package, path: '/products' },
  { label: 'Categories', icon: FolderTree, path: '/categories' },
  { label: 'Orders', icon: ShoppingCart, path: '/orders' },
  { label: 'Reviews', icon: Star, path: '/reviews' },
  { label: 'Customers', icon: Users, path: '/customers' },
  {
    label: 'Marketing',
    icon: Tag,
    children: [
      { label: 'Site Pages', icon: LayoutDashboard, path: '/marketing/pages' },
      { label: 'Coupons', path: '/marketing/coupons' },
      { label: 'Flash Sales', icon: Zap, path: '/marketing/flash-sales' },
      { label: 'Banners', icon: Image, path: '/marketing/banners' },
    ],
  },
  { label: 'Reports', icon: BarChart3, path: '/reports/sales' },
  { label: 'Support', icon: MessageSquare, path: '/support' },
  { label: 'Settings', icon: Settings, path: '/settings/app' },
];

export default function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleCollapsed = useUIStore((s) => s.toggleCollapsed);
  const location = useLocation();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 bottom-0 z-40 flex flex-col transition-all duration-300 gradient-sidebar'
      )}
      style={{ width: collapsed ? 72 : 256 }}
    >
      <div className="flex items-center h-16 px-4 border-b border-white/5">
        <div className="flex items-center gap-3 overflow-hidden">
          <img 
            src="/logo.png" 
            alt="Admin Logo" 
            className="w-10 h-10 rounded-xl shadow-lg border border-white/10" 
          />
          {!collapsed && (
            <div className="slide-in-left">
              <h1 className="text-white font-black text-sm leading-tight tracking-tighter uppercase">Masha<span className="text-rose-500">Mart</span></h1>
              <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Admin Panel</p>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map((item) => {
          if (item.children) {
            const isChildActive = item.children.some((c) => location.pathname.startsWith(c.path));
            return (
              <div key={item.label}>
                <div
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isChildActive
                      ? 'text-white bg-white/10'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  )}
                >
                  <item.icon size={18} className="flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </div>
                {!collapsed && (
                  <div className="ml-8 mt-0.5 space-y-0.5">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                            isActive
                              ? 'text-white bg-white/10'
                              : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                          )
                        }
                      >
                        <span>{child.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path!}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'text-white bg-white/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )
              }
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={18} className="flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={toggleCollapsed}
        className="flex items-center justify-center h-12 border-t border-white/5 text-slate-500 hover:text-white transition-colors"
      >
        <ChevronLeft
          size={18}
          className={cn('transition-transform duration-300', collapsed && 'rotate-180')}
        />
      </button>
    </aside>
  );
}
