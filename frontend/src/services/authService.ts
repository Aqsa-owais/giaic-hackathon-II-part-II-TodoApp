// Better Auth service wrapper
import { signIn, signOut, useSession } from '../mocks/better-auth';
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
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
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
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();
      const token = data.access_token;

      // Store the token
      localStorage.setItem('access_token', token);

      // For now, return a minimal user object since we don't have user details endpoint
      // In a real implementation, you might decode the JWT to get user info
      return { user: { id: '', email: credentials.email } as User, token: token };
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  }

  /**
   * Log out the current user
   */
  async logout(): Promise<void> {
    // Remove the stored token
    localStorage.removeItem('access_token');
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
    // Extract user info from stored token or make a call to backend to verify token
    // For now, return null since user info is typically obtained during login
    const token = this.getToken();
    if (!token) return null;

    // In a real implementation, you would decode the JWT or call an endpoint
    // to get user details, but since there's no specific endpoint in the backend,
    // we'll return null for now
    return null;
  }
}

export default new AuthService();