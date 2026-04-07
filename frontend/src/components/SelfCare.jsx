import React, { useState, useEffect, useRef } from 'react';
import { Heart, Wind, Eye, Volume2, Waves, TreePine, CloudRain, Sun, Headphones, Timer, Pause, Play } from 'lucide-react';

const BREATHING_EXERCISES = [
    { name: '4-7-8 Breathing', pattern: [{ phase: 'Breathe In', duration: 4 }, { phase: 'Hold', duration: 7 }, { phase: 'Breathe Out', duration: 8 }], cycles: 4 },
    { name: 'Box Breathing', pattern: [{ phase: 'Breathe In', duration: 4 }, { phase: 'Hold', duration: 4 }, { phase: 'Breathe Out', duration: 4 }, { phase: 'Hold', duration: 4 }], cycles: 4 },
    { name: 'Calm Breathing', pattern: [{ phase: 'Breathe In', duration: 3 }, { phase: 'Breathe Out', duration: 6 }], cycles: 6 },
];

const GROUNDING_STEPS = [
    { sense: 'See', count: 5, prompt: 'Name 5 things you can SEE right now', icon: '👁️', color: '#3b82f6' },
    { sense: 'Touch', count: 4, prompt: 'Name 4 things you can TOUCH', icon: '✋', color: '#22c55e' },
    { sense: 'Hear', count: 3, prompt: 'Name 3 things you can HEAR', icon: '👂', color: '#f59e0b' },
    { sense: 'Smell', count: 2, prompt: 'Name 2 things you can SMELL', icon: '👃', color: '#ef4444' },
    { sense: 'Taste', count: 1, prompt: 'Name 1 thing you can TASTE', icon: '👅', color: '#8b5cf6' },
];

const SOUND_CATEGORIES = [
    { name: 'Rain', icon: <CloudRain size={24} />, url: 'https://www.youtube.com/embed/mPZkdNFkNps?autoplay=1', color: '#3b82f6' },
    { name: 'Forest', icon: <TreePine size={24} />, url: 'https://www.youtube.com/embed/xNN7iTA57jM?autoplay=1', color: '#22c55e' },
    { name: 'Ocean Waves', icon: <Waves size={24} />, url: 'https://www.youtube.com/embed/Nep1qytq9JM?autoplay=1', color: '#0ea5e9' },
    { name: 'Lo-Fi Music', icon: <Headphones size={24} />, url: 'https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1', color: '#8b5cf6' },
];

