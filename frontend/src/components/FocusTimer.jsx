import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, Trophy, Volume2 } from 'lucide-react';

export default function FocusTimer() {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState('focus');
    const [sessions, setSessions] = useState(() => parseInt(localStorage.getItem('focusSessions') || '0'));
    const [breaks, setBreaks] = useState(() => parseInt(localStorage.getItem('focusBreaks') || '0'));
    const [totalFocusTime, setTotalFocusTime] = useState(() => parseInt(localStorage.getItem('totalFocusTime') || '0'));

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((time) => time - 1);
                if (mode === 'focus') {
                    setTotalFocusTime(prev => {
                        const newVal = prev + 1;
                        localStorage.setItem('totalFocusTime', newVal.toString());
                        return newVal;
                    });
                }
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            playSound();
            if (mode === 'focus') {
                setSessions(prev => {
                    const newVal = prev + 1;
                    localStorage.setItem('focusSessions', newVal.toString());
                    return newVal;
                });
            } else {
                setBreaks(prev => {
                    const newVal = prev + 1;
                    localStorage.setItem('focusBreaks', newVal.toString());
                    return newVal;
                });
            }
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft, mode]);

    const playSound = () => {
        if ('speechSynthesis' in window) {
            const msg = new SpeechSynthesisUtterance(mode === 'focus' ? 'Focus session complete. Time for a break!' : 'Break over. Ready to focus again?');
            msg.rate = 0.9;
            speechSynthesis.speak(msg);
        }
    };

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        const times = { focus: 25 * 60, shortBreak: 5 * 60, longBreak: 15 * 60 };
        setTimeLeft(times[mode]);
    };

    const changeMode = (newMode) => {
        setMode(newMode);
        setIsActive(false);
        const times = { focus: 25 * 60, shortBreak: 5 * 60, longBreak: 15 * 60 };
        setTimeLeft(times[newMode]);
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const progress = (() => {
        const totals = { focus: 25 * 60, shortBreak: 5 * 60, longBreak: 15 * 60 };
        return ((totals[mode] - timeLeft) / totals[mode]) * 100;
    })();

    return (
        <div className="container app-page animate-fade-in text-center">
            <div className="page-header mb-6">
                <Brain color="var(--color-primary)" size={48} className="mx-auto mb-4" />
                <h2>Focus Timer</h2>
                <p>Work with your brain, not against it. Take breaks when you need them.</p>
            </div>

            <div className="timer-card glass-card mx-auto">
                <div className="mode-selector">
                    <button className={`mode-btn ${mode === 'focus' ? 'active' : ''}`} onClick={() => changeMode('focus')}>Focus Time</button>
                    <button className={`mode-btn ${mode === 'shortBreak' ? 'active' : ''}`} onClick={() => changeMode('shortBreak')}>Short Break</button>
                    <button className={`mode-btn ${mode === 'longBreak' ? 'active' : ''}`} onClick={() => changeMode('longBreak')}>Long Break</button>
                </div>

                <div style={{ position: 'relative', margin: '1rem auto', width: '220px', height: '220px' }}>
                    <svg width="220" height="220" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
                        <circle cx="110" cy="110" r="100" fill="none" stroke="var(--color-bg-secondary)" strokeWidth="8" />
                        <circle cx="110" cy="110" r="100" fill="none" stroke="var(--color-primary)" strokeWidth="8"
                            strokeDasharray={`${2 * Math.PI * 100}`}
                            strokeDashoffset={`${2 * Math.PI * 100 * (1 - progress / 100)}`}
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dashoffset 1s linear' }}
                        />
                    </svg>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                        <div className="time-display" style={{ fontSize: '3.5rem', margin: 0 }}>{formatTime(timeLeft)}</div>
                    </div>
                </div>

                <div className="timer-controls">
                    <button className="control-btn play-btn" onClick={toggleTimer}>{isActive ? <Pause size={32} /> : <Play size={32} />}</button>
                    <button className="control-btn reset-btn" onClick={resetTimer}><RotateCcw size={24} /></button>
                </div>
            </div>

            <div className="productivity-stats glass-card mx-auto mt-6" style={{ maxWidth: '500px', padding: '1.5rem' }}>
                <h4 className="flex align-center justify-center mb-4 gap-2"><Trophy size={20} color="#f59e0b" /> Your Stats</h4>
                <div className="stats-row flex justify-space-between">
                    <div>
                        <p className="stats-val">{sessions}</p>
                        <p className="stats-label text-sm text-secondary">Focus Sessions</p>
                    </div>
                    <div>
                        <p className="stats-val">{breaks}</p>
                        <p className="stats-label text-sm text-secondary">Breaks Taken</p>
                    </div>
                    <div>
                        <p className="stats-val">{Math.floor(totalFocusTime / 60)}</p>
                        <p className="stats-label text-sm text-secondary">Total Minutes</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
