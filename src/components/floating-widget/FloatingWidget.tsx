import React, { useState, useEffect } from 'react';
import './floating-widget.scss';
import { useLiveAPIContext } from '../../contexts/LiveAPIContext';
import { ChatInterface } from '../chat-interface/ChatInterface';
import { Avatar } from '../avatar/Avatar';
import SimplifiedControlTray from '../control-tray/SimplifiedControlTray';

interface FloatingWidgetProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onVideoStreamChange: (stream: MediaStream | null) => void;
  initiallyOpen?: boolean;
  agentName?: string;
}

export const FloatingWidget: React.FC<FloatingWidgetProps> = ({
  videoRef,
  onVideoStreamChange,
  initiallyOpen = false,
  agentName = 'Compliance Cal'
}) => {
  // Check if running as standalone PWA
  const isPWA = window.matchMedia('(display-mode: standalone)').matches;
  const [isOpen, setIsOpen] = useState(isPWA || initiallyOpen);
  const [relationshipLevel] = useState(1);
  const { connected, volume, connect, disconnect } = useLiveAPIContext();

  // Debug logging
  useEffect(() => {
    console.log('FloatingWidget mounted');
    console.log('Initial state:', { isPWA, initiallyOpen, isOpen, connected });
  }, []);

  // Initialize open state from prop
  useEffect(() => {
    console.log('Setting open state:', { isPWA, initiallyOpen });
    setIsOpen(isPWA || initiallyOpen);
  }, [initiallyOpen, isPWA]);

  // Automatically connect/disconnect when modal opens/closes
  useEffect(() => {
    console.log('Connection state changed:', { isOpen, connected });
    if (isOpen && !connected) {
      console.log('Connecting...');
      connect().catch(error => {
        console.error('Connection error:', error);
      });
    } else if (!isOpen && connected) {
      console.log('Disconnecting...');
      disconnect();
    }
  }, [isOpen, connected, connect, disconnect]);

  const handleOpen = () => {
    console.log('Opening chat');
    setIsOpen(true);
  };

  const handleClose = () => {
    // In PWA mode, don't allow closing
    if (!isPWA) {
      console.log('Closing chat');
      setIsOpen(false);
    }
  };

  return (
    <div className="floating-widget-container">
      {!isOpen && (
        <button 
          className="floating-button"
          onClick={handleOpen}
          aria-label="Open chat"
        >
          <Avatar active={connected} volume={volume} size="small" />
        </button>
      )}

      {isOpen && (
        <div className="chat-modal">
          <div className="modal-header">
            <h2>{agentName}</h2>
            <div className="relationship-indicator">
              {[...Array(5)].map((_, i) => (
                <span 
                  key={i} 
                  className={`heart ${i < relationshipLevel ? 'active' : ''}`}
                >
                  ❤️
                </span>
              ))}
            </div>
          </div>

          <div className="modal-content">
            <div className="avatar-section">
              <Avatar active={connected} volume={volume} size="large" />
            </div>
            <ChatInterface />
          </div>

          <div className="modal-footer">
            <div className="controls">
              <SimplifiedControlTray
                videoRef={videoRef}
                onVideoStreamChange={onVideoStreamChange}
              />
            </div>
            {!isPWA && (
              <button 
                className="close-button"
                onClick={handleClose}
                aria-label="Close chat"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
