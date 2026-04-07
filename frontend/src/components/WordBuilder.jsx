import React, { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw, Lightbulb, CheckCircle, XCircle, Sparkles } from 'lucide-react';

const WORD_SETS = {
    easy: [
        { word: 'CAT', hint: 'A small furry pet that purrs' },
        { word: 'DOG', hint: 'A loyal pet that barks' },
        { word: 'SUN', hint: 'Bright star in the sky' },
        { word: 'BIG', hint: 'Opposite of small' },
        { word: 'HAT', hint: 'You wear it on your head' },
        { word: 'RED', hint: 'Color of a fire truck' },
        { word: 'CUP', hint: 'You drink water from it' },
        { word: 'RUN', hint: 'Moving fast on your feet' },
    ],
    medium: [
        { word: 'HAPPY', hint: 'Feeling joy and smiling' },
        { word: 'WATER', hint: 'You drink this to stay hydrated' },
        { word: 'MUSIC', hint: 'Songs and melodies' },
        { word: 'BRAVE', hint: 'Not afraid; courageous' },
        { word: 'QUIET', hint: 'Making very little noise' },
        { word: 'LIGHT', hint: 'Opposite of dark' },
        { word: 'DREAM', hint: 'What happens when you sleep' },
        { word: 'SMILE', hint: 'Happy expression on your face' },
    ],
    hard: [
        { word: 'PUZZLE', hint: 'A game that needs solving' },
        { word: 'FRIEND', hint: 'Someone you care about and trust' },
        { word: 'GENTLE', hint: 'Soft and kind' },
        { word: 'BRIGHT', hint: 'Full of light or smart' },
        { word: 'GARDEN', hint: 'Where flowers grow outside' },
        { word: 'LISTEN', hint: 'To hear and pay attention' },
    ],
};

