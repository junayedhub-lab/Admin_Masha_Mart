import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Users } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { formatCurrency, formatDate, getInitials } from '../../../lib/utils';

export default function CustomersListPage() {
  const [search, setSearch] = useState('');

  const { data: customers = [], isLoading: loading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data: users, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (!users) return [];

      const enriched = await Promise.all(users.map(async (u: any) => {
        const { data: orders } = await supabase.from('orders').select('total_amount').eq('user_id', u.id);
        return { 
          ...u, 
          total_orders: orders?.length || 0, 
          total_spent: orders?.reduce((s: number, o: any) => s + Number(o.total_amount), 0) || 0 
        };
      }));
      return enriched;
    }
  });


  const filtered = customers.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.full_name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.phone?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-5 fade-in">
      <div>
        <h1 className="page-title">Customers</h1>
        <p className="page-subtitle">{customers.length} registered customers</p>
      </div>
      <div className="card p-4">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search by name, email, or phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="form-input pl-9" />
        </div>
      </div>
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon"><Users size={28} /></div><h3 className="text-base font-semibold text-slate-700">No customers found</h3></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead><tr><th>Customer</th><th>Email</th><th>Phone</th><th>Orders</th><th>Total Spent</th><th>Joined</th></tr></thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: 'linear-gradient(135deg, #E91E63, #FF6F00)' }}>
                          {c.avatar_url ? <img src={c.avatar_url} alt="" className="w-full h-full rounded-full object-cover" /> : getInitials(c.full_name || c.email || '?')}
                        </div>
                        <span className="text-sm font-medium text-slate-700">{c.full_name || 'Unnamed'}</span>
                      </div>
                    </td>
                    <td className="text-xs text-slate-500">{c.email}</td>
                    <td className="text-xs text-slate-500">{c.phone || '—'}</td>
                    <td className="text-xs font-semibold">{c.total_orders}</td>
                    <td className="text-xs font-semibold">{formatCurrency(c.total_spent)}</td>
                    <td className="text-xs text-slate-400">{formatDate(c.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
