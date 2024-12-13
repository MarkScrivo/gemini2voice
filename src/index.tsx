import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Set default configuration if not already set
if (!window.VOICE_ASSISTANT_CONFIG) {
  window.VOICE_ASSISTANT_CONFIG = {
    apiKey: process.env.REACT_APP_GEMINI_API_KEY || '',
    initiallyOpen: true,
    agentName: 'Compliance Cal',
    theme: 'dark'
  };
}

// Create root div if it doesn't exist
let rootElement = document.getElementById('root');
if (!rootElement) {
  rootElement = document.createElement('div');
  rootElement.id = 'root';
  document.body.appendChild(rootElement);
}

// Wait for DOM to be ready
const initApp = () => {
  try {
    console.log('Initializing React app');
    const root = ReactDOM.createRoot(rootElement as HTMLElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('React app initialized');
  } catch (error) {
    console.error('Error initializing React app:', error);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
