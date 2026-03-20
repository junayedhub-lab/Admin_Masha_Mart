import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { formatCurrency, formatDate, cn } from '../../../lib/utils';
import type { Coupon } from '../../../types';
import toast from 'react-hot-toast';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState({ code: '', type: 'percentage' as 'flat' | 'percentage', value: '', min_order_amount: '', max_discount: '', usage_limit: '', valid_from: '', valid_until: '', is_active: true });

  useEffect(() => { fetchCoupons(); }, []);
  async function fetchCoupons() { setLoading(true); const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false }); if (data) setCoupons(data); setLoading(false); }

  function openModal(c?: Coupon) {
    if (c) { setEditing(c); setForm({ code: c.code, type: c.type, value: String(c.value), min_order_amount: String(c.min_order_amount || ''), max_discount: c.max_discount ? String(c.max_discount) : '', usage_limit: c.usage_limit ? String(c.usage_limit) : '', valid_from: c.valid_from?.slice(0, 10) || '', valid_until: c.valid_until?.slice(0, 10) || '', is_active: c.is_active }); }
    else { setEditing(null); setForm({ code: '', type: 'percentage', value: '', min_order_amount: '', max_discount: '', usage_limit: '', valid_from: '', valid_until: '', is_active: true }); }
    setModalOpen(true);
  }

  async function handleSave() {
    const payload = { code: form.code.toUpperCase(), type: form.type, value: parseFloat(form.value), min_order_amount: form.min_order_amount ? parseFloat(form.min_order_amount) : 0, max_discount: form.max_discount ? parseFloat(form.max_discount) : null, usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null, valid_from: form.valid_from || null, valid_until: form.valid_until || null, is_active: form.is_active };
    if (editing) { await supabase.from('coupons').update(payload).eq('id', editing.id); toast.success('Coupon updated'); }
    else { await supabase.from('coupons').insert(payload); toast.success('Coupon created'); }
    setModalOpen(false); fetchCoupons();
  }

  async function deleteCoupon(id: string) { if (!confirm('Delete this coupon?')) return; await supabase.from('coupons').delete().eq('id', id); toast.success('Deleted'); fetchCoupons(); }

  return (
    <div className="space-y-5 fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="page-title">Coupons</h1><p className="page-subtitle">Manage discount coupons</p></div>
        <button onClick={() => openModal()} className="btn btn-primary"><Plus size={16} /> Add Coupon</button>
      </div>
      <div className="card overflow-hidden">
        {loading ? <div className="flex justify-center py-16"><div className="spinner" /></div> : coupons.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon"><Tag size={28} /></div><h3 className="text-base font-semibold text-slate-700">No coupons yet</h3></div>
        ) : (
          <div className="overflow-x-auto"><table className="admin-table"><thead><tr><th>Code</th><th>Type</th><th>Value</th><th>Min Order</th><th>Usage</th><th>Valid Until</th><th>Active</th><th>Actions</th></tr></thead>
            <tbody>{coupons.map(c => (
              <tr key={c.id}>
                <td><span className="font-mono font-bold text-sm text-pink-600">{c.code}</span></td>
                <td><span className="badge badge-info text-[10px]">{c.type}</span></td>
                <td className="text-sm font-semibold">{c.type === 'percentage' ? `${c.value}%` : formatCurrency(c.value)}</td>
                <td className="text-xs text-slate-500">{c.min_order_amount ? formatCurrency(c.min_order_amount) : '—'}</td>
                <td className="text-xs">{c.used_count}/{c.usage_limit || '∞'}</td>
                <td className="text-xs text-slate-500">{c.valid_until ? formatDate(c.valid_until) : '—'}</td>
                <td><button onClick={async () => { await supabase.from('coupons').update({ is_active: !c.is_active }).eq('id', c.id); fetchCoupons(); }} className={cn('toggle', c.is_active && 'active')} /></td>
                <td><div className="flex gap-1"><button onClick={() => openModal(c)} className="btn btn-ghost btn-icon btn-sm"><Edit2 size={14} /></button><button onClick={() => deleteCoupon(c.id)} className="btn btn-ghost btn-icon btn-sm text-red-500"><Trash2 size={14} /></button></div></td>
              </tr>
            ))}</tbody></table></div>
        )}
      </div>
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3 className="text-lg font-semibold">{editing ? 'Edit Coupon' : 'Add Coupon'}</h3><button onClick={() => setModalOpen(false)} className="btn btn-ghost btn-icon btn-sm">✕</button></div>
            <div className="modal-body space-y-4">
              <div><label className="form-label">Coupon Code *</label><input type="text" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} className="form-input font-mono uppercase" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="form-label">Type</label><select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))} className="form-input"><option value="percentage">Percentage</option><option value="flat">Flat Amount</option></select></div>
                <div><label className="form-label">Value *</label><input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} className="form-input" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="form-label">Min Order (৳)</label><input type="number" value={form.min_order_amount} onChange={e => setForm(f => ({ ...f, min_order_amount: e.target.value }))} className="form-input" /></div>
                <div><label className="form-label">Max Discount (৳)</label><input type="number" value={form.max_discount} onChange={e => setForm(f => ({ ...f, max_discount: e.target.value }))} className="form-input" /></div>
              </div>
              <div><label className="form-label">Usage Limit</label><input type="number" value={form.usage_limit} onChange={e => setForm(f => ({ ...f, usage_limit: e.target.value }))} className="form-input" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="form-label">Valid From</label><input type="date" value={form.valid_from} onChange={e => setForm(f => ({ ...f, valid_from: e.target.value }))} className="form-input" /></div>
                <div><label className="form-label">Valid Until</label><input type="date" value={form.valid_until} onChange={e => setForm(f => ({ ...f, valid_until: e.target.value }))} className="form-input" /></div>
              </div>
            </div>
            <div className="modal-footer"><button onClick={() => setModalOpen(false)} className="btn btn-secondary">Cancel</button><button onClick={handleSave} className="btn btn-primary">Save</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
