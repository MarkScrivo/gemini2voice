import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

type VoiceAssistantConfig = {
  apiKey: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme?: 'dark' | 'light';
  initiallyOpen?: boolean;
  agentName?: string;
};

declare global {
  interface Window {
    VOICE_ASSISTANT_CONFIG?: VoiceAssistantConfig;
  }
}

// Create root element if it doesn't exist
let rootElement = document.getElementById('voice-assistant-root');
if (!rootElement) {
  rootElement = document.createElement('div');
  rootElement.id = 'voice-assistant-root';
  document.body.appendChild(rootElement);
}

// Get configuration from window object or environment
const defaultConfig: VoiceAssistantConfig = {
  apiKey: process.env.REACT_APP_GEMINI_API_KEY || '',
  position: 'bottom-right',
  theme: 'dark',
  initiallyOpen: false,
  agentName: 'Compliance Cal'
};

const userConfig = window.VOICE_ASSISTANT_CONFIG || {};
const config = { ...defaultConfig, ...userConfig };

if (!config.apiKey) {
  console.error('No API key provided. Please set VOICE_ASSISTANT_CONFIG.apiKey or REACT_APP_GEMINI_API_KEY');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App 
      apiKey={config.apiKey}
      position={config.position}
      theme={config.theme}
      initiallyOpen={config.initiallyOpen}
      agentName={config.agentName}
    />
  </React.StrictMode>
);
