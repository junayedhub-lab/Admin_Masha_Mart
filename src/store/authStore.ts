import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { AdminUser } from '../types';

// Module-level guard to prevent multiple auth listeners
let adminAuthListenerRegistered = false;

interface AdminAuthState {
  admin: AdminUser | null;
  loading: boolean;
  initialized: boolean;

  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

export const useAdminAuthStore = create<AdminAuthState>((set, get) => ({
  admin: null,
  loading: false,
  initialized: false,

  initialize: async () => {
    // Prevent re-initialization if already done
    if (get().initialized) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // Check if user is admin
        const { data: adminData } = await supabase
          .from('admin_users')
          .select('*')
          .eq('id', session.user.id)
          .eq('is_active', true)
          .single();

        if (adminData) {
          set({ admin: adminData as AdminUser });

          // Update last login
          await supabase
            .from('admin_users')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', session.user.id);
        } else {
          // Not an admin, force logout
          await supabase.auth.signOut();
          set({ admin: null });
        }
      }

      // Only register the auth listener once for the lifetime of the app
      if (!adminAuthListenerRegistered) {
        adminAuthListenerRegistered = true;
        supabase.auth.onAuthStateChange(async (_event: any, session: any) => {
          if (session?.user) {
            const { data: adminData } = await supabase
              .from('admin_users')
              .select('*')
              .eq('id', session.user.id)
              .eq('is_active', true)
              .single();

            if (adminData) {
              set({ admin: adminData as AdminUser });
            } else {
              await supabase.auth.signOut();
              set({ admin: null });
            }
          } else {
            set({ admin: null });
          }
        });
      }
    } finally {
      set({ initialized: true });
    }
  },

  signIn: async (email: string, password: string) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        if (error.message.includes('Invalid login')) return { error: 'Email or password is incorrect' };
        if (error.message.includes('rate')) return { error: 'Too many attempts. Try again later.' };
        return { error: error.message };
      }

      // Verify admin access
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', data.user.id)
        .eq('is_active', true)
        .single();

      if (adminError || !adminData) {
        await supabase.auth.signOut();
        return { error: 'Access denied. This account is not authorized for admin access.' };
      }

      set({ admin: adminData as AdminUser });

      // Update last login
      await supabase
        .from('admin_users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', data.user.id);

      return { error: null };
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ admin: null });
  },
}));