export default function SelfCare() {
    const [activeSection, setActiveSection] = useState(null);
    const [breathingExercise, setBreathingExercise] = useState(null);
    const [breathPhase, setBreathPhase] = useState('');
    const [breathTimer, setBreathTimer] = useState(0);
    const [breathActive, setBreathActive] = useState(false);
    const [groundingStep, setGroundingStep] = useState(0);
    const [groundingActive, setGroundingActive] = useState(false);
    const [activeSound, setActiveSound] = useState(null);
    const [circleScale, setCircleScale] = useState(1);
    const breathRef = useRef(null);

    const startBreathing = (exercise) => {
        setBreathingExercise(exercise);
        setBreathActive(true);
        setActiveSection('breathing-active');
        runBreathingCycle(exercise, 0, 0);
    };

    const runBreathingCycle = (exercise, cycleIdx, phaseIdx) => {
        if (cycleIdx >= exercise.cycles) {
            setBreathActive(false);
            setBreathPhase('Complete! Well done 🌟');
            setCircleScale(1);
            return;
        }
        const phase = exercise.pattern[phaseIdx];
        setBreathPhase(phase.phase);
        setBreathTimer(phase.duration);
        setCircleScale(phase.phase.includes('In') ? 1.5 : phase.phase.includes('Out') ? 0.7 : 1.2);

        let timeLeft = phase.duration;
        const interval = setInterval(() => {
            timeLeft--;
            setBreathTimer(timeLeft);
            if (timeLeft <= 0) {
                clearInterval(interval);
                const nextPhase = phaseIdx + 1;
                if (nextPhase >= exercise.pattern.length) {
                    runBreathingCycle(exercise, cycleIdx + 1, 0);
                } else {
                    runBreathingCycle(exercise, cycleIdx, nextPhase);
                }
            }
        }, 1000);
        breathRef.current = interval;
    };

    const stopBreathing = () => {
        if (breathRef.current) clearInterval(breathRef.current);
        setBreathActive(false);
        setActiveSection(null);
        setCircleScale(1);
    };

    const sections = [
        { id: 'breathing', title: 'Guided Breathing', icon: <Wind size={32} />, desc: 'Calming breathing exercises with visual guides', color: '#3b82f6' },
        { id: 'grounding', title: '5-4-3-2-1 Grounding', icon: <Eye size={32} />, desc: 'Sensory grounding technique for overwhelm', color: '#22c55e' },
        { id: 'sounds', title: 'Calming Sounds', icon: <Volume2 size={32} />, desc: 'Nature sounds, rain, and lo-fi music', color: '#8b5cf6' },
        { id: 'body-scan', title: 'Body Scan', icon: <Sun size={32} />, desc: 'Progressive relaxation from head to toe', color: '#f59e0b' },
    ];

    const bodyScanSteps = [
        'Close your eyes. Take a deep breath.',
        'Focus on the top of your head. Release any tension.',
        'Move to your forehead and eyes. Let them soften.',
        'Relax your jaw. Unclench your teeth.',
        'Let your shoulders drop. Release all tension.',
        'Feel your arms become heavy and warm.',
        'Breathe into your chest. Let it expand.',
        'Relax your stomach. Let it be soft.',
        'Feel your legs become heavy and relaxed.',
        'Wiggle your toes. Take a final deep breath.',
        'Gently open your eyes. You are calm. 🌟',
    ];
    const [bodyScanIdx, setBodyScanIdx] = useState(0);

    if (activeSection === 'breathing-active') {
        return (
            <div className="container app-page animate-fade-in text-center">
                <h2 className="mb-4">{breathingExercise.name}</h2>
                <div className="breathing-visual" style={{ margin: '2rem auto', position: 'relative', width: '250px', height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{
                        width: '200px', height: '200px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)',
                        transform: `scale(${circleScale})`, transition: 'transform 2s ease-in-out',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'white',
                    }}>
                        <span style={{ fontSize: '1.3rem', fontWeight: 600 }}>{breathPhase}</span>
                        {breathActive && <span style={{ fontSize: '2.5rem', fontWeight: 700, marginTop: '4px' }}>{breathTimer}</span>}
                    </div>
                </div>
                <button className="btn-secondary" onClick={stopBreathing}>Stop Exercise</button>
            </div>
        );
    }

    if (activeSection === 'breathing') {
        return (
            <div className="container app-page animate-fade-in">
                <button className="btn-secondary mb-4" onClick={() => setActiveSection(null)}>← Back</button>
                <h2 className="text-center mb-6">Guided Breathing</h2>
                <div className="flex flex-col gap-4" style={{ maxWidth: '500px', margin: '0 auto' }}>
                    {BREATHING_EXERCISES.map((ex, i) => (
                        <button key={i} className="glass-card flex align-center gap-4" style={{ padding: '1.5rem', textAlign: 'left', border: 'none', cursor: 'pointer' }} onClick={() => startBreathing(ex)}>
                            <Wind size={32} color="#3b82f6" />
                            <div>
                                <h3 style={{ margin: 0 }}>{ex.name}</h3>
                                <p className="text-secondary text-sm">{ex.pattern.map(p => `${p.phase}: ${p.duration}s`).join(' → ')} × {ex.cycles} cycles</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    if (activeSection === 'grounding') {
        const step = GROUNDING_STEPS[groundingStep];
        return (
            <div className="container app-page animate-fade-in text-center">
                <button className="btn-secondary mb-4" onClick={() => { setActiveSection(null); setGroundingStep(0); }}>← Back</button>
                <h2 className="mb-2">5-4-3-2-1 Grounding</h2>
                <p className="text-secondary mb-6">Focus on your senses to feel present and calm.</p>
                <div className="glass-card mx-auto animate-fade-in" style={{ maxWidth: '450px', padding: '3rem 2rem', textAlign: 'center' }}>
                    <span style={{ fontSize: '4rem' }}>{step.icon}</span>
                    <h3 style={{ color: step.color, margin: '1rem 0 0.5rem 0', fontSize: '1.5rem' }}>{step.count} things you can {step.sense}</h3>
                    <p className="text-secondary">{step.prompt}</p>
                    <div className="flex justify-center gap-2 mt-6">
                        {groundingStep > 0 && <button className="btn-secondary" onClick={() => setGroundingStep(s => s - 1)}>Previous</button>}
                        {groundingStep < GROUNDING_STEPS.length - 1 ? (
                            <button className="btn-primary" onClick={() => setGroundingStep(s => s + 1)}>Next Sense →</button>
                        ) : (
                            <button className="btn-primary" onClick={() => { setActiveSection(null); setGroundingStep(0); }}>Complete ✓</button>
                        )}
                    </div>
                    <div className="flex justify-center gap-2 mt-4">
                        {GROUNDING_STEPS.map((_, i) => (
                            <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: i <= groundingStep ? 'var(--color-primary)' : 'var(--color-bg-secondary)' }} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (activeSection === 'sounds') {
        return (
            <div className="container app-page animate-fade-in">
                <button className="btn-secondary mb-4" onClick={() => { setActiveSection(null); setActiveSound(null); }}>← Back</button>
                <h2 className="text-center mb-6">Calming Sounds</h2>
                <div className="flex flex-col gap-4" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    {SOUND_CATEGORIES.map((sound, i) => (
                        <button key={i} className={`glass-card flex align-center gap-4 ${activeSound === i ? 'selected-sound' : ''}`} style={{ padding: '1.25rem', border: activeSound === i ? `2px solid ${sound.color}` : 'none', cursor: 'pointer', textAlign: 'left' }} onClick={() => setActiveSound(activeSound === i ? null : i)}>
                            <div style={{ color: sound.color }}>{sound.icon}</div>
                            <span style={{ fontWeight: 500 }}>{sound.name}</span>
                            {activeSound === i && <span className="badge priority-low" style={{ marginLeft: 'auto' }}>Playing</span>}
                        </button>
                    ))}
                    {activeSound !== null && (
                        <div className="glass-card" style={{ borderRadius: '16px', overflow: 'hidden', height: '0', paddingBottom: '56.25%', position: 'relative' }}>
                            <iframe src={SOUND_CATEGORIES[activeSound].url} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} allow="autoplay" allowFullScreen />
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (activeSection === 'body-scan') {
        return (
            <div className="container app-page animate-fade-in text-center">
                <button className="btn-secondary mb-4" onClick={() => { setActiveSection(null); setBodyScanIdx(0); }}>← Back</button>
                <h2 className="mb-6">Body Scan Meditation</h2>
                <div className="glass-card mx-auto animate-fade-in" style={{ maxWidth: '500px', padding: '3rem 2rem' }}>
                    <p style={{ fontSize: '1.25rem', lineHeight: '1.8', minHeight: '80px' }}>{bodyScanSteps[bodyScanIdx]}</p>
                    <div className="flex justify-center gap-2 mt-6">
                        {bodyScanIdx > 0 && <button className="btn-secondary" onClick={() => setBodyScanIdx(i => i - 1)}>Previous</button>}
                        {bodyScanIdx < bodyScanSteps.length - 1 ? (
                            <button className="btn-primary" onClick={() => setBodyScanIdx(i => i + 1)}>Continue →</button>
                        ) : (
                            <button className="btn-primary" onClick={() => { setActiveSection(null); setBodyScanIdx(0); }}>Finish ✓</button>
                        )}
                    </div>
                    <div style={{ marginTop: '1.5rem', background: 'var(--color-bg-secondary)', borderRadius: '10px', height: '6px' }}>
                        <div style={{ background: 'var(--color-primary)', height: '100%', width: `${((bodyScanIdx + 1) / bodyScanSteps.length) * 100}%`, borderRadius: '10px', transition: 'width 0.3s' }} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container app-page animate-fade-in">
            <div className="page-header text-center mb-6">
                <Heart color="var(--color-primary)" size={48} className="mx-auto mb-4" />
                <h2>Self-Care Toolkit</h2>
                <p>Tools to help you regulate, ground, and recharge.</p>
            </div>
            <div className="games-grid" style={{ maxWidth: '700px', margin: '0 auto' }}>
                {sections.map(s => (
                    <button key={s.id} className="glass-card game-card-btn" onClick={() => setActiveSection(s.id)}>
                        <div className="game-icon-circle" style={{ background: `${s.color}15`, color: s.color }}>{s.icon}</div>
                        <h4>{s.title}</h4>
                        <p className="text-sm text-secondary">{s.desc}</p>
                    </button>
                ))}
            </div>
        </div>
    );
}
