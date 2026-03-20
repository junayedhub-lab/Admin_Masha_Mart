import { MessageSquare } from 'lucide-react';

export default function SupportPage() {
  return (
    <div className="space-y-5 fade-in">
      <div><h1 className="page-title">Support Tickets</h1><p className="page-subtitle">Manage customer support</p></div>
      <div className="card empty-state" style={{ minHeight: '50vh' }}>
        <div className="empty-state-icon"><MessageSquare size={28} /></div>
        <h3 className="text-base font-semibold text-slate-700">Support System Coming Soon</h3>
        <p className="text-sm text-slate-500 mt-1">Ticket management will be available here.</p>
      </div>
    </div>
  );
}
