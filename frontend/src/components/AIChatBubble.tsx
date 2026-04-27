import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Bot } from "lucide-react";
import { getLiveAIResponse } from "../lib/aiService";

export const AIChatBubble: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi! I'm your TestimonialHub AI Assistant! Ask me anything about the app or whatever is on your mind." }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEsc);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen]);

  // Clear unread when opened
  useEffect(() => {
    if (isOpen) setHasUnread(false);
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const typeWriter = (text: string) => {
    let currentText = "";
    const words = text.split(" ");
    let i = 0;
    
    setMessages(prev => [...prev, { role: "ai", text: "" }]);
    
    const interval = setInterval(() => {
      if (i < words.length) {
        currentText += (i === 0 ? "" : " ") + words[i];
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = currentText;
          return newMessages;
        });
        i++;
      } else {
        clearInterval(interval);
        setHasUnread(true);
      }
    }, 40);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await getLiveAIResponse(userMsg);
      setIsTyping(false);
      typeWriter(response);
    } catch (error: any) {
      setIsTyping(false);
      setMessages(prev => [...prev, { role: "ai", text: `I'm having a brief network issue: ${error?.message || "Unknown error"}. Please try again!` }]);
    }
  };

  // Helper to render text with bold support
  const formatMessage = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div ref={containerRef} className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 bg-background border border-border shadow-2xl rounded-2xl overflow-hidden flex flex-col mb-4 animate-in slide-in-from-bottom-2 fade-in duration-200" style={{ height: "450px" }}>
          {/* Header */}
          <div className="bg-[#0B1120] p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 p-1.5 rounded-full">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-medium leading-none">AI Assistant</h3>
                <p className="text-xs text-blue-200 mt-1">Real-time Live AI</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-300 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-accent">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "ai" ? "justify-start" : "justify-end"}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  msg.role === "ai" 
                    ? "bg-card border border-border text-foreground rounded-tl-sm shadow-sm whitespace-pre-wrap" 
                    : "bg-blue-600 text-white rounded-tr-sm shadow-sm"
                }`}>
                  {formatMessage(msg.text)}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-card border border-border p-3 rounded-2xl rounded-tl-sm shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 bg-card border-t border-border flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 bg-accent border border-border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isTyping}
              className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </div>
      )}
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center group"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6 group-hover:animate-pulse" />}
        
        {!isOpen && hasUnread && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white dark:border-slate-900"></span>
          </span>
        )}
      </button>
    </div>
  );
};
