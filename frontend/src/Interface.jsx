// ChatInterface.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router';
import UserServices from './services/UserService';
import chatbotService from './services/ChatBotServices';
import { 
  Send, 
  Loader2, 
  Sparkles, 
  User, 
  Bot, 
  MessageSquare, 
  UserCircle,
  LogOut,
  Menu,
  X
} from 'lucide-react';

function ChatInterface() {
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const messagesEndRef = useRef(null);
  const conversationId = 'default';

  // Load user data
  useEffect(() => {
    const userData = UserServices.getUser();
    setUser(userData);
  }, []);

  // Load chat history on mount
  useEffect(() => {
    const history = chatbotService.getChatHistory(conversationId);
    if (history.length === 0) {
      const newConv = chatbotService.startNewConversation(conversationId);
      setMessages(newConv.messages);
    } else {
      setMessages(history);
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setError('');

    const newMessages = [
      ...messages,
      {
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString()
      }
    ];
    setMessages(newMessages);
    setLoading(true);

    const result = await chatbotService.sendMessage(userMessage, messages);

    if (result.success) {
      const updatedMessages = [
        ...newMessages,
        {
          role: 'assistant',
          content: result.data.response,
          timestamp: result.data.timestamp
        }
      ];
      setMessages(updatedMessages);
      chatbotService.saveChatHistory(updatedMessages, conversationId);
    } else {
      setError(result.error);
      setMessages(messages);
    }

    setLoading(false);
  };

  const handleNewChat = () => {
    const newConv = chatbotService.startNewConversation(conversationId);
    setMessages(newConv.messages);
    setError('');
  };

  const handleSuggestion = (suggestion) => {
    setInput(suggestion);
  };

  const handleLogout = async () => {
    await UserServices.logout();
    navigate('/');
  };

  const navItems = [
    {
      name: 'Chat',
      icon: MessageSquare,
      path: '/chat/interface',
      active: location.pathname === '/chat/interface'
    },
    {
      name: 'Profile',
      icon: UserCircle,
      path: '/student/profile',
      active: location.pathname === '/student/profile'
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed lg:static lg:translate-x-0 z-30 w-64 h-full bg-gradient-to-b from-purple-900 to-purple-800 text-white transition-transform duration-300 ease-in-out`}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="p-6 border-b border-purple-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-8 h-8" />
                <div>
                  <h2 className="font-bold text-lg">Fed Poly Ado</h2>
                  <p className="text-xs text-purple-200">Student Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* User Info */}
          {user && (
            <div className="p-4 bg-purple-800/50 mx-4 mt-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center">
                  <User className="w-6 h-6 text-purple-900" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{user.full_name}</p>
                  <p className="text-xs text-purple-200 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  item.active
                    ? 'bg-white text-purple-900 shadow-lg'
                    : 'hover:bg-purple-700/50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </button>
            ))}
          </nav>

          {/* New Chat Button */}
          <div className="p-4 border-t border-purple-700">
            <button
              onClick={handleNewChat}
              className="w-full px-4 py-3 bg-purple-700 hover:bg-purple-600 rounded-lg font-medium transition-colors"
            >
              + New Chat
            </button>
          </div>

          {/* Logout */}
          <div className="p-4 border-t border-purple-700">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-purple-200 hover:text-white hover:bg-purple-700/50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Header */}
        <div className="bg-white border-b p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-600 hover:text-gray-900"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
              <Bot className="w-8 h-8 text-purple-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI Assistant</h1>
                <p className="text-sm text-gray-500">Ask me anything about Fed Poly Ado</p>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-purple-600" />
                  </div>
                )}
                <div
                  className={`max-w-xl px-4 py-3 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'bg-white shadow-md text-gray-800'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-purple-600" />
                </div>
                <div className="bg-white shadow-md px-4 py-3 rounded-2xl">
                  <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && !loading && (
          <div className="max-w-4xl mx-auto px-4 pb-4">
            <p className="text-sm text-gray-600 mb-2 font-medium">Quick questions:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {chatbotService.getSuggestions().slice(0, 4).map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestion(suggestion)}
                  className="text-left px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition text-sm shadow-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t bg-white p-4">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={loading}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChatInterface;