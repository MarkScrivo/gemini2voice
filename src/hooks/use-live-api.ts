import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MultimodalLiveAPIClientConnection,
  MultimodalLiveClient,
} from "../lib/multimodal-live-client";
import { LiveConfig } from "../multimodal-live-types";
import { AudioStreamer } from "../lib/audio-streamer";
import { audioContext } from "../lib/utils";
import VolMeterWorket from "../lib/worklets/vol-meter";

export type UseLiveAPIResults = {
  client: MultimodalLiveClient;
  setConfig: (config: LiveConfig) => void;
  config: LiveConfig;
  connected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  volume: number;
};

export function useLiveAPI({
  url,
  apiKey,
}: MultimodalLiveAPIClientConnection): UseLiveAPIResults {
  console.log('useLiveAPI initialized with:', { url, hasApiKey: !!apiKey });

  const client = useMemo(
    () => new MultimodalLiveClient({ url, apiKey }),
    [url, apiKey],
  );
  const audioStreamerRef = useRef<AudioStreamer | null>(null);

  const [connected, setConnected] = useState(false);
  const [config, setConfig] = useState<LiveConfig>({
    model: "models/gemini-2.0-flash-exp",
  });
  const [volume, setVolume] = useState(0);

  // register audio for streaming server -> speakers
  useEffect(() => {
    if (!audioStreamerRef.current) {
      audioContext({ id: "audio-out" }).then((audioCtx: AudioContext) => {
        console.log('Audio context initialized');
        audioStreamerRef.current = new AudioStreamer(audioCtx);
        audioStreamerRef.current
          .addWorklet<any>("vumeter-out", VolMeterWorket, (ev: any) => {
            setVolume(ev.data.volume);
          })
          .then(() => {
            console.log('Audio worklet added successfully');
          });
      });
    }
  }, [audioStreamerRef]);

  useEffect(() => {
    const onClose = (event: CloseEvent) => {
      console.log('WebSocket connection closed:', event);
      setConnected(false);
    };

    const stopAudioStreamer = () => {
      console.log('Stopping audio streamer');
      audioStreamerRef.current?.stop();
    };

    const onAudio = (data: ArrayBuffer) => {
      console.log('Received audio data:', data.byteLength, 'bytes');
      audioStreamerRef.current?.addPCM16(new Uint8Array(data));
    };

    const onContent = (content: any) => {
      console.log('Received content:', content);
    };

    const onSetupComplete = () => {
      console.log('Setup complete');
      setConnected(true);
    };

    client
      .on("close", onClose)
      .on("interrupted", stopAudioStreamer)
      .on("audio", onAudio)
      .on("content", onContent)
      .on("setupcomplete", onSetupComplete);

    return () => {
      client
        .off("close", onClose)
        .off("interrupted", stopAudioStreamer)
        .off("audio", onAudio)
        .off("content", onContent)
        .off("setupcomplete", onSetupComplete);
    };
  }, [client]);

  const connect = useCallback(async () => {
    console.log('Connecting with config:', config);
    if (!config) {
      throw new Error("config has not been set");
    }
    client.disconnect();
    await client.connect(config);
  }, [client, config]);

  const disconnect = useCallback(async () => {
    console.log('Disconnecting');
    client.disconnect();
    setConnected(false);
  }, [client]);

  return {
    client,
    config,
    setConfig,
    connected,
    connect,
    disconnect,
    volume,
  };
}
