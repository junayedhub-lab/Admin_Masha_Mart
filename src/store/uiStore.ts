import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  toggleCollapsed: () => void;
  closeSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleCollapsed: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  closeSidebar: () => set({ sidebarOpen: false }),
}));
