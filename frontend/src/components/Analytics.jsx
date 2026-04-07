import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Brain, Heart, Target, Clock, Star, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../contexts/AuthContext';

const MOOD_COLORS = { great: '#22c55e', okay: '#f59e0b', struggling: '#ef4444', crisis: '#dc2626' };
const PIE_COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#dc2626', '#6b7280'];

export default function Analytics() {
    const { authFetch, profile } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadAnalytics(); }, []);

    const loadAnalytics = async () => {
        try {
            const res = await authFetch('/analytics');
            if (res.ok) setData(await res.json());
        } catch {
            setData({
                moodTrends: [],
                taskStats: [{ status: 'pending', count: 3 }, { status: 'completed', count: 7 }],
                gameStats: [],
                focusSessions: 0,
                profile: { points: parseInt(localStorage.getItem('neuroPoints') || '0'), level: 1, streak_days: 0 }
            });
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="container app-page text-center">
                <p>Loading analytics...</p>
            </div>
        );
    }

    if (!data) return null;

    const moodChartData = data.moodTrends.map(m => ({
        date: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sensory: m.sensory_level,
        energy: m.energy_level,
        mood: m.mood,
        moodScore: m.mood === 'great' ? 4 : m.mood === 'okay' ? 3 : m.mood === 'struggling' ? 2 : 1,
    })).reverse();

    const moodDistribution = {};
    data.moodTrends.forEach(m => { moodDistribution[m.mood] = (moodDistribution[m.mood] || 0) + 1; });
    const moodPieData = Object.entries(moodDistribution).map(([name, value]) => ({ name, value }));

    const taskData = data.taskStats.map(t => ({ name: t.status, count: t.count }));
    const completedTasks = data.taskStats.find(t => t.status === 'completed')?.count || 0;
    const totalTasks = data.taskStats.reduce((a, b) => a + b.count, 0);

    return (
        <div className="container app-page animate-fade-in">
            <div className="page-header text-center mb-6">
                <BarChart3 color="var(--color-primary)" size={48} className="mx-auto mb-4" />
                <h2>My Analytics</h2>
                <p>Track your progress and identify patterns.</p>
            </div>

            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <div className="dashboard-stats-grid mb-6">
                    <div className="glass-card stat-card">
                        <Star size={24} color="#f59e0b" />
                        <div className="stat-value">{data.profile?.points || 0}</div>
                        <div className="stat-label">Total Points</div>
                    </div>
                    <div className="glass-card stat-card">
                        <Zap size={24} color="#6C5CE7" />
                        <div className="stat-value">Level {data.profile?.level || 1}</div>
                        <div className="stat-label">Current Level</div>
                    </div>
                    <div className="glass-card stat-card">
                        <Target size={24} color="#22c55e" />
                        <div className="stat-value">{completedTasks}/{totalTasks}</div>
                        <div className="stat-label">Tasks Done</div>
                    </div>
                    <div className="glass-card stat-card">
                        <Clock size={24} color="#3b82f6" />
                        <div className="stat-value">{data.focusSessions}</div>
                        <div className="stat-label">Focus Sessions</div>
                    </div>
                </div>

                {moodChartData.length > 0 && (
                    <div className="glass-card mb-6" style={{ padding: '1.5rem' }}>
                        <h3 className="flex align-center gap-2 mb-4"><TrendingUp size={20} color="var(--color-primary)" /> Mood & Sensory Trends</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={moodChartData}>
                                <XAxis dataKey="date" fontSize={12} />
                                <YAxis domain={[0, 100]} fontSize={12} />
                                <Tooltip />
                                <Line type="monotone" dataKey="sensory" stroke="#ef4444" strokeWidth={2} name="Sensory Level" dot={{ r: 3 }} />
                                <Line type="monotone" dataKey="energy" stroke="#3b82f6" strokeWidth={2} name="Energy Level" dot={{ r: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    {moodPieData.length > 0 && (
                        <div className="glass-card" style={{ padding: '1.5rem' }}>
                            <h3 className="flex align-center gap-2 mb-4"><Heart size={20} color="#ef4444" /> Mood Distribution</h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={moodPieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                        {moodPieData.map((entry, i) => (
                                            <Cell key={i} fill={MOOD_COLORS[entry.name] || PIE_COLORS[i % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {taskData.length > 0 && (
                        <div className="glass-card" style={{ padding: '1.5rem' }}>
                            <h3 className="flex align-center gap-2 mb-4"><Brain size={20} color="var(--color-primary)" /> Task Completion</h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={taskData}>
                                    <XAxis dataKey="name" fontSize={12} />
                                    <YAxis fontSize={12} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {data.gameStats.length > 0 && (
                    <div className="glass-card mt-6" style={{ padding: '1.5rem' }}>
                        <h3 className="flex align-center gap-2 mb-4"><Target size={20} color="#22c55e" /> Game Performance</h3>
                        <div className="flex flex-col gap-2">
                            {data.gameStats.map((g, i) => (
                                <div key={i} className="flex justify-space-between align-center" style={{ padding: '8px 0', borderBottom: '1px solid var(--glass-border)' }}>
                                    <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>{g.game_type?.replace(/_/g, ' ')}</span>
                                    <div className="flex gap-4 text-sm">
                                        <span>Best: {g.best}</span>
                                        <span>Avg: {Math.round(g.average)}</span>
                                        <span className="badge priority-low">{g.played}x played</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
