import React, { useState } from 'react';
import { Target, Star, Award, Zap, BrainCircuit, CheckCircle2, PlaySquare, Grid3X3, Layers, Music, Heart, BookOpen, ArrowLeft } from 'lucide-react';
import IdentifyingGame from './IdentifyingGame';
import PuzzleGame from './PuzzleGame';
import MemoryMatch from './MemoryMatch';
import SequenceGame from './SequenceGame';
import EmotionGame from './EmotionGame';
import WordBuilder from './WordBuilder';

const LEVELS = [
    { level: 1, title: 'Explorer', minPoints: 0, icon: '🌱' },
    { level: 2, title: 'Learner', minPoints: 500, icon: '🌿' },
    { level: 3, title: 'Achiever', minPoints: 1500, icon: '🌳' },
    { level: 4, title: 'Champion', minPoints: 3000, icon: '⭐' },
    { level: 5, title: 'Master Mind', minPoints: 5000, icon: '👑' },
];

export default function GamifiedLearning() {
    const [points, setPoints] = useState(() => parseInt(localStorage.getItem('neuroPoints') || '0'));
    const [activeView, setActiveView] = useState('hub');

    const addPoints = (reward) => {
        setPoints(p => {
            const newPts = p + reward;
            localStorage.setItem('neuroPoints', newPts.toString());
            return newPts;
        });
    };

    const currentLevel = [...LEVELS].reverse().find(l => points >= l.minPoints) || LEVELS[0];
    const nextLevel = LEVELS.find(l => l.minPoints > points);
    const progress = nextLevel ? ((points - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100 : 100;

    const games = [
        { id: 'identifying', title: 'Identifying Game', desc: 'Practice identifying alphabets, colors, shapes, and numbers', icon: <PlaySquare size={36} />, color: '#6C5CE7' },
        { id: 'puzzle', title: 'Logic Puzzle', desc: 'Solve the sliding puzzle to improve logic skills', icon: <Grid3X3 size={36} />, color: '#3b82f6' },
        { id: 'memory', title: 'Memory Match', desc: 'Find matching pairs to train working memory', icon: <Layers size={36} />, color: '#22c55e' },
        { id: 'sequence', title: 'Sequence Builder', desc: 'Remember and repeat growing color sequences', icon: <Music size={36} />, color: '#f59e0b' },
        { id: 'emotion', title: 'Emotion Recognition', desc: 'Identify emotions from facial expressions and scenarios', icon: <Heart size={36} />, color: '#ef4444' },
        { id: 'wordbuilder', title: 'Word Builder', desc: 'Build words from scrambled letters with hints', icon: <BookOpen size={36} />, color: '#8b5cf6' },
    ];

    const badges = [
        { name: 'Consistent Focus', icon: <Zap size={14} />, earned: points > 100 },
        { name: 'Memory Master', icon: <BrainCircuit size={14} />, earned: points > 300 },
        { name: 'Rising Star', icon: <Star size={14} />, earned: points > 500 },
        { name: 'Quick Thinker', icon: <Zap size={14} />, earned: points > 1000 },
        { name: 'Puzzle Pro', icon: <Grid3X3 size={14} />, earned: points > 2000 },
        { name: 'Champion', icon: <Award size={14} />, earned: points > 3000 },
    ];

    const renderGame = () => {
        const props = { onBack: () => setActiveView('hub'), addPoints };
        switch (activeView) {
            case 'identifying': return <IdentifyingGame {...props} />;
            case 'puzzle': return <PuzzleGame {...props} />;
            case 'memory': return <MemoryMatch {...props} />;
            case 'sequence': return <SequenceGame {...props} />;
            case 'emotion': return <EmotionGame {...props} />;
            case 'wordbuilder': return <WordBuilder {...props} />;
            default: return null;
        }
    };

    if (activeView !== 'hub') return renderGame();

    return (
        <div className="container app-page animate-fade-in">
            <div className="page-header text-center mb-6">
                <Target color="var(--color-primary)" size={48} className="mx-auto mb-4" />
                <h2>Gamified Learning & Focus</h2>
                <p>Train your cognitive skills while earning points and badges.</p>
            </div>

            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <div className="glass-card mb-6" style={{ padding: '1.5rem' }}>
                    <div className="flex justify-space-between align-center mb-4">
                        <div className="flex align-center gap-2">
                            <span style={{ fontSize: '2rem' }}>{currentLevel.icon}</span>
                            <div>
                                <h3 style={{ margin: 0 }}>Level {currentLevel.level}: {currentLevel.title}</h3>
                                <p className="text-secondary text-sm">{points} total points</p>
                            </div>
                        </div>
                        <div className="text-center">
                            <Star size={32} color="#f59e0b" />
                            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{points}</div>
                        </div>
                    </div>
                    {nextLevel && (
                        <div>
                            <div className="flex justify-space-between text-sm text-secondary mb-1">
                                <span>{currentLevel.title}</span>
                                <span>{nextLevel.title} ({nextLevel.minPoints} pts)</span>
                            </div>
                            <div style={{ background: 'var(--color-bg-secondary)', borderRadius: '10px', height: '10px', overflow: 'hidden' }}>
                                <div style={{ background: 'var(--color-primary)', height: '100%', width: `${progress}%`, borderRadius: '10px', transition: 'width 0.5s ease' }} />
                            </div>
                        </div>
                    )}
                </div>

                <div className="glass-card mb-6" style={{ padding: '1.5rem' }}>
                    <h3 className="mb-4 flex align-center gap-2"><Award size={20} color="var(--color-primary)" /> Badges Earned</h3>
                    <div className="flex flex-wrap gap-2">
                        {badges.map(b => (
                            <span key={b.name} className={`badge ${b.earned ? 'priority-low' : ''} flex align-center gap-1`} style={{ opacity: b.earned ? 1 : 0.4, padding: '6px 12px' }}>
                                {b.icon} {b.name} {b.earned ? '✓' : '🔒'}
                            </span>
                        ))}
                    </div>
                </div>

                <h3 className="mb-4">Play & Learn</h3>
                <div className="games-grid">
                    {games.map(game => (
                        <button key={game.id} className="glass-card game-card-btn" onClick={() => setActiveView(game.id)}>
                            <div className="game-icon-circle" style={{ background: `${game.color}15`, color: game.color }}>{game.icon}</div>
                            <h4>{game.title}</h4>
                            <p className="text-sm text-secondary">{game.desc}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
