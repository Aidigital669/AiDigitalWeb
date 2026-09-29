"use client";

import React, { useState, useEffect, useRef } from "react";
import { useVisibility } from "../context/VisibilityContext";

export default function ChatWidget() {
  const { isVisible } = useVisibility();
  const [isOpen, setIsOpen] = useState(false);

  if (!isVisible("widget_chat")) return null;
  const [messages, setMessages] = useState([
    {
      sender: "model",
      text: "Hi! I'm AiDigital Bot, your growth assistant. Ask me anything about our digital marketing, web development packages, or Razorpay pricing plans!"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickQuestions = [
    "What packages do you offer?",
    "How do I purchase a plan?",
    "Can I customize a plan?",
    "Is payment secure?"
  ];

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputValue;
    if (!query.trim()) return;

    const userMessage = { sender: "user", text: query };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    if (!textToSend) setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages })
      });
      const data = await response.json();
      if (data.text) {
        setMessages(prev => [...prev, { sender: "model", text: data.text }]);
      } else {
        setMessages(prev => [...prev, { sender: "model", text: "Sorry, I had trouble processing that request." }]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { sender: "model", text: "Connection error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  return (
    <div className="ai-chat-widget-wrapper">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <div className="chat-trigger-container">
          <span className="chat-assistance-text" onClick={() => setIsOpen(true)}>
            Ask me
          </span>
          <button className="chat-trigger-btn" onClick={() => setIsOpen(true)} aria-label="Open support chat">
            <svg className="chat-icon-svg" viewBox="0 0 121.85 122.88" fill="currentColor">
              <path fillRule="evenodd" d="M42.18,72.75A47.21,47.21,0,0,1,38.28,65c-8.39-4.72-9.73-25.71-4.56-24.12,0-.79-.14-3-.14-4.52,0-34.07,54.74-34.09,54.74,0,0,1.56-.16,3.73-.14,4.52C93.34,39.26,92,60.25,83.62,65c-2.13,5.9-5.93,9.86-5.62,12.45,0,8.89-9.77,12.11-17,12.19-.66,0-1.33,0-2-.1a17.8,17.8,0,0,0,4.52-1.9h0c3.11-1.9,5.21-4.71,5.21-8.08s-2.09-6.2-5.2-8.09h0a18.68,18.68,0,0,0-9.4-2.57,19.54,19.54,0,0,0-7.51,1.35,12.78,12.78,0,0,0-4,2.58l-.37,0Zm58.25-41.14h-.37C96.63,17.08,87.81,7,77.3,2.83A44.05,44.05,0,0,0,58,.15a46.75,46.75,0,0,0-18.44,5.4A34.24,34.24,0,0,0,22.15,31.61h-.69c-3.3,0-6.64,2.71-6.64,6V59.28c0,3.3,3.34,6,6.64,6h1.95C25.54,73.93,34.17,81.85,43,81.85h1.73c1.51,2.22,4.44,3.79,9.32,3.79s10.08-2.75,10.08-6.13S59,73.39,54.05,73.39,46.1,75,44.64,77.32H43c-7.54,0-15-8-15.53-15.22V32A29.1,29.1,0,0,1,42.13,10.2,41.46,41.46,0,0,1,58.4,5.47,38.8,38.8,0,0,1,75.33,7.79c8.71,3.44,16.06,12,19.23,23.82h-.13V65.28h6c3.3,0,6.64-2.7,6.64-6V37.62c0-3.31-3.34-6-6.64-6ZM64.59,104.44h1.86a3,3,0,0,0,3-3v-5a3,3,0,0,0-3-3h-11a3.05,3.05,0,0,0-3,3v5a3.06,3.06,0,0,0,3,3H57.3l-3.64,18.43H68.07l-3.48-18.44ZM0,122.88c1.43-18.54-2.21-17.79,13.32-23.6a128.67,128.67,0,0,0,22.78-11l13.27,34.63ZM86.4,86.67a95.25,95.25,0,0,0,21.07,10c14.5,4.82,14.5,5.5,14.36,26.17H72.65L86.4,86.67Z" />
            </svg>
            <span className="notification-ping"></span>
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window-container">
          {/* Header */}
          <div className="chat-window-header">
            <div className="bot-header-info">
              <div className="bot-avatar-active">
                <svg className="bot-avatar-svg" viewBox="0 0 121.85 122.88" fill="currentColor">
                  <path fillRule="evenodd" d="M42.18,72.75A47.21,47.21,0,0,1,38.28,65c-8.39-4.72-9.73-25.71-4.56-24.12,0-.79-.14-3-.14-4.52,0-34.07,54.74-34.09,54.74,0,0,1.56-.16,3.73-.14,4.52C93.34,39.26,92,60.25,83.62,65c-2.13,5.9-5.93,9.86-5.62,12.45,0,8.89-9.77,12.11-17,12.19-.66,0-1.33,0-2-.1a17.8,17.8,0,0,0,4.52-1.9h0c3.11-1.9,5.21-4.71,5.21-8.08s-2.09-6.2-5.2-8.09h0a18.68,18.68,0,0,0-9.4-2.57,19.54,19.54,0,0,0-7.51,1.35,12.78,12.78,0,0,0-4,2.58l-.37,0Zm58.25-41.14h-.37C96.63,17.08,87.81,7,77.3,2.83A44.05,44.05,0,0,0,58,.15a46.75,46.75,0,0,0-18.44,5.4A34.24,34.24,0,0,0,22.15,31.61h-.69c-3.3,0-6.64,2.71-6.64,6V59.28c0,3.3,3.34,6,6.64,6h1.95C25.54,73.93,34.17,81.85,43,81.85h1.73c1.51,2.22,4.44,3.79,9.32,3.79s10.08-2.75,10.08-6.13S59,73.39,54.05,73.39,46.1,75,44.64,77.32H43c-7.54,0-15-8-15.53-15.22V32A29.1,29.1,0,0,1,42.13,10.2,41.46,41.46,0,0,1,58.4,5.47,38.8,38.8,0,0,1,75.33,7.79c8.71,3.44,16.06,12,19.23,23.82h-.13V65.28h6c3.3,0,6.64-2.7,6.64-6V37.62c0-3.31-3.34-6-6.64-6ZM64.59,104.44h1.86a3,3,0,0,0,3-3v-5a3,3,0,0,0-3-3h-11a3.05,3.05,0,0,0-3,3v5a3.06,3.06,0,0,0,3,3H57.3l-3.64,18.43H68.07l-3.48-18.44ZM0,122.88c1.43-18.54-2.21-17.79,13.32-23.6a128.67,128.67,0,0,0,22.78-11l13.27,34.63ZM86.4,86.67a95.25,95.25,0,0,0,21.07,10c14.5,4.82,14.5,5.5,14.36,26.17H72.65L86.4,86.67Z" />
                </svg>
              </div>
              <div>
                <h4 className="bot-title">AiDigital Bot</h4>
                <p className="bot-status">Online & ready to grow</p>
              </div>
            </div>
            <button className="chat-close-btn" onClick={() => setIsOpen(false)} aria-label="Minimize support chat">
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          </div>

          {/* Messages Area */}
          <div className="chat-messages-area">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-message-bubble ${msg.sender === "user" ? "user-bubble" : "bot-bubble"}`}>
                {msg.text}
              </div>
            ))}
            {isLoading && (
              <div className="chat-message-bubble bot-bubble typing-indicator-bubble">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions Section */}
          <div className="quick-questions-scroll">
            {quickQuestions.map((q, i) => (
              <button key={i} className="quick-question-chip" onClick={() => handleSendMessage(q)}>
                {q}
              </button>
            ))}
          </div>

          {/* Input Form Footer */}
          <form
            className="chat-input-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <input
              type="text"
              placeholder="Ask anything..."
              className="chat-text-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
            />
            <button type="submit" className="chat-send-btn" disabled={!inputValue.trim() || isLoading} aria-label="Send message">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
