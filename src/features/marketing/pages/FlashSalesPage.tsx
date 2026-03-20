import { Zap } from 'lucide-react';

export default function FlashSalesPage() {
  return (
    <div className="space-y-5 fade-in">
      <div><h1 className="page-title">Flash Sales</h1><p className="page-subtitle">Manage time-limited sales</p></div>
      <div className="card empty-state" style={{ minHeight: '50vh' }}>
        <div className="empty-state-icon"><Zap size={28} /></div>
        <h3 className="text-base font-semibold text-slate-700">Flash Sales Coming Soon</h3>
        <p className="text-sm text-slate-500 mt-1">Create and manage flash sales here.</p>
      </div>
    </div>
  );
}
