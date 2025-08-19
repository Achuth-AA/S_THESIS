import React, { useState, useEffect, useRef } from 'react'
import { Send, MessageCircle, Bot, User, HelpCircle, Shield, Database, BarChart3 } from 'lucide-react'

const Helper = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! I\'m your Network Security Assistant. I can help you with questions about network intrusion detection, using the prediction system, understanding attack types, and interpreting results. How can I assist you today?',
      timestamp: new Date().toLocaleTimeString()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const quickQuestions = [
    { 
      icon: Shield, 
      text: 'What attack types can this system detect?',
      question: 'What attack types can this system detect?'
    },
    { 
      icon: Database, 
      text: 'How do I use the CSV upload feature?',
      question: 'How do I use the CSV upload feature?'
    },
    { 
      icon: BarChart3, 
      text: 'What do the confidence scores mean?',
      question: 'What do the confidence scores mean?'
    },
    { 
      icon: HelpCircle, 
      text: 'How accurate is the ML model?',
      question: 'How accurate is the ML model?'
    }
  ]

  const predefinedAnswers = {
    'what attack types can this system detect?': 'This system can detect 15 different types of network attacks:\n\n• BENIGN - Normal traffic\n• Bot - Botnet activity\n• DDoS - Distributed Denial of Service\n• DoS attacks (GoldenEye, Hulk, Slowhttptest, Slowloris)\n• Web attacks (Brute Force, SQL Injection, XSS)\n• FTP-Patator & SSH-Patator - Brute force attacks\n• Heartbleed - SSL/TLS vulnerability exploit\n• Infiltration - Network penetration attempts\n• PortScan - Network reconnaissance',
    
    'how do i use the csv upload feature?': 'To use the CSV upload feature:\n\n1. Go to the Prediction tab\n2. Switch to "CSV Upload" mode\n3. Click the upload area or drag & drop your CSV file\n4. Ensure your CSV has the same format as the sample data\n5. Click "Analyze CSV Data"\n6. View results in the table with attack classifications and confidence scores\n\nThe system will process all rows and return predictions for each one.',
    
    'what do the confidence scores mean?': 'Confidence scores indicate how certain the ML model is about its prediction:\n\n• 90-100%: Very high confidence\n• 70-89%: High confidence  \n• 50-69%: Moderate confidence\n• Below 50%: Low confidence\n\nHigher scores mean the model is more certain about the classification. Scores above 80% are generally considered reliable for security decisions.',
    
    'how accurate is the ml model?': 'The XGBoost model used in this system:\n\n• Is trained on comprehensive network traffic data\n• Uses 78+ features for classification\n• Employs gradient boosting for high accuracy\n• Can handle various network protocols and patterns\n\nModel performance depends on:\n- Quality of training data\n- Feature engineering\n- Regular updates with new attack patterns\n\nFor best results, ensure your input data matches the training format.'
  }

  const generateBotResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase()
    
    // Check for exact matches first
    for (const [key, answer] of Object.entries(predefinedAnswers)) {
      if (lowerMessage.includes(key.toLowerCase()) || lowerMessage === key.toLowerCase()) {
        return answer
      }
    }
    
    // Check for keywords and provide relevant responses
    if (lowerMessage.includes('attack') || lowerMessage.includes('threat')) {
      return predefinedAnswers['what attack types can this system detect?']
    }
    
    if (lowerMessage.includes('csv') || lowerMessage.includes('upload') || lowerMessage.includes('file')) {
      return predefinedAnswers['how do i use the csv upload feature?']
    }
    
    if (lowerMessage.includes('confidence') || lowerMessage.includes('score') || lowerMessage.includes('percentage')) {
      return predefinedAnswers['what do the confidence scores mean?']
    }
    
    if (lowerMessage.includes('accuracy') || lowerMessage.includes('reliable') || lowerMessage.includes('model')) {
      return predefinedAnswers['how accurate is the ml model?']
    }
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return 'Hello! I\'m here to help you with the Network Intrusion Detection System. You can ask me about attack types, how to use features, or understanding the results. What would you like to know?'
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
      return 'I can help you with:\n\n• Understanding different attack types\n• Using the prediction features\n• Interpreting confidence scores\n• CSV upload process\n• Model accuracy and reliability\n\nWhat specific topic would you like to know more about?'
    }
    
    // Default response
    return 'I\'m here to help with questions about network security and this detection system. You can ask me about:\n\n• Attack types and classifications\n• How to use the prediction features\n• Understanding confidence scores\n• CSV upload process\n• Model performance\n\nTry asking one of the quick questions below or type your own question!'
  }

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    // Simulate bot typing delay
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: generateBotResponse(inputMessage),
        timestamp: new Date().toLocaleTimeString()
      }
      setMessages(prev => [...prev, botResponse])
      setIsTyping(false)
    }, 1500)
  }

  const handleQuickQuestion = (question) => {
    setInputMessage(question)
    setTimeout(() => handleSendMessage(), 100)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="space-y-6 h-full">
      {/* Header */}
      <div className={`text-center transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
        <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">
          Security Assistant
        </h2>
        <p className="text-gray-400">Get help with network intrusion detection and system features</p>
      </div>

      {/* Chat Container */}
      <div className={`bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 h-[500px] flex flex-col transition-all duration-1000 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        
        {/* Chat Header */}
        <div className="flex items-center space-x-3 p-4 border-b border-white/10">
          <div className="p-2 bg-white/10 rounded-full">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-medium">Security Assistant</h3>
            <p className="text-gray-400 text-sm">Online • Ready to help</p>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
            >
              <div className={`flex items-start space-x-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`p-2 rounded-full ${message.type === 'user' ? 'bg-white/20' : 'bg-white/10'}`}>
                  {message.type === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                <div>
                  <div className={`p-3 rounded-lg ${
                    message.type === 'user' 
                      ? 'bg-white text-black' 
                      : 'bg-white/10 text-white border border-white/20'
                  }`}>
                    <p className="whitespace-pre-line">{message.content}</p>
                  </div>
                  <p className="text-gray-500 text-xs mt-1">{message.timestamp}</p>
                </div>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start animate-fadeIn">
              <div className="flex items-start space-x-2">
                <div className="p-2 bg-white/10 rounded-full">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="p-3 bg-white/10 rounded-lg border border-white/20">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/10">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about network security..."
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all duration-300"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className="px-4 py-3 bg-white text-black rounded-lg hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Questions */}
      <div className={`transition-all duration-1000 delay-400 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <h3 className="text-lg font-semibold text-white mb-4">Quick Questions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {quickQuestions.map((item, index) => {
            const Icon = item.icon
            return (
              <button
                key={index}
                onClick={() => handleQuickQuestion(item.question)}
                className="flex items-center space-x-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300 text-left group"
              >
                <Icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                <span className="text-gray-300 group-hover:text-white transition-colors text-sm">
                  {item.text}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Helper