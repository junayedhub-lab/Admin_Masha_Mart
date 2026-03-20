import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, ImagePlus, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { generateSlug } from '../../../lib/utils';
import type { Category } from '../../../types';
import toast from 'react-hot-toast';

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    original_price: '',
    stock: '',
    sku: '',
    brand: '',
    category_id: '',
    is_featured: false,
    is_active: true,
    tags: [] as string[],
    images: [] as string[],
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchCategories();
    if (isEdit) fetchProduct();
  }, [id]);

  async function fetchCategories() {
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) setCategories(data);
  }

  async function fetchProduct() {
    setLoading(true);
    const { data } = await supabase.from('products').select('*').eq('id', id).single();
    if (data) {
      setForm({
        name: data.name,
        slug: data.slug,
        description: data.description || '',
        price: String(data.price),
        original_price: data.original_price ? String(data.original_price) : '',
        stock: String(data.stock),
        sku: data.sku || '',
        brand: data.brand || '',
        category_id: data.category_id || '',
        is_featured: data.is_featured,
        is_active: data.is_active,
        tags: data.tags || [],
        images: data.images || [],
      });
    }
    setLoading(false);
  }

  function handleNameChange(name: string) {
    setForm(f => ({
      ...f,
      name,
      slug: isEdit ? f.slug : generateSlug(name),
    }));
  }

  function addTag() {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm(f => ({ ...f, tags: [...f.tags, tagInput.trim()] }));
      setTagInput('');
    }
  }

  function removeTag(tag: string) {
    setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }));
  }

  function addImageUrl() {
    const url = prompt('Enter image URL:');
    if (url) {
      setForm(f => ({ ...f, images: [...f.images, url] }));
    }
  }

  function removeImage(index: number) {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const price = parseFloat(form.price);
    const original_price = form.original_price ? parseFloat(form.original_price) : null;
    const discount_pct = original_price && original_price > price
      ? Math.round(((original_price - price) / original_price) * 100)
      : 0;

    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description || null,
      price,
      original_price,
      discount_pct,
      stock: parseInt(form.stock) || 0,
      sku: form.sku || null,
      brand: form.brand || null,
      category_id: form.category_id || null,
      is_featured: form.is_featured,
      is_active: form.is_active,
      tags: form.tags,
      images: form.images,
      updated_at: new Date().toISOString(),
    };

    try {
      if (isEdit) {
        const { error } = await supabase.from('products').update(payload).eq('id', id);
        if (error) throw error;
        toast.success('Product updated successfully');
      } else {
        const { error } = await supabase.from('products').insert(payload);
        if (error) throw error;
        toast.success('Product created successfully');
      }
      navigate('/products');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-5 fade-in max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/products')} className="btn btn-ghost btn-icon">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="page-title">{isEdit ? 'Edit Product' : 'Add Product'}</h1>
          <p className="page-subtitle">{isEdit ? 'Update product details' : 'Create a new product listing'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Info */}
        <div className="card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-800 border-b pb-3 border-slate-100">
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="form-label">Product Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="form-label">Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Brand</label>
              <input
                type="text"
                value={form.brand}
                onChange={(e) => setForm(f => ({ ...f, brand: e.target.value }))}
                className="form-input"
              />
            </div>
            <div className="md:col-span-2">
              <label className="form-label">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                className="form-input"
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-800 border-b pb-3 border-slate-100">
            Pricing & Stock
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="form-label">Price (৳) *</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))}
                className="form-input"
                required
                min="0"
              />
            </div>
            <div>
              <label className="form-label">Original Price (৳)</label>
              <input
                type="number"
                value={form.original_price}
                onChange={(e) => setForm(f => ({ ...f, original_price: e.target.value }))}
                className="form-input"
                min="0"
              />
            </div>
            <div>
              <label className="form-label">SKU</label>
              <input
                type="text"
                value={form.sku}
                onChange={(e) => setForm(f => ({ ...f, sku: e.target.value }))}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Stock Quantity *</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm(f => ({ ...f, stock: e.target.value }))}
                className="form-input"
                required
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Category & Visibility */}
        <div className="card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-800 border-b pb-3 border-slate-100">
            Category & Visibility
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Category</label>
              <select
                value={form.category_id}
                onChange={(e) => setForm(f => ({ ...f, category_id: e.target.value }))}
                className="form-input"
              >
                <option value="">Select Category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-6 pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, is_featured: !f.is_featured }))}
                  className={`toggle ${form.is_featured ? 'active' : ''}`}
                />
                <span className="text-sm text-slate-700">Featured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                  className={`toggle ${form.is_active ? 'active' : ''}`}
                />
                <span className="text-sm text-slate-700">Active</span>
              </label>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-800 border-b pb-3 border-slate-100">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {form.tags.map(tag => (
              <span key={tag} className="badge badge-primary flex items-center gap-1">
                {tag}
                <X size={12} className="cursor-pointer" onClick={() => removeTag(tag)} />
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); }}}
              className="form-input flex-1"
              placeholder="Add a tag..."
            />
            <button type="button" onClick={addTag} className="btn btn-secondary btn-sm">Add</button>
          </div>
        </div>

        {/* Images */}
        <div className="card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-800 border-b pb-3 border-slate-100">
            Images
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {form.images.map((url, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 group">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
                {i === 0 && (
                  <span className="absolute bottom-2 left-2 text-[10px] font-semibold bg-black/70 text-white px-2 py-0.5 rounded">
                    Cover
                  </span>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addImageUrl}
              className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:border-pink-300 hover:text-pink-500 transition-colors"
            >
              <ImagePlus size={20} />
              <span className="text-[10px]">Add Image</span>
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 justify-end">
          <button type="button" onClick={() => navigate('/products')} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              <>
                <Save size={16} />
                {isEdit ? 'Update Product' : 'Create Product'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
