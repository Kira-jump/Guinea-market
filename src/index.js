import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// DEBUG : bandeau visible montrant l'etat des env vars au moment du build
(function showEnvDebug() {
  const url = process.env.REACT_APP_SUPABASE_URL || '';
  const key = process.env.REACT_APP_SUPABASE_ANON_KEY || '';
  const urlTrimmed = url.trim();
  const keyTrimmed = key.trim();
  const urlHasSpace = url !== urlTrimmed;
  const keyHasSpace = key !== keyTrimmed;
  const problem = !url || !key || urlHasSpace || keyHasSpace;
  const banner = document.createElement('div');
  banner.style.cssText =
    'position:fixed;top:0;left:0;right:0;z-index:99999;padding:8px 12px;' +
    'font-family:monospace;font-size:11px;line-height:1.4;color:#000;' +
    'background:' + (problem ? '#ffd24d' : '#b6f5b6') + ';border-bottom:2px solid #000;';
  banner.innerHTML =
    '<b>ENV DEBUG</b><br>' +
    'URL: len=' + url.length + (urlHasSpace ? ' <b style="color:#c00">(espaces detectes : ' + (url.length - urlTrimmed.length) + ')</b>' : '') + '<br>' +
    'KEY: len=' + key.length + (keyHasSpace ? ' <b style="color:#c00">(espaces detectes : ' + (key.length - keyTrimmed.length) + ')</b>' : '');
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
