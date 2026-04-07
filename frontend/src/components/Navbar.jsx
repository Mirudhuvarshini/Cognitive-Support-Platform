import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, LogOut, Menu, X, User, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="navbar glass-card">
            <div className="container nav-content">
                <Link to="/" className="brand">
                    <Brain color="var(--color-primary)" size={28} />
                    <span className="brand-name">Neural Compass</span>
                </Link>

                <div className="nav-links">
                    <Link to="/" className="nav-link">Home</Link>
                    {user && (
                        <Link to="/dashboard" className="nav-link">
                            <LayoutDashboard size={16} /> Dashboard
                        </Link>
                    )}
                </div>

                <div className="nav-actions">
                    {user ? (
                        <div className="user-menu">
                            <span className="user-greeting-nav">
                                <User size={16} /> {user.name}
                            </span>
                            <button onClick={handleLogout} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                                <LogOut size={16} /> Logout
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link">Login</Link>
                            <Link to="/signup" className="btn-primary" style={{ borderRadius: '50px', padding: '10px 20px' }}>Sign Up</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
