import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { RootLayout } from './components/layout/RootLayout';
import { AuthProvider, GOOGLE_CLIENT_ID } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Home from './pages/Home';
import RouteError from './pages/RouteError';

// Route-level code splitting: each page is its own chunk.
const Events = lazy(() => import('./pages/Events'));
const EventDetail = lazy(() => import('./pages/EventDetail'));
const Register = lazy(() => import('./pages/Register'));
const Tickets = lazy(() => import('./pages/Tickets'));
const TicketView = lazy(() => import('./pages/TicketView'));
const Host = lazy(() => import('./pages/Host'));
const NotFound = lazy(() => import('./pages/NotFound'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      // Retry network/5xx errors (e.g. the free-tier API waking up), never 4xx.
      retry: (count, err) => (err?.status === 0 || err?.status >= 500 ? count < 4 : false),
      retryDelay: (attempt) => Math.min(1500 * 2 ** attempt, 10_000),
    },
  },
});

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Home /> },
      { path: 'events', element: <Events /> },
      { path: 'events/:slug', element: <EventDetail /> },
      { path: 'register', element: <Register /> },
      { path: 'tickets', element: <Tickets /> },
      { path: 'tickets/:code', element: <TicketView /> },
      { path: 'host', element: <Host /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

function ThemedToaster() {
  const { theme } = useTheme();
  return (
    <Toaster
      theme={theme}
      position="bottom-right"
      closeButton
      toastOptions={{ classNames: { toast: '!rounded-2xl !border-line !font-sans', title: '!font-semibold' } }}
    />
  );
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || 'not-configured'}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <RouterProvider router={router} />
            <ThemedToaster />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}
