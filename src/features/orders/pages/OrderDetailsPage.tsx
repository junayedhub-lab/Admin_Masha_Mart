import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, User, CreditCard, Package, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { formatCurrency, formatDateTime, getOrderStatusColor, getOrderStatusLabel } from '../../../lib/utils';
import StatusBadge from '../../../components/ui/StatusBadge';
import { adminConfig } from '../../../config/adminConfig';
import type { Order } from '../../../types';
import toast from 'react-hot-toast';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  async function fetchOrder() {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*, user:users(*), items:order_items(*), payment:payments(*), address:addresses(*), status_history:order_status_history(*)')
      .eq('id', id)
      .single();
    if (!error && data) setOrder(data as any);
    setLoading(false);
  }

  async function updateStatus(newStatus: string) {
    if (!order) return;
    if (!confirm(`Change order status to "${getOrderStatusLabel(newStatus)}"?`)) return;

    setUpdating(true);
    try {
      const currentPayment = Array.isArray((order as any).payment) ? (order as any).payment[0] : (order as any).payment;
      
      await supabase.from('orders').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', order.id);
      
      // Automatic Payment Status for COD on Delivery
      if (newStatus === 'delivered' && currentPayment?.method === 'cod' && currentPayment?.status !== 'paid') {
        await supabase.from('payments').update({ 
          status: 'paid', 
          paid_at: new Date().toISOString() 
        }).eq('id', currentPayment.id);
      }

      await supabase.from('order_status_history').insert({
        order_id: order.id,
        status: newStatus,
        note: `Status changed to ${newStatus}${newStatus === 'delivered' && currentPayment?.method === 'cod' ? ' (Payment automatic paid)' : ''}`,
      });

      // Send notification if delivered
      if (newStatus === 'delivered' && (order as any).user_id) {
        await supabase.from('notifications').insert({
          user_id: (order as any).user_id,
          type: 'order',
          title: 'Order Delivered',
          body: `Your order #${order.order_number} has been delivered successfully. Please leave a review!`,
          data: { order_id: order.id },
          is_read: false
        });
      }
      
      toast.success(`Order status updated to ${getOrderStatusLabel(newStatus)}`);
      fetchOrder(); // Refresh data to show updated payment status
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  }

  if (loading || !order) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  const payment = Array.isArray((order as any).payment) ? (order as any).payment[0] : (order as any).payment;
  const address = Array.isArray((order as any).address) ? (order as any).address[0] : (order as any).address;
  const statusHistory = (order as any).status_history || [];

  return (
    <div className="space-y-5 fade-in max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/orders')} className="btn btn-ghost btn-icon">
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="page-title">Order #{order.order_number}</h1>
              <StatusBadge status={order.status} />
            </div>
            <p className="page-subtitle">Placed on {formatDateTime(order.created_at)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={order.status}
            onChange={(e) => updateStatus(e.target.value)}
            disabled={updating}
            className="form-input w-auto text-sm"
          >
            {adminConfig.orders.statuses.map(s => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Order Items */}
          <div className="card overflow-hidden">
            <div className="p-5 pb-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <Package size={16} />
                Order Items
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Variant</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.items || []).map(item => (
                    <tr key={item.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                            {item.product_image ? (
                              <img src={item.product_image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package size={14} className="text-slate-300" />
                              </div>
                            )}
                          </div>
                          <span className="text-xs font-medium text-slate-700">{item.product_name}</span>
                        </div>
                      </td>
                      <td className="text-xs text-slate-500">{item.variant_info || '—'}</td>
                      <td className="text-xs font-semibold">{item.quantity}</td>
                      <td className="text-xs">{formatCurrency(item.unit_price)}</td>
                      <td className="text-xs font-semibold">{formatCurrency(item.total_price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-5 bg-slate-50 space-y-1.5">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-xs text-emerald-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-slate-600">
                <span>Shipping</span>
                <span>{formatCurrency(order.shipping_fee)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-800 pt-2 border-t border-slate-200">
                <span>Total</span>
                <span>{formatCurrency(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          {statusHistory.length > 0 && (
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Clock size={16} />
                Status Timeline
              </h3>
              <div className="space-y-3">
                {statusHistory
                  .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .map((entry: any) => (
                    <div key={entry.id} className="flex items-start gap-3">
                      <div
                        className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0"
                        style={{ background: getOrderStatusColor(entry.status) }}
                      />
                      <div>
                        <p className="text-xs font-semibold text-slate-700">
                          {getOrderStatusLabel(entry.status)}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {formatDateTime(entry.created_at)}
                        </p>
                        {entry.note && (
                          <p className="text-[10px] text-slate-500 mt-0.5">{entry.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Customer */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <User size={16} />
              Customer
            </h3>
            <div className="space-y-2 text-xs">
              <p className="font-medium text-slate-700">{(order as any).user?.full_name || 'Guest'}</p>
              <p className="text-slate-500">{(order as any).user?.email}</p>
              <p className="text-slate-500">{(order as any).user?.phone || '—'}</p>
            </div>
          </div>

          {/* Address */}
          {address && (
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <MapPin size={16} />
                Delivery Address
              </h3>
              <div className="text-xs text-slate-600 space-y-1">
                <p className="font-medium text-slate-700">{address.full_name}</p>
                <p>{address.street}</p>
                <p>{[address.upazila, address.district, address.division].filter(Boolean).join(', ')}</p>
                {address.postal_code && <p>Postal Code: {address.postal_code}</p>}
                <p>{address.phone}</p>
              </div>
            </div>
          )}

          {/* Payment */}
          {payment && (
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <CreditCard size={16} />
                Payment
              </h3>
              <div className="text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Method</span>
                  <span className="font-medium text-slate-700 capitalize">{payment.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status</span>
                  <span className={`badge text-[10px] ${
                    payment.status === 'paid' ? 'badge-success' : 
                    payment.status === 'pending_verification' ? 'badge-warning' : 
                    payment.status === 'failed' ? 'badge-danger' : 'badge-info'
                  }`}>
                    {payment.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount</span>
                  <span className="font-bold text-slate-800">{formatCurrency(payment.amount)}</span>
                </div>
                {payment.transaction_id && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">TrxID</span>
                    <span className="font-mono text-slate-700">{payment.transaction_id}</span>
                  </div>
                )}
              </div>
              {/* Manual verification only for mobile banking, OR for COD if stuck in delivered */}
              {( (payment.status === 'pending_verification' && payment.method !== 'cod') || 
                 (payment.method === 'cod' && order.status === 'delivered' && payment.status !== 'paid') ) && (
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={async () => {
                      await supabase.from('payments').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', payment.id);
                      if (order.status !== 'delivered') updateStatus('confirmed');
                      toast.success('Payment marked as paid');
                      fetchOrder();
                    }}
                    className="btn btn-primary btn-sm flex-1"
                  >
                    <CheckCircle size={14} />
                    Mark as Paid
                  </button>
                  {payment.method !== 'cod' && (
                    <button
                      onClick={async () => {
                        await supabase.from('payments').update({ status: 'failed' }).eq('id', payment.id);
                        toast.success('Payment rejected');
                        fetchOrder();
                      }}
                      className="btn btn-danger btn-sm flex-1"
                    >
                      Reject
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-2">Customer Notes</h3>
              <p className="text-xs text-slate-600">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
