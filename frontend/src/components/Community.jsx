import React, { useState, useEffect } from 'react';
import { Users, Send, Heart, MessageCircle, Filter, Plus, ThumbsUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const CATEGORIES = ['all', 'general', 'tips', 'wins', 'support', 'resources', 'questions'];

export default function Community() {
    const { authFetch, user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [category, setCategory] = useState('all');
    const [showCompose, setShowCompose] = useState(false);
    const [newPost, setNewPost] = useState({ content: '', category: 'general', is_anonymous: true });

    useEffect(() => { loadPosts(); }, [category]);

    const loadPosts = async () => {
        try {
            const res = await authFetch(`/community?category=${category}`);
            if (res.ok) setPosts(await res.json());
        } catch {
            setPosts([
                { id: 1, content: 'Just had my first successful meltdown-free week! Small wins matter 💪', author_name: 'Anonymous', category: 'wins', likes_count: 12, created_at: new Date().toISOString() },
                { id: 2, content: 'Tip: Brown noise is way better than white noise for focus. Changed my life!', author_name: 'Anonymous', category: 'tips', likes_count: 8, created_at: new Date().toISOString() },
                { id: 3, content: 'Does anyone else struggle with time blindness? How do you cope?', author_name: 'Anonymous', category: 'questions', likes_count: 15, created_at: new Date().toISOString() },
                { id: 4, content: 'Reminder: It\'s okay to not be productive every day. Rest is productive too. 🌿', author_name: 'Anonymous', category: 'support', likes_count: 23, created_at: new Date().toISOString() },
                { id: 5, content: 'Found a great app for visual schedules. Check the Resources section!', author_name: 'Anonymous', category: 'resources', likes_count: 5, created_at: new Date().toISOString() },
            ]);
        }
    };

    const handlePost = async () => {
        if (!newPost.content.trim()) return;
        try {
            await authFetch('/community', { method: 'POST', body: JSON.stringify(newPost) });
            setNewPost({ content: '', category: 'general', is_anonymous: true });
            setShowCompose(false);
            loadPosts();
        } catch { /* offline */ }
    };

    const handleLike = async (id) => {
        try {
            await authFetch(`/community/${id}/like`, { method: 'POST' });
            setPosts(prev => prev.map(p => p.id === id ? { ...p, likes_count: (p.likes_count || 0) + 1 } : p));
        } catch { /* offline */ }
    };

    const getCategoryEmoji = (cat) => {
        const map = { general: '💬', tips: '💡', wins: '🎉', support: '🤗', resources: '📚', questions: '❓' };
        return map[cat] || '💬';
    };

    const getTimeSince = (dateStr) => {
        const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    return (
        <div className="container app-page animate-fade-in">
            <div className="page-header text-center mb-6">
                <Users color="var(--color-primary)" size={48} className="mx-auto mb-4" />
                <h2>Community & Peer Support</h2>
                <p>A safe, anonymous space to share, learn, and support each other.</p>
            </div>

            <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                <div className="flex justify-space-between align-center mb-4" style={{ flexWrap: 'wrap', gap: '8px' }}>
                    <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                        {CATEGORIES.map(cat => (
                            <button key={cat} className={`pill-btn ${category === cat ? 'selected' : ''}`} onClick={() => setCategory(cat)} style={{ fontSize: '0.8rem', textTransform: 'capitalize' }}>
                                {cat !== 'all' && getCategoryEmoji(cat)} {cat}
                            </button>
                        ))}
                    </div>
                    <button className="btn-primary" onClick={() => setShowCompose(!showCompose)} style={{ padding: '8px 16px' }}>
                        <Plus size={16} /> Post
                    </button>
                </div>

                {showCompose && (
                    <div className="glass-card mb-4" style={{ padding: '1.5rem' }}>
                        <textarea className="notes-textarea mb-4" placeholder="Share something with the community..." value={newPost.content} onChange={e => setNewPost({ ...newPost, content: e.target.value })} rows="3" style={{ width: '100%' }} />
                        <div className="flex justify-space-between align-center" style={{ flexWrap: 'wrap', gap: '8px' }}>
                            <div className="flex gap-2 align-center">
                                <select value={newPost.category} onChange={e => setNewPost({ ...newPost, category: e.target.value })} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--glass-border)', fontSize: '0.85rem' }}>
                                    {CATEGORIES.filter(c => c !== 'all').map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <label className="checkbox-label" style={{ padding: 0, fontSize: '0.85rem' }}>
                                    <input type="checkbox" checked={newPost.is_anonymous} onChange={e => setNewPost({ ...newPost, is_anonymous: e.target.checked })} />
                                    <span>Post anonymously</span>
                                </label>
                            </div>
                            <button className="btn-primary" onClick={handlePost} style={{ padding: '8px 16px' }}><Send size={16} /> Share</button>
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-4">
                    {posts.map(post => (
                        <div key={post.id} className="glass-card" style={{ padding: '1.25rem' }}>
                            <div className="flex justify-space-between align-center mb-2">
                                <div className="flex align-center gap-2">
                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                                        {post.author_name === 'Anonymous' ? '?' : post.author_name?.charAt(0) || '?'}
                                    </div>
                                    <div>
                                        <span style={{ fontWeight: 500 }}>{post.author_name || 'Anonymous'}</span>
                                        <span className="text-secondary text-sm" style={{ display: 'block' }}>{getTimeSince(post.created_at)}</span>
                                    </div>
                                </div>
                                <span className="badge" style={{ textTransform: 'capitalize' }}>{getCategoryEmoji(post.category)} {post.category}</span>
                            </div>
                            <p style={{ lineHeight: '1.6', margin: '8px 0' }}>{post.content}</p>
                            <div className="flex gap-4 mt-2">
                                <button onClick={() => handleLike(post.id)} className="flex align-center gap-1" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                                    <ThumbsUp size={14} /> {post.likes_count || 0}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
