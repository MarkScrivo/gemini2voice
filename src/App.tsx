import React, { useRef, useState, useEffect } from 'react';
import './App.scss';
import { FloatingWidget } from './components/floating-widget/FloatingWidget';
import { LiveAPIProvider } from './contexts/LiveAPIContext';

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [mode, setMode] = useState<'embedded' | 'standalone'>('standalone');

  // Get API key from config
  const apiKey = window.VOICE_ASSISTANT_CONFIG?.apiKey || process.env.REACT_APP_GEMINI_API_KEY || '';

  // Determine if we're running embedded or standalone
  useEffect(() => {
    const isPWA = window.matchMedia('(display-mode: standalone)').matches;
    const isEmbedded = window !== window.parent; // Check if running in iframe
    setMode(isPWA || !isEmbedded ? 'standalone' : 'embedded');
    console.log('Running in mode:', isPWA ? 'PWA' : isEmbedded ? 'embedded' : 'standalone');
  }, []);

  return (
    <LiveAPIProvider apiKey={apiKey}>
      <div className={`App ${mode}`}>
        <FloatingWidget
          videoRef={videoRef}
          onVideoStreamChange={setVideoStream}
          initiallyOpen={window.VOICE_ASSISTANT_CONFIG?.initiallyOpen}
          agentName={window.VOICE_ASSISTANT_CONFIG?.agentName}
        />
      </div>
    </LiveAPIProvider>
  );
}

export default App;
