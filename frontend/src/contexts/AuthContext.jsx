import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);
const API_URL = 'http://localhost:5000/api';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('neuroToken'));
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        if (token) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchUser = async () => {
        try {
            const res = await fetch(`${API_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUser({ id: data.id, name: data.name, email: data.email, role: data.role });
                setProfile(data);
            } else {
                logout();
            }
        } catch {
            // Server might be down — keep token for retry but set user from localStorage fallback
            const stored = localStorage.getItem('neuroUser');
            if (stored) {
                try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
            }
        }
        setLoading(false);
    };

    const login = async (email, password) => {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');
        localStorage.setItem('neuroToken', data.token);
        localStorage.setItem('neuroUser', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return data.user;
    };

    const signup = async (name, email, password, role = 'user') => {
        const res = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Signup failed');
        localStorage.setItem('neuroToken', data.token);
        localStorage.setItem('neuroUser', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return data.user;
    };

    const logout = () => {
        localStorage.removeItem('neuroToken');
        localStorage.removeItem('neuroUser');
        setToken(null);
        setUser(null);
        setProfile(null);
    };

    const updateProfile = async (profileData) => {
        const res = await fetch(`${API_URL}/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(profileData)
        });
        if (res.ok) {
            setProfile(prev => ({ ...prev, ...profileData }));
        }
        return res.ok;
    };

    const addPoints = async (pts) => {
        try {
            await fetch(`${API_URL}/profile/points`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ points: pts })
            });
        } catch { /* offline fallback */ }
    };

    const authFetch = async (url, options = {}) => {
        return fetch(`${API_URL}${url}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
                ...options.headers
            }
        });
    };

    return (
        <AuthContext.Provider value={{
            user, token, loading, profile,
            login, signup, logout, updateProfile, addPoints, authFetch, fetchUser
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
