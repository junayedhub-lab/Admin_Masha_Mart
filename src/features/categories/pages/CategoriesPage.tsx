import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, FolderTree, ChevronRight } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { cn } from '../../../lib/utils';
import type { Category } from '../../../types';
import toast from 'react-hot-toast';

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', parent_id: '', image_url: '', is_active: true });

  const { data: categories = [], isLoading: loading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*').order('display_order');
      if (error) throw error;
      return (data || []) as Category[];
    }
  });



  function openModal(cat?: Category) {
    if (cat) {
      setEditing(cat);
      setForm({ name: cat.name, slug: cat.slug, parent_id: cat.parent_id || '', image_url: cat.image_url || '', is_active: cat.is_active });
    } else {
      setEditing(null);
      setForm({ name: '', slug: '', parent_id: '', image_url: '', is_active: true });
    }
    setModalOpen(true);
  }

  async function handleSave() {
    const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const payload = { name: form.name, slug, parent_id: form.parent_id || null, image_url: form.image_url || null, is_active: form.is_active };
    if (editing) {
      await supabase.from('categories').update(payload).eq('id', editing.id);
      toast.success('Category updated');
    } else {
      await supabase.from('categories').insert(payload);
      toast.success('Category created');
    }
    setModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ['categories'] });
  }

  async function deleteCategory(id: string) {
    if (!confirm('Delete this category?')) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) toast.error('Cannot delete category with products');
    else { toast.success('Category deleted'); queryClient.invalidateQueries({ queryKey: ['categories'] }); }
  }

  const parents = categories.filter(c => !c.parent_id);
  const getChildren = (parentId: string) => categories.filter(c => c.parent_id === parentId);

  return (
    <div className="space-y-5 fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="page-title">Categories</h1><p className="page-subtitle">{categories.length} categories</p></div>
        <button onClick={() => openModal()} className="btn btn-primary"><Plus size={16} /> Add Category</button>
      </div>

      <div className="card overflow-hidden">
        {loading ? <div className="flex justify-center py-16"><div className="spinner" /></div> : (
          <div className="divide-y divide-slate-100">
            {parents.map(parent => (
              <div key={parent.id}>
                <div className="flex items-center justify-between px-5 py-3 hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                      {parent.image_url ? <img src={parent.image_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><FolderTree size={16} className="text-slate-300" /></div>}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{parent.name}</p>
                      <p className="text-[10px] text-slate-400">{getChildren(parent.id).length} subcategories</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setForm(f => ({ ...f, is_active: !parent.is_active }))} className={cn('toggle text-sm', parent.is_active && 'active')} />
                    <button onClick={() => openModal(parent)} className="btn btn-ghost btn-icon btn-sm"><Edit2 size={14} /></button>
                    <button onClick={() => deleteCategory(parent.id)} className="btn btn-ghost btn-icon btn-sm text-red-500"><Trash2 size={14} /></button>
                  </div>
                </div>
                {getChildren(parent.id).map(child => (
                  <div key={child.id} className="flex items-center justify-between px-5 py-2.5 pl-14 hover:bg-slate-50 bg-slate-25">
                    <div className="flex items-center gap-2">
                      <ChevronRight size={12} className="text-slate-300" />
                      <span className="text-xs font-medium text-slate-600">{child.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openModal(child)} className="btn btn-ghost btn-icon btn-sm"><Edit2 size={12} /></button>
                      <button onClick={() => deleteCategory(child.id)} className="btn btn-ghost btn-icon btn-sm text-red-500"><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3 className="text-lg font-semibold">{editing ? 'Edit Category' : 'Add Category'}</h3><button onClick={() => setModalOpen(false)} className="btn btn-ghost btn-icon btn-sm">✕</button></div>
            <div className="modal-body space-y-4">
              <div><label className="form-label">Name *</label><input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') }))} className="form-input" /></div>
              <div><label className="form-label">Slug</label><input type="text" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="form-input" /></div>
              <div><label className="form-label">Parent Category</label>
                <select value={form.parent_id} onChange={e => setForm(f => ({ ...f, parent_id: e.target.value }))} className="form-input">
                  <option value="">None (Top-level)</option>
                  {parents.filter(p => p.id !== editing?.id).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div><label className="form-label">Image URL</label><input type="text" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} className="form-input" placeholder="https://..." /></div>
            </div>
            <div className="modal-footer"><button onClick={() => setModalOpen(false)} className="btn btn-secondary">Cancel</button><button onClick={handleSave} className="btn btn-primary">Save</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
