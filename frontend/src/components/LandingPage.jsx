import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Heart, Search, Bell, Shield, BookOpen, Clock, Activity, Target, MessageCircle, Navigation, ChevronDown, MapPin, Users, Pencil, Calendar, BarChart3, Star, Zap, Eye, Hand } from 'lucide-react';

const conditions = [
    {
        id: 'adhd', title: 'ADHD', subtitle: 'Attention-Deficit / Hyperactivity Disorder',
        description: 'A condition that affects focus, impulse control, and energy levels.',
        symptoms: ['Difficulty sustaining attention', 'Hyperactivity', 'Impulsivity', 'Time blindness'],
        strengths: ['Creativity', 'Hyper-focus on interests', 'Resilience', 'High energy'],
        tips: ['Use timers', 'Break tasks into chunks', 'Keep a visual schedule'],
        icon: <Clock className="condition-icon" size={32} />,
        image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&h=400&fit=crop&auto=format',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        emoji: '⚡'
    },
    {
        id: 'autism', title: 'Autism Spectrum Disorder', subtitle: 'Differences in social interaction and sensory processing',
        description: 'A developmental condition involving differences in communication, behavior, and sensory experiences.',
        symptoms: ['Sensory sensitivities', 'Routine reliance', 'Social communication challenges'],
        strengths: ['Deep focus', 'High attention to detail', 'Honesty', 'Unique problem solving'],
        tips: ['Create predictable routines', 'Use sensory-friendly environments', 'Clear communication'],
        icon: <Brain className="condition-icon" size={32} />,
        image: 'https://images.unsplash.com/photo-1616531770192-c9f16e773e04?w=800&h=400&fit=crop&auto=format',
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        emoji: '🧩'
    },
    {
        id: 'dyslexia', title: 'Dyslexia', subtitle: 'Reading and language processing difference',
        description: 'A learning difference that primarily affects reading and spelling skills.',
        symptoms: ['Difficulty reading fluently', 'Spelling challenges', 'Mixing up letters or words'],
        strengths: ['Strong visual thinking', '3D spatial reasoning', 'Storytelling abilities'],
        tips: ['Use text-to-speech tools', 'Audiobooks', 'Color-coded overlays'],
        icon: <BookOpen className="condition-icon" size={32} />,
        image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&h=400&fit=crop&auto=format',
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        emoji: '📖'
    },
    {
        id: 'dyspraxia', title: 'Dyspraxia', subtitle: 'Coordination and movement differences',
        description: 'A condition affecting physical coordination, making daily tasks harder.',
        symptoms: ['Clumsiness', 'Poor balance', 'Difficulty with fine motor skills'],
        strengths: ['High empathy', 'Determination', 'Creative thinking'],
        tips: ['Break physical tasks down', 'Use ergonomic tools', 'Take extra time'],
        icon: <Activity className="condition-icon" size={32} />,
        image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=400&fit=crop&auto=format',
        gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        emoji: '🤸'
    },
    {
        id: 'dyscalculia', title: 'Dyscalculia', subtitle: 'Number and math processing difference',
        description: 'A learning difference that affects the ability to understand numbers and math concepts.',
        symptoms: ['Difficulty with mental math', 'Trouble reading clocks', 'Number transpositions'],
        strengths: ['Strong verbal skills', 'Intuitive thinking', 'Artistic abilities'],
        tips: ['Use calculators', 'Visual representations of math', 'Digital clocks'],
        icon: <Target className="condition-icon" size={32} />,
        image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=400&fit=crop&auto=format',
        gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        emoji: '🔢'
    },
    {
        id: 'tourette', title: 'Tourette Syndrome', subtitle: 'Nervous system condition involving tics',
        description: 'A condition characterized by sudden, involuntary movements or sounds called tics.',
        symptoms: ['Motor tics', 'Vocal tics', 'Worsens with stress'],
        strengths: ['Quick reflexes', 'Perceptive', 'Highly observant', 'Empathic'],
        tips: ['Reduce stress triggers', 'Allow breaks for tics', 'Provide a safe environment'],
        icon: <Bell className="condition-icon" size={32} />,
        image: 'https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=800&h=400&fit=crop&auto=format',
        gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
        emoji: '💫'
    },
];

