import React, { useState, useEffect } from 'react';
import { Pencil, Save, Trash2, Smile, Meh, Frown, Calendar, Mic, MicOff, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const MOOD_OPTIONS = [
    { id: 'great', emoji: '😊', label: 'Great' },
    { id: 'okay', emoji: '😐', label: 'Okay' },
    { id: 'struggling', emoji: '😟', label: 'Low' },
];

const TAG_OPTIONS = ['gratitude', 'reflection', 'anxiety', 'achievement', 'social', 'sensory', 'sleep', 'exercise'];

export default function Journal() {
    const { authFetch } = useAuth();
    const [entries, setEntries] = useState([]);
    const [content, setContent] = useState('');
    const [selectedMood, setSelectedMood] = useState(null);
    const [selectedTags, setSelectedTags] = useState([]);
    const [isListening, setIsListening] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [saved, setSaved] = useState(false);

    useEffect(() => { loadEntries(); }, []);

    const loadEntries = async () => {
        try {
            const res = await authFetch('/journal');
            if (res.ok) setEntries(await res.json());
        } catch { /* offline */ }
    };

    const handleSave = async () => {
        if (!content.trim()) return;
        try {
            await authFetch('/journal', {
                method: 'POST',
                body: JSON.stringify({ content, mood: selectedMood, tags: selectedTags })
            });
            setSaved(true);
            setContent('');
            setSelectedMood(null);
            setSelectedTags([]);
            loadEntries();
            setTimeout(() => setSaved(false), 2000);
        } catch { /* offline */ }
    };

    const toggleTag = (tag) => {
        setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    };

    const startVoiceInput = () => {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SR();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.onresult = (e) => {
            const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
            setContent(transcript);
        };
        recognition.onend = () => setIsListening(false);
        recognition.start();
        setIsListening(true);
    };

    const filteredEntries = entries.filter(e =>
        !searchQuery || e.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="container app-page animate-fade-in">
            <div className="page-header text-center mb-6">
                <Pencil color="var(--color-primary)" size={48} className="mx-auto mb-4" />
                <h2>Daily Journal</h2>
                <p>Write, reflect, and track your thoughts over time.</p>
            </div>

            <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                <div className="glass-card mb-6" style={{ padding: '1.5rem' }}>
                    <div className="flex justify-space-between align-center mb-4">
                        <h3 style={{ margin: 0 }}>New Entry</h3>
                        <span className="text-secondary text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                    </div>

                    <div className="mb-4">
                        <label className="text-sm text-secondary" style={{ display: 'block', marginBottom: '8px' }}>How are you feeling?</label>
                        <div className="flex gap-2">
                            {MOOD_OPTIONS.map(m => (
                                <button key={m.id} onClick={() => setSelectedMood(m.id)} className={`pill-btn ${selectedMood === m.id ? 'selected' : ''}`}>
                                    {m.emoji} {m.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4" style={{ position: 'relative' }}>
                        <textarea
                            className="notes-textarea"
                            placeholder="What's on your mind? How was your day? Any wins or challenges?"
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            rows="6"
                            style={{ width: '100%', fontSize: '1rem' }}
                        />
                        <button onClick={startVoiceInput} style={{ position: 'absolute', right: '10px', bottom: '10px', background: isListening ? '#fee2e2' : 'var(--color-bg-secondary)', border: 'none', borderRadius: '50%', padding: '8px', cursor: 'pointer' }}>
                            {isListening ? <MicOff size={16} color="#dc2626" /> : <Mic size={16} />}
                        </button>
                    </div>

                    <div className="mb-4">
                        <label className="text-sm text-secondary" style={{ display: 'block', marginBottom: '8px' }}>Tags (optional)</label>
                        <div className="flex flex-wrap gap-2">
                            {TAG_OPTIONS.map(tag => (
                                <button key={tag} onClick={() => toggleTag(tag)} className={`pill-btn ${selectedTags.includes(tag) ? 'selected' : ''}`} style={{ fontSize: '0.8rem', padding: '4px 12px' }}>
                                    #{tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button className="btn-primary full-width" onClick={handleSave} disabled={!content.trim()}>
                        <Save size={18} /> {saved ? '✓ Saved!' : 'Save Entry'}
                    </button>
                </div>

                {entries.length > 0 && (
                    <>
                        <div className="flex justify-space-between align-center mb-4">
                            <h3>Past Entries</h3>
                            <div style={{ position: 'relative', width: '200px' }}>
                                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '8px 8px 8px 30px', borderRadius: '20px', border: '1px solid var(--glass-border)', fontSize: '0.85rem' }} />
                            </div>
                        </div>
                        <div className="flex flex-col gap-4">
                            {filteredEntries.map((entry, i) => {
                                const moodObj = MOOD_OPTIONS.find(m => m.id === entry.mood);
                                const tags = entry.tags ? (typeof entry.tags === 'string' ? JSON.parse(entry.tags) : entry.tags) : [];
                                return (
                                    <div key={entry.id || i} className="glass-card" style={{ padding: '1.25rem' }}>
                                        <div className="flex justify-space-between align-center mb-2">
                                            <div className="flex align-center gap-2">
                                                {moodObj && <span style={{ fontSize: '1.3rem' }}>{moodObj.emoji}</span>}
                                                <span className="text-secondary text-sm">{new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            </div>
                                        </div>
                                        <p style={{ lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{entry.content}</p>
                                        {tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {tags.map(t => <span key={t} className="badge" style={{ fontSize: '0.7rem' }}>#{t}</span>)}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
