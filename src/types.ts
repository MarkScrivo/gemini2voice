export interface VoiceAssistantConfig {
  apiKey?: string;
  initiallyOpen?: boolean;
  agentName?: string;
  theme?: 'light' | 'dark';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

declare global {
  interface Window {
    VOICE_ASSISTANT_CONFIG?: VoiceAssistantConfig;
  }
}

export interface LiveAPIConfig {
  url?: string;
  apiKey: string;
}

export interface LiveAPIProviderProps {
  children: React.ReactNode;
  url?: string;
  apiKey: string;
}

export {};
