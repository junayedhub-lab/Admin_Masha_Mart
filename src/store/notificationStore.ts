import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'cancel' | 'review' | 'system';
  created_at: string;
  is_read: boolean;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (n: Omit<Notification, 'id' | 'created_at' | 'is_read'>) => void;
  markAllRead: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (content) => {
    const newNotif: Notification = {
      id: Math.random().toString(36).substring(7),
      ...content,
      created_at: new Date().toISOString(),
      is_read: false,
    };
    
    set((state) => ({
      notifications: [newNotif, ...state.notifications].slice(0, 50),
      unreadCount: state.unreadCount + 1,
    }));

    // Browser alert
    if (content.type === 'order') toast.success(content.title, { icon: '🛍️' });
    else if (content.type === 'cancel') toast.error(content.title, { icon: '🚫' });
  },

  markAllRead: () => set((state) => ({ 
    unreadCount: 0, 
    notifications: state.notifications.map(n => ({ ...n, is_read: true })) 
  })),
  
  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));

// Real-time listener for orders
export const startNotificationListener = () => {
  const store = useNotificationStore.getState();

  supabase
    .channel('admin-notifications')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'orders' },
      (payload: any) => {
        store.addNotification({
          title: '📦 New Order Received!',
          message: `Order #${payload.new.order_number} just came in for ৳${payload.new.total_amount}.`,
          type: 'order'
        });
      }
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'orders' },
      (payload: any) => {
        if (payload.new.status === 'cancelled' && payload.old.status !== 'cancelled') {
          store.addNotification({
            title: '🚫 Order Cancelled',
            message: `Order #${payload.new.order_number} has been cancelled.`,
            type: 'cancel'
          });
        }
      }
    )
    .subscribe();
};
