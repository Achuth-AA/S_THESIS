import { useState, useEffect } from 'react'
import Prediction from './components/Prediction'
import Visualizations from './components/Visualizations'
import Helper from './components/Helper'
import { Shield, BarChart3, MessageCircle, AlertCircle } from 'lucide-react'
import { API_ENDPOINTS } from './config/api'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('prediction')
  const [isLoaded, setIsLoaded] = useState(false)
  const [apiStatus, setApiStatus] = useState('checking')

  useEffect(() => {
    setIsLoaded(true)
    checkApiStatus()
  }, [])

  const checkApiStatus = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.HEALTH)
      if (response.ok) {
        const data = await response.json()
        setApiStatus(data.model_loaded ? 'connected' : 'model-error')
      } else {
        setApiStatus('error')
      }
    } catch (error) {
      setApiStatus('error')
    }
  }

  const tabs = [
    { id: 'prediction', name: 'Prediction', icon: Shield },
    { id: 'visualizations', name: 'Visualizations', icon: BarChart3 },
    { id: 'helper', name: 'Helper', icon: MessageCircle },
  ]

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <div className="min-h-screen relative">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -inset-[10px] opacity-10">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-gray-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gray-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
          </div>
        </div>

        {/* Header */}
        <header className={`relative border-b border-white/10 transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white rounded-xl animate-float">
                  <Shield className="w-8 h-8 text-black" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-tight">
                    Network Intrusion Detection System
                  </h1>
                  <p className="text-gray-400 text-sm mt-1">AI-Powered Security Analysis Platform</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  {apiStatus === 'connected' && (
                    <>
                      <div className="absolute inset-0 bg-green-400 rounded-full animate-ping"></div>
                      <div className="relative w-3 h-3 bg-green-400 rounded-full"></div>
                    </>
                  )}
                  {apiStatus === 'checking' && (
                    <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                  )}
                  {apiStatus === 'error' && (
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-300">
                  {apiStatus === 'connected' && 'API Connected'}
                  {apiStatus === 'checking' && 'Checking API...'}
                  {apiStatus === 'error' && 'API Disconnected'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className={`container mx-auto px-6 mt-8 transition-all duration-1000 delay-200 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-2 border border-white/10">
            <nav className="flex space-x-2">
              {tabs.map((tab, index) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{ animationDelay: `${index * 100}ms` }}
                    className={`
                      flex-1 flex items-center justify-center space-x-2 px-6 py-4 rounded-xl
                      font-medium transition-all duration-500 transform
                      ${activeTab === tab.id
                        ? 'bg-white text-black shadow-2xl scale-[1.02] animate-slideIn'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.name}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <main className={`container mx-auto px-6 mt-8 pb-12 transition-all duration-1000 delay-300 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 min-h-[600px] animate-fadeIn">
            {activeTab === 'prediction' && <Prediction />}
            {activeTab === 'visualizations' && <Visualizations />}
            {activeTab === 'helper' && <Helper />}
          </div>
        </main>

        {/* Footer */}
        <footer className={`border-t border-white/10 transition-all duration-1000 delay-400 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between text-gray-400 text-sm">
              <span>© 2025 Network Security Thesis Project</span>
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 animate-pulse" />
                <span>By SASI </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App
