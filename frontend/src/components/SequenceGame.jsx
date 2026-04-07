import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Play, RotateCcw, Trophy } from 'lucide-react';

const COLORS = [
    { name: 'Red', bg: '#ef4444' },
    { name: 'Blue', bg: '#3b82f6' },
    { name: 'Green', bg: '#22c55e' },
    { name: 'Yellow', bg: '#eab308' },
];

export default function SequenceGame({ onBack, addPoints }) {
    const [sequence, setSequence] = useState([]);
    const [playerInput, setPlayerInput] = useState([]);
    const [isShowingSequence, setIsShowingSequence] = useState(false);
    const [activeColor, setActiveColor] = useState(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [bestScore, setBestScore] = useState(() => parseInt(localStorage.getItem('seqBest') || '0'));
    const [started, setStarted] = useState(false);

    const playSequence = useCallback(async (seq) => {
        setIsShowingSequence(true);
        setPlayerInput([]);
        for (let i = 0; i < seq.length; i++) {
            await new Promise(r => setTimeout(r, 600));
            setActiveColor(seq[i]);
            await new Promise(r => setTimeout(r, 500));
            setActiveColor(null);
        }
        await new Promise(r => setTimeout(r, 300));
        setIsShowingSequence(false);
    }, []);

    const startNewGame = () => {
        const first = Math.floor(Math.random() * 4);
        const newSeq = [first];
        setSequence(newSeq);
        setPlayerInput([]);
        setScore(0);
        setGameOver(false);
        setStarted(true);
        setTimeout(() => playSequence(newSeq), 500);
    };

    const nextRound = () => {
        const next = Math.floor(Math.random() * 4);
        const newSeq = [...sequence, next];
        setSequence(newSeq);
        setPlayerInput([]);
        setTimeout(() => playSequence(newSeq), 800);
    };

    const handleColorClick = (index) => {
        if (isShowingSequence || gameOver) return;

        setActiveColor(index);
        setTimeout(() => setActiveColor(null), 200);

        const newInput = [...playerInput, index];
        setPlayerInput(newInput);

        const currentStep = newInput.length - 1;
        if (newInput[currentStep] !== sequence[currentStep]) {
            setGameOver(true);
            if (score > bestScore) {
                setBestScore(score);
                localStorage.setItem('seqBest', score.toString());
            }
            addPoints(score * 5);
            return;
        }

        if (newInput.length === sequence.length) {
            setScore(s => s + 1);
            nextRound();
        }
    };

    if (!started) {
        return (
            <div className="game-container animate-fade-in text-center">
                <button className="btn-secondary mb-4 flex align-center gap-2" onClick={onBack}><ArrowLeft size={18} /> Back to Hub</button>
                <h2>Sequence Builder</h2>
                <p className="mb-6">Watch the color sequence, then repeat it. The sequence grows each round!</p>
                <p className="text-secondary mb-4">Best Score: {bestScore} rounds</p>
                <button className="btn-primary" onClick={startNewGame}><Play size={18} /> Start Game</button>
            </div>
        );
    }

    return (
        <div className="game-container animate-fade-in text-center">
            <div className="flex justify-space-between align-center mb-6">
                <button className="btn-secondary flex align-center gap-2" onClick={onBack}><ArrowLeft size={18} /> Back</button>
                <div className="flex gap-2">
                    <span className="score-badge">Round: {score + 1}</span>
                    <span className="score-badge">Best: {bestScore}</span>
                </div>
            </div>

            <p className="mb-4" style={{ fontWeight: 500 }}>
                {isShowingSequence ? 'Watch the sequence...' : gameOver ? 'Game Over!' : 'Your turn! Repeat the sequence'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', maxWidth: '300px', margin: '0 auto' }}>
                {COLORS.map((color, i) => (
                    <button key={i} onClick={() => handleColorClick(i)} disabled={isShowingSequence || gameOver} style={{
                        background: color.bg,
                        opacity: activeColor === i ? 1 : 0.5,
                        transform: activeColor === i ? 'scale(1.05)' : 'scale(1)',
                        width: '100%', height: '120px', borderRadius: '16px', border: 'none',
                        cursor: isShowingSequence ? 'default' : 'pointer',
                        transition: 'all 0.15s ease', boxShadow: activeColor === i ? `0 0 20px ${color.bg}60` : 'none',
                    }} />
                ))}
            </div>

            {gameOver && (
                <div className="mt-6 animate-fade-in">
                    <Trophy size={48} color="#f59e0b" className="mb-2" />
                    <h3>Score: {score} rounds</h3>
                    <p className="text-secondary">+{score * 5} Points!</p>
                    <button className="btn-primary mt-4" onClick={startNewGame}><RotateCcw size={16} /> Try Again</button>
                </div>
            )}
        </div>
    );
}
