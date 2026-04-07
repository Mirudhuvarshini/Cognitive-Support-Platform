import React, { useState } from 'react';
import { MessageSquare, Volume2, Maximize2, Minimize2, Plus, X } from 'lucide-react';

const DEFAULT_CARDS = [
    { id: 1, text: 'I need a break', emoji: '🛑', color: '#ef4444', category: 'needs' },
    { id: 2, text: 'Too loud', emoji: '🔇', color: '#f59e0b', category: 'sensory' },
    { id: 3, text: 'I\'m hungry', emoji: '🍽️', color: '#22c55e', category: 'needs' },
    { id: 4, text: 'I need help', emoji: '🆘', color: '#dc2626', category: 'needs' },
    { id: 5, text: 'I\'m feeling overwhelmed', emoji: '😰', color: '#8b5cf6', category: 'emotions' },
    { id: 6, text: 'I\'m happy', emoji: '😊', color: '#22c55e', category: 'emotions' },
    { id: 7, text: 'I\'m tired', emoji: '😴', color: '#6366f1', category: 'needs' },
    { id: 8, text: 'Too bright', emoji: '☀️', color: '#f59e0b', category: 'sensory' },
    { id: 9, text: 'I want to go home', emoji: '🏠', color: '#3b82f6', category: 'needs' },
    { id: 10, text: 'Yes / I agree', emoji: '✅', color: '#22c55e', category: 'response' },
    { id: 11, text: 'No / I disagree', emoji: '❌', color: '#ef4444', category: 'response' },
    { id: 12, text: 'Wait, please', emoji: '⏳', color: '#f59e0b', category: 'response' },
    { id: 13, text: 'I\'m scared', emoji: '😨', color: '#8b5cf6', category: 'emotions' },
    { id: 14, text: 'I\'m frustrated', emoji: '😤', color: '#ef4444', category: 'emotions' },
    { id: 15, text: 'Can you repeat that?', emoji: '🔄', color: '#3b82f6', category: 'response' },
    { id: 16, text: 'I need space', emoji: '🧘', color: '#14b8a6', category: 'needs' },
];

const CATEGORIES = ['all', 'needs', 'sensory', 'emotions', 'response'];

export default function CommunicationCards() {
    const [cards, setCards] = useState(DEFAULT_CARDS);
    const [filter, setFilter] = useState('all');
    const [fullscreenCard, setFullscreenCard] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newCard, setNewCard] = useState({ text: '', emoji: '💬', color: '#6C5CE7', category: 'needs' });

    const speak = (text) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.85;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            speechSynthesis.speak(utterance);
        }
    };

    const handleCardTap = (card) => {
        speak(card.text);
    };

    const openFullscreen = (card) => {
        setFullscreenCard(card);
        speak(card.text);
    };

    const addCard = () => {
        if (!newCard.text.trim()) return;
        setCards(prev => [...prev, { ...newCard, id: Date.now() }]);
        setNewCard({ text: '', emoji: '💬', color: '#6C5CE7', category: 'needs' });
        setShowAddForm(false);
    };

    const filteredCards = filter === 'all' ? cards : cards.filter(c => c.category === filter);

    return (
        <div className="container app-page animate-fade-in">
            {fullscreenCard && (
                <div className="fullscreen-card-overlay" onClick={() => setFullscreenCard(null)}>
                    <div className="fullscreen-card" style={{ background: fullscreenCard.color }} onClick={e => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setFullscreenCard(null)} style={{ color: 'white', position: 'absolute', top: '20px', right: '20px' }}><X size={32} /></button>
                        <span style={{ fontSize: '8rem' }}>{fullscreenCard.emoji}</span>
                        <h1 style={{ color: 'white', fontSize: '3rem', textAlign: 'center', marginTop: '1rem' }}>{fullscreenCard.text}</h1>
                        <button onClick={() => speak(fullscreenCard.text)} style={{ marginTop: '2rem', background: 'rgba(255,255,255,0.2)', border: '2px solid white', color: 'white', padding: '12px 24px', borderRadius: '50px', fontSize: '1.2rem', cursor: 'pointer' }}>
                            <Volume2 size={20} /> Speak Again
                        </button>
                    </div>
                </div>
            )}

            <div className="page-header text-center mb-6">
                <MessageSquare color="var(--color-primary)" size={48} className="mx-auto mb-4" />
                <h2>Communication Cards</h2>
                <p>Tap a card to speak it aloud. Use fullscreen mode to show others.</p>
            </div>

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div className="flex justify-space-between align-center mb-4" style={{ flexWrap: 'wrap', gap: '8px' }}>
                    <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                        {CATEGORIES.map(cat => (
                            <button key={cat} className={`pill-btn ${filter === cat ? 'selected' : ''}`} onClick={() => setFilter(cat)} style={{ fontSize: '0.85rem', textTransform: 'capitalize' }}>{cat}</button>
                        ))}
                    </div>
                    <button className="btn-primary" onClick={() => setShowAddForm(true)} style={{ padding: '8px 16px' }}><Plus size={16} /> Custom Card</button>
                </div>

                {showAddForm && (
                    <div className="glass-card mb-4" style={{ padding: '1.5rem' }}>
                        <h3 className="mb-4">Create Custom Card</h3>
                        <div className="form-grid">
                            <div className="input-group">
                                <label>Message</label>
                                <input type="text" value={newCard.text} onChange={e => setNewCard({ ...newCard, text: e.target.value })} placeholder="e.g. I need water" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)' }} />
                            </div>
                            <div className="input-group">
                                <label>Emoji</label>
                                <input type="text" value={newCard.emoji} onChange={e => setNewCard({ ...newCard, emoji: e.target.value })} style={{ width: '80px', padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', fontSize: '1.5rem', textAlign: 'center' }} />
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button className="btn-primary" onClick={addCard}>Add Card</button>
                            <button className="btn-secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
                        </div>
                    </div>
                )}

                <div className="comm-cards-grid">
                    {filteredCards.map(card => (
                        <div key={card.id} className="comm-card" style={{ background: `${card.color}15`, borderLeft: `4px solid ${card.color}` }} onClick={() => handleCardTap(card)}>
                            <span style={{ fontSize: '2.5rem' }}>{card.emoji}</span>
                            <p style={{ fontWeight: 600, fontSize: '1rem', margin: '8px 0 0 0' }}>{card.text}</p>
                            <div className="comm-card-actions">
                                <button onClick={(e) => { e.stopPropagation(); speak(card.text); }} title="Speak"><Volume2 size={14} /></button>
                                <button onClick={(e) => { e.stopPropagation(); openFullscreen(card); }} title="Fullscreen"><Maximize2 size={14} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
