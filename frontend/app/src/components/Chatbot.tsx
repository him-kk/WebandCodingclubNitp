import { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Sparkles, MessageCircle } from 'lucide-react';
import api from '../services/api';// your axios instance

interface Message {
  id: number;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
}

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hey! I'm HackBot, your AI assistant. Ask me anything about events, learning paths, or projects.",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Simulate typing
    setIsTyping(true);

    try {
      // Call backend API
      const response = await api.post('/chatbot/message', { message: inputText }); // your backend endpoint
      const botMessage: Message = {
        id: Date.now() + 1,
        // text: response.data.reply || "Sorry, I didn't understand that.",
        text: response.data.data.message || "Sorry, I didn't understand that.",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      const botMessage: Message = {
        id: Date.now() + 1,
        text: "Oops! Something went wrong. Try again later.",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full transition-all duration-500 ${
          isOpen
            ? 'bg-void border border-orange/50'
            : 'bg-orange text-black hover:shadow-glow-lg'
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-20 right-6 z-50 w-[350px] h-[500px] bg-void/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden transition-all duration-500 ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-orange/10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bot className="w-8 h-8 text-orange" />
              <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">HackBot</h3>
              <p className="text-xs text-green-400 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Online
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-light/50" />
          </button>
        </div>

        {/* Messages */}
        <div className="h-[calc(100%-140px)] overflow-y-auto p-4 space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-4 py-2 rounded-2xl ${
                  message.sender === 'user' ? 'bg-orange text-black' : 'bg-white/10 text-white'
                }`}
              >
                <div className="whitespace-pre-wrap text-sm">{message.text}</div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="px-4 py-3 bg-white/10 text-white rounded-2xl">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-orange rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-orange rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-orange rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-void">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-light/40 focus:outline-none focus:border-orange/50"
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim()}
              className="p-2 bg-orange text-black rounded-lg hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chatbot;
