import { createContext, FC, useContext, useEffect } from "react";
import { useLiveAPI, UseLiveAPIResults } from "../hooks/use-live-api";

const LiveAPIContext = createContext<UseLiveAPIResults | undefined>(undefined);

export type LiveAPIProviderProps = {
  children: React.ReactNode;
  url?: string;
  apiKey: string;
};

export const LiveAPIProvider: FC<LiveAPIProviderProps> = ({
  url,
  apiKey,
  children,
}) => {
  const liveAPI = useLiveAPI({ 
    url: url || 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent',
    apiKey 
  });

  // Debug logging
  useEffect(() => {
    console.log('LiveAPIProvider initialized with:', { 
      url, 
      hasApiKey: !!apiKey,
      connected: liveAPI.connected
    });

    // Log WebSocket events
    const handleLog = (log: any) => {
      console.log('WebSocket log:', log);
    };

    const handleContent = (content: any) => {
      console.log('WebSocket content:', content);
    };

    const handleTurnComplete = () => {
      console.log('WebSocket turn complete');
    };

    liveAPI.client
      .on('log', handleLog)
      .on('content', handleContent)
      .on('turncomplete', handleTurnComplete);

    return () => {
      liveAPI.client
        .off('log', handleLog)
        .off('content', handleContent)
        .off('turncomplete', handleTurnComplete);
    };
  }, [url, apiKey, liveAPI]);

  return (
    <LiveAPIContext.Provider value={liveAPI}>
      {children}
    </LiveAPIContext.Provider>
  );
};

export const useLiveAPIContext = () => {
  const context = useContext(LiveAPIContext);
  if (!context) {
    throw new Error("useLiveAPIContext must be used within a LiveAPIProvider");
  }
  return context;
};
