// Better Auth service wrapper
// Removed mock import as we're using direct API calls
import { User } from '../utils/types';

class AuthService {
  /**
   * Register a new user
   */
  async register(userData: { email: string; password: string }): Promise<{ user: User; token: string }> {
    try {
      // For registration, we'll make a direct API call to our backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        // Check if response has JSON content
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Registration failed';

        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.detail || errorData.message || errorMessage;
          } catch (jsonError) {
            // If JSON parsing fails, use status text or default message
            errorMessage = response.statusText || errorMessage;
          }
        } else {
          // If not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }

        throw new Error(errorMessage);
      }

      // After successful registration, trigger login to get token
      return await this.login(userData);
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  }

  /**
   * Log in an existing user
   */
  async login(credentials: { email: string; password: string }): Promise<{ user: User; token: string }> {
    try {
      // Make direct API call to backend for login
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        // Check if response has JSON content
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Login failed';

        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.detail || errorData.message || errorMessage;
          } catch (jsonError) {
            // If JSON parsing fails, use status text or default message
            errorMessage = response.statusText || errorMessage;
          }
        } else {
          // If not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }

        throw new Error(errorMessage);
      }

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error('Invalid response format from server');
      }

      const token = data.access_token;

      // Store the token and email
      localStorage.setItem('access_token', token);
      localStorage.setItem('user_email', credentials.email);

      // Decode the JWT token to get user ID
      let userId = '';
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          userId = payload.sub; // subject claim contains the user ID
        }
      } catch (decodeError) {
        console.error('Error decoding token:', decodeError);
      }

      // Return the user object with both ID and email
      return {
        user: {
          id: userId,
          email: credentials.email
        } as User,
        token: token
      };
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  }

  /**
   * Log out the current user
   */
  async logout(): Promise<void> {
    // Remove the stored token and email
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_email');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    // This will use Better Auth's session management
    // In practice, you'd typically use the useSession hook in components
    const token = localStorage.getItem('access_token');
    return !!token;
  }

  /**
   * Get the current user's token
   */
  getToken(): string | null {
    // With Better Auth, token management is handled internally
    // This is maintained for compatibility
    return localStorage.getItem('access_token');
  }

  /**
   * Get the current user's info
   */
  async getCurrentUser(): Promise<User | null> {
    // Extract user info from stored token
    const token = this.getToken();
    if (!token) return null;

    // Get email from localStorage
    const email = localStorage.getItem('user_email') || '';

    try {
      // Decode the JWT token to get user ID
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        return null;
      }

      const payload = JSON.parse(atob(tokenParts[1]));
      const userId = payload.sub; // subject claim contains the user ID

      // Return a user object with both ID and email
      return {
        id: userId,
        email: email
      } as User;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
}

export default new AuthService();