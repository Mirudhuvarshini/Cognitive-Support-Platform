import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, Clock, Sun, Moon, Coffee, Heart, BookOpen, Pill, Dumbbell, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const CATEGORIES = [
    { id: 'self-care', label: 'Self-Care', icon: <Heart size={16} />, color: '#ec4899' },
    { id: 'therapy', label: 'Therapy', icon: <Heart size={16} />, color: '#8b5cf6' },
    { id: 'school', label: 'School/Study', icon: <BookOpen size={16} />, color: '#3b82f6' },
    { id: 'work', label: 'Work', icon: <Coffee size={16} />, color: '#f59e0b' },
    { id: 'leisure', label: 'Leisure', icon: <Sun size={16} />, color: '#22c55e' },
    { id: 'exercise', label: 'Exercise', icon: <Dumbbell size={16} />, color: '#ef4444' },
    { id: 'medication', label: 'Medication', icon: <Pill size={16} />, color: '#14b8a6' },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function RoutineBuilder() {
    const { authFetch } = useAuth();
    const [routines, setRoutines] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: '', time_slot: '08:00', category: 'self-care', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] });
    const [viewDay, setViewDay] = useState(DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]);

    useEffect(() => { loadRoutines(); }, []);

    const loadRoutines = async () => {
        try {
            const res = await authFetch('/routines');
            if (res.ok) setRoutines(await res.json());
        } catch { /* offline */ }
    };

    const handleSave = async () => {
        if (!form.title.trim()) return;
        try {
            await authFetch('/routines', { method: 'POST', body: JSON.stringify(form) });
            setShowForm(false);
            setForm({ title: '', time_slot: '08:00', category: 'self-care', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] });
            loadRoutines();
        } catch { /* offline */ }
    };

    const handleDelete = async (id) => {
        await authFetch(`/routines/${id}`, { method: 'DELETE' });
        loadRoutines();
    };

    const toggleDay = (day) => {
        setForm(prev => ({
            ...prev,
            days: prev.days.includes(day) ? prev.days.filter(d => d !== day) : [...prev.days, day]
        }));
    };

    const getCategoryConfig = (catId) => CATEGORIES.find(c => c.id === catId) || CATEGORIES[0];

    const dayRoutines = routines
        .filter(r => {
            const days = r.days ? (typeof r.days === 'string' ? JSON.parse(r.days) : r.days) : [];
            return days.includes(viewDay);
        })
        .sort((a, b) => (a.time_slot || '').localeCompare(b.time_slot || ''));

    const getTimePeriod = (time) => {
        const hour = parseInt(time?.split(':')[0] || '12');
        if (hour < 12) return 'Morning';
        if (hour < 17) return 'Afternoon';
        return 'Evening';
    };

    const groupedRoutines = {};
    dayRoutines.forEach(r => {
        const period = getTimePeriod(r.time_slot);
        if (!groupedRoutines[period]) groupedRoutines[period] = [];
        groupedRoutines[period].push(r);
    });

    return (
        <div className="container app-page animate-fade-in">
            <div className="page-header text-center mb-6">
                <Calendar color="var(--color-primary)" size={48} className="mx-auto mb-4" />
                <h2>Daily Routine Builder</h2>
                <p>Create a structured daily schedule that works with your brain.</p>
            </div>

            <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                <div className="flex justify-space-between align-center mb-4">
                    <div className="flex gap-1">
                        {DAYS.map(d => (
                            <button key={d} className={`pill-btn ${viewDay === d ? 'selected' : ''}`} onClick={() => setViewDay(d)} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>{d}</button>
                        ))}
                    </div>
                    <button className="btn-primary" onClick={() => setShowForm(true)} style={{ padding: '8px 16px' }}><Plus size={16} /> Add</button>
                </div>

                {showForm && (
                    <div className="glass-card mb-4" style={{ padding: '1.5rem' }}>
                        <div className="flex justify-space-between align-center mb-4">
                            <h3>New Routine</h3>
                            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
                        </div>
                        <div className="form-grid">
                            <div className="input-group">
                                <label>Activity</label>
                                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Morning meditation" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)' }} />
                            </div>
                            <div className="input-group">
                                <label>Time</label>
                                <input type="time" value={form.time_slot} onChange={e => setForm({ ...form, time_slot: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)' }} />
                            </div>
                        </div>
                        <div className="input-group mt-4">
                            <label>Category</label>
                            <div className="flex flex-wrap gap-2">
                                {CATEGORIES.map(c => (
                                    <button key={c.id} className={`pill-btn ${form.category === c.id ? 'selected' : ''}`} onClick={() => setForm({ ...form, category: c.id })} style={{ fontSize: '0.8rem', padding: '4px 12px' }}>
                                        {c.icon} {c.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="input-group mt-4">
                            <label>Days</label>
                            <div className="flex gap-2">
                                {DAYS.map(d => (
                                    <button key={d} className={`pill-btn ${form.days.includes(d) ? 'selected' : ''}`} onClick={() => toggleDay(d)} style={{ padding: '6px 10px', fontSize: '0.8rem' }}>{d}</button>
                                ))}
                            </div>
                        </div>
                        <button className="btn-primary mt-4" onClick={handleSave}>Save Routine</button>
                    </div>
                )}

                {Object.keys(groupedRoutines).length === 0 ? (
                    <div className="glass-card text-center" style={{ padding: '3rem' }}>
                        <Calendar size={48} color="var(--color-text-secondary)" className="mb-4" />
                        <h3>No routines for {viewDay}</h3>
                        <p className="text-secondary">Add activities to build your daily structure.</p>
                    </div>
                ) : (
                    Object.entries(groupedRoutines).map(([period, items]) => (
                        <div key={period} className="mb-6">
                            <h3 className="flex align-center gap-2 mb-4">
                                {period === 'Morning' ? <Sun size={18} color="#f59e0b" /> : period === 'Afternoon' ? <Coffee size={18} color="#f97316" /> : <Moon size={18} color="#6366f1" />}
                                {period}
                            </h3>
                            <div className="flex flex-col gap-2">
                                {items.map(r => {
                                    const cat = getCategoryConfig(r.category);
                                    return (
                                        <div key={r.id} className="glass-card flex justify-space-between align-center" style={{ padding: '1rem', borderLeft: `4px solid ${cat.color}` }}>
                                            <div className="flex align-center gap-4">
                                                <span className="text-secondary" style={{ fontWeight: 500, minWidth: '50px' }}>{r.time_slot}</span>
                                                <div>
                                                    <span style={{ fontWeight: 500 }}>{r.title}</span>
                                                    <span className="badge" style={{ marginLeft: '8px', background: `${cat.color}20`, color: cat.color, fontSize: '0.7rem' }}>{cat.label}</span>
                                                </div>
                                            </div>
                                            <button onClick={() => handleDelete(r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}><Trash2 size={16} /></button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
