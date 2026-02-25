import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState(localStorage.getItem('selectedCity') || '');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (token) => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
      if (response.data.city) {
        setSelectedCity(response.data.city);
        localStorage.setItem('selectedCity', response.data.city);
      }
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    const { token, user: userData } = response.data;
    localStorage.setItem('token', token);
    setUser(userData);
    return userData;
  };

  const signup = async (data) => {
    const response = await axios.post(`${API_URL}/auth/signup`, data);
    const { token, user: userData } = response.data;
    localStorage.setItem('token', token);
    setUser(userData);
    return userData;
  };

  const providerSignup = async (data) => {
    const response = await axios.post(`${API_URL}/auth/provider-signup`, data);
    const { token, user: userData } = response.data;
    localStorage.setItem('token', token);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('selectedCity');
    setUser(null);
    setSelectedCity('');
  };

  const updateCity = async (city) => {
    const token = localStorage.getItem('token');
    if (token && user) {
      await axios.put(`${API_URL}/auth/update-city?city=${city}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
    setSelectedCity(city);
    localStorage.setItem('selectedCity', city);
  };

  const getToken = () => localStorage.getItem('token');

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      selectedCity,
      login,
      signup,
      providerSignup,
      logout,
      updateCity,
      getToken
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
