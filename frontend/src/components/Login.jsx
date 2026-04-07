import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await login(formData.email, formData.password);
            navigate(user.role === 'caregiver' ? '/caregiver' : '/dashboard');
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        }
        setLoading(false);
    };

    return (
        <div className="container auth-container animate-fade-in">
            <div className="glass-card auth-card">
                <div className="auth-header text-center">
                    <h2>Welcome Back</h2>
                    <p>Sign in to continue your journey with NeuroAssist.</p>
                </div>

                {error && (
                    <div className="error-banner">
                        <AlertCircle size={18} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <label>Email Address</label>
                        <div className="input-wrap">
                            <Mail className="input-icon" size={20} />
                            <input
                                type="email"
                                placeholder="Enter your email" required
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <div className="input-wrap">
                            <Lock className="input-icon" size={20} />
                            <input
                                type="password"
                                placeholder="Enter your password" required
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary full-width" disabled={loading}>
                        <LogIn size={20} /> {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="auth-footer text-center">
                    <p>Don't have an account? <Link to="/signup" className="auth-link">Create one</Link></p>
                </div>
            </div>
        </div>
    );
}
