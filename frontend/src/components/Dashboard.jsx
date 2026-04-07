import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings, CheckCircle2, Brain, Target, Heart, Calendar, BookOpen, MapPin, Shield, BarChart3, TrendingUp, Star, Zap, MessageSquare, Clock, Users, Pencil } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
    const { user, profile } = useAuth();
    const [activeTab, setActiveTab] = useState('tools');
    const userName = user?.name || 'Friend';
    const conditions = profile?.conditions ? (typeof profile.conditions === 'string' ? JSON.parse(profile.conditions) : profile.conditions) : [];
    const level = profile?.level || 1;
    const points = profile?.points || 0;

    const levelNames = { 1: 'Explorer', 2: 'Learner', 3: 'Achiever', 4: 'Champion', 5: 'Master Mind' };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    const tips = conditions.includes('ADHD') ? [
        'Break tasks into 15-minute chunks with timers',
        'Use body-doubling technique for difficult tasks',
        'Keep a "parking lot" list for stray thoughts during focus time',
    ] : conditions.includes('Autism Spectrum Disorder') ? [
        'Practice conversation scripts for common social situations',
        'Use our Social Script Generator for specific scenarios',
        'Consider communication cards for difficult situations',
    ] : conditions.includes('Dyslexia') ? [
        'Use text-to-speech tools when reading feels overwhelming',
        'Try color-coded overlays for better reading flow',
        'Break reading sessions into 10-minute intervals',
    ] : [
        'Start your day with a 5-minute mindfulness exercise',
        'Use the task planner to break down overwhelming activities',
        'Track your mood regularly to identify patterns',
    ];

    const toolLinks = [
        { to: '/tasks', icon: <Brain size={20} />, label: 'AI Task Planner', desc: 'Break down tasks', color: '#6C5CE7' },
        { to: '/mood', icon: <Heart size={20} />, label: 'Mood Tracker', desc: 'Log & track moods', color: '#ef4444' },
        { to: '/focus', icon: <Clock size={20} />, label: 'Focus Timer', desc: 'Pomodoro sessions', color: '#f59e0b' },
        { to: '/learning', icon: <Target size={20} />, label: 'Gamified Learning', desc: 'Train & earn points', color: '#22c55e' },
        { to: '/self-care', icon: <Heart size={20} />, label: 'Self-Care Toolkit', desc: 'Breathing & sounds', color: '#ec4899' },
        { to: '/places', icon: <MapPin size={20} />, label: 'Safe Places', desc: 'Nearby support', color: '#3b82f6' },
        { to: '/journal', icon: <Pencil size={20} />, label: 'Daily Journal', desc: 'Write & reflect', color: '#8b5cf6' },
        { to: '/routines', icon: <Calendar size={20} />, label: 'Routine Builder', desc: 'Plan your day', color: '#14b8a6' },
        { to: '/emergency', icon: <Shield size={20} />, label: 'Emergency Contacts', desc: 'Manage contacts', color: '#dc2626' },
        { to: '/communication-cards', icon: <MessageSquare size={20} />, label: 'Communication Cards', desc: 'Visual aids', color: '#0ea5e9' },
        { to: '/analytics', icon: <BarChart3 size={20} />, label: 'My Analytics', desc: 'View progress', color: '#6366f1' },
        { to: '/community', icon: <Users size={20} />, label: 'Community', desc: 'Peer support', color: '#10b981' },
    ];

    return (
        <div className="container dashboard-container animate-fade-in">
            <div className="dashboard-welcome glass-card mb-4" style={{ padding: '2rem', background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)', color: 'white', borderRadius: 'var(--radius-lg)' }}>
                <div className="flex justify-space-between align-center">
                    <div>
                        <h2 style={{ color: 'white', margin: 0 }}>{getGreeting()}, {userName}!</h2>
                        <p style={{ opacity: 0.9, marginTop: '4px' }}>
                            {conditions.length > 0 ? `Personalized for your ${conditions[0]} support` : 'Your cognitive support dashboard'}
                        </p>
                    </div>
                    <div className="level-display text-center" style={{ background: 'rgba(255,255,255,0.2)', padding: '12px 20px', borderRadius: '16px' }}>
                        <Star size={24} color="#f59e0b" />
                        <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>Level {level}</div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>{levelNames[level] || 'Explorer'}</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{points} pts</div>
                    </div>
                </div>
            </div>

            <div className="tabs-container mb-4">
                <div className="tabs">
                    <button className={`tab-btn ${activeTab === 'tools' ? 'active' : ''}`} onClick={() => setActiveTab('tools')}>Support Tools</button>
                    <button className={`tab-btn ${activeTab === 'tips' ? 'active' : ''}`} onClick={() => setActiveTab('tips')}>Personalized Tips</button>
                </div>
            </div>

            {activeTab === 'tools' && (
                <div className="tools-grid">
                    {toolLinks.map(tool => (
                        <Link key={tool.to} to={tool.to} className="glass-card tool-card-dash" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div className="tool-icon-circle" style={{ background: `${tool.color}15`, color: tool.color }}>
                                {tool.icon}
                            </div>
                            <h4 style={{ margin: '8px 0 4px 0', fontSize: '0.95rem' }}>{tool.label}</h4>
                            <p className="text-secondary" style={{ fontSize: '0.8rem', margin: 0 }}>{tool.desc}</p>
                        </Link>
                    ))}
                </div>
            )}

            {activeTab === 'tips' && (
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div className="tips-list">
                        {tips.map((tip, i) => (
                            <div key={i} className="tip-item glass-card mb-3">
                                <CheckCircle2 size={20} color="#22c55e" />
                                <span>{tip}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-center text-secondary mt-4" style={{ fontSize: '0.85rem' }}>
                        Tips are generated based on your profile and activity patterns.
                    </p>
                </div>
            )}
        </div>
    );
}
