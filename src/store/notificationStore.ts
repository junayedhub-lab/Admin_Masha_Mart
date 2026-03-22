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
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAllRead: () => Promise<void>;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async () => {
    set({ loading: true });
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .is('user_id', null)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (data) {
      const notifications = data.map((n: any) => ({
        id: n.id,
        title: n.title,
        message: n.body || '',
        type: n.type as any,
        created_at: n.created_at,
        is_read: n.is_read
      }));
      set({ 
        notifications, 
        unreadCount: notifications.filter((n: any) => !n.is_read).length 
      });
    }
    set({ loading: false });
  },

  markAllRead: async () => {
    const { notifications } = get();
    set({ unreadCount: 0, notifications: notifications.map((n: any) => ({ ...n, is_read: true })) });
    await supabase.from('notifications').update({ is_read: true }).eq('is_read', false).is('user_id', null);
  },
  
  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));

// Module-level guard to prevent duplicate channel subscriptions
let adminNotifChannel: ReturnType<typeof supabase.channel> | null = null;

export const startNotificationListener = () => {
  // If already listening, don't create another channel
  if (adminNotifChannel) return;

  const store = useNotificationStore.getState();
  store.fetchNotifications();

  adminNotifChannel = supabase
    .channel('admin-notifications-realtime')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications' },
      (payload: any) => {
        const n = payload.new;
        if (n.user_id !== null) return;
        
        const newNotif: Notification = {
          id: n.id,
          title: n.title,
          message: n.body || '',
          type: n.type as any,
          created_at: n.created_at,
          is_read: n.is_read
        };

        const state = useNotificationStore.getState();
        useNotificationStore.setState({
          notifications: [newNotif, ...state.notifications].slice(0, 50),
          unreadCount: state.unreadCount + 1,
        });

        toast.success(n.title, { icon: '🛍️' });
      }
    )
    .subscribe();
};

// Use this in components that need cleanup (e.g. useEffect return)
export const startNotificationListenerWithCleanup = () => {
  startNotificationListener();
  // Return a no-op cleanup — the channel persists for the app's lifetime
  // but we prevent duplicate subscriptions via the module-level guard above
  return () => {};
};
