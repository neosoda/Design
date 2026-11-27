import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Dashboard from './Dashboard';
import dashboardConfig from './dashboard.config.json';
import type { DashboardConfig } from './types';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Dashboard config={dashboardConfig as DashboardConfig} />
  </StrictMode>,
);
