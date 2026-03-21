import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Image, Layout, ArrowDownCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { cn } from '../../../lib/utils';
import type { Banner } from '../../../types';
import toast from 'react-hot-toast';

export default function BannersPage() {
  const [activeTab, setActiveTab] = useState<'top' | 'bottom'>('top');
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  
  const [form, setForm] = useState({ 
    title: '', 
    image_url: '', 
    link_type: '' as string, 
    link_value: '', 
    display_order: 0, 
    is_active: true 
  });

  useEffect(() => { fetchBanners(); }, []);

  async function fetchBanners() { 
    setLoading(true); 
    const { data } = await supabase.from('banners').select('*').order('display_order'); 
    if (data) setBanners(data); 
    setLoading(false); 
  }

  // Filter banners based on active tab
  // Top: 0, 1, 2
  // Bottom: 3, 4
  const filteredBanners = banners.filter(b => {
    if (activeTab === 'top') return b.display_order <= 2;
    return b.display_order >= 3;
  });

  function openModal(b?: Banner) {
    if (b) { 
      setEditing(b); 
      setForm({ 
        title: b.title || '', 
        image_url: b.image_url, 
        link_type: b.link_type || '', 
        link_value: b.link_value || '', 
        display_order: b.display_order, 
        is_active: b.is_active 
      }); 
    } else { 
      setEditing(null); 
      // Default order based on tab
      const defaultOrder = activeTab === 'top' ? 0 : 3;
      setForm({ 
        title: '', 
        image_url: '', 
        link_type: '', 
        link_value: '', 
        display_order: defaultOrder, 
        is_active: true 
      }); 
    }
    setModalOpen(true);
  }

  async function handleSave() {
    const payload = { 
      title: form.title || null, 
      image_url: form.image_url, 
      link_type: form.link_type || null, 
      link_value: form.link_value || null, 
      display_order: form.display_order, 
      is_active: form.is_active 
    };

    if (editing) { 
      await supabase.from('banners').update(payload).eq('id', editing.id); 
      toast.success('Banner updated'); 
    } else { 
      await supabase.from('banners').insert(payload); 
      toast.success('Banner created'); 
    }
    setModalOpen(false); 
    fetchBanners();
  }

  async function deleteBanner(id: string) { 
    if (!confirm('Delete this banner?')) return; 
    await supabase.from('banners').delete().eq('id', id); 
    toast.success('Deleted'); 
    fetchBanners(); 
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Banners</h1>
          <p className="page-subtitle">Manage all promotional banners</p>
        </div>
        <button onClick={() => openModal()} className="btn btn-primary">
          <Plus size={16} /> Add Banner
        </button>
      </div>

      {/* Tabs for Section Selection */}
      <div className="flex p-1 bg-slate-100 rounded-xl w-fit">
        <button 
          onClick={() => setActiveTab('top')}
          className={cn(
            "flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all",
            activeTab === 'top' ? "bg-white text-pink-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <Layout size={16} /> Top Banners
        </button>
        <button 
          onClick={() => setActiveTab('bottom')}
          className={cn(
            "flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all",
            activeTab === 'bottom' ? "bg-white text-pink-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <ArrowDownCircle size={16} /> Bottom Banners
        </button>
      </div>

      {/* Dynamic Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? <div className="col-span-2 flex justify-center py-16"><div className="spinner" /></div> :
          filteredBanners.length === 0 ? (
            <div className="col-span-2 card py-20 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed">
              <Image size={40} className="mb-4 opacity-20" />
              <p className="text-sm font-medium">No banners for this section yet</p>
            </div>
          ) :
          filteredBanners.map(b => (
            <div key={b.id} className="card overflow-hidden card-hover border-slate-100">
              <div className="aspect-[3/1] bg-slate-100 relative overflow-hidden group">
                <img src={b.image_url} alt={b.title || ''} className="w-full h-full object-cover" />
                {!b.is_active && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><span className="badge badge-danger">Inactive</span></div>}
                
                {/* Position Badge Overlay */}
                <div className="absolute top-2 left-2">
                  <span className="bg-black/60 text-white text-[9px] font-bold px-2 py-1 rounded backdrop-blur-sm uppercase">
                    Order: {b.display_order} 
                    {activeTab === 'top' && b.display_order === 2 && " (Static)"}
                    {activeTab === 'top' && b.display_order < 2 && " (Slider)"}
                  </span>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-700">{b.title || 'Untitled Banner'}</p>
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
            <div className="modal-header">
              <h3 className="text-lg font-semibold">{editing ? 'Edit Banner' : 'Add Banner'}</h3>
              <button onClick={() => setModalOpen(false)} className="btn btn-ghost btn-icon btn-sm">✕</button>
            </div>
            <div className="modal-body space-y-4">
              <div>
                <label className="form-label">Placement Section</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="tab_select" 
                      checked={form.display_order <= 2} 
                      onChange={() => setForm(f => ({ ...f, display_order: 0 }))}
                    /> 
                    <span className="text-sm text-slate-600">Top Hero</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="tab_select" 
                      checked={form.display_order >= 3} 
                      onChange={() => setForm(f => ({ ...f, display_order: 3 }))}
                    /> 
                    <span className="text-sm text-slate-600">Bottom Section</span>
                  </label>
                </div>
              </div>

              <div><label className="form-label">Banner Title</label><input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="form-input" /></div>
              <div><label className="form-label">Image URL *</label><input type="text" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} className="form-input" placeholder="https://..." /></div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Precise Order</label>
                  <select 
                    value={form.display_order} 
                    onChange={e => setForm(f => ({ ...f, display_order: parseInt(e.target.value) }))} 
                    className="form-input"
                  >
                    {form.display_order <= 2 ? (
                      <>
                        <option value={0}>Slider Item 1</option>
                        <option value={1}>Slider Item 2</option>
                        <option value={2}>Static Side Banner (400x400)</option>
                      </>
                    ) : (
                      <>
                        <option value={3}>Bottom Left (600x400)</option>
                        <option value={4}>Bottom Right (600x400)</option>
                      </>
                    )}
                  </select>
                </div>
                <div><label className="form-label text-slate-300">Section Lock</label><div className="bg-slate-50 p-2.5 rounded-lg text-xs font-bold text-slate-400 capitalize">{form.display_order <= 2 ? 'Hero Area' : 'Bottom Area'}</div></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><label className="form-label">Link Type</label><select value={form.link_type} onChange={e => setForm(f => ({ ...f, link_type: e.target.value }))} className="form-input"><option value="">None</option><option value="product">Product</option><option value="category">Category</option><option value="url">URL</option></select></div>
                <div><label className="form-label">Link Value</label><input type="text" value={form.link_value} onChange={e => setForm(f => ({ ...f, link_value: e.target.value }))} className="form-input" /></div>
              </div>
              
              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <button type="button" onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))} className={cn('toggle', form.is_active && 'active')} />
                <span className="text-sm font-medium text-slate-700">Banner Visible</span>
              </label>
            </div>
            <div className="modal-footer">
              <button onClick={() => setModalOpen(false)} className="btn btn-secondary">Cancel</button>
              <button onClick={handleSave} className="btn btn-primary px-8">Save Banner</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
