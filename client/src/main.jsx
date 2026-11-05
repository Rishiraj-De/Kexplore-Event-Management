import '@fontsource-variable/bricolage-grotesque';
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Nudge the API awake as early as possible (free-tier hosts sleep when idle).
fetch('/api/health', { cache: 'no-store' }).catch(() => {});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
