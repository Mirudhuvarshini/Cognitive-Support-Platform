import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Heart, RotateCcw } from 'lucide-react';

const SCENARIOS = [
    { emoji: '😊', emotion: 'Happy', scenario: 'Your friend just gave you a surprise gift', options: ['Happy', 'Sad', 'Angry', 'Scared'] },
    { emoji: '😢', emotion: 'Sad', scenario: 'Your favorite toy broke and cannot be fixed', options: ['Happy', 'Sad', 'Surprised', 'Angry'] },
    { emoji: '😠', emotion: 'Angry', scenario: 'Someone took your lunch without asking', options: ['Scared', 'Sad', 'Angry', 'Happy'] },
    { emoji: '😨', emotion: 'Scared', scenario: 'You hear a loud unexpected noise in the dark', options: ['Happy', 'Scared', 'Angry', 'Sad'] },
    { emoji: '😲', emotion: 'Surprised', scenario: 'You found out you won a prize you didn\'t expect', options: ['Angry', 'Sad', 'Surprised', 'Scared'] },
    { emoji: '😔', emotion: 'Disappointed', scenario: 'The event you were looking forward to got cancelled', options: ['Happy', 'Disappointed', 'Angry', 'Surprised'] },
    { emoji: '🥰', emotion: 'Loved', scenario: 'Your family is all together for a special dinner', options: ['Loved', 'Scared', 'Angry', 'Sad'] },
    { emoji: '😤', emotion: 'Frustrated', scenario: 'You keep trying but can\'t solve the problem', options: ['Happy', 'Sad', 'Frustrated', 'Scared'] },
    { emoji: '😌', emotion: 'Calm', scenario: 'Sitting by a quiet lake watching the sunset', options: ['Angry', 'Calm', 'Scared', 'Frustrated'] },
    { emoji: '🤗', emotion: 'Grateful', scenario: 'A stranger helped you when you dropped your things', options: ['Angry', 'Scared', 'Grateful', 'Sad'] },
    { emoji: '😳', emotion: 'Embarrassed', scenario: 'You accidentally called your teacher "mom"', options: ['Happy', 'Embarrassed', 'Angry', 'Calm'] },
    { emoji: '🤔', emotion: 'Confused', scenario: 'Everyone is laughing at a joke you don\'t understand', options: ['Confused', 'Happy', 'Angry', 'Sad'] },
];

export default function EmotionGame({ onBack, addPoints }) {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [total, setTotal] = useState(0);
    const [feedback, setFeedback] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [shuffledScenarios, setShuffledScenarios] = useState([]);

    useEffect(() => {
        setShuffledScenarios([...SCENARIOS].sort(() => Math.random() - 0.5).slice(0, 8));
    }, []);

    const current = shuffledScenarios[currentIdx];

    const handleAnswer = (answer) => {
        if (feedback) return;
        setTotal(t => t + 1);
        if (answer === current.emotion) {
            setFeedback('correct');
            setScore(s => s + 1);
            addPoints(15);
        } else {
            setFeedback('incorrect');
        }
        setTimeout(() => {
            setFeedback(null);
            if (currentIdx + 1 >= shuffledScenarios.length) {
                setShowResult(true);
            } else {
                setCurrentIdx(i => i + 1);
            }
        }, 1500);
    };

    const restart = () => {
        setShuffledScenarios([...SCENARIOS].sort(() => Math.random() - 0.5).slice(0, 8));
        setCurrentIdx(0);
        setScore(0);
        setTotal(0);
        setShowResult(false);
        setFeedback(null);
    };

    if (shuffledScenarios.length === 0) return null;

    if (showResult) {
        const percentage = Math.round((score / total) * 100);
        return (
            <div className="game-container animate-fade-in text-center">
                <button className="btn-secondary mb-4 flex align-center gap-2" onClick={onBack}><ArrowLeft size={18} /> Back to Hub</button>
                <Heart size={48} color="#ef4444" className="mb-4" />
                <h2>Results</h2>
                <p style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--color-primary)' }}>{score}/{total}</p>
                <p className="text-secondary mb-4">{percentage}% accuracy</p>
                <p>{percentage >= 80 ? 'Amazing emotional awareness! 🌟' : percentage >= 50 ? 'Good job! Keep practicing! 💪' : 'Practice makes perfect! Try again 🤗'}</p>
                <button className="btn-primary mt-4" onClick={restart}><RotateCcw size={16} /> Play Again</button>
            </div>
        );
    }

    return (
        <div className="game-container animate-fade-in">
            <div className="flex justify-space-between align-center mb-6">
                <button className="btn-secondary flex align-center gap-2" onClick={onBack}><ArrowLeft size={18} /> Back</button>
                <div className="flex gap-2">
                    <span className="score-badge">Score: {score}/{total}</span>
                    <span className="score-badge">{currentIdx + 1}/{shuffledScenarios.length}</span>
                </div>
            </div>

            <div className="game-play-area">
                <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>{current.emoji}</div>
                <h3 className="mb-2">What emotion does this person feel?</h3>
                <p className="text-secondary mb-6" style={{ maxWidth: '400px', margin: '0 auto 2rem auto', fontSize: '1.05rem' }}>
                    <em>"{current.scenario}"</em>
                </p>
                <div className="options-grid">
                    {current.options.map((opt, i) => (
                        <button key={i} className={`game-option-btn ${feedback && opt === current.emotion ? 'correct-anim' : ''}`} onClick={() => handleAnswer(opt)} disabled={feedback !== null}>
                            {opt}
                        </button>
                    ))}
                </div>
                {feedback && (
                    <div className={`feedback-message ${feedback}`}>
                        {feedback === 'correct' ? <><CheckCircle size={24} /> Correct! +15pts</> : <><XCircle size={24} /> The answer was: {current.emotion}</>}
                    </div>
                )}
            </div>
        </div>
    );
}
