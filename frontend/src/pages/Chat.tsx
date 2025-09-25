import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
    id: number
    text: string
    isUser: boolean
    timestamp: Date
}

const Chat = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: "Hello! I'm your AI movie assistant. I can help you find movies, get recommendations, or answer questions about films and TV shows. What would you like to know?",
            isUser: false,
            timestamp: new Date()
        }
    ])
    const [inputText, setInputText] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSendMessage = async () => {
        if (!inputText.trim()) return

        const userMessage: Message = {
            id: Date.now(),
            text: inputText,
            isUser: true,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInputText('')
        setIsTyping(true)

        // Simulate AI response
        setTimeout(() => {
            const aiResponse: Message = {
                id: Date.now() + 1,
                text: getAIResponse(inputText),
                isUser: false,
                timestamp: new Date()
            }
            setMessages(prev => [...prev, aiResponse])
            setIsTyping(false)
        }, 1500)
    }

    const getAIResponse = (userInput: string): string => {
        const input = userInput.toLowerCase()
        
        if (input.includes('recommend') || input.includes('suggest')) {
            return "I'd be happy to help you find great movies! Based on your preferences, I recommend checking out our AI Recommendations page. You can filter by genre, year, and more. What type of movies do you usually enjoy? Action, comedy, drama, or something else?"
        }
        
        if (input.includes('action') || input.includes('thriller')) {
            return "Great choice! For action and thriller movies, I'd recommend checking out recent releases like 'John Wick 4', 'Mission: Impossible - Dead Reckoning', or 'Top Gun: Maverick'. You can also explore our trending section for more exciting options!"
        }
        
        if (input.includes('comedy') || input.includes('funny')) {
            return "Comedy is always a great choice! Some recent comedy hits include 'Barbie', 'The Super Mario Bros. Movie', and 'Guardians of the Galaxy Vol. 3'. You can also browse our comedy genre filter in the recommendations section!"
        }
        
        if (input.includes('search') || input.includes('find')) {
            return "I can help you search for specific movies or TV shows! Use the search bar in the navigation to find exactly what you're looking for. You can search by title, actor, director, or even plot keywords. What are you trying to find?"
        }
        
        if (input.includes('rating') || input.includes('score')) {
            return "Our ratings are based on The Movie Database (TMDB) scores, which aggregate ratings from millions of users. Movies with ratings above 7.0 are generally considered excellent, 6.0-7.0 are good, and below 6.0 might be worth checking reviews before watching."
        }
        
        if (input.includes('help') || input.includes('how')) {
            return "I'm here to help! I can assist you with:\n• Finding movie recommendations\n• Explaining ratings and reviews\n• Helping you search for specific content\n• Answering questions about movies and TV shows\n• Guiding you through our features\n\nWhat would you like to know more about?"
        }
        
        return "That's an interesting question! I'm constantly learning about movies and TV shows. You can explore our extensive database by browsing different genres, checking out trending content, or using the search function. Is there a specific movie or show you'd like to know more about?"
    }

    const quickQuestions = [
        "Recommend me a good action movie",
        "What are the top rated movies?",
        "Find me comedy movies from 2023",
        "How do ratings work here?",
        "What's trending right now?"
    ]

    return (
        <div className="w-screen min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-x-hidden">
            <div className="pt-24 px-4 w-full max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    className="text-center mb-8"
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        AI Movie Assistant
                    </h1>
                    <p className="text-lg text-gray-300">
                        Chat with our AI to get personalized movie recommendations and answers
                    </p>
                </motion.div>

                {/* Chat Container */}
                <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-purple-500/20 overflow-hidden">
                    {/* Messages */}
                    <div className="h-96 overflow-y-auto p-6 space-y-4">
                        <AnimatePresence>
                            {messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                                            message.isUser
                                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                                : 'bg-gray-800/50 backdrop-blur-sm text-gray-100'
                                        }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                                        <p className="text-xs opacity-70 mt-1">
                                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Typing Indicator */}
                        {isTyping && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex justify-start"
                            >
                                <div className="bg-gray-800/50 backdrop-blur-sm px-4 py-3 rounded-2xl">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Questions */}
                    <div className="p-4 border-t border-gray-700/50">
                        <p className="text-sm text-gray-400 mb-3">Quick questions:</p>
                        <div className="flex flex-wrap gap-2">
                            {quickQuestions.map((question, index) => (
                                <button
                                    key={index}
                                    onClick={() => setInputText(question)}
                                    className="px-3 py-1 bg-gray-800/50 backdrop-blur-sm rounded-full text-xs text-gray-300 hover:bg-purple-600/50 hover:text-white transition-colors duration-200"
                                >
                                    {question}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-gray-700/50">
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Ask me about movies, get recommendations, or search for content..."
                                className="flex-1 bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors duration-300"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputText.trim() || isTyping}
                                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold hover:scale-105 transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                                Send
                            </button>
                        </div>
                    </div>
                </div>

                {/* Features */}
                <motion.div
                    className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                >
                    <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20 text-center">
                        <div className="text-3xl mb-3">🎯</div>
                        <h3 className="text-lg font-bold mb-2 text-purple-300">Smart Recommendations</h3>
                        <p className="text-sm text-gray-400">Get personalized movie suggestions based on your preferences and viewing history</p>
                    </div>
                    <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20 text-center">
                        <div className="text-3xl mb-3">🔍</div>
                        <h3 className="text-lg font-bold mb-2 text-purple-300">Intelligent Search</h3>
                        <p className="text-sm text-gray-400">Find movies and shows using natural language queries and advanced filters</p>
                    </div>
                    <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20 text-center">
                        <div className="text-3xl mb-3">💬</div>
                        <h3 className="text-lg font-bold mb-2 text-purple-300">24/7 Support</h3>
                        <p className="text-sm text-gray-400">Always available to help you discover your next favorite movie or TV show</p>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default Chat;