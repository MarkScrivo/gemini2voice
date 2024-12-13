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

export {};
