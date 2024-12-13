/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useRef, useState, useEffect } from "react";
import "./App.scss";
import { LiveAPIProvider } from "./contexts/LiveAPIContext";
import { FloatingWidget } from "./components/floating-widget/FloatingWidget";

interface AppProps {
  apiKey: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme?: 'dark' | 'light';
  initiallyOpen?: boolean;
  agentName?: string;
}

const host = "generativelanguage.googleapis.com";
const uri = `wss://${host}/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent`;

function App({ 
  apiKey,
  position = 'bottom-right',
  theme = 'dark',
  initiallyOpen = false,
  agentName = 'Compliance Cal'
}: AppProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    // Add Material Icons font
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200';
    document.head.appendChild(link);

    // Add theme class to body
    document.body.classList.add(`theme-${theme}`);

    return () => {
      document.head.removeChild(link);
      document.body.classList.remove(`theme-${theme}`);
    };
  }, [theme]);

  return (
    <div className={`App position-${position}`}>
      <LiveAPIProvider url={uri} apiKey={apiKey}>
        <FloatingWidget
          videoRef={videoRef}
          onVideoStreamChange={setVideoStream}
          initiallyOpen={initiallyOpen}
          agentName={agentName}
        />
        <video
          className={`stream ${!videoRef.current || !videoStream ? 'hidden' : ''}`}
          ref={videoRef}
          autoPlay
          playsInline
        />
      </LiveAPIProvider>
    </div>
  );
}

export default App;
