import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, AlertCircle, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Signup() {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { signup } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        try {
            await signup(formData.name, formData.email, formData.password, formData.role);
            navigate(formData.role === 'caregiver' ? '/caregiver' : '/onboarding');
        } catch (err) {
            setError(err.message || 'Signup failed. Please try again.');
        }
        setLoading(false);
    };

    return (
        <div className="container auth-container animate-fade-in">
            <div className="glass-card auth-card">
                <div className="auth-header text-center">
                    <h2>Create Your Account</h2>
                    <p>Join a platform designed for your unique mind.</p>
                </div>

                {error && (
                    <div className="error-banner">
                        <AlertCircle size={18} /> {error}
                    </div>
                )}

                <div className="role-selector mb-4">
                    <button
                        className={`role-btn ${formData.role === 'user' ? 'active' : ''}`}
                        onClick={() => setFormData({ ...formData, role: 'user' })}
                        type="button"
                    >
                        <User size={18} /> I Need Support
                    </button>
                    <button
                        className={`role-btn ${formData.role === 'caregiver' ? 'active' : ''}`}
                        onClick={() => setFormData({ ...formData, role: 'caregiver' })}
                        type="button"
                    >
                        <Shield size={18} /> I'm a Caregiver
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <label>Full Name</label>
                        <div className="input-wrap">
                            <User className="input-icon" size={20} />
                            <input
                                type="text"
                                placeholder="Enter your name" required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    </div>

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
                                placeholder="Create a password (min 6 chars)" required
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary full-width" disabled={loading}>
                        {loading ? 'Creating account...' : 'Continue to Setup'} <ArrowRight size={20} />
                    </button>
                </form>

                <div className="auth-footer text-center">
                    <p>Already have an account? <Link to="/login" className="auth-link">Log In</Link></p>
                </div>
            </div>
        </div>
    );
}
