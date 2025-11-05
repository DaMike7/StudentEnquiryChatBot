// chatbotService.js
const API_BASE_URL = 'http://localhost:8000/api';

class ChatBotService {
  /**
   * Get authentication token from localStorage
   */
  getToken() {
    return localStorage.getItem('token');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.getToken();
  }

  /**
   * Get chat history from localStorage
   * @param {string} conversationId - Unique conversation identifier
   */
  getChatHistory(conversationId = 'default') {
    const history = localStorage.getItem(`chat_history_${conversationId}`);
    return history ? JSON.parse(history) : [];
  }

  /**
   * Save chat history to localStorage
   * @param {Array} messages - Array of message objects
   * @param {string} conversationId - Unique conversation identifier
   */
  saveChatHistory(messages, conversationId = 'default') {
    localStorage.setItem(`chat_history_${conversationId}`, JSON.stringify(messages));
  }

  /**
   * Clear chat history from localStorage
   * @param {string} conversationId - Unique conversation identifier
   */
  clearChatHistory(conversationId = 'default') {
    localStorage.removeItem(`chat_history_${conversationId}`);
  }

  /**
   * Send a message to the chatbot
   * @param {string} message - User's message
   * @param {Array} history - Conversation history (array of {role, content} objects)
   * @returns {Promise<Object>} Response object with success status and data/error
   */
  async sendMessage(message, history = []) {
    try {
      const token = this.getToken();

      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }

      // Validate message
      if (!message || typeof message !== 'string' || !message.trim()) {
        throw new Error('Message cannot be empty');
      }

      // Format history for API (only send relevant fields)
      const formattedHistory = history.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: message.trim(),
          history: formattedHistory
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error codes
        if (response.status === 401) {
          throw new Error('Session expired. Please log in again.');
        } else if (response.status === 500) {
          throw new Error('Server error. Please try again later.');
        }
        throw new Error(data.detail || 'Failed to get response from chatbot');
      }

      return {
        success: true,
        data: {
          response: data.response,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('ChatBot Service Error:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred'
      };
    }
  }

  /**
   * Send a message and automatically manage history
   * @param {string} message - User's message
   * @param {string} conversationId - Unique conversation identifier
   * @returns {Promise<Object>} Complete conversation with new messages
   */
  async sendMessageWithHistory(message, conversationId = 'default') {
    try {
      // Get existing history
      const history = this.getChatHistory(conversationId);

      // Send message
      const result = await this.sendMessage(message, history);

      if (result.success) {
        // Add user message and bot response to history
        const updatedHistory = [
          ...history,
          {
            role: 'user',
            content: message,
            timestamp: new Date().toISOString()
          },
          {
            role: 'assistant',
            content: result.data.response,
            timestamp: result.data.timestamp
          }
        ];

        // Save updated history
        this.saveChatHistory(updatedHistory, conversationId);

        return {
          success: true,
          messages: updatedHistory,
          latestResponse: result.data.response
        };
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get conversation suggestions/quick replies
   * @returns {Array<string>} Array of suggested questions
   */
  getSuggestions() {
    return [
      "What are the admission requirements?",
      "How much is the tuition fee?",
      "When is the resumption date?",
      "How do I register for courses?",
      "What programs are available?",
      "How do I pay my fees?",
      "Where is the student dashboard?",
      "What is the application deadline?"
    ];
  }

  /**
   * Start a new conversation
   * @param {string} conversationId - Unique conversation identifier
   * @returns {Object} Initial conversation state
   */
  startNewConversation(conversationId = 'default') {
    const initialMessage = {
      role: 'assistant',
      content: "Hello! I'm your Federal Polytechnic Ado-Ekiti assistant. How can I help you today?",
      timestamp: new Date().toISOString()
    };

    this.saveChatHistory([initialMessage], conversationId);

    return {
      success: true,
      conversationId,
      messages: [initialMessage],
      suggestions: this.getSuggestions()
    };
  }

  /**
   * Get all conversations (if you want to support multiple chats)
   * @returns {Array<string>} Array of conversation IDs
   */
  getAllConversations() {
    const conversations = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('chat_history_')) {
        conversations.push(key.replace('chat_history_', ''));
      }
    }
    return conversations;
  }

  /**
   * Delete a conversation
   * @param {string} conversationId - Conversation to delete
   */
  deleteConversation(conversationId) {
    this.clearChatHistory(conversationId);
    return {
      success: true,
      message: 'Conversation deleted'
    };
  }

  /**
   * Export conversation as JSON
   * @param {string} conversationId - Conversation to export
   * @returns {string} JSON string of conversation
   */
  exportConversation(conversationId = 'default') {
    const history = this.getChatHistory(conversationId);
    return JSON.stringify({
      conversationId,
      exportedAt: new Date().toISOString(),
      messages: history
    }, null, 2);
  }

  /**
   * Get conversation statistics
   * @param {string} conversationId - Conversation to analyze
   * @returns {Object} Statistics about the conversation
   */
  getConversationStats(conversationId = 'default') {
    const history = this.getChatHistory(conversationId);
    const userMessages = history.filter(msg => msg.role === 'user');
    const assistantMessages = history.filter(msg => msg.role === 'assistant');

    return {
      totalMessages: history.length,
      userMessages: userMessages.length,
      assistantMessages: assistantMessages.length,
      averageMessageLength: history.reduce((sum, msg) => sum + msg.content.length, 0) / history.length || 0,
      firstMessage: history[0]?.timestamp || null,
      lastMessage: history[history.length - 1]?.timestamp || null
    };
  }
}

// Export singleton instance
const chatbotService = new ChatBotService();
export default chatbotService;