const ConditionCard = ({ condition }) => {
    const [expanded, setExpanded] = useState(false);
    const [imgError, setImgError] = useState(false);

    return (
        <div className="glass-card condition-card animate-fade-in" style={{ overflow: 'hidden' }}>
            <div className="condition-image-banner" style={{ background: condition.gradient }}>
                {!imgError ? (
                    <img
                        src={condition.image}
                        alt={condition.title}
                        className="condition-banner-img"
                        onError={() => setImgError(true)}
                        loading="lazy"
                    />
                ) : null}
                <div className="condition-image-overlay">
                    <span className="condition-emoji">{condition.emoji}</span>
                </div>
            </div>

            <div className="condition-header" onClick={() => setExpanded(!expanded)}>
                <div className="condition-title-group">
                    {condition.icon}
                    <div><h3>{condition.title}</h3><p className="subtitle">{condition.subtitle}</p></div>
                </div>
                <button className="expand-btn"><ChevronDown style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s' }} /></button>
            </div>
            {expanded && (
                <div className="condition-content">
                    <p className="description">{condition.description}</p>
                    <div className="info-grid">
                        <div className="info-box"><h4>Common Traits</h4><ul>{condition.symptoms.map((s, i) => <li key={i}>• {s}</li>)}</ul></div>
                        <div className="info-box strengths"><h4>Associated Strengths</h4><ul>{condition.strengths.map((s, i) => <li key={i}>• {s}</li>)}</ul></div>
                        <div className="info-box tips"><h4>Support Tips</h4><ul>{condition.tips.map((s, i) => <li key={i}>• {s}</li>)}</ul></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default function LandingPage() {
    return (
        <div className="landing-page">
            <section className="hero container animate-fade-in">
                <div className="hero-content">
                    <div className="pill-badge">AI-powered cognitive support</div>
                    <h1>Neural Compass</h1>
                    <p>Personalized support for neurodivergent individuals through AI-powered assistance, sensory tools, gamified learning, and a caring community.</p>
                    <div className="hero-actions">
                        <Link to="/signup" className="btn-primary" style={{ borderRadius: '50px' }}>Get Started Free</Link>
                        <Link to="/login" className="btn-secondary" style={{ border: 'none', background: 'transparent' }}>Already have an account →</Link>
                    </div>
                </div>
                <div className="hero-visual">
                    <div className="hero-circle-bg"><Brain size={120} color="var(--color-primary)" /></div>
                </div>
            </section>

            <section className="about-app-section container" style={{ padding: '6rem 24px', textAlign: 'center', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)', marginBottom: '4rem' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2 style={{ color: 'var(--color-primary)', fontSize: '2.5rem' }}>What is NeuroAssist & Why Does It Exist?</h2>
                    <p style={{ marginTop: '1.5rem', fontSize: '1.15rem' }}>NeuroAssist is a personalized, AI-driven cognitive support platform built to empower neurodivergent individuals. Navigating a world designed for neurotypical minds can often lead to burnout, sensory overload, and task paralysis.</p>
                    <p style={{ marginTop: '1.25rem', fontSize: '1.15rem' }}>Our mission is to bridge that gap with structured task breakdowns, sensory regulation tools, gamified learning, emergency support, caregiver monitoring, and a supportive AI companion.</p>
                </div>
            </section>

            <section id="about-section" className="education-section container">
                <div className="section-header text-center">
                    <h2>Understanding Neurodivergence</h2>
                    <p>Neurodivergence is the idea that people experience and interact with the world in many different ways; there is no one "right" way of thinking, learning, and behaving.</p>
                </div>
                <div className="conditions-list">{conditions.map(c => <ConditionCard key={c.id} condition={c} />)}</div>
            </section>

            <section className="features-preview container">
                <div className="section-header text-center"><h2>Holistic Tools Designed for You</h2></div>
                <div className="features-grid">
                    {[
                        { icon: <Brain size={32} />, title: 'AI Task Planner', desc: 'Break down overwhelming tasks into step-by-step guides' },
                        { icon: <Heart size={32} />, title: 'Mood & Self-Care', desc: 'Track moods, breathing exercises, grounding, and calming sounds' },
                        { icon: <Target size={32} />, title: 'Gamified Learning', desc: '6 cognitive games with points, levels, and badges' },
                        { icon: <MapPin size={32} />, title: 'Safe Places Map', desc: 'Find nearby restaurants, hospitals, and pharmacies' },
                        { icon: <Shield size={32} />, title: 'Emergency SOS', desc: 'One-tap alerts to trusted contacts with live location' },
                        { icon: <MessageCircle size={32} />, title: 'AI Companion', desc: '24/7 empathetic chatbot with live voice conversation' },
                        { icon: <Calendar size={32} />, title: 'Routine Builder', desc: 'Visual daily schedules tailored to your needs' },
                        { icon: <Users size={32} />, title: 'Community', desc: 'Anonymous peer support and shared experiences' },
                        { icon: <BarChart3 size={32} />, title: 'Analytics', desc: 'Track progress with charts and insights' },
                    ].map((f, i) => (
                        <div key={i} className="glass-card feature-tile">
                            <span style={{ color: 'var(--color-primary)' }}>{f.icon}</span>
                            <h3>{f.title}</h3><p>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <footer>
                <div className="container footer-content text-center">
                    <h3>Neural Compass</h3>
                    <p className="disclaimer"><strong>Disclaimer:</strong> This platform provides supportive tools and self-assessment guidance. It does not provide medical diagnosis. Please consult healthcare professionals for medical advice.</p>
                    <div className="footer-links">
                        <span>© 2026 Neural Compass Platform</span>
                        <span>Privacy Policy</span>
                        <span>Terms of Service</span>
                        <Link to="/emergency" style={{ color: 'inherit' }}>Emergency Contacts</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
