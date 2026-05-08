import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './ErrorBoundary.tsx';
import { registerSW } from 'virtual:pwa-register';

import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';

posthog.init(import.meta.env.VITE_POSTHOG_KEY || 'phc_mock_key', {
  api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://eu.i.posthog.com',
  autocapture: false, // best practice for enterprise tracking (manual tracking)
});

// Register service worker for offline support
registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <PostHogProvider client={posthog}>
        <App />
      </PostHogProvider>
    </ErrorBoundary>
  </StrictMode>,
);

