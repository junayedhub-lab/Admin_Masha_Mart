import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, TrendingUp, ShoppingBag, Users, ArrowUpRight, ArrowDownRight, Download } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { formatCurrency, cn } from '../../../lib/utils';
import { adminConfig } from '../../../config/adminConfig';

export default function SalesReportPage() {
  const [dateRange, setDateRange] = useState<'today' | '7d' | '30d' | 'all'>('30d');

  const { data: orders = [], isLoading } = useQuery<any[]>({
    queryKey: ['sales-report'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const stats = useMemo(() => {
    const now = new Date();
    const filtered = orders.filter((o: any) => {
      const orderDate = new Date(o.created_at);
      if (dateRange === 'today') return orderDate.toDateString() === now.toDateString();
      if (dateRange === '7d') return (now.getTime() - orderDate.getTime()) <= 7 * 24 * 60 * 60 * 1000;
      if (dateRange === '30d') return (now.getTime() - orderDate.getTime()) <= 30 * 24 * 60 * 60 * 1000;
      return true;
    });

    const totalRevenue = filtered.reduce((acc: number, o: any) => acc + (o.total_amount || 0), 0);
    const totalOrders = filtered.length;
    const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Simple mock logic for "change" percentage
    const change = {
      revenue: 12.5,
      orders: 8.2,
      aov: -2.4,
      customers: 15.3
    };

    return { totalRevenue, totalOrders, aov, filtered, change };
  }, [orders, dateRange]);

  if (isLoading) return <div className="flex h-96 items-center justify-center"><div className="spinner" /></div>;

  return (
    <div className="space-y-6 fade-in pb-10">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title text-2xl font-black text-slate-800 tracking-tight">Sales Analytics</h1>
          <p className="page-subtitle text-slate-500 font-medium">Detailed overview of your store's performance</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex p-1 bg-slate-100 rounded-xl">
            {(['today', '7d', '30d', 'all'] as const).map(range => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider",
                  dateRange === range ? "bg-white text-pink-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
                )}
              >
                {range}
              </button>
            ))}
          </div>
          <button className="btn btn-secondary btn-sm gap-2 border-slate-200">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Revenue" 
          value={formatCurrency(stats.totalRevenue)} 
          icon={TrendingUp} 
          color="rose" 
          change={stats.change.revenue}
        />
        <StatCard 
          title="Total Orders" 
          value={stats.totalOrders.toString()} 
          icon={ShoppingBag} 
          color="blue" 
          change={stats.change.orders}
        />
        <StatCard 
          title="Avg. Order Value" 
          value={formatCurrency(stats.aov)} 
          icon={BarChart3} 
          color="purple" 
          change={stats.change.aov}
        />
        <StatCard 
          title="New Customers" 
          value="48" 
          icon={Users} 
          color="emerald" 
          change={stats.change.customers}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart Mockup */}
        <div className="lg:col-span-2 card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Revenue Forecast</h3>
            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded font-black">LIVE</span>
          </div>
          <div className="h-[250px] w-full flex items-end gap-2 px-2">
            {[40, 65, 45, 90, 55, 75, 85, 30, 60, 95, 70, 80].map((h, i) => (
              <div key={i} className="flex-1 group relative">
                <div 
                  className="w-full bg-slate-100 rounded-t-lg transition-all duration-500 group-hover:bg-rose-500" 
                  style={{ height: `${h}%` }}
                />
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  ৳{(h * 10).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-bold px-2 uppercase tracking-widest pt-2">
            <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Nov</span>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="card p-6 space-y-6">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Order Fulfillment</h3>
          <div className="space-y-5">
            {adminConfig.orders.statuses.map(status => {
              const count = stats.filtered.filter((o: any) => o.status === status.id).length;
              const pct = stats.totalOrders > 0 ? (count / stats.totalOrders) * 100 : 0;
              return (
                <div key={status.id} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-600 uppercase tracking-tighter" style={{ color: status.color }}>{status.label}</span>
                    <span className="font-black text-slate-800">{count}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${pct}%`, backgroundColor: status.color }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent High Value Orders */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Recent Transactions</h3>
          <button className="text-[10px] font-black text-rose-500 hover:underline uppercase tracking-widest">View All</button>
        </div>
        <div className="overflow-x-auto text-xs">
          <table className="admin-table">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="py-2.5 font-black uppercase text-slate-400">Order</th>
                <th className="py-2.5 font-black uppercase text-slate-400">Customer</th>
                <th className="py-2.5 font-black uppercase text-slate-400">Items</th>
                <th className="py-2.5 font-black uppercase text-slate-400">Amount</th>
                <th className="py-2.5 font-black uppercase text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.filtered.slice(0, 5).map((order: any) => (
                <tr key={order.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-50 last:border-0 cursor-pointer">
                  <td className="font-mono font-bold text-rose-600">#{order.order_number}</td>
                  <td>
                    <div className="font-bold text-slate-700">Guest Order</div>
                    <div className="text-[10px] text-slate-400 italic">Verified Checkout</div>
                  </td>
                  <td className="font-medium text-slate-500">{order.order_items?.length || 0} Products</td>
                  <td className="font-black text-slate-800">{formatCurrency(order.total_amount)}</td>
                  <td>
                    <span 
                      className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tight"
                      style={{ 
                        backgroundColor: adminConfig.orders.statuses.find(s => s.id === order.status)?.color + '15',
                        color: adminConfig.orders.statuses.find(s => s.id === order.status)?.color
                      }}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, change }: { title: string, value: string, icon: any, color: 'rose' | 'blue' | 'purple' | 'emerald', change: number }) {
  const colors = {
    rose: 'bg-rose-50 text-rose-500 border-rose-100',
    blue: 'bg-blue-50 text-blue-500 border-blue-100',
    purple: 'bg-purple-50 text-purple-500 border-purple-100',
    emerald: 'bg-emerald-50 text-emerald-500 border-emerald-100',
  };

  const isPositive = change >= 0;

  return (
    <div className="card p-5 group hover:border-rose-200 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-500 group-hover:rotate-12", colors[color])}>
          <Icon size={20} />
        </div>
        <div className={cn(
          "flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full",
          isPositive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
        )}>
          {isPositive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
          {Math.abs(change)}%
        </div>
      </div>
      <div className="mt-4">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">{title}</h4>
        <p className="text-2xl font-black text-slate-800 tracking-tight mt-1">{value}</p>
      </div>
    </div>
  );
}
