import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Get query parameters
const urlParams = new URLSearchParams(window.location.search);

// Set default configuration
window.VOICE_ASSISTANT_CONFIG = {
  apiKey: process.env.REACT_APP_GEMINI_API_KEY || '',
  initiallyOpen: true,
  agentName: 'Compliance Cal',
  theme: 'dark'
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
