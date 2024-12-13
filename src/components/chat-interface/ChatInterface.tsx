import React, { useState, useEffect, useRef } from 'react';
import './chat-interface.scss';
import { useLiveAPIContext } from '../../contexts/LiveAPIContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const { client } = useLiveAPIContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const currentMessageRef = useRef<string>('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleContent = (data: any) => {
      if (data.modelTurn?.parts) {
        const text = data.modelTurn.parts
          .filter((part: any) => part.text)
          .map((part: any) => part.text)
          .join(' ');
        
        if (text) {
          setIsTyping(true);
          currentMessageRef.current += text;
        }
      }
    };

    const handleTurnComplete = () => {
      if (currentMessageRef.current) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: currentMessageRef.current,
          timestamp: new Date().toLocaleTimeString()
        }]);
        currentMessageRef.current = '';
        setIsTyping(false);
      }
    };

    client.on('content', handleContent);
    client.on('turncomplete', handleTurnComplete);

    // Debug logging
    client.on('log', (log) => {
      console.log('Client log:', log);
    });

    return () => {
      client.off('content', handleContent);
      client.off('turncomplete', handleTurnComplete);
    };
  }, [client]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage: Message = {
      role: 'user',
      content: inputText,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, newMessage]);
    client.send({ text: inputText });
    setInputText('');
  };

  return (
    <div className="chat-interface">
      <div className="messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            <div className="message-header">
              <span className="sender">{message.role === 'assistant' ? 'Cal' : 'You'}</span>
              <span className="timestamp">{message.timestamp}</span>
            </div>
            <div className="message-content">
              {message.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="message assistant">
            <div className="message-header">
              <span className="sender">Cal</span>
            </div>
            <div className="message-content typing">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="input-area">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message..."
          className="message-input"
        />
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
    </div>
  );
};
