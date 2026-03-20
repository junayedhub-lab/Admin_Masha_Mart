import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Image } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { cn } from '../../../lib/utils';
import type { Banner } from '../../../types';
import toast from 'react-hot-toast';

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState({ title: '', image_url: '', link_type: '' as string, link_value: '', display_order: 0, is_active: true });

  useEffect(() => { fetchBanners(); }, []);
  async function fetchBanners() { setLoading(true); const { data } = await supabase.from('banners').select('*').order('display_order'); if (data) setBanners(data); setLoading(false); }

  function openModal(b?: Banner) {
    if (b) { setEditing(b); setForm({ title: b.title || '', image_url: b.image_url, link_type: b.link_type || '', link_value: b.link_value || '', display_order: b.display_order, is_active: b.is_active }); }
    else { setEditing(null); setForm({ title: '', image_url: '', link_type: '', link_value: '', display_order: banners.length, is_active: true }); }
    setModalOpen(true);
  }

  async function handleSave() {
    const payload = { title: form.title || null, image_url: form.image_url, link_type: form.link_type || null, link_value: form.link_value || null, display_order: form.display_order, is_active: form.is_active };
    if (editing) { await supabase.from('banners').update(payload).eq('id', editing.id); toast.success('Banner updated'); }
    else { await supabase.from('banners').insert(payload); toast.success('Banner created'); }
    setModalOpen(false); fetchBanners();
  }

  async function deleteBanner(id: string) { if (!confirm('Delete this banner?')) return; await supabase.from('banners').delete().eq('id', id); toast.success('Deleted'); fetchBanners(); }

  return (
    <div className="space-y-5 fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="page-title">Banners</h1><p className="page-subtitle">Manage homepage banners</p></div>
        <button onClick={() => openModal()} className="btn btn-primary"><Plus size={16} /> Add Banner</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? <div className="col-span-2 flex justify-center py-16"><div className="spinner" /></div> :
          banners.length === 0 ? <div className="col-span-2 card empty-state"><div className="empty-state-icon"><Image size={28} /></div><h3 className="text-base font-semibold text-slate-700">No banners yet</h3></div> :
          banners.map(b => (
            <div key={b.id} className="card overflow-hidden card-hover">
              <div className="aspect-[3/1] bg-slate-100 relative overflow-hidden">
                <img src={b.image_url} alt={b.title || ''} className="w-full h-full object-cover" />
                {!b.is_active && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><span className="badge badge-danger">Inactive</span></div>}
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-700">{b.title || 'Untitled'}</p>
                  <p className="text-[10px] text-slate-400">Order: {b.display_order}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openModal(b)} className="btn btn-ghost btn-icon btn-sm"><Edit2 size={14} /></button>
                  <button onClick={() => deleteBanner(b.id)} className="btn btn-ghost btn-icon btn-sm text-red-500"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))
        }
      </div>
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3 className="text-lg font-semibold">{editing ? 'Edit Banner' : 'Add Banner'}</h3><button onClick={() => setModalOpen(false)} className="btn btn-ghost btn-icon btn-sm">✕</button></div>
            <div className="modal-body space-y-4">
              <div><label className="form-label">Title</label><input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="form-input" /></div>
              <div><label className="form-label">Image URL *</label><input type="text" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} className="form-input" placeholder="https://..." /></div>
              {form.image_url && <div className="aspect-[3/1] rounded-lg overflow-hidden bg-slate-100"><img src={form.image_url} alt="" className="w-full h-full object-cover" /></div>}
              <div className="grid grid-cols-2 gap-3">
                <div><label className="form-label">Link Type</label><select value={form.link_type} onChange={e => setForm(f => ({ ...f, link_type: e.target.value }))} className="form-input"><option value="">None</option><option value="product">Product</option><option value="category">Category</option><option value="url">URL</option></select></div>
                <div><label className="form-label">Link Value</label><input type="text" value={form.link_value} onChange={e => setForm(f => ({ ...f, link_value: e.target.value }))} className="form-input" /></div>
              </div>
              <div><label className="form-label">Display Order</label><input type="number" value={form.display_order} onChange={e => setForm(f => ({ ...f, display_order: parseInt(e.target.value) || 0 }))} className="form-input" /></div>
              <label className="flex items-center gap-2 cursor-pointer"><button type="button" onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))} className={cn('toggle', form.is_active && 'active')} /><span className="text-sm text-slate-700">Active</span></label>
            </div>
            <div className="modal-footer"><button onClick={() => setModalOpen(false)} className="btn btn-secondary">Cancel</button><button onClick={handleSave} className="btn btn-primary">Save</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
