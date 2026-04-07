import React, { useState, useEffect } from 'react';
import { Smile, Frown, Meh, Wind, Speaker, Activity, AlertTriangle, TrendingUp, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const MOOD_EMOJIS = {
    great: { icon: '😊', color: '#22c55e' },
    okay: { icon: '😐', color: '#f59e0b' },
    struggling: { icon: '😟', color: '#ef4444' },
    crisis: { icon: '🆘', color: '#dc2626' },
};

export default function MoodTracker() {
    const { authFetch, user } = useAuth();
    const { setMood: setThemeMood } = useTheme();
    const [selectedMood, setSelectedMood] = useState(null);
    const [sensoryLevel, setSensoryLevel] = useState(50);
    const [energyLevel, setEnergyLevel] = useState(50);
    const [notes, setNotes] = useState('');
    const [saved, setSaved] = useState(false);
    const [history, setHistory] = useState([]);
    const [showBreathing, setShowBreathing] = useState(false);
    const [breathPhase, setBreathPhase] = useState('');

    const moods = [
        { id: 'great', label: 'Great', icon: <Smile size={32} />, color: '#22c55e' },
        { id: 'okay', label: 'Okay', icon: <Meh size={32} />, color: '#f59e0b' },
        { id: 'struggling', label: 'Struggling', icon: <Frown size={32} />, color: '#ef4444' },
        { id: 'crisis', label: 'Need Help', icon: <AlertTriangle size={32} />, color: '#dc2626' },
    ];

    useEffect(() => { loadHistory(); }, []);

    const loadHistory = async () => {
        try {
            const res = await authFetch('/mood?limit=7');
            if (res.ok) setHistory(await res.json());
        } catch { /* offline */ }
    };

    const handleSave = async () => {
        if (!selectedMood) return;
        setThemeMood(selectedMood);
        try {
            const res = await authFetch('/mood', {
                method: 'POST',
                body: JSON.stringify({ mood: selectedMood, sensory_level: sensoryLevel, energy_level: energyLevel, notes })
            });
            if (res.ok) {
                const data = await res.json();
                setSaved(true);
                if (data.crisisAlert) {
                    alert('We noticed you\'ve been struggling. Please consider reaching out to your emergency contacts or using the SOS button.');
                }
                loadHistory();
                setTimeout(() => setSaved(false), 3000);
            }
        } catch { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    };

    const startBreathing = () => {
        setShowBreathing(true);
        const phases = ['Breathe In...', 'Hold...', 'Breathe Out...', 'Hold...'];
        const durations = [4000, 7000, 8000, 4000];
        let i = 0;
        const cycle = () => {
            if (i >= phases.length * 3) { setShowBreathing(false); setBreathPhase(''); return; }
            setBreathPhase(phases[i % phases.length]);
            setTimeout(cycle, durations[i % durations.length]);
            i++;
        };
        cycle();
    };

    return (
        <div className="container app-page animate-fade-in">
            <div className="page-header text-center mb-6">
                <Heart color="var(--color-primary)" size={48} className="mx-auto mb-4" />
                <h2>Mood & Sensory Check-In</h2>
                <p>Take a deep breath. How is your energy today?</p>
            </div>

            <div className="mood-container glass-card">
                <div className="section-block">
                    <h3>1. How do you feel right now?</h3>
                    <div className="mood-options">
                        {moods.map(m => (
                            <button key={m.id} className={`mood-btn ${selectedMood === m.id ? 'active' : ''}`} onClick={() => setSelectedMood(m.id)} style={selectedMood === m.id ? { borderColor: m.color, color: m.color } : {}}>
                                {m.icon}
                                <span>{m.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="section-block mt-4">
                    <h3>2. Sensory Overload Level</h3>
                    <div className="sensory-slider-container">
                        <input type="range" min="0" max="100" value={sensoryLevel} onChange={(e) => setSensoryLevel(parseInt(e.target.value))} className="sensory-slider" />
                        <div className="slider-labels"><span>Calm</span><span>Overwhelmed</span></div>
                    </div>
                </div>

                <div className="section-block mt-4">
                    <h3>3. Energy Level</h3>
                    <div className="sensory-slider-container">
                        <input type="range" min="0" max="100" value={energyLevel} onChange={(e) => setEnergyLevel(parseInt(e.target.value))} className="sensory-slider" />
                        <div className="slider-labels"><span>Exhausted</span><span>Energized</span></div>
                    </div>
                </div>

                <div className="section-block mt-4">
                    <h3>4. Notes (optional)</h3>
                    <textarea className="notes-textarea" placeholder="What's on your mind? Any triggers or observations..." value={notes} onChange={e => setNotes(e.target.value)} rows="3" />
                </div>

                <button className="btn-primary full-width mt-6" disabled={!selectedMood} onClick={handleSave}>
                    {saved ? '✓ Saved!' : 'Save Entry & Get Recommendations'}
                </button>
            </div>

            {(sensoryLevel > 70 || selectedMood === 'struggling' || selectedMood === 'crisis') && (
                <div className="recommendation-card glass-card mt-6">
                    <div className="insight-header">
                        <Activity size={24} color="#f59e0b" />
                        <h4>{selectedMood === 'crisis' ? 'Crisis Support Available' : 'High Sensory Load Detected'}</h4>
                    </div>
                    <p>Your current levels suggest you might need a reset. Try one of these:</p>
                    <div className="action-buttons">
                        <button className="btn-secondary" onClick={startBreathing}><Wind size={18} /> 4-7-8 Breathing</button>
                        <button className="btn-secondary" onClick={() => window.open('https://www.youtube.com/watch?v=BGaVKSBRKJU', '_blank')}><Speaker size={18} /> Calming Sounds</button>
                    </div>
                </div>
            )}

            {showBreathing && (
                <div className="breathing-overlay">
                    <div className="breathing-circle">
                        <div className={`breathing-dot ${breathPhase.includes('In') ? 'expand' : breathPhase.includes('Out') ? 'shrink' : ''}`} />
                        <p className="breathing-text">{breathPhase}</p>
                    </div>
                    <button className="btn-secondary mt-4" onClick={() => setShowBreathing(false)}>Stop</button>
                </div>
            )}

            {history.length > 0 && (
                <div className="glass-card mt-6" style={{ maxWidth: '600px', margin: '1.5rem auto', padding: '1.5rem' }}>
                    <h3 className="flex align-center gap-2 mb-4"><TrendingUp size={20} color="var(--color-primary)" /> Recent Mood History</h3>
                    <div className="mood-history-list">
                        {history.map((entry, i) => (
                            <div key={i} className="mood-history-item flex justify-space-between align-center" style={{ padding: '8px 0', borderBottom: '1px solid var(--glass-border)' }}>
                                <div className="flex align-center gap-2">
                                    <span style={{ fontSize: '1.5rem' }}>{MOOD_EMOJIS[entry.mood]?.icon || '😐'}</span>
                                    <div>
                                        <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>{entry.mood}</span>
                                        <span className="text-secondary text-sm" style={{ display: 'block' }}>Sensory: {entry.sensory_level}%</span>
                                    </div>
                                </div>
                                <span className="text-secondary text-sm">{new Date(entry.created_at).toLocaleDateString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
