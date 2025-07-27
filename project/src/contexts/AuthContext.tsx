import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import authService from '../services/authService'; 

// Define the shape of the user object
interface User {
  id: number;
  email: string;
  role: 'host' | 'performer' | 'admin';
  username?: string; 
}

// Define the shape of the AuthContext
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean; // To indicate if auth state is being loaded/checked
}

// Create the AuthContext with a default (empty) value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the props for AuthContextProvider
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContextProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start as true, assume loading initial state

  // Effect to check for existing token in localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false); // Finished checking initial state
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login(email, password);
      const { token: receivedToken, user: userInfo } = response;

      localStorage.setItem('token', receivedToken);
      localStorage.setItem('user', JSON.stringify(userInfo));

      setToken(receivedToken);
      setUser(userInfo);
      setIsAuthenticated(true);
      return Promise.resolve(); // Indicate success
    } catch (error) {
      console.error('Login failed in AuthContext:', error);
      logout(); // Ensure state is cleared on login failure
      return Promise.reject(error); // Propagate error
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    // Optionally redirect to login page here if not handled by protected routes
  };

  // Value provided by the context
  const contextValue: AuthContextType = {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthContextProvider');
  }
  return context;
};
