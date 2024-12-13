import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

window.VOICE_ASSISTANT_CONFIG = {
  apiKey: 'test-api-key',
  initiallyOpen: false,
  agentName: 'Test Agent',
  theme: 'dark'
};

test('renders without crashing', () => {
  render(<App />);
});
