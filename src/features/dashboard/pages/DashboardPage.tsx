import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, DollarSign, Users, Clock, Package, AlertTriangle, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import StatCard from '../../../components/ui/StatCard';
import StatusBadge from '../../../components/ui/StatusBadge';
import { supabase } from '../../../lib/supabase';
import { formatCurrency, formatRelativeTime, getPercentChange } from '../../../lib/utils';
import { adminConfig } from '../../../config/adminConfig';
import type { Order, RevenueDataPoint } from '../../../types';

export default function DashboardPage() {
  const navigate = useNavigate();

  const { data, isLoading: loading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Fetch orders
      const { data: allOrders } = await supabase
        .from('orders')
        .select('*, user:users(full_name, email, phone), items:order_items(*), payment:payments(*)')
        .order('created_at', { ascending: false });

      const orders = allOrders || [];

      // Today's stats
      const todayOrders = orders.filter((o: any) => new Date(o.created_at) >= today);
      const yesterdayOrders = orders.filter((o: any) => {
        const d = new Date(o.created_at);
        return d >= yesterday && d < today;
      });

      const todayRevenue = todayOrders.reduce((sum: number, o: any) => sum + Number(o.total_amount), 0);
      const yesterdayRevenue = yesterdayOrders.reduce((sum: number, o: any) => sum + Number(o.total_amount), 0);

      const pendingOrders = orders.filter((o: any) => o.status === 'pending').length;

      // Customers
      const { count: totalCustomers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

        // Revenue data (last 7 days)
      const revenuePoints: RevenueDataPoint[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const nextDay = new Date(d);
        nextDay.setDate(nextDay.getDate() + 1);

        const dayOrders = orders.filter((o: any) => {
          const od = new Date(o.created_at);
          return od >= d && od < nextDay;
        });

        revenuePoints.push({
          date: d.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
          revenue: dayOrders.reduce((sum: number, o: any) => sum + Number(o.total_amount), 0),
          orders: dayOrders.length,
        });
      }

      // Orders by status for pie chart
      const statusGroups = orders.reduce((acc: any, o: any) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
      }, {});

      const statusCounts = adminConfig.orders.statuses.map(s => ({
        name: s.label,
        value: statusGroups[s.id] || 0,
        color: s.color || '#CBD5E1'
      })).filter(s => s.value > 0);

      // Top Products (based on orders_count field if it exists, or just top 5)
      const { data: topProductsData } = await supabase
        .from('products')
        .select('*')
        .order('review_count', { ascending: false }) // Fallback to reviews if orders_count is missing
        .limit(5);

      // Low Stock Products
      const { data: lowStockData } = await supabase
        .from('products')
        .select('*')
        .lte('stock', adminConfig.business.low_stock_threshold)
        .order('stock', { ascending: true })
        .limit(5);
      
      return {
        stats: {
          todayOrders: todayOrders.length,
          todayRevenue,
          newCustomers: totalCustomers || 0,
          pendingOrders,
          yesterdayOrders: yesterdayOrders.length,
          yesterdayRevenue,
          yesterdayCustomers: 0,
        },
        recentOrders: orders.slice(0, 8) as Order[],
        ordersByStatus: statusCounts,
        topProducts: (topProductsData as any[]) || [],
        lowStockProducts: (lowStockData as any[]) || [],
        revenueData: revenuePoints
      };
    }
  });

  const { stats, recentOrders = [], ordersByStatus = [], topProducts = [], lowStockProducts = [], revenueData = [] } = data || {};

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  const orderChange = stats ? getPercentChange(stats.todayOrders, stats.yesterdayOrders) : undefined;
  const revenueChange = stats ? getPercentChange(stats.todayRevenue, stats.yesterdayRevenue) : undefined;

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome back! Here's what's happening today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Orders"
          value={String(stats?.todayOrders || 0)}
          change={orderChange}
          icon={ShoppingCart}
          iconColor="#2563EB"
          iconBg="#DBEAFE"
        />
        <StatCard
          title="Today's Revenue"
          value={formatCurrency(stats?.todayRevenue || 0)}
          change={revenueChange}
          icon={DollarSign}
          iconColor="#16A34A"
          iconBg="#DCFCE7"
        />
        <StatCard
          title="Total Customers"
          value={String(stats?.newCustomers || 0)}
          icon={Users}
          iconColor="#9333EA"
          iconBg="#F3E8FF"
        />
        <StatCard
          title="Pending Orders"
          value={String(stats?.pendingOrders || 0)}
          icon={Clock}
          iconColor="#D97706"
          iconBg="#FEF3C7"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Revenue Overview</h3>
              <p className="text-xs text-slate-500 mt-0.5">Last 7 days</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
              <TrendingUp size={12} />
              Revenue Trend
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: '#0F172A',
                  border: 'none',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '12px',
                  padding: '10px 14px',
                }}
                formatter={(value: any) => [formatCurrency(Number(value)), 'Revenue']}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#E91E63"
                strokeWidth={2.5}
                dot={{ fill: '#E91E63', r: 4, strokeWidth: 2, stroke: 'white' }}
                activeDot={{ r: 6, fill: '#E91E63', strokeWidth: 3, stroke: 'white' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Orders by Status Pie */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Orders by Status</h3>
          {ordersByStatus.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={ordersByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {ordersByStatus.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#0F172A', border: 'none', borderRadius: '10px', color: 'white', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {ordersByStatus.map((s) => (
                  <div key={s.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                      <span className="text-slate-600">{s.name}</span>
                    </div>
                    <span className="font-semibold text-slate-800">{s.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-48 text-sm text-slate-400">
              No orders yet
            </div>
          )}
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Orders */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between p-5 pb-3">
            <h3 className="text-sm font-semibold text-slate-800">Recent Orders</h3>
            <button onClick={() => navigate('/orders')} className="text-xs font-medium text-pink-600 hover:text-pink-700">
              View All →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-slate-400 py-8">No orders yet</td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="cursor-pointer"
                      onClick={() => navigate(`/orders/${order.id}`)}
                    >
                      <td className="text-xs font-mono font-semibold text-pink-600">
                        #{order.order_number}
                      </td>
                      <td className="text-xs text-slate-600">
                        {(order as any).user?.full_name || 'Guest'}
                      </td>
                      <td className="text-xs font-semibold">{formatCurrency(order.total_amount)}</td>
                      <td><StatusBadge status={order.status} /></td>
                      <td className="text-xs text-slate-400">{formatRelativeTime(order.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products & Low Stock */}
        <div className="space-y-4">
          {/* Top Products */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between p-5 pb-3">
              <h3 className="text-sm font-semibold text-slate-800">Top Selling Products</h3>
              <button onClick={() => navigate('/products')} className="text-xs font-medium text-pink-600 hover:text-pink-700">
                View All →
              </button>
            </div>
            <div className="px-5 pb-4 space-y-3">
              {topProducts.map((product, i) => (
                <div key={product.id} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 w-5">#{i + 1}</span>
                  <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={16} className="text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">{product.name}</p>
                    <p className="text-[10px] text-slate-400">{product.orders_count} orders</p>
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    {formatCurrency(product.price)}
                  </span>
                </div>
              ))}
              {topProducts.length === 0 && (
                <p className="text-center text-sm text-slate-400 py-4">No products yet</p>
              )}
            </div>
          </div>

          {/* Low Stock Alerts */}
          {lowStockProducts.length > 0 && (
            <div className="card overflow-hidden border-orange-200">
              <div className="flex items-center gap-2 p-5 pb-3">
                <AlertTriangle size={16} className="text-orange-500" />
                <h3 className="text-sm font-semibold text-slate-800">Low Stock Alerts</h3>
              </div>
              <div className="px-5 pb-4 space-y-2.5">
                {lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between py-1 cursor-pointer hover:bg-slate-50 -mx-2 px-2 rounded-lg"
                    onClick={() => navigate(`/products/${product.id}/edit`)}
                  >
                    <span className="text-xs text-slate-600 truncate flex-1">{product.name}</span>
                    <span className={`badge text-[10px] ${product.stock <= 0 ? 'badge-danger' : 'badge-warning'}`}>
                      {product.stock <= 0 ? 'Out of Stock' : `${product.stock} left`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
