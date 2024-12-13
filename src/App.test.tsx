import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app with required props', () => {
  render(
    <App 
      apiKey="test-api-key"
      position="bottom-right"
      theme="dark"
      initiallyOpen={false}
      agentName="Test Agent"
    />
  );
  
  // Test for the agent name being rendered
  const agentNameElement = screen.getByText('Test Agent');
  expect(agentNameElement).toBeInTheDocument();
});
