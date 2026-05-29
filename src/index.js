import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// DEBUG : bandeau visible montrant l'etat des env vars au moment du build
(function showEnvDebug() {
  const url = process.env.REACT_APP_SUPABASE_URL;
  const key = process.env.REACT_APP_SUPABASE_ANON_KEY;
  const ok = !!url && !!key;
  const banner = document.createElement('div');
  banner.style.cssText =
    'position:fixed;top:0;left:0;right:0;z-index:99999;padding:8px 12px;' +
    'font-family:monospace;font-size:12px;line-height:1.4;color:#000;' +
    'background:' + (ok ? '#b6f5b6' : '#ffd24d') + ';border-bottom:2px solid #000;';
  banner.innerHTML =
    '<b>ENV DEBUG</b> &nbsp; ' +
    'URL=' + (url ? '"' + url + '"' : '<b style="color:#c00">UNDEFINED</b>') +
    ' &nbsp;|&nbsp; KEY=' + (key ? '"' + key.slice(0, 20) + '...' + key.slice(-10) + '"' : '<b style="color:#c00">UNDEFINED</b>');
  document.body.prepend(banner);
})();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Désactivé : un SW resté en cache peut bloquer les calls Supabase (fetch failures)
serviceWorkerRegistration.unregister();
