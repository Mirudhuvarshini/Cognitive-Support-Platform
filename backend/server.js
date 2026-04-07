import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'neuroassist_secret_key_2026';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");

app.use(cors());
app.use(express.json());

// ─── In-Memory Store (works without MySQL) ────────────────────
const store = {
    users: [],
    profiles: [],
    tasks: [],
    mood_logs: [],
    emergency_contacts: [],
    chat_history: [],
    game_scores: [],
    journal_entries: [],
    routines: [],
    community_posts: [
        { id: 1, user_id: 0, content: 'Just had my first successful meltdown-free week! Small wins matter 💪', category: 'wins', is_anonymous: true, likes_count: 12, created_at: new Date().toISOString(), author_name: 'Anonymous' },
        { id: 2, user_id: 0, content: 'Tip: Brown noise is way better than white noise for focus. Changed my life!', category: 'tips', is_anonymous: true, likes_count: 8, created_at: new Date().toISOString(), author_name: 'Anonymous' },
        { id: 3, user_id: 0, content: 'Does anyone else struggle with time blindness? How do you cope?', category: 'questions', is_anonymous: true, likes_count: 15, created_at: new Date().toISOString(), author_name: 'Anonymous' },
        { id: 4, user_id: 0, content: "Reminder: It's okay to not be productive every day. Rest is productive too. 🌿", category: 'support', is_anonymous: true, likes_count: 23, created_at: new Date().toISOString(), author_name: 'Anonymous' },
    ],
    caregiver_links: [],
    _nextId: 100,
};

function nextId() { return ++store._nextId; }

// ─── Try MySQL, fallback to memory ────────────────────────────
let db = null;
let useMySQL = false;

async function initDB() {
    try {
        const mysql = await import('mysql2/promise');
        db = mysql.default.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'neuroassist_db',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
        await db.query('SELECT 1');
        useMySQL = true;
        console.log('✅ Connected to MySQL database');
    } catch (err) {
        useMySQL = false;
        console.log('⚠️  MySQL not available — using in-memory storage');
        console.log(`   Reason: ${err.message}`);
        console.log('   The app works fully, data resets on server restart.');
    }
}

// ─── Auth Middleware ──────────────────────────────────────────
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// ─── Health Check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running', storage: useMySQL ? 'MySQL' : 'In-Memory', timestamp: new Date() });
});

