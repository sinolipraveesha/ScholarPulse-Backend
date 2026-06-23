import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../config/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Initial load: check if token exists in AsyncStorage
    useEffect(() => {
        const loadStoredData = async () => {
            const storedToken = await AsyncStorage.getItem('token');
            const storedUser = await AsyncStorage.getItem('user');
            
            if (storedToken && storedUser) {
                setToken(storedToken);
                setCurrentUser(JSON.parse(storedUser));
            }
        };
        loadStoredData();
    }, []);

    const register = async (fullName, email, studentId, password) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, email, studentId, password })
            });
            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (err) {
                throw new Error(`Server returned non-JSON response: ${text.substring(0, 150)}`);
            }
            setIsLoading(false);
            if (!response.ok) throw data;
            return data;
        } catch (error) {
            setIsLoading(false);
            throw error;
        }
    };

    const login = async (email, password) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (err) {
                throw new Error(`Server returned non-JSON response: ${text.substring(0, 150)}`);
            }
            
            if (response.ok && data.status === 'success') {
                const { token: userToken, ...userData } = data.data;
                await AsyncStorage.setItem('token', userToken);
                await AsyncStorage.setItem('user', JSON.stringify(userData));
                setToken(userToken);
                setCurrentUser(userData);
            }
            setIsLoading(false);
            if (!response.ok) throw data;
            return data;
        } catch (error) {
            setIsLoading(false);
            throw error;
        }
    };

    const updateProfile = async (fullName, password) => {
        setIsLoading(true);
        try {
            const payload = { fullName };
            if (password) payload.password = password;

            const response = await fetch(`${BASE_URL}/auth/profile`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (err) {
                throw new Error(`Server returned non-JSON response: ${text.substring(0, 150)}`);
            }

            if (response.ok && data.status === 'success') {
                const { token: newToken, ...userData } = data.data;
                await AsyncStorage.setItem('user', JSON.stringify(userData));
                if (newToken) {
                    await AsyncStorage.setItem('token', newToken);
                    setToken(newToken);
                }
                setCurrentUser(userData);
            }
            setIsLoading(false);
            if (!response.ok) throw data;
            return data;
        } catch (error) {
            setIsLoading(false);
            throw error;
        }
    };

    const logout = async () => {
        setIsLoading(true);
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        setToken(null);
        setCurrentUser(null);
        setIsLoading(false);
    };

    return (
        <AuthContext.Provider value={{ currentUser, token, isLoading, register, login, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};
