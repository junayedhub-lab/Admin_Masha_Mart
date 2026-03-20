import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { router } from './router';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0F172A',
            color: '#F8FAFC',
            borderRadius: '12px',
            fontSize: '13px',
            padding: '12px 16px',
          },
          success: {
            iconTheme: { primary: '#16A34A', secondary: '#DCFCE7' },
          },
          error: {
            iconTheme: { primary: '#DC2626', secondary: '#FEE2E2' },
          },
        }}
      />
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
);
