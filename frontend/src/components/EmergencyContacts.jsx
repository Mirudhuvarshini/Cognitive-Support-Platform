import React, { useState, useEffect } from 'react';
import { Phone, Plus, Trash2, Edit2, Save, X, Shield, AlertTriangle, Heart, UserCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const RELATIONSHIPS = ['Parent', 'Spouse', 'Sibling', 'Caregiver', 'Therapist', 'Doctor', 'Friend', 'Teacher', 'Other'];

export default function EmergencyContacts() {
    const { authFetch } = useAuth();
    const [contacts, setContacts] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ name: '', relationship: 'Parent', phone: '', email: '', is_primary: false, notify_on_sos: true, notify_on_mood_crisis: false });

    useEffect(() => { loadContacts(); }, []);

    const loadContacts = async () => {
        try {
            const res = await authFetch('/emergency-contacts');
            if (res.ok) setContacts(await res.json());
        } catch { /* offline */ }
    };

    const handleSave = async () => {
        try {
            if (editingId) {
                await authFetch(`/emergency-contacts/${editingId}`, { method: 'PUT', body: JSON.stringify(form) });
            } else {
                await authFetch('/emergency-contacts', { method: 'POST', body: JSON.stringify(form) });
            }
            setShowForm(false);
            setEditingId(null);
            setForm({ name: '', relationship: 'Parent', phone: '', email: '', is_primary: false, notify_on_sos: true, notify_on_mood_crisis: false });
            loadContacts();
        } catch { /* error */ }
    };

    const handleDelete = async (id) => {
        if (!confirm('Remove this emergency contact?')) return;
        await authFetch(`/emergency-contacts/${id}`, { method: 'DELETE' });
        loadContacts();
    };

    const startEdit = (contact) => {
        setForm(contact);
        setEditingId(contact.id);
        setShowForm(true);
    };

    return (
        <div className="container app-page animate-fade-in">
            <div className="page-header text-center mb-6">
                <Shield color="var(--color-primary)" size={48} className="mx-auto mb-4" />
                <h2>Emergency Contacts</h2>
                <p>Add trusted people who can be notified during emergencies or mood crises.</p>
            </div>

            <div className="emergency-container" style={{ maxWidth: '700px', margin: '0 auto' }}>
                <button className="btn-primary mb-4" onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: '', relationship: 'Parent', phone: '', email: '', is_primary: false, notify_on_sos: true, notify_on_mood_crisis: false }); }}>
                    <Plus size={18} /> Add Contact
                </button>

                {showForm && (
                    <div className="glass-card mb-4" style={{ padding: '1.5rem' }}>
                        <div className="flex justify-space-between align-center mb-4">
                            <h3>{editingId ? 'Edit Contact' : 'New Emergency Contact'}</h3>
                            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        <div className="form-grid">
                            <div className="input-group">
                                <label>Name</label>
                                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Contact name" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)' }} />
                            </div>
                            <div className="input-group">
                                <label>Relationship</label>
                                <select value={form.relationship} onChange={e => setForm({ ...form, relationship: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                                    {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Phone</label>
                                <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+1 234 567 8900" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)' }} />
                            </div>
                            <div className="input-group">
                                <label>Email</label>
                                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)' }} />
                            </div>
                        </div>
                        <div className="consent-list mt-4" style={{ gap: '12px' }}>
                            <label className="checkbox-label"><input type="checkbox" checked={form.is_primary} onChange={e => setForm({ ...form, is_primary: e.target.checked })} /> <span>Primary contact</span></label>
                            <label className="checkbox-label"><input type="checkbox" checked={form.notify_on_sos} onChange={e => setForm({ ...form, notify_on_sos: e.target.checked })} /> <span>Notify on SOS emergency</span></label>
                            <label className="checkbox-label"><input type="checkbox" checked={form.notify_on_mood_crisis} onChange={e => setForm({ ...form, notify_on_mood_crisis: e.target.checked })} /> <span>Notify on mood crisis pattern</span></label>
                        </div>
                        <button className="btn-primary mt-4" onClick={handleSave}><Save size={18} /> {editingId ? 'Update' : 'Save'} Contact</button>
                    </div>
                )}

                {contacts.length === 0 && !showForm ? (
                    <div className="glass-card text-center" style={{ padding: '3rem' }}>
                        <UserCheck size={48} color="var(--color-text-secondary)" className="mb-4" />
                        <h3>No Emergency Contacts Yet</h3>
                        <p className="text-secondary">Add trusted contacts for emergencies and mood crisis alerts.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {contacts.map(c => (
                            <div key={c.id} className="glass-card flex justify-space-between align-center" style={{ padding: '1.25rem' }}>
                                <div>
                                    <div className="flex align-center gap-2 mb-2">
                                        <h3 style={{ margin: 0 }}>{c.name}</h3>
                                        {c.is_primary && <span className="badge priority-low">Primary</span>}
                                    </div>
                                    <p className="text-secondary text-sm">{c.relationship} &bull; {c.phone}</p>
                                    <div className="flex gap-2 mt-2">
                                        {c.notify_on_sos && <span className="badge priority-high" style={{ fontSize: '0.7rem' }}><AlertTriangle size={10} /> SOS</span>}
                                        {c.notify_on_mood_crisis && <span className="badge priority-medium" style={{ fontSize: '0.7rem' }}><Heart size={10} /> Mood</span>}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <a href={`tel:${c.phone}`} className="btn-primary" style={{ padding: '8px 12px' }}><Phone size={16} /></a>
                                    <button className="btn-secondary" style={{ padding: '8px 12px' }} onClick={() => startEdit(c)}><Edit2 size={16} /></button>
                                    <button className="btn-secondary" style={{ padding: '8px 12px', color: '#dc2626', borderColor: '#dc2626' }} onClick={() => handleDelete(c.id)}><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
