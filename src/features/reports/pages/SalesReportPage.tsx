import { BarChart3 } from 'lucide-react';

export default function SalesReportPage() {
  return (
    <div className="space-y-5 fade-in">
      <div><h1 className="page-title">Sales Report</h1><p className="page-subtitle">Revenue and order analytics</p></div>
      <div className="card empty-state" style={{ minHeight: '50vh' }}>
        <div className="empty-state-icon"><BarChart3 size={28} /></div>
        <h3 className="text-base font-semibold text-slate-700">Reports Coming Soon</h3>
        <p className="text-sm text-slate-500 mt-1">Advanced sales analytics will be available here.</p>
      </div>
    </div>
  );
}
