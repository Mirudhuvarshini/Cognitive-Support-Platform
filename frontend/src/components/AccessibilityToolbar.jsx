import React, { useState } from 'react';
import { Settings, Type, Eye, Zap, Palette, X, SunMoon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function AccessibilityToolbar() {
    const [isOpen, setIsOpen] = useState(false);
    const {
        currentTheme, setCurrentTheme, themeOptions,
        fontSize, setFontSize,
        animationsEnabled, setAnimationsEnabled,
        highContrast, setHighContrast,
        dyslexiaFont, setDyslexiaFont,
        reducedMotion, setReducedMotion,
        moodAutoTheme, setMoodAutoTheme,
    } = useTheme();

    const themeLabels = {
        calm: 'Calm Lavender',
        lowStim: 'Low Stimulation',
        highFocus: 'High Focus',
        nature: 'Nature Green',
        ocean: 'Ocean Blue',
    };

    return (
        <>
            <button
                className="accessibility-fab"
                onClick={() => setIsOpen(!isOpen)}
                title="Accessibility Settings"
                aria-label="Open accessibility settings"
            >
                {isOpen ? <X size={22} /> : <Settings size={22} />}
            </button>

            {isOpen && (
                <div className="accessibility-panel glass-card animate-fade-in">
                    <div className="flex justify-space-between align-center mb-4">
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Accessibility</h3>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
                    </div>

                    <div className="a11y-section">
                        <label className="a11y-label"><Palette size={14} /> Theme</label>
                        <div className="theme-chips">
                            {themeOptions.map(t => (
                                <button
                                    key={t}
                                    className={`pill-btn ${currentTheme === t ? 'selected' : ''}`}
                                    onClick={() => setCurrentTheme(t)}
                                    style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                                >
                                    {themeLabels[t] || t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="a11y-section">
                        <label className="a11y-label"><Type size={14} /> Text Size: {(fontSize * 100).toFixed(0)}%</label>
                        <input
                            type="range" min="0.8" max="1.5" step="0.05"
                            value={fontSize}
                            onChange={e => setFontSize(parseFloat(e.target.value))}
                            className="sensory-slider"
                        />
                        <div className="slider-labels">
                            <span style={{ fontSize: '0.75rem' }}>Smaller</span>
                            <span style={{ fontSize: '0.75rem' }}>Larger</span>
                        </div>
                    </div>

                    <div className="a11y-toggles">
                        <div className="a11y-toggle-row">
                            <span><Zap size={14} /> Animations</span>
                            <label className="switch"><input type="checkbox" checked={animationsEnabled} onChange={() => setAnimationsEnabled(!animationsEnabled)} /><span className="slider round"></span></label>
                        </div>
                        <div className="a11y-toggle-row">
                            <span><Eye size={14} /> High Contrast</span>
                            <label className="switch"><input type="checkbox" checked={highContrast} onChange={() => setHighContrast(!highContrast)} /><span className="slider round"></span></label>
                        </div>
                        <div className="a11y-toggle-row">
                            <span><Type size={14} /> Dyslexia Font</span>
                            <label className="switch"><input type="checkbox" checked={dyslexiaFont} onChange={() => setDyslexiaFont(!dyslexiaFont)} /><span className="slider round"></span></label>
                        </div>
                        <div className="a11y-toggle-row">
                            <span><SunMoon size={14} /> Mood Auto-Theme</span>
                            <label className="switch"><input type="checkbox" checked={moodAutoTheme} onChange={() => setMoodAutoTheme(!moodAutoTheme)} /><span className="slider round"></span></label>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
