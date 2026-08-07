import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AppRoutes } from './routes/AppRoutes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#FFFFFF',
              color: '#000000',
              border: '2px solid #000000',
              boxShadow: '4px 4px 0px 0px #000000',
              fontFamily: "'Geist', 'Inter', sans-serif",
              fontWeight: 700,
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
