import React, { memo, RefObject, useEffect, useState } from "react";
import { useLiveAPIContext } from "../../contexts/LiveAPIContext";
import { AudioRecorder } from "../../lib/audio-recorder";
import AudioPulse from "../audio-pulse/AudioPulse";
import "./control-tray.scss";
import cn from "classnames";

export type SimplifiedControlTrayProps = {
  videoRef: RefObject<HTMLVideoElement>;
  onVideoStreamChange: (stream: MediaStream | null) => void;
};

const SimplifiedControlTray: React.FC<SimplifiedControlTrayProps> = ({
  videoRef,
  onVideoStreamChange,
}) => {
  const [inVolume, setInVolume] = useState(0);
  const [audioRecorder] = useState(() => new AudioRecorder());
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const { client, connected, volume } = useLiveAPIContext();

  const startAudioRecording = async () => {
    try {
      await audioRecorder.start();
      setError(null);
      setIsRetrying(false);
      setRetryCount(0);
    } catch (err: any) {
      console.error("Failed to start audio recording:", err);
      
      if (retryCount < MAX_RETRIES) {
        setIsRetrying(true);
        setError(`Retrying to connect to audio device (${retryCount + 1}/${MAX_RETRIES})`);
        setRetryCount(prev => prev + 1);
        
        // Retry after a delay
        setTimeout(() => {
          if (!muted) {
            startAudioRecording();
          }
        }, 2000);
      } else {
        setError("Could not access microphone. Please check permissions and try again.");
        setMuted(true);
        setIsRetrying(false);
      }
    }
  };

  useEffect(() => {
    const onData = (base64: string) => {
      client.sendRealtimeInput([
        {
          mimeType: "audio/pcm;rate=16000",
          data: base64,
        },
      ]);
    };

    const onError = (errorMessage: string) => {
      setError(errorMessage);
      if (!errorMessage.includes("Retrying")) {
        setMuted(true);
      }
    };

    const onDeviceReconnected = () => {
      setError(null);
      setIsRetrying(false);
      setRetryCount(0);
      setMuted(false);
    };

    if (connected && !muted && audioRecorder) {
      audioRecorder
        .on("data", onData)
        .on("volume", setInVolume)
        .on("error", onError)
        .on("deviceReconnected", onDeviceReconnected);
      
      startAudioRecording();
    } else {
      audioRecorder.stop();
    }

    return () => {
      audioRecorder
        .off("data", onData)
        .off("volume", setInVolume)
        .off("error", onError)
        .off("deviceReconnected", onDeviceReconnected);
    };
  }, [connected, client, muted, audioRecorder]);

  useEffect(() => {
    return () => {
      audioRecorder.cleanup();
    };
  }, [audioRecorder]);

  const toggleMute = () => {
    if (!isRetrying) {
      setMuted(!muted);
      setError(null);
      setRetryCount(0);
    }
  };

  return (
    <section className="control-tray simplified">
      <nav className={cn("actions-nav", { disabled: !connected })}>
        <button
          className={cn("action-button mic-button", { 
            error: !!error,
            retrying: isRetrying 
          })}
          onClick={toggleMute}
          title={error || (muted ? "Unmute" : "Mute")}
          disabled={isRetrying}
        >
          {!muted ? (
            <span className="material-symbols-outlined filled">mic</span>
          ) : (
            <span className="material-symbols-outlined filled">mic_off</span>
          )}
        </button>

        <div className="action-button no-action outlined">
          <AudioPulse volume={volume} active={connected} hover={false} />
        </div>
      </nav>
    </section>
  );
};

export default memo(SimplifiedControlTray);
