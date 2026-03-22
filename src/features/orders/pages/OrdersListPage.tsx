import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Eye, ShoppingCart } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { formatCurrency, formatRelativeTime, formatDateTime } from '../../../lib/utils';
import StatusBadge from '../../../components/ui/StatusBadge';
import { adminConfig } from '../../../config/adminConfig';
import type { Order } from '../../../types';

export default function OrdersListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const channel = supabase
      .channel('orders-realtime-list')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['orders'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: orders = [], isLoading: loading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, user:users(full_name, email, phone), items:order_items(count), payment:payments(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Order[];
    }
  });

  const filtered = orders.filter(o => {
    if (statusFilter && o.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const userName = ((o as any).user?.full_name || '').toLowerCase();
      const userPhone = ((o as any).user?.phone || '').toLowerCase();
      if (!o.order_number.toLowerCase().includes(q) && !userName.includes(q) && !userPhone.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-5 fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">{orders.length} total orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by order #, customer name, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input pl-9"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-input w-auto min-w-[150px]"
          >
            <option value="">All Statuses</option>
            {adminConfig.orders.statuses.map(s => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><ShoppingCart size={28} /></div>
            <h3 className="text-base font-semibold text-slate-700">No orders found</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => {
                  const payment = Array.isArray((order as any).payment) ? (order as any).payment[0] : (order as any).payment;
                  const itemCount = Array.isArray((order as any).items) ? (order as any).items.length : 0;
                  return (
                    <tr key={order.id} className="cursor-pointer" onClick={() => navigate(`/orders/${order.id}`)}>
                      <td className="text-xs font-mono font-semibold text-pink-600">
                        #{order.order_number}
                      </td>
                      <td>
                        <div>
                          <p className="text-xs font-medium text-slate-700">
                            {(order as any).user?.full_name || 'Guest'}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {(order as any).user?.phone || ''}
                          </p>
                        </div>
                      </td>
                      <td className="text-xs text-slate-600">
                        {itemCount} {itemCount === 1 ? 'item' : 'items'}
                      </td>
                      <td className="text-sm font-bold text-slate-800">
                        {formatCurrency(order.total_amount)}
                      </td>
                      <td>
                        <div>
                          <span className="text-xs text-slate-600 capitalize">{payment?.method || '—'}</span>
                          {payment && (
                            <span className={`ml-1 badge text-[10px] ${
                              payment.status === 'paid' ? 'badge-success' : 
                              payment.status === 'pending_verification' ? 'badge-warning' : 
                              payment.status === 'failed' ? 'badge-danger' : 'badge-info'
                            }`}>
                              {payment.status}
                            </span>
                          )}
                        </div>
                      </td>
                      <td><StatusBadge status={order.status} /></td>
                      <td>
                        <div>
                          <p className="text-xs text-slate-600">{formatRelativeTime(order.created_at)}</p>
                          <p className="text-[10px] text-slate-400">{formatDateTime(order.created_at)}</p>
                        </div>
                      </td>
                      <td>
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={(e) => { e.stopPropagation(); navigate(`/orders/${order.id}`); }}>
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
