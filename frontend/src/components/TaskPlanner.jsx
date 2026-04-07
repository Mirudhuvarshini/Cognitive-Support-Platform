import React, { useState, useEffect } from 'react';
import { Plus, Check, Trash2, Brain, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function TaskPlanner() {
    const { authFetch } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [newPriority, setNewPriority] = useState('Medium');
    const [newTimeline, setNewTimeline] = useState('');
    const [showInsight, setShowInsight] = useState(true);

    useEffect(() => { loadTasks(); }, []);

    const loadTasks = async () => {
        try {
            const res = await authFetch('/tasks');
            if (res.ok) {
                const data = await res.json();
                setTasks(data.length > 0 ? data : [
                    { id: 1, title: 'Buy groceries', priority: 'Medium', status: 'pending', ai_suggested: false },
                    { id: 2, title: 'Email professor', priority: 'High', status: 'completed', ai_suggested: false },
                    { id: 3, title: 'Take a 15 min walk', priority: 'Low', status: 'pending', ai_suggested: true },
                ]);
            }
        } catch {
            setTasks([
                { id: 1, title: 'Buy groceries', priority: 'Medium', status: 'pending', ai_suggested: false },
                { id: 2, title: 'Email professor', priority: 'High', status: 'completed', ai_suggested: false },
            ]);
        }
    };

    const handleBreakDown = async () => {
        const taskToBreak = tasks.find(t => t.priority === 'Medium' && t.status === 'pending');
        if (taskToBreak) {
            const newSubTasks = [
                { title: `Step 1 for: ${taskToBreak.title}`, priority: 'Medium', ai_suggested: true },
                { title: `Step 2 for: ${taskToBreak.title}`, priority: 'Medium', ai_suggested: true },
                { title: `Step 3 for: ${taskToBreak.title}`, priority: 'Medium', ai_suggested: true },
            ];
            for (const sub of newSubTasks) {
                try { await authFetch('/tasks', { method: 'POST', body: JSON.stringify(sub) }); } catch {}
            }
            try { await authFetch(`/tasks/${taskToBreak.id}`, { method: 'DELETE' }); } catch {}
            loadTasks();
        }
        setShowInsight(false);
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;
        try {
            await authFetch('/tasks', {
                method: 'POST',
                body: JSON.stringify({ title: newTask, priority: newPriority, timeline: newTimeline })
            });
            loadTasks();
        } catch {
            setTasks(prev => [...prev, { id: Date.now(), title: newTask, priority: newPriority, timeline: newTimeline, status: 'pending', ai_suggested: false }]);
        }
        setNewTask('');
        setNewPriority('Medium');
        setNewTimeline('');
    };

    const toggleStatus = async (task) => {
        const newStatus = task.status === 'pending' ? 'completed' : 'pending';
        try { await authFetch(`/tasks/${task.id}`, { method: 'PUT', body: JSON.stringify({ status: newStatus }) }); } catch {}
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
    };

    const removeTask = async (id) => {
        try { await authFetch(`/tasks/${id}`, { method: 'DELETE' }); } catch {}
        setTasks(prev => prev.filter(t => t.id !== id));
    };

    return (
        <div className="container app-page animate-fade-in">
            <div className="page-header text-center mb-6">
                <Brain color="var(--color-primary)" size={48} className="mx-auto mb-4" />
                <h2>AI Task Planner</h2>
                <p>Break down your day into manageable pieces without feeling overwhelmed.</p>
            </div>

            <div className="planner-container">
                <form onSubmit={handleAddTask} className="add-task-form glass-card mb-4 flex flex-col gap-3" style={{ padding: '1.5rem' }}>
                    <input type="text" placeholder="What do you need to do?" value={newTask} onChange={(e) => setNewTask(e.target.value)} className="task-input full-width" style={{ border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '8px' }} />
                    <div className="flex gap-3 mt-2">
                        <select value={newPriority} onChange={(e) => setNewPriority(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', flex: 1 }}>
                            <option value="Low">Low Priority</option>
                            <option value="Medium">Medium Priority</option>
                            <option value="High">High Priority</option>
                        </select>
                        <input type="time" value={newTimeline} onChange={(e) => setNewTimeline(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', flex: 1 }} />
                        <button type="submit" className="btn-primary" style={{ padding: '10px 24px' }}><Plus /> Add</button>
                    </div>
                </form>

                <div className="tasks-list glass-card">
                    {tasks.length === 0 ? (
                        <div className="empty-state text-center" style={{ padding: '2rem' }}><p>Your list is empty. Enjoy the calm!</p></div>
                    ) : (
                        tasks.map(task => (
                            <div key={task.id} className={`task-row ${task.status === 'completed' ? 'completed' : ''}`}>
                                <button className="check-btn" onClick={() => toggleStatus(task)}>
                                    {task.status === 'completed' ? <Check size={20} color="var(--color-primary)" /> : <div className="circle-outline"></div>}
                                </button>
                                <div className="task-content">
                                    <span className="task-title">{task.title}</span>
                                    <div className="task-meta">
                                        <span className={`badge priority-${task.priority?.toLowerCase()}`}>{task.priority}</span>
                                        {task.timeline && <span className="badge" style={{ background: '#e2e8f0', color: '#475569' }}>Limit: {task.timeline}</span>}
                                        {task.ai_suggested && <span className="badge ai-suggested"><Sparkles size={12} /> AI</span>}
                                    </div>
                                </div>
                                <button className="delete-btn" onClick={() => removeTask(task.id)}><Trash2 size={18} /></button>
                            </div>
                        ))
                    )}
                </div>

                {showInsight && tasks.some(t => t.priority === 'Medium' && t.status === 'pending') && (
                    <div className="ai-insight-card glass-card mt-4" style={{ padding: '1.5rem' }}>
                        <div className="insight-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <AlertCircle size={20} color="var(--color-primary)" />
                            <h4>AI Planner Insight</h4>
                        </div>
                        <p style={{ lineHeight: '1.5' }}>Would you like the system to break down your next Medium priority task into 3 simpler steps?</p>
                        <button className="btn-secondary mt-2" onClick={handleBreakDown}>Break It Down For Me</button>
                    </div>
                )}
            </div>
        </div>
    );
}
