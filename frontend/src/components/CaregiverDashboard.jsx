import React, { useState, useEffect } from 'react';
import { Shield, Users, TrendingUp, AlertTriangle, Heart, Brain, BarChart3, Link as LinkIcon, Plus, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function CaregiverDashboard() {
    const { authFetch, user } = useAuth();
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patientReport, setPatientReport] = useState(null);
    const [linkEmail, setLinkEmail] = useState('');
    const [linkStatus, setLinkStatus] = useState('');
    const [showLink, setShowLink] = useState(false);

    useEffect(() => { loadPatients(); }, []);

    const loadPatients = async () => {
        try {
            const res = await authFetch('/caregiver/patients');
            if (res.ok) setPatients(await res.json());
        } catch { /* offline */ }
    };

    const linkPatient = async () => {
        try {
            const res = await authFetch('/caregiver/link', { method: 'POST', body: JSON.stringify({ patient_email: linkEmail }) });
            if (res.ok) {
                setLinkStatus('Linked successfully!');
                setLinkEmail('');
                loadPatients();
            } else {
                const data = await res.json();
                setLinkStatus(data.error || 'Failed to link');
            }
        } catch { setLinkStatus('Connection error'); }
    };

    const viewReport = async (patientId) => {
        try {
            const res = await authFetch(`/caregiver/patient/${patientId}/report`);
            if (res.ok) {
                const data = await res.json();
                setPatientReport(data);
                setSelectedPatient(patients.find(p => p.id === patientId));
            }
        } catch { /* offline */ }
    };

    const getMoodColor = (mood) => {
        const colors = { great: '#22c55e', okay: '#f59e0b', struggling: '#ef4444', crisis: '#dc2626' };
        return colors[mood] || '#6b7280';
    };

    const getMoodEmoji = (mood) => {
        const emojis = { great: '😊', okay: '😐', struggling: '😟', crisis: '🆘' };
        return emojis[mood] || '❓';
    };

    if (patientReport && selectedPatient) {
        const completedTasks = patientReport.tasks.filter(t => t.status === 'completed').length;
        const totalTasks = patientReport.tasks.length;
        return (
            <div className="container app-page animate-fade-in">
                <button className="btn-secondary mb-4" onClick={() => { setPatientReport(null); setSelectedPatient(null); }}>← Back to Patients</button>
                <div className="flex align-center gap-4 mb-6">
                    <div className="user-avatar" style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700 }}>
                        {selectedPatient.name?.charAt(0) || '?'}
                    </div>
                    <div>
                        <h2 style={{ margin: 0 }}>{selectedPatient.name}'s Report</h2>
                        <p className="text-secondary">Level {patientReport.profile?.level || 1} &bull; {patientReport.profile?.points || 0} pts</p>
                    </div>
                </div>

                <div className="dashboard-stats-grid mb-6">
                    <div className="glass-card stat-card">
                        <Heart size={24} color="#ef4444" />
                        <div className="stat-value">{patientReport.moods.length}</div>
                        <div className="stat-label">Mood Entries</div>
                    </div>
                    <div className="glass-card stat-card">
                        <Brain size={24} color="#6C5CE7" />
                        <div className="stat-value">{completedTasks}/{totalTasks}</div>
                        <div className="stat-label">Tasks Done</div>
                    </div>
                    <div className="glass-card stat-card">
                        <Activity size={24} color="#22c55e" />
                        <div className="stat-value">{patientReport.scores.length}</div>
                        <div className="stat-label">Games Played</div>
                    </div>
                    <div className="glass-card stat-card">
                        <TrendingUp size={24} color="#f59e0b" />
                        <div className="stat-value">{patientReport.profile?.streak_days || 0}</div>
                        <div className="stat-label">Day Streak</div>
                    </div>
                </div>

                <div className="glass-card mb-6" style={{ padding: '1.5rem' }}>
                    <h3 className="mb-4">Recent Mood Log</h3>
                    {patientReport.moods.length === 0 ? (
                        <p className="text-secondary">No mood data yet.</p>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {patientReport.moods.slice(0, 10).map((m, i) => (
                                <div key={i} className="flex justify-space-between align-center" style={{ padding: '8px 0', borderBottom: '1px solid var(--glass-border)' }}>
                                    <div className="flex align-center gap-2">
                                        <span style={{ fontSize: '1.3rem' }}>{getMoodEmoji(m.mood)}</span>
                                        <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>{m.mood}</span>
                                        <span className="text-secondary text-sm">Sensory: {m.sensory_level}%</span>
                                    </div>
                                    <span className="text-secondary text-sm">{new Date(m.created_at).toLocaleDateString()}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <h3 className="mb-4">Recent Tasks</h3>
                    {patientReport.tasks.slice(0, 10).map((t, i) => (
                        <div key={i} className="flex justify-space-between align-center" style={{ padding: '8px 0', borderBottom: '1px solid var(--glass-border)' }}>
                            <span style={{ textDecoration: t.status === 'completed' ? 'line-through' : 'none' }}>{t.title}</span>
                            <span className={`badge priority-${t.priority?.toLowerCase()}`}>{t.priority}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container app-page animate-fade-in">
            <div className="page-header text-center mb-6">
                <Shield color="var(--color-primary)" size={48} className="mx-auto mb-4" />
                <h2>Caregiver Dashboard</h2>
                <p>Monitor and support your linked individuals.</p>
            </div>

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div className="flex justify-space-between align-center mb-4">
                    <h3>Linked Individuals</h3>
                    <button className="btn-primary" onClick={() => setShowLink(!showLink)} style={{ padding: '8px 16px' }}><Plus size={16} /> Link Patient</button>
                </div>

                {showLink && (
                    <div className="glass-card mb-4" style={{ padding: '1.5rem' }}>
                        <h4 className="mb-2">Link a new individual</h4>
                        <p className="text-secondary text-sm mb-4">Enter the email of the person you want to monitor.</p>
                        <div className="flex gap-2">
                            <input type="email" value={linkEmail} onChange={e => setLinkEmail(e.target.value)} placeholder="patient@email.com" style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)' }} />
                            <button className="btn-primary" onClick={linkPatient}><LinkIcon size={16} /> Link</button>
                        </div>
                        {linkStatus && <p className="mt-2 text-sm" style={{ color: linkStatus.includes('success') ? '#22c55e' : '#ef4444' }}>{linkStatus}</p>}
                    </div>
                )}

                {patients.length === 0 ? (
                    <div className="glass-card text-center" style={{ padding: '3rem' }}>
                        <Users size={48} color="var(--color-text-secondary)" className="mb-4" />
                        <h3>No Linked Individuals</h3>
                        <p className="text-secondary">Link a patient's account to start monitoring their progress.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {patients.map(p => {
                            const conditions = p.conditions ? (typeof p.conditions === 'string' ? JSON.parse(p.conditions) : p.conditions) : [];
                            return (
                                <div key={p.id} className="glass-card flex justify-space-between align-center" style={{ padding: '1.5rem' }}>
                                    <div className="flex align-center gap-4">
                                        <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700 }}>
                                            {p.name?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0 }}>{p.name}</h3>
                                            <p className="text-secondary text-sm">{p.email}</p>
                                            <div className="flex gap-2 mt-1">
                                                {p.last_mood && (
                                                    <span className="badge" style={{ background: `${getMoodColor(p.last_mood)}20`, color: getMoodColor(p.last_mood) }}>
                                                        {getMoodEmoji(p.last_mood)} {p.last_mood}
                                                    </span>
                                                )}
                                                <span className="badge priority-low">Lvl {p.level || 1}</span>
                                                {conditions.length > 0 && <span className="badge">{conditions[0]}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <button className="btn-primary" onClick={() => viewReport(p.id)} style={{ padding: '8px 16px' }}>
                                        <BarChart3 size={16} /> Report
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
