import client from "./api";

const API_BASE_URL = 'http://localhost:8000/api';

class UserService {
  // Get token from localStorage
  getToken() {
    return localStorage.getItem('token');
  }

  // Set token in localStorage
  setToken(token) {
    localStorage.setItem('token', token);
  }

  // Remove token from localStorage
  removeToken() {
    localStorage.removeItem('token');
  }

  // Get user from localStorage
  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Set user in localStorage
  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  // Remove user from localStorage
  removeUser() {
    localStorage.removeItem('user');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken();
  }

  /**
   * Sign up a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @param {string} userData.full_name - User full name
   * @param {string} userData.matric_no - Matric number (optional)
   * @param {string} userData.school - School name (optional)
   * @param {string} userData.department - Department (optional)
   * @param {string} userData.level - Academic level (optional)
   */
  async signUp(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Signup failed');
      }

      // Store token and user data
      this.setToken(data.access_token);
      this.setUser(data.user);

      return {
        success: true,
        data: data,
        message: 'Signup successful',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   */
  async login(email, password) {
    try {
        console.log(email,password)
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      // Store token and user data
      this.setToken(data.access_token);
      this.setUser(data.user);

      return {
        success: true,
        data: data,
        message: 'Login successful',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      const token = this.getToken();
      
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }

      // Clear local storage
      this.removeToken();
      this.removeUser();

      return {
        success: true,
        message: 'Logout successful',
      };
    } catch (error) {
      // Clear local storage even if API call fails
      this.removeToken();
      this.removeUser();
      
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get current user profile
   */
  async getProfile() {
    try {
      const token = this.getToken();

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to fetch profile');
      }

      // Update user in localStorage
      this.setUser(data);

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Send message to chatbot
   * @param {string} message - User message
   * @param {Array} history - Chat history
   */
  async sendMessage(message, history = []) {
    try {
      const token = this.getToken();

      if (!token) {
        throw new Error('Please login to use the chatbot');
      }

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: message,
          history: history,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to get response');
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get user's conversation history (if you add this endpoint)
   */
  async getConversationHistory() {
    try {
      const token = this.getToken();

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/chat/history`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to fetch history');
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

// Export singleton instance
const UserServices = new UserService();
export default UserServices;