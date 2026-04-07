import React, { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw, Trophy, Clock } from 'lucide-react';

const CARD_SETS = {
    easy: ['🍎', '🍊', '🍋', '🍇', '🍓', '🫐'],
    medium: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'],
    hard: ['🌍', '🌙', '⭐', '🌈', '❄️', '🔥', '💧', '🌸', '🍀', '🌻'],
};

export default function MemoryMatch({ onBack, addPoints }) {
    const [difficulty, setDifficulty] = useState(null);
    const [cards, setCards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [matched, setMatched] = useState([]);
    const [moves, setMoves] = useState(0);
    const [gameWon, setGameWon] = useState(false);
    const [timer, setTimer] = useState(0);
    const [timerActive, setTimerActive] = useState(false);

    useEffect(() => {
        let interval;
        if (timerActive && !gameWon) {
            interval = setInterval(() => setTimer(t => t + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timerActive, gameWon]);

    const startGame = (diff) => {
        setDifficulty(diff);
        const emojis = CARD_SETS[diff];
        const pairs = [...emojis, ...emojis];
        const shuffled = pairs.sort(() => Math.random() - 0.5).map((emoji, i) => ({ id: i, emoji, isFlipped: false }));
        setCards(shuffled);
        setFlipped([]);
        setMatched([]);
        setMoves(0);
        setTimer(0);
        setTimerActive(true);
        setGameWon(false);
    };

    const handleCardClick = (id) => {
        if (flipped.length === 2 || flipped.includes(id) || matched.includes(id)) return;

        const newFlipped = [...flipped, id];
        setFlipped(newFlipped);

        if (newFlipped.length === 2) {
            setMoves(m => m + 1);
            const [first, second] = newFlipped;
            if (cards[first].emoji === cards[second].emoji) {
                const newMatched = [...matched, first, second];
                setMatched(newMatched);
                setFlipped([]);
                if (newMatched.length === cards.length) {
                    setGameWon(true);
                    setTimerActive(false);
                    const reward = difficulty === 'easy' ? 20 : difficulty === 'medium' ? 40 : 60;
                    addPoints(reward);
                }
            } else {
                setTimeout(() => setFlipped([]), 800);
            }
        }
    };

    if (!difficulty) {
        return (
            <div className="game-container animate-fade-in">
                <button className="btn-secondary mb-4 flex align-center gap-2" onClick={onBack}><ArrowLeft size={18} /> Back to Hub</button>
                <div className="text-center mb-6">
                    <h2>Memory Match</h2>
                    <p>Find matching pairs to train your working memory.</p>
                </div>
                <div className="category-grid">
                    {['easy', 'medium', 'hard'].map(d => (
                        <button key={d} className="game-category-card" onClick={() => startGame(d)}>
                            <h3 style={{ fontSize: '2rem' }}>{d === 'easy' ? '🟢' : d === 'medium' ? '🟡' : '🔴'}</h3>
                            <p style={{ textTransform: 'capitalize' }}>{d}</p>
                            <span className="text-sm text-secondary">{CARD_SETS[d].length * 2} cards</span>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    const cols = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 4 : 5;

    return (
        <div className="game-container animate-fade-in">
            <div className="flex justify-space-between align-center mb-4">
                <button className="btn-secondary flex align-center gap-2" onClick={() => setDifficulty(null)}><ArrowLeft size={18} /> Back</button>
                <div className="flex gap-4 align-center">
                    <span className="score-badge"><Clock size={14} /> {timer}s</span>
                    <span className="score-badge">Moves: {moves}</span>
                </div>
            </div>

            <div className="memory-grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, display: 'grid', gap: '10px', maxWidth: '500px', margin: '0 auto' }}>
                {cards.map((card) => {
                    const isVisible = flipped.includes(card.id) || matched.includes(card.id);
                    return (
                        <button key={card.id} className={`memory-card ${isVisible ? 'flipped' : ''} ${matched.includes(card.id) ? 'matched' : ''}`} onClick={() => handleCardClick(card.id)} disabled={matched.includes(card.id)}>
                            <span style={{ fontSize: '2rem' }}>{isVisible ? card.emoji : '?'}</span>
                        </button>
                    );
                })}
            </div>

            {gameWon && (
                <div className="text-center mt-6 animate-fade-in">
                    <Trophy size={48} color="#f59e0b" className="mb-2" />
                    <h3>Excellent Memory!</h3>
                    <p>Completed in {moves} moves and {timer} seconds.</p>
                    <p className="text-secondary">+{difficulty === 'easy' ? 20 : difficulty === 'medium' ? 40 : 60} Points!</p>
                    <button className="btn-primary mt-4" onClick={() => startGame(difficulty)}><RotateCcw size={16} /> Play Again</button>
                </div>
            )}
        </div>
    );
}
