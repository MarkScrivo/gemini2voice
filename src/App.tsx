import React, { useRef, useState } from 'react';
import './App.scss';
import { FloatingWidget } from './components/floating-widget/FloatingWidget';
import { LiveAPIProvider } from './contexts/LiveAPIContext';

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);

  // Get API key from config
  const apiKey = window.VOICE_ASSISTANT_CONFIG?.apiKey || process.env.REACT_APP_GEMINI_API_KEY || '';

  return (
    <LiveAPIProvider apiKey={apiKey}>
      <div className="App">
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
