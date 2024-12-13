import React from 'react';
import './avatar.scss';

interface AvatarProps {
  active: boolean;
  volume: number;
  size?: 'small' | 'large';
}

export const Avatar: React.FC<AvatarProps> = ({ active, volume, size = 'small' }) => {
  return (
    <div className={`avatar ${size} ${active ? 'speaking' : ''}`}>
      <img src="/Cal.png" alt="AI Assistant" className="avatar-icon" />
      <div className="audio-pulse-wrapper">
        <div className={`audio-ring ${active && volume > 0.05 ? 'active' : ''}`} 
             style={{ transform: `scale(${1 + Math.min(volume * 0.5, 0.3)})` }} />
      </div>
    </div>
  );
};
