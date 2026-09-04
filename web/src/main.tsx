import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, MutationCache } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { ThemeProvider } from './context/ThemeContext'
import * as Sentry from "@sentry/react";
import './index.css'
import App from './App.tsx'
import { tanstackPersister } from './services/tanstackPersister'
import { PWAPrompt } from './components/PWAPrompt';
import { Toaster } from 'react-hot-toast';
import { OpenTelemetryInterceptor } from './infrastructure/telemetry/OpenTelemetryInterceptor';

// Auto-recover from stale dynamic imports after new deployments
window.addEventListener('vite:preloadError', (event) => {
  console.warn('[Vite] Dynamic import preload error detected. Reloading page...', event);
  window.location.reload();
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      networkMode: 'offlineFirst',
      retry: 5,
    }
  },
  mutationCache: new MutationCache({
    onError: async (error, variables, context, mutation) => {
      // Si la mutación excedió los reintentos (5) o recibió un 4xx severo, va a DLQ
      if (mutation.state.failureCount >= 5 || (error as any)?.response?.status >= 400) {
        console.error('[MutationCache] DLQ Dispatching:', mutation);
        try {
          const token = localStorage.getItem('token');
          await fetch('/api/v1/athlete/telemetry/dlq', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({
              event_type: "DLQ_SYNC_FAILURE",
              payload: { variables, error: String(error) },
              stack_trace: error instanceof Error ? error.stack : String(error)
            })
          });
        } catch (telemetryError) {
          console.error('[MutationCache] Failed to send DLQ telemetry:', telemetryError);
        }
      }
    }
  })
})

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: 1.0,
    tracePropagationTargets: ["localhost", /^https:\/\/bienestar-staging\.vercel\.app/],
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PersistQueryClientProvider 
      client={queryClient}
      persistOptions={{
        persister: tanstackPersister,
        maxAge: 1000 * 60 * 60 * 24, // 24 horas
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            // No persistir analíticas o queries temporales pesadas
            const queryKey = query.queryKey[0] as string;
            if (['analytics', 'roster', 'watchtower'].includes(queryKey)) {
              return false;
            }
            return query.state.status === 'success';
          },
          // Asegurarse de dehydrate las mutaciones pausadas (offline)
          shouldDehydrateMutation: (mutation) => mutation.state.isPaused,
        }
      }}
    >
      <BrowserRouter>
        <ThemeProvider>
          <Sentry.ErrorBoundary fallback={<p>Ha ocurrido un error inesperado.</p>}>
            <App />
            <PWAPrompt />
          </Sentry.ErrorBoundary>
        </ThemeProvider>
      </BrowserRouter>
    </PersistQueryClientProvider>
  </StrictMode>,
)

