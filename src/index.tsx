import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@fontsource/playfair-display/400.css';
import '@fontsource/playfair-display/700.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
