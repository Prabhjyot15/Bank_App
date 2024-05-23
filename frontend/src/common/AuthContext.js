import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

// Create a Context
const AuthContext = createContext(null);

// Provider component that wraps your app and makes auth object available to any child component that calls useAuth().
export const AuthProvider = ({ children }) => {
  
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));  // Get user from localStorage
  const [token, setToken] = useState(Cookies.get('token'));  // Get token from cookies

  // Effect to sync user data to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));  // Save user data to localStorage
    } else {
      localStorage.removeItem('user');  // Remove user data from localStorage if not logged in
    }
  }, [user]);

  const login = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    Cookies.set('token', tokenData, { expires: 1 });  // Save token in cookies for 1 day
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    Cookies.remove('token');  // Remove the token from cookies
    localStorage.removeItem('user');  // Remove the user from localStorage
  };

  // Pass the user and login method to the context
  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook for child components to get the auth object and re-render when it changes.
export const useAuth = () => {
  return useContext(AuthContext);
};
