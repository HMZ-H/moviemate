import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';

interface ChatbotProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onToggle }) => {
  const [input, setInput] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    { role: 'assistant', content: "Hey there! 🎬 I'm your movie buddy! What's your vibe tonight? Looking for something to make you laugh, cry, or jump out of your seat?" }
  ]);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  // Check backend connection on component mount
  React.useEffect(() => {
    const checkConnection = async () => {
      try {
        console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
        console.log('Environment check:', {
          VITE_API_URL: import.meta.env.VITE_API_URL,
          NODE_ENV: import.meta.env.NODE_ENV,
          MODE: import.meta.env.MODE
        });
        
        if (!import.meta.env.VITE_API_URL) {
          console.error('VITE_API_URL is not defined!');
          setIsConnected(false);
          return;
        }
        
        const url = `${import.meta.env.VITE_API_URL}/health`;
        console.log('Health check URL:', url);
        
        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const res = await fetch(url, { 
          signal: controller.signal,
          headers: { 'Accept': 'application/json' }
        });
        clearTimeout(timeoutId);
        
        console.log('Response status:', res.status);
        console.log('Response headers:', Object.fromEntries(res.headers.entries()));
        
        const data = await res.json();
        setIsConnected(res.ok && data.status === 'ok');
        console.log('Backend health check:', data);
      } catch (e) {
        setIsConnected(false);
        console.error('Backend connection failed:', e);
        console.error('Error details:', {
          name: e instanceof Error ? e.name : 'Unknown',
          message: e instanceof Error ? e.message : String(e),
          stack: e instanceof Error ? e.stack : undefined
        });
      }
    };
    checkConnection();
  }, []);

  const quickOptions = [
    "I want something mind-blowing! 🤯",
    "Make me laugh tonight! 😂",
    "What's everyone watching? 🔥",
    "Hidden gems I've never heard of",
    "Something for the whole family 👨‍👩‍👧‍👦",
    "Movies like Inception but better",
    "What's new and exciting? ✨",
    "Best animated movies ever 🎨",
    "Sweet romantic movies 💕",
    "Sci-fi that won't give me nightmares"
  ];

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    setIsSending(true);
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    try {
      console.log('Sending message to backend:', text);
      
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Response data:', data);
      const reply = data?.reply || data?.error || 'Sorry, something went wrong.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (e) {
      console.error('Chat error:', e);
      const errorMessage = e instanceof Error && e.name === 'AbortError' 
        ? 'Request timed out. Please try again.' 
        : 'Network error. Please try again.';
      setMessages(prev => [...prev, { role: 'assistant', content: errorMessage }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleOptionClick = (option: string) => {
    void sendMessage(option);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input;
    setInput("");
    void sendMessage(text);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-50 bg-purple-500 hover:bg-purple-700 text-white rounded-full p-4 shadow-lg transition-colors duration-300"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
        </svg>
      </motion.button>

      {/* Chatbot Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-6 right-6 z-40 w-80 h-[500px] bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden flex flex-col"
          >
            {/* Chatbot Header */}
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Logo size="sm" showText={false} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">MovieBot</h3>
                  <p className="text-xs text-green-100">
                    {isConnected === null ? 'Connecting...' : 
                     isConnected ? 'AI Assistant Ready' : 
                     'Backend Offline'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-1 hover:bg-white/20 rounded">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                  </svg>
                </button>
                <button className="p-1 hover:bg-white/20 rounded">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                  </svg>
                </button>
                <button 
                  onClick={onToggle}
                  className="p-1 hover:bg-white/20 rounded"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Chat Content */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-700 space-y-3 min-h-0">
              {/* Quick Options when empty */}
              {messages.length <= 1 && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-400 mb-2">Quick questions:</p>
                  {quickOptions.map((option, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleOptionClick(option)}
                      className="w-full text-left bg-gray-600 hover:bg-gray-500 border border-gray-500 hover:border-green-400 rounded-lg p-2 text-xs transition-colors duration-200 text-gray-200"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {option}
                    </motion.button>
                  ))}
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex items-start space-x-2'}>
                  {m.role === 'assistant' && (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                  )}
                  <div className={m.role === 'user' ? 'bg-green-500 text-white rounded-lg p-3 max-w-xs' : 'bg-gray-600 rounded-lg p-3 shadow-sm max-w-xs'}>
                    <p className={m.role === 'user' ? 'text-sm' : 'text-sm text-gray-200'}>{m.content}</p>
                  </div>
                </div>
              ))}

              {isSending && (
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <div className="bg-gray-600 rounded-lg p-3 shadow-sm max-w-xs">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area - Always visible */}
            <div className="border-t border-gray-600 p-4 bg-gray-800 flex-shrink-0">
              <form className="flex items-center space-x-2" onSubmit={handleSubmit}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => {
                    console.log('Input changed:', e.target.value);
                    setInput(e.target.value);
                  }}
                  placeholder="Ask about movies..."
                  className="flex-1 border-2 border-gray-600 rounded-lg px-4 py-3 text-sm text-gray-100 bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  disabled={isSending}
                  style={{ 
                    color: '#1f2937',
                    backgroundColor: '#ffffff',
                    borderColor: '#d1d5db'
                  }}
                />
                <button 
                  type="submit" 
                  disabled={isSending || !input.trim()} 
                  className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white rounded-lg p-3 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                  </svg>
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
