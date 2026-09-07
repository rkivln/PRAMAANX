import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

// Mount without StrictMode to prevent duplicate concurrent camera hardware acquisition on Windows
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <App />
);
