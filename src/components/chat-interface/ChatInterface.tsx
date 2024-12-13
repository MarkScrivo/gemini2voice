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
  const { client, connected } = useLiveAPIContext();
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
    console.log('WebSocket connected:', connected);
  }, [connected]);

  useEffect(() => {
    const handleContent = (data: any) => {
      console.log('Received content:', data);
      if (data.modelTurn?.parts) {
        const text = data.modelTurn.parts
          .filter((part: any) => part.text)
          .map((part: any) => part.text)
          .join(' ');
        
        console.log('Extracted text:', text);
        if (text) {
          setIsTyping(true);
          currentMessageRef.current += text;
          // Force a re-render to show the streaming text
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.role === 'assistant') {
              lastMessage.content = currentMessageRef.current;
              console.log('Updated last message:', lastMessage);
            } else {
              newMessages.push({
                role: 'assistant',
                content: currentMessageRef.current
              });
              console.log('Added new message:', currentMessageRef.current);
            }
            return newMessages;
          });
        }
      }
    };

    const handleTurnComplete = () => {
      console.log('Turn complete, final message:', currentMessageRef.current);
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

    console.log('Sending message:', inputText);
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
