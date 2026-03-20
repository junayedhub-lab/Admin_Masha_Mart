import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Package, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { formatCurrency, getStockStatus, cn } from '../../../lib/utils';
import type { Product, Category } from '../../../types';
import toast from 'react-hot-toast';

export default function ProductsListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as Product[];
    }
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (error) throw error;
      return (data || []) as Category[];
    }
  });

  const loading = loadingProducts;

  async function toggleActive(product: Product) {
    const { error } = await supabase
      .from('products')
      .update({ is_active: !product.is_active })
      .eq('id', product.id);
    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(`Product ${!product.is_active ? 'activated' : 'deactivated'}`);
    }
  }

  async function deleteProduct(id: string) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted');
    } else {
      toast.error('Failed to delete product');
    }
  }

  const filtered = products.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.sku?.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter && p.category_id !== categoryFilter) return false;
    if (statusFilter === 'active' && !p.is_active) return false;
    if (statusFilter === 'inactive' && p.is_active) return false;
    if (statusFilter === 'out_of_stock' && p.stock > 0) return false;
    return true;
  });

  return (
    <div className="space-y-5 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">{products.length} total products</p>
        </div>
        <button onClick={() => navigate('/products/new')} className="btn btn-primary">
          <Plus size={16} />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input pl-9"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="form-input w-auto min-w-[160px]"
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-input w-auto min-w-[140px]"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Package size={28} /></div>
            <h3 className="text-base font-semibold text-slate-700">No products found</h3>
            <p className="text-sm text-slate-500 mt-1">Try adjusting your filters or add a new product.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(product => {
                  const stock = getStockStatus(product.stock);
                  return (
                    <tr key={product.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                            {product.images?.[0] ? (
                              <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package size={16} className="text-slate-300" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate max-w-[200px]">
                              {product.name}
                            </p>
                            {product.brand && (
                              <p className="text-[10px] text-slate-400">{product.brand}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="text-xs font-mono text-slate-500">{product.sku || '—'}</td>
                      <td>
                        <span className="badge badge-info text-[10px]">
                          {(product as any).category?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td>
                        <div>
                          <p className="text-sm font-semibold">{formatCurrency(product.price)}</p>
                          {product.original_price && product.original_price > product.price && (
                            <p className="text-[10px] text-slate-400 line-through">
                              {formatCurrency(product.original_price)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={cn(
                          'badge text-[10px]',
                          stock.type === 'success' && 'badge-success',
                          stock.type === 'warning' && 'badge-warning',
                          stock.type === 'error' && 'badge-danger',
                        )}>
                          {stock.label}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => toggleActive(product)}
                          className={cn('toggle', product.is_active && 'active')}
                        />
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => navigate(`/products/${product.id}/edit`)}
                            className="btn btn-ghost btn-icon btn-sm"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="btn btn-ghost btn-icon btn-sm text-red-500 hover:text-red-700"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
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
