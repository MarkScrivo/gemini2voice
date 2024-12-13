import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

// Set up test configuration
window.VOICE_ASSISTANT_CONFIG = {
  apiKey: 'test-api-key',
  initiallyOpen: true,
  agentName: 'Test Agent',
  theme: 'dark'
};

test('renders without crashing', () => {
  render(<App />);
});