// ─── AUTH ENDPOINTS ───────────────────────────────────────────
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }

        if (useMySQL) {
            const hash = await bcrypt.hash(password, 12);
            const [result] = await db.query(
                'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
                [name, email, hash, role || 'user']
            );
            await db.query('INSERT INTO profiles (user_id) VALUES (?)', [result.insertId]);
            const token = jwt.sign({ userId: result.insertId }, JWT_SECRET, { expiresIn: '7d' });
            return res.json({ token, user: { id: result.insertId, name, email, role: role || 'user' } });
        }

        // In-memory
        if (store.users.find(u => u.email === email)) {
            return res.status(409).json({ error: 'Email already registered' });
        }
        const hash = await bcrypt.hash(password, 12);
        const id = nextId();
        store.users.push({ id, name, email, password_hash: hash, role: role || 'user', created_at: new Date().toISOString() });
        store.profiles.push({ user_id: id, diagnosis_status: 'Not Sure', conditions: null, age: null, symptoms: null, additional_notes: null, communication_style: 'gentle', theme_preference: 'calm', font_size: 1.0, animations_enabled: true, high_contrast: false, dyslexia_font: false, points: 0, level: 1, streak_days: 0, consent_audio: false, consent_video: false, consent_activity: false });
        const token = jwt.sign({ userId: id }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id, name, email, role: role || 'user' } });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email already registered' });
        console.log('Signup error:', error.message);
        res.status(500).json({ error: 'Failed to create account' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (useMySQL) {
            const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
            if (rows.length === 0) return res.status(401).json({ error: 'Invalid email or password' });
            const user = rows[0];
            const valid = await bcrypt.compare(password, user.password_hash);
            if (!valid) return res.status(401).json({ error: 'Invalid email or password' });
            const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
            return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
        }

        // In-memory
        const user = store.users.find(u => u.email === email);
        if (!user) return res.status(401).json({ error: 'Invalid email or password' });
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return res.status(401).json({ error: 'Invalid email or password' });
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
    try {
        if (useMySQL) {
            const [rows] = await db.query(
                'SELECT u.id, u.name, u.email, u.role, p.* FROM users u LEFT JOIN profiles p ON u.id = p.user_id WHERE u.id = ?',
                [req.userId]
            );
            if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
            const user = rows[0];
            delete user.password_hash;
            return res.json(user);
        }

        const user = store.users.find(u => u.id === req.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        const profile = store.profiles.find(p => p.user_id === req.userId) || {};
        res.json({ id: user.id, name: user.name, email: user.email, role: user.role, ...profile });
    } catch (error) {
        console.error('Auth me error:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// ─── PROFILE ENDPOINTS ────────────────────────────────────────
app.put('/api/profile', authMiddleware, async (req, res) => {
    try {
        const updates = req.body;

        if (useMySQL) {
            const fields = ['diagnosis_status', 'conditions', 'age', 'symptoms', 'additional_notes',
                'communication_style', 'theme_preference', 'font_size', 'animations_enabled',
                'high_contrast', 'dyslexia_font', 'consent_audio', 'consent_video', 'consent_activity'];
            const setClauses = [];
            const values = [];
            for (const f of fields) {
                if (updates[f] !== undefined) {
                    setClauses.push(`${f} = ?`);
                    values.push(Array.isArray(updates[f]) || typeof updates[f] === 'object' ? JSON.stringify(updates[f]) : updates[f]);
                }
            }
            if (setClauses.length > 0) {
                values.push(req.userId);
                await db.query(`UPDATE profiles SET ${setClauses.join(', ')} WHERE user_id = ?`, values);
            }
            return res.json({ message: 'Profile updated' });
        }

        // In-memory
        const idx = store.profiles.findIndex(p => p.user_id === req.userId);
        if (idx >= 0) {
            for (const [key, val] of Object.entries(updates)) {
                if (val !== undefined) store.profiles[idx][key] = val;
            }
        }
        res.json({ message: 'Profile updated' });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

app.put('/api/profile/points', authMiddleware, async (req, res) => {
    try {
        const { points } = req.body;
        if (useMySQL) {
            await db.query('UPDATE profiles SET points = points + ? WHERE user_id = ?', [points, req.userId]);
            const [rows] = await db.query('SELECT points, level FROM profiles WHERE user_id = ?', [req.userId]);
            const profile = rows[0];
            let newLevel = profile.points >= 5000 ? 5 : profile.points >= 3000 ? 4 : profile.points >= 1500 ? 3 : profile.points >= 500 ? 2 : 1;
            if (newLevel !== profile.level) await db.query('UPDATE profiles SET level = ? WHERE user_id = ?', [newLevel, req.userId]);
            return res.json({ points: profile.points, level: newLevel });
        }
        const p = store.profiles.find(p => p.user_id === req.userId);
        if (p) {
            p.points = (p.points || 0) + points;
            p.level = p.points >= 5000 ? 5 : p.points >= 3000 ? 4 : p.points >= 1500 ? 3 : p.points >= 500 ? 2 : 1;
            return res.json({ points: p.points, level: p.level });
        }
        res.json({ points: 0, level: 1 });
    } catch (error) {
        console.error('Points update error:', error);
        res.status(500).json({ error: 'Failed to update points' });
    }
});

// ─── TASK ENDPOINTS ────────────────────────────────────────────
app.get('/api/tasks', authMiddleware, async (req, res) => {
    try {
        if (useMySQL) {
            const [rows] = await db.query('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC', [req.userId]);
            return res.json(rows);
        }
        res.json(store.tasks.filter(t => t.user_id === req.userId).reverse());
    } catch (error) { res.status(500).json({ error: 'Failed to fetch tasks' }); }
});

app.post('/api/tasks', authMiddleware, async (req, res) => {
    try {
        const { title, description, priority, timeline, ai_suggested } = req.body;
        if (useMySQL) {
            const [result] = await db.query(
                'INSERT INTO tasks (user_id, title, description, priority, timeline, ai_suggested) VALUES (?, ?, ?, ?, ?, ?)',
                [req.userId, title, description || null, priority || 'Medium', timeline || null, ai_suggested || false]
            );
            return res.json({ id: result.insertId, title, priority: priority || 'Medium', status: 'pending', ai_suggested: ai_suggested || false });
        }
        const id = nextId();
        const task = { id, user_id: req.userId, title, description, priority: priority || 'Medium', timeline, status: 'pending', ai_suggested: ai_suggested || false, created_at: new Date().toISOString() };
        store.tasks.push(task);
        res.json(task);
    } catch (error) { res.status(500).json({ error: 'Failed to create task' }); }
});

app.put('/api/tasks/:id', authMiddleware, async (req, res) => {
    try {
        const { status, title, priority } = req.body;
        if (useMySQL) {
            await db.query('UPDATE tasks SET status = COALESCE(?, status), title = COALESCE(?, title), priority = COALESCE(?, priority) WHERE id = ? AND user_id = ?', [status, title, priority, req.params.id, req.userId]);
            return res.json({ message: 'Task updated' });
        }
        const task = store.tasks.find(t => t.id === parseInt(req.params.id) && t.user_id === req.userId);
        if (task) { if (status) task.status = status; if (title) task.title = title; if (priority) task.priority = priority; }
        res.json({ message: 'Task updated' });
    } catch (error) { res.status(500).json({ error: 'Failed to update task' }); }
});

app.delete('/api/tasks/:id', authMiddleware, async (req, res) => {
    try {
        if (useMySQL) {
            await db.query('DELETE FROM tasks WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
            return res.json({ message: 'Task deleted' });
        }
        store.tasks = store.tasks.filter(t => !(t.id === parseInt(req.params.id) && t.user_id === req.userId));
        res.json({ message: 'Task deleted' });
    } catch (error) { res.status(500).json({ error: 'Failed to delete task' }); }
});

// ─── MOOD ENDPOINTS ────────────────────────────────────────────
app.get('/api/mood', authMiddleware, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 30;
        if (useMySQL) {
            const [rows] = await db.query('SELECT * FROM mood_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?', [req.userId, limit]);
            return res.json(rows);
        }
        res.json(store.mood_logs.filter(m => m.user_id === req.userId).reverse().slice(0, limit));
    } catch (error) { res.status(500).json({ error: 'Failed to fetch mood logs' }); }
});

app.post('/api/mood', authMiddleware, async (req, res) => {
    try {
        const { mood, sensory_level, energy_level, notes } = req.body;
        if (useMySQL) {
            const [result] = await db.query('INSERT INTO mood_logs (user_id, mood, sensory_level, energy_level, notes) VALUES (?, ?, ?, ?, ?)', [req.userId, mood, sensory_level || 50, energy_level || 50, notes || null]);
            const [recent] = await db.query('SELECT mood FROM mood_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 3', [req.userId]);
            const crisis = recent.length >= 3 && recent.every(m => m.mood === 'struggling' || m.mood === 'crisis');
            return res.json({ id: result.insertId, crisisAlert: crisis });
        }
        const id = nextId();
        store.mood_logs.push({ id, user_id: req.userId, mood, sensory_level: sensory_level || 50, energy_level: energy_level || 50, notes, created_at: new Date().toISOString() });
        const recent = store.mood_logs.filter(m => m.user_id === req.userId).slice(-3);
        const crisis = recent.length >= 3 && recent.every(m => m.mood === 'struggling' || m.mood === 'crisis');
        res.json({ id, crisisAlert: crisis });
    } catch (error) { res.status(500).json({ error: 'Failed to save mood' }); }
});

// ─── EMERGENCY CONTACTS ───────────────────────────────────────
app.get('/api/emergency-contacts', authMiddleware, async (req, res) => {
    try {
        if (useMySQL) {
            const [rows] = await db.query('SELECT * FROM emergency_contacts WHERE user_id = ? ORDER BY is_primary DESC', [req.userId]);
            return res.json(rows);
        }
        res.json(store.emergency_contacts.filter(c => c.user_id === req.userId));
    } catch (error) { res.status(500).json({ error: 'Failed to fetch contacts' }); }
});

app.post('/api/emergency-contacts', authMiddleware, async (req, res) => {
    try {
        const { name, relationship, phone, email, is_primary, notify_on_sos, notify_on_mood_crisis } = req.body;
        if (useMySQL) {
            const [result] = await db.query('INSERT INTO emergency_contacts (user_id, name, relationship, phone, email, is_primary, notify_on_sos, notify_on_mood_crisis) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [req.userId, name, relationship, phone, email, is_primary || false, notify_on_sos !== false, notify_on_mood_crisis || false]);
            return res.json({ id: result.insertId, name, relationship, phone, email });
        }
        const id = nextId();
        const contact = { id, user_id: req.userId, name, relationship, phone, email, is_primary: is_primary || false, notify_on_sos: notify_on_sos !== false, notify_on_mood_crisis: notify_on_mood_crisis || false, created_at: new Date().toISOString() };
        store.emergency_contacts.push(contact);
        res.json(contact);
    } catch (error) { res.status(500).json({ error: 'Failed to create contact' }); }
});

app.put('/api/emergency-contacts/:id', authMiddleware, async (req, res) => {
    try {
        const { name, relationship, phone, email, is_primary, notify_on_sos, notify_on_mood_crisis } = req.body;
        if (useMySQL) {
            await db.query('UPDATE emergency_contacts SET name=?, relationship=?, phone=?, email=?, is_primary=?, notify_on_sos=?, notify_on_mood_crisis=? WHERE id=? AND user_id=?', [name, relationship, phone, email, is_primary, notify_on_sos, notify_on_mood_crisis, req.params.id, req.userId]);
            return res.json({ message: 'Contact updated' });
        }
        const c = store.emergency_contacts.find(c => c.id === parseInt(req.params.id) && c.user_id === req.userId);
        if (c) { Object.assign(c, { name, relationship, phone, email, is_primary, notify_on_sos, notify_on_mood_crisis }); }
        res.json({ message: 'Contact updated' });
    } catch (error) { res.status(500).json({ error: 'Failed to update contact' }); }
});

app.delete('/api/emergency-contacts/:id', authMiddleware, async (req, res) => {
    try {
        if (useMySQL) {
            await db.query('DELETE FROM emergency_contacts WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
            return res.json({ message: 'Contact deleted' });
        }
        store.emergency_contacts = store.emergency_contacts.filter(c => !(c.id === parseInt(req.params.id) && c.user_id === req.userId));
        res.json({ message: 'Contact deleted' });
    } catch (error) { res.status(500).json({ error: 'Failed to delete contact' }); }
});

// ─── CHAT ENDPOINT ────────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
    try {
        const { message, userName } = req.body;
        const token = req.headers.authorization?.split(' ')[1];
        let userId = null, profile = null, chatHistory = [], recentMoods = [];

        if (token) {
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                userId = decoded.userId;
                if (useMySQL) {
                    const [profiles] = await db.query('SELECT p.*, u.name FROM profiles p JOIN users u ON p.user_id = u.id WHERE p.user_id = ?', [userId]);
                    if (profiles.length > 0) profile = profiles[0];
                    const [history] = await db.query('SELECT sender, message FROM chat_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 10', [userId]);
                    chatHistory = history.reverse();
                    const [moods] = await db.query('SELECT mood, sensory_level FROM mood_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 3', [userId]);
                    recentMoods = moods;
                } else {
                    const user = store.users.find(u => u.id === userId);
                    const prof = store.profiles.find(p => p.user_id === userId);
                    if (user && prof) profile = { ...prof, name: user.name };
                    chatHistory = store.chat_history.filter(c => c.user_id === userId).slice(-10);
                    recentMoods = store.mood_logs.filter(m => m.user_id === userId).slice(-3);
                }
            } catch { /* token invalid */ }
        }

        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_api_key_here') {
            const name = profile?.name || userName || 'Friend';
            const aiResponse = `Hello ${name}! I'm Neural Compass, your supportive AI companion. I'm here to help you with focus, emotional regulation, and daily tasks. How can I support you today?`;
            if (userId) {
                store.chat_history.push({ user_id: userId, sender: 'user', message, created_at: new Date().toISOString() });
                store.chat_history.push({ user_id: userId, sender: 'ai', message: aiResponse, created_at: new Date().toISOString() });
            }
            return res.json({ response: aiResponse });
        }

        const name = profile?.name || userName || 'User';
        const conditions = profile?.conditions ? (typeof profile.conditions === 'string' ? JSON.parse(profile.conditions) : profile.conditions).join(', ') : 'not specified';
        const currentMood = recentMoods.length > 0 ? recentMoods[recentMoods.length - 1].mood : 'unknown';

        const systemPrompt = `You are Neural Compass, a deeply empathetic AI companion for neurodivergent individuals.
USER: ${name} | Conditions: ${conditions} | Current mood: ${currentMood}
RULES: Keep responses to 2-3 sentences max. Use simple language. Never diagnose. Validate feelings first.
User says: "${message}"`;

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        const text = response.text();

        if (userId) {
            if (useMySQL) {
                await db.query('INSERT INTO chat_history (user_id, sender, message) VALUES (?, ?, ?)', [userId, 'user', message]);
                await db.query('INSERT INTO chat_history (user_id, sender, message) VALUES (?, ?, ?)', [userId, 'ai', text]);
            } else {
                store.chat_history.push({ user_id: userId, sender: 'user', message, created_at: new Date().toISOString() });
                store.chat_history.push({ user_id: userId, sender: 'ai', message: text, created_at: new Date().toISOString() });
            }
        }

        res.json({ response: text });
    } catch (error) {
        console.error('Chat AI Error:', error);
        res.status(500).json({ error: 'Failed to generate response.' });
    }
});

// ─── GAME SCORES ──────────────────────────────────────────────
app.post('/api/game-scores', authMiddleware, async (req, res) => {
    try {
        const { game_type, score, difficulty, duration_seconds } = req.body;
        if (useMySQL) {
            await db.query('INSERT INTO game_scores (user_id, game_type, score, difficulty, duration_seconds) VALUES (?, ?, ?, ?, ?)', [req.userId, game_type, score, difficulty || 'medium', duration_seconds || 0]);
            return res.json({ message: 'Score saved' });
        }
        store.game_scores.push({ id: nextId(), user_id: req.userId, game_type, score, difficulty: difficulty || 'medium', duration_seconds: duration_seconds || 0, created_at: new Date().toISOString() });
        res.json({ message: 'Score saved' });
    } catch (error) { res.status(500).json({ error: 'Failed to save score' }); }
});

app.get('/api/game-scores', authMiddleware, async (req, res) => {
    try {
        if (useMySQL) {
            const [rows] = await db.query('SELECT game_type, MAX(score) as best_score, COUNT(*) as times_played, AVG(score) as avg_score FROM game_scores WHERE user_id = ? GROUP BY game_type', [req.userId]);
            return res.json(rows);
        }
        const userScores = store.game_scores.filter(g => g.user_id === req.userId);
        const grouped = {};
        userScores.forEach(s => {
            if (!grouped[s.game_type]) grouped[s.game_type] = { game_type: s.game_type, best: 0, total: 0, count: 0 };
            grouped[s.game_type].best = Math.max(grouped[s.game_type].best, s.score);
            grouped[s.game_type].total += s.score;
            grouped[s.game_type].count++;
        });
        res.json(Object.values(grouped).map(g => ({ game_type: g.game_type, best_score: g.best, times_played: g.count, avg_score: g.total / g.count })));
    } catch (error) { res.status(500).json({ error: 'Failed to fetch scores' }); }
});

// ─── JOURNAL ──────────────────────────────────────────────────
app.get('/api/journal', authMiddleware, async (req, res) => {
    try {
        if (useMySQL) {
            const [rows] = await db.query('SELECT * FROM journal_entries WHERE user_id = ? ORDER BY created_at DESC LIMIT 50', [req.userId]);
            return res.json(rows);
        }
        res.json(store.journal_entries.filter(j => j.user_id === req.userId).reverse().slice(0, 50));
    } catch (error) { res.status(500).json({ error: 'Failed to fetch journal' }); }
});

app.post('/api/journal', authMiddleware, async (req, res) => {
    try {
        const { content, mood, tags } = req.body;
        if (useMySQL) {
            const [result] = await db.query('INSERT INTO journal_entries (user_id, content, mood, tags) VALUES (?, ?, ?, ?)', [req.userId, content, mood || null, tags ? JSON.stringify(tags) : null]);
            return res.json({ id: result.insertId });
        }
        const id = nextId();
        store.journal_entries.push({ id, user_id: req.userId, content, mood, tags, created_at: new Date().toISOString() });
        res.json({ id });
    } catch (error) { res.status(500).json({ error: 'Failed to save entry' }); }
});

// ─── ROUTINES ─────────────────────────────────────────────────
app.get('/api/routines', authMiddleware, async (req, res) => {
    try {
        if (useMySQL) {
            const [rows] = await db.query('SELECT * FROM routines WHERE user_id = ? ORDER BY time_slot ASC', [req.userId]);
            return res.json(rows);
        }
        res.json(store.routines.filter(r => r.user_id === req.userId).sort((a, b) => (a.time_slot || '').localeCompare(b.time_slot || '')));
    } catch (error) { res.status(500).json({ error: 'Failed to fetch routines' }); }
});

app.post('/api/routines', authMiddleware, async (req, res) => {
    try {
        const { title, time_slot, category, days } = req.body;
        if (useMySQL) {
            const [result] = await db.query('INSERT INTO routines (user_id, title, time_slot, category, days) VALUES (?, ?, ?, ?, ?)', [req.userId, title, time_slot, category || 'self-care', days ? JSON.stringify(days) : null]);
            return res.json({ id: result.insertId });
        }
        const id = nextId();
        store.routines.push({ id, user_id: req.userId, title, time_slot, category: category || 'self-care', days, is_active: true, created_at: new Date().toISOString() });
        res.json({ id });
    } catch (error) { res.status(500).json({ error: 'Failed to save routine' }); }
});

app.delete('/api/routines/:id', authMiddleware, async (req, res) => {
    try {
        if (useMySQL) {
            await db.query('DELETE FROM routines WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
            return res.json({ message: 'Routine deleted' });
        }
        store.routines = store.routines.filter(r => !(r.id === parseInt(req.params.id) && r.user_id === req.userId));
        res.json({ message: 'Routine deleted' });
    } catch (error) { res.status(500).json({ error: 'Failed to delete routine' }); }
});

// ─── COMMUNITY ────────────────────────────────────────────────
app.get('/api/community', async (req, res) => {
    try {
        const category = req.query.category || null;
        if (useMySQL) {
            let query = 'SELECT cp.*, CASE WHEN cp.is_anonymous THEN "Anonymous" ELSE u.name END as author_name FROM community_posts cp JOIN users u ON cp.user_id = u.id';
            const params = [];
            if (category && category !== 'all') { query += ' WHERE cp.category = ?'; params.push(category); }
            query += ' ORDER BY cp.created_at DESC LIMIT 50';
            const [rows] = await db.query(query, params);
            return res.json(rows);
        }
        let posts = store.community_posts;
        if (category && category !== 'all') posts = posts.filter(p => p.category === category);
        res.json(posts.slice().reverse().slice(0, 50));
    } catch (error) { res.status(500).json({ error: 'Failed to fetch posts' }); }
});

app.post('/api/community', authMiddleware, async (req, res) => {
    try {
        const { content, category, is_anonymous } = req.body;
        if (useMySQL) {
            const [result] = await db.query('INSERT INTO community_posts (user_id, content, category, is_anonymous) VALUES (?, ?, ?, ?)', [req.userId, content, category || 'general', is_anonymous !== false]);
            return res.json({ id: result.insertId });
        }
        const user = store.users.find(u => u.id === req.userId);
        const id = nextId();
        store.community_posts.push({ id, user_id: req.userId, content, category: category || 'general', is_anonymous: is_anonymous !== false, likes_count: 0, created_at: new Date().toISOString(), author_name: is_anonymous !== false ? 'Anonymous' : (user?.name || 'Anonymous') });
        res.json({ id });
    } catch (error) { res.status(500).json({ error: 'Failed to create post' }); }
});

app.post('/api/community/:id/like', authMiddleware, async (req, res) => {
    try {
        if (useMySQL) {
            await db.query('UPDATE community_posts SET likes_count = likes_count + 1 WHERE id = ?', [req.params.id]);
            return res.json({ message: 'Liked' });
        }
        const post = store.community_posts.find(p => p.id === parseInt(req.params.id));
        if (post) post.likes_count = (post.likes_count || 0) + 1;
        res.json({ message: 'Liked' });
    } catch (error) { res.status(500).json({ error: 'Failed to like post' }); }
});

// ─── CAREGIVER ENDPOINTS ──────────────────────────────────────
app.post('/api/caregiver/link', authMiddleware, async (req, res) => {
    try {
        const { patient_email } = req.body;
        if (useMySQL) {
            const [patients] = await db.query('SELECT id FROM users WHERE email = ?', [patient_email]);
            if (patients.length === 0) return res.status(404).json({ error: 'Patient not found' });
            await db.query('INSERT INTO caregiver_links (caregiver_id, patient_id, status) VALUES (?, ?, ?)', [req.userId, patients[0].id, 'active']);
            return res.json({ message: 'Linked successfully' });
        }
        const patient = store.users.find(u => u.email === patient_email);
        if (!patient) return res.status(404).json({ error: 'Patient not found' });
        store.caregiver_links.push({ id: nextId(), caregiver_id: req.userId, patient_id: patient.id, status: 'active' });
        res.json({ message: 'Linked successfully' });
    } catch (error) { res.status(500).json({ error: 'Failed to link' }); }
});

app.get('/api/caregiver/patients', authMiddleware, async (req, res) => {
    try {
        if (useMySQL) {
            const [rows] = await db.query(`
                SELECT u.id, u.name, u.email, p.conditions, p.points, p.level, p.streak_days,
                    (SELECT mood FROM mood_logs WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1) as last_mood
                FROM caregiver_links cl JOIN users u ON cl.patient_id = u.id LEFT JOIN profiles p ON u.id = p.user_id
                WHERE cl.caregiver_id = ? AND cl.status = 'active'
            `, [req.userId]);
            return res.json(rows);
        }
        const links = store.caregiver_links.filter(l => l.caregiver_id === req.userId && l.status === 'active');
        const patients = links.map(l => {
            const user = store.users.find(u => u.id === l.patient_id);
            const profile = store.profiles.find(p => p.user_id === l.patient_id);
            const lastMood = store.mood_logs.filter(m => m.user_id === l.patient_id).slice(-1)[0];
            return user ? { id: user.id, name: user.name, email: user.email, conditions: profile?.conditions, points: profile?.points || 0, level: profile?.level || 1, last_mood: lastMood?.mood } : null;
        }).filter(Boolean);
        res.json(patients);
    } catch (error) { res.status(500).json({ error: 'Failed to fetch patients' }); }
});

app.get('/api/caregiver/patient/:id/report', authMiddleware, async (req, res) => {
    try {
        const patientId = parseInt(req.params.id);
        if (useMySQL) {
            const [link] = await db.query('SELECT * FROM caregiver_links WHERE caregiver_id = ? AND patient_id = ? AND status = "active"', [req.userId, patientId]);
            if (link.length === 0) return res.status(403).json({ error: 'Not authorized' });
            const [moods] = await db.query('SELECT * FROM mood_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 30', [patientId]);
            const [tasks] = await db.query('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC LIMIT 20', [patientId]);
            const [scores] = await db.query('SELECT * FROM game_scores WHERE user_id = ? ORDER BY created_at DESC LIMIT 20', [patientId]);
            const [profile] = await db.query('SELECT * FROM profiles WHERE user_id = ?', [patientId]);
            return res.json({ moods, tasks, scores, profile: profile[0] || {} });
        }
        const link = store.caregiver_links.find(l => l.caregiver_id === req.userId && l.patient_id === patientId && l.status === 'active');
        if (!link) return res.status(403).json({ error: 'Not authorized' });
        res.json({
            moods: store.mood_logs.filter(m => m.user_id === patientId).slice(-30),
            tasks: store.tasks.filter(t => t.user_id === patientId).slice(-20),
            scores: store.game_scores.filter(s => s.user_id === patientId).slice(-20),
            profile: store.profiles.find(p => p.user_id === patientId) || {}
        });
    } catch (error) { res.status(500).json({ error: 'Failed to fetch report' }); }
});

// ─── ANALYTICS ────────────────────────────────────────────────
app.get('/api/analytics', authMiddleware, async (req, res) => {
    try {
        if (useMySQL) {
            const [moodData] = await db.query('SELECT mood, sensory_level, energy_level, DATE(created_at) as date FROM mood_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 30', [req.userId]);
            const [taskStats] = await db.query('SELECT status, COUNT(*) as count FROM tasks WHERE user_id = ? GROUP BY status', [req.userId]);
            const [gameStats] = await db.query('SELECT game_type, COUNT(*) as played, MAX(score) as best, AVG(score) as average FROM game_scores WHERE user_id = ? GROUP BY game_type', [req.userId]);
            const [profile] = await db.query('SELECT points, level, streak_days FROM profiles WHERE user_id = ?', [req.userId]);
            return res.json({ moodTrends: moodData, taskStats, gameStats, focusSessions: 0, profile: profile[0] || {} });
        }
        const moods = store.mood_logs.filter(m => m.user_id === req.userId).slice(-30).map(m => ({ mood: m.mood, sensory_level: m.sensory_level, energy_level: m.energy_level, date: m.created_at }));
        const tasks = store.tasks.filter(t => t.user_id === req.userId);
        const pending = tasks.filter(t => t.status === 'pending').length;
        const completed = tasks.filter(t => t.status === 'completed').length;
        const profile = store.profiles.find(p => p.user_id === req.userId) || {};
        res.json({
            moodTrends: moods,
            taskStats: [{ status: 'pending', count: pending }, { status: 'completed', count: completed }],
            gameStats: [],
            focusSessions: 0,
            profile
        });
    } catch (error) { res.status(500).json({ error: 'Failed to fetch analytics' }); }
});

// ─── Start Server ─────────────────────────────────────────────
await initDB();

app.listen(PORT, () => {
    console.log(`🧠 Neural Compass server running on port ${PORT}`);
});
