import React, { useState, useEffect, useRef } from 'react';
import './chat-interface.scss';
import { useLiveAPIContext } from '../../contexts/LiveAPIContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
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
  }, [messages, currentMessageRef.current]);

  useEffect(() => {
    const handleContent = (data: any) => {
      console.log('Content received:', data);
      if (data.modelTurn?.parts) {
        const text = data.modelTurn.parts
          .filter((part: any) => part.text)
          .map((part: any) => part.text)
          .join(' ');
        
        if (text) {
          setIsTyping(true);
          // Update the current message immediately for streaming effect
          currentMessageRef.current += text;
          // Force a re-render to show the streaming text
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.role === 'assistant') {
              lastMessage.content = currentMessageRef.current;
            } else {
              newMessages.push({
                role: 'assistant',
                content: currentMessageRef.current
              });
            }
            return newMessages;
          });
        }
      }
    };

    const handleTurnComplete = () => {
      console.log('Turn complete');
      if (currentMessageRef.current) {
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.role === 'assistant') {
            lastMessage.content = currentMessageRef.current;
          } else {
            newMessages.push({
              role: 'assistant',
              content: currentMessageRef.current
            });
          }
          return newMessages;
        });
        currentMessageRef.current = '';
        setIsTyping(false);
      }
    };

    client.on('content', handleContent);
    client.on('turncomplete', handleTurnComplete);

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
      content: inputText
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
            <div className="message-content">
              {message.content}
            </div>
          </div>
        ))}
        {isTyping && currentMessageRef.current && (
          <div className="message assistant">
            <div className="message-content">
              {currentMessageRef.current}
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
