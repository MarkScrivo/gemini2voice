import React, { useRef, useState } from 'react';
import './App.scss';
import { FloatingWidget } from './components/floating-widget/FloatingWidget';
import { LiveAPIProvider } from './contexts/LiveAPIContext';

declare global {
  interface Window {
    VOICE_ASSISTANT_CONFIG?: {
      apiKey?: string;
      initiallyOpen?: boolean;
      agentName?: string;
      theme?: 'light' | 'dark';
    };
  }
}

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);

  // Get initiallyOpen from URL params or config
  const urlParams = new URLSearchParams(window.location.search);
  const configInitiallyOpen = window.VOICE_ASSISTANT_CONFIG?.initiallyOpen;
  const isInitiallyOpen = urlParams.get('initiallyOpen') === 'true' || configInitiallyOpen || true;

  // Get API key from config
  const apiKey = window.VOICE_ASSISTANT_CONFIG?.apiKey || process.env.REACT_APP_GEMINI_API_KEY || '';

  return (
    <LiveAPIProvider apiKey={apiKey}>
      <div className="App">
        <FloatingWidget
          videoRef={videoRef}
          onVideoStreamChange={setVideoStream}
          initiallyOpen={isInitiallyOpen}
          agentName={window.VOICE_ASSISTANT_CONFIG?.agentName}
        />
      </div>
    </LiveAPIProvider>
  );
}

export default App;
