import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuthStore } from '../../store/authStore';
import type { AdminUser } from '../../types';

interface Props {
  children: React.ReactNode;
  requiredRole?: AdminUser['role'][];
}

export default function ProtectedRoute({ children, requiredRole }: Props) {
  const { admin, initialized, initialize } = useAdminAuthStore();

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  if (!initialized) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F1F5F9' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !requiredRole.includes(admin.role)) {
    return (
      <div className="empty-state" style={{ minHeight: '60vh' }}>
        <div className="empty-state-icon">🔒</div>
        <h3 className="text-lg font-semibold text-slate-800 mt-2">Access Denied</h3>
        <p className="text-sm text-slate-500 mt-1">You don't have permission to access this page.</p>
      </div>
    );
  }

  return <>{children}</>;
}