export default function WordBuilder({ onBack, addPoints }) {
    const [difficulty, setDifficulty] = useState(null);
    const [currentWord, setCurrentWord] = useState(null);
    const [scrambled, setScrambled] = useState([]);
    const [answer, setAnswer] = useState([]);
    const [showHint, setShowHint] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [score, setScore] = useState(0);
    const [wordIdx, setWordIdx] = useState(0);
    const [words, setWords] = useState([]);

    const scrambleWord = (word) => {
        const letters = word.split('');
        for (let i = letters.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [letters[i], letters[j]] = [letters[j], letters[i]];
        }
        if (letters.join('') === word) return scrambleWord(word);
        return letters.map((l, i) => ({ letter: l, id: i, used: false }));
    };

    const startGame = (diff) => {
        setDifficulty(diff);
        const shuffled = [...WORD_SETS[diff]].sort(() => Math.random() - 0.5);
        setWords(shuffled);
        setWordIdx(0);
        setScore(0);
        loadWord(shuffled[0]);
    };

    const loadWord = (wordObj) => {
        setCurrentWord(wordObj);
        setScrambled(scrambleWord(wordObj.word));
        setAnswer([]);
        setShowHint(false);
        setFeedback(null);
    };

    const selectLetter = (letterObj) => {
        if (letterObj.used || feedback) return;
        const newScrambled = scrambled.map(s => s.id === letterObj.id ? { ...s, used: true } : s);
        const newAnswer = [...answer, letterObj];
        setScrambled(newScrambled);
        setAnswer(newAnswer);

        if (newAnswer.length === currentWord.word.length) {
            const built = newAnswer.map(a => a.letter).join('');
            if (built === currentWord.word) {
                setFeedback('correct');
                const pts = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 30;
                setScore(s => s + 1);
                addPoints(pts);
                setTimeout(() => {
                    if (wordIdx + 1 < words.length) {
                        setWordIdx(i => i + 1);
                        loadWord(words[wordIdx + 1]);
                    } else {
                        setFeedback('complete');
                    }
                }, 1500);
            } else {
                setFeedback('incorrect');
                setTimeout(() => {
                    setScrambled(scrambleWord(currentWord.word));
                    setAnswer([]);
                    setFeedback(null);
                }, 1200);
            }
        }
    };

    const removeLetter = () => {
        if (answer.length === 0 || feedback) return;
        const last = answer[answer.length - 1];
        setAnswer(answer.slice(0, -1));
        setScrambled(scrambled.map(s => s.id === last.id ? { ...s, used: false } : s));
    };

    if (!difficulty) {
        return (
            <div className="game-container animate-fade-in text-center">
                <button className="btn-secondary mb-4 flex align-center gap-2" onClick={onBack}><ArrowLeft size={18} /> Back to Hub</button>
                <h2>Word Builder</h2>
                <p className="mb-6">Unscramble the letters to build words. Hints available!</p>
                <div className="category-grid">
                    {['easy', 'medium', 'hard'].map(d => (
                        <button key={d} className="game-category-card" onClick={() => startGame(d)}>
                            <h3 style={{ fontSize: '2rem' }}>{d === 'easy' ? '📝' : d === 'medium' ? '📖' : '📚'}</h3>
                            <p style={{ textTransform: 'capitalize' }}>{d}</p>
                            <span className="text-sm text-secondary">{d === 'easy' ? '3 letters' : d === 'medium' ? '5 letters' : '6 letters'}</span>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    if (feedback === 'complete') {
        return (
            <div className="game-container animate-fade-in text-center">
                <Sparkles size={48} color="#f59e0b" className="mb-4" />
                <h2>Round Complete!</h2>
                <p style={{ fontSize: '2rem', fontWeight: 700 }}>{score}/{words.length} correct</p>
                <button className="btn-primary mt-4" onClick={() => startGame(difficulty)}><RotateCcw size={16} /> Play Again</button>
                <button className="btn-secondary mt-2" onClick={onBack}>Back to Hub</button>
            </div>
        );
    }

    return (
        <div className="game-container animate-fade-in text-center">
            <div className="flex justify-space-between align-center mb-6">
                <button className="btn-secondary flex align-center gap-2" onClick={onBack}><ArrowLeft size={18} /> Back</button>
                <div className="flex gap-2">
                    <span className="score-badge">Score: {score}</span>
                    <span className="score-badge">{wordIdx + 1}/{words.length}</span>
                </div>
            </div>

            <div className="game-play-area">
                <h3 className="mb-4">Build the word!</h3>

                <div className="flex justify-center gap-2 mb-4" style={{ minHeight: '60px' }}>
                    {currentWord.word.split('').map((_, i) => (
                        <div key={i} style={{
                            width: '50px', height: '50px', border: '2px solid var(--color-primary)',
                            borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.5rem', fontWeight: 700, background: answer[i] ? 'var(--color-accent)' : 'transparent',
                            color: 'var(--color-primary)',
                        }}>
                            {answer[i]?.letter || ''}
                        </div>
                    ))}
                </div>

                <div className="flex justify-center gap-2 mb-4 flex-wrap">
                    {scrambled.map((s) => (
                        <button key={s.id} onClick={() => selectLetter(s)} disabled={s.used || feedback === 'correct'} style={{
                            width: '50px', height: '50px', borderRadius: '12px', fontSize: '1.3rem',
                            fontWeight: 700, border: '2px solid var(--glass-border)',
                            background: s.used ? 'var(--color-bg-secondary)' : 'var(--color-bg-primary)',
                            opacity: s.used ? 0.3 : 1, cursor: s.used ? 'default' : 'pointer',
                        }}>
                            {s.letter}
                        </button>
                    ))}
                </div>

                <div className="flex justify-center gap-2">
                    <button className="btn-secondary" onClick={removeLetter} disabled={answer.length === 0}>⌫ Undo</button>
                    <button className="btn-secondary" onClick={() => setShowHint(true)} disabled={showHint}>
                        <Lightbulb size={16} /> Hint
                    </button>
                </div>

                {showHint && <p className="mt-4 text-secondary" style={{ fontStyle: 'italic' }}>💡 {currentWord.hint}</p>}

                {feedback && feedback !== 'complete' && (
                    <div className={`feedback-message ${feedback}`}>
                        {feedback === 'correct' ? <><CheckCircle size={24} /> Correct!</> : <><XCircle size={24} /> Try again!</>}
                    </div>
                )}
            </div>
        </div>
    );
}
