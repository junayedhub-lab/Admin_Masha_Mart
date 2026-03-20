import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { Star, CheckCircle, XCircle, Trash2, MessageSquare } from 'lucide-react';
import { formatDateTime } from '../../../lib/utils';
import toast from 'react-hot-toast';

export default function ReviewsManagementPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['admin-reviews', filter],
    queryFn: async () => {
      let query = supabase
        .from('reviews')
        .select('*, user:users(full_name, email), product:products(name, images)')
        .order('created_at', { ascending: false });

      if (filter === 'pending') query = query.eq('is_approved', false);
      if (filter === 'approved') query = query.eq('is_approved', true);

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as any[];
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, is_approved }: { id: string; is_approved: boolean }) => {
      const { error } = await supabase
        .from('reviews')
        .update({ is_approved })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast.success('Review status updated');
    },
    onError: () => toast.error('Failed to update review status')
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast.success('Review deleted');
    },
    onError: () => toast.error('Failed to delete review')
  });

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title">Reviews Management</h1>
          <p className="page-subtitle">Moderate and manage customer product reviews</p>
        </div>
        <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
          {(['all', 'pending', 'approved'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                filter === f 
                  ? 'bg-pink-600 text-white shadow-md' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="spinner" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="empty-state py-20">
            <div className="empty-state-icon"><MessageSquare size={32} /></div>
            <h3 className="text-slate-800 font-semibold">No reviews found</h3>
            <p className="text-slate-500 text-sm">No reviews match your current filter</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Customer</th>
                  <th>Rating</th>
                  <th>Review</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <tr key={review.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <img 
                          src={review.product?.images?.[0] || 'https://via.placeholder.com/100'} 
                          alt="" 
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                        />
                        <span className="text-xs font-medium text-slate-700 max-w-[150px] truncate">
                          {review.product?.name}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-slate-800">{review.user?.full_name || 'Guest'}</p>
                        <p className="text-[10px] text-slate-400">{review.user?.email || ''}</p>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={12} 
                            fill={i < review.rating ? '#FFB300' : 'transparent'} 
                            stroke={i < review.rating ? '#FFB300' : '#CBD5E1'} 
                          />
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="max-w-[300px]">
                        {review.title && <p className="text-xs font-bold text-slate-800 truncate mb-0.5">{review.title}</p>}
                        <p className="text-xs text-slate-600 line-clamp-2">{review.body}</p>
                      </div>
                    </td>
                    <td>
                      <span className={`badge text-[10px] ${review.is_approved ? 'badge-success' : 'badge-warning'}`}>
                        {review.is_approved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="text-[10px] text-slate-400">
                      {formatDateTime(review.created_at)}
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        {review.is_approved ? (
                          <button 
                            onClick={() => updateStatusMutation.mutate({ id: review.id, is_approved: false })}
                            className="btn btn-ghost btn-icon text-orange-500 hover:bg-orange-50"
                            title="Unapprove"
                          >
                            <XCircle size={16} />
                          </button>
                        ) : (
                          <button 
                            onClick={() => updateStatusMutation.mutate({ id: review.id, is_approved: true })}
                            className="btn btn-ghost btn-icon text-emerald-500 hover:bg-emerald-50"
                            title="Approve"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            if(confirm('Are you sure you want to delete this review?')) {
                              deleteMutation.mutate(review.id);
                            }
                          }}
                          className="btn btn-ghost btn-icon text-red-500 hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
