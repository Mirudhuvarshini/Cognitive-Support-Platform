import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

const THEME_PROFILES = {
    calm: {
        '--color-bg-primary': '#FAFDFB',
        '--color-bg-secondary': '#F0F4F8',
        '--color-text-primary': '#1E293B',
        '--color-text-secondary': '#475569',
        '--color-primary': '#6C5CE7',
        '--color-primary-light': '#A29BFE',
        '--color-accent': '#E0E7FF',
    },
    lowStim: {
        '--color-bg-primary': '#1A1A2E',
        '--color-bg-secondary': '#16213E',
        '--color-text-primary': '#E8E8E8',
        '--color-text-secondary': '#B0B0B0',
        '--color-primary': '#A29BFE',
        '--color-primary-light': '#6C5CE7',
        '--color-accent': '#2D2D44',
    },
    highFocus: {
        '--color-bg-primary': '#FFFBF0',
        '--color-bg-secondary': '#FEF3C7',
        '--color-text-primary': '#1C1917',
        '--color-text-secondary': '#57534E',
        '--color-primary': '#E17055',
        '--color-primary-light': '#FDCB6E',
        '--color-accent': '#FFEAA7',
    },
    nature: {
        '--color-bg-primary': '#F0FFF4',
        '--color-bg-secondary': '#C6F6D5',
        '--color-text-primary': '#1A202C',
        '--color-text-secondary': '#4A5568',
        '--color-primary': '#38A169',
        '--color-primary-light': '#68D391',
        '--color-accent': '#C6F6D5',
    },
    ocean: {
        '--color-bg-primary': '#EBF8FF',
        '--color-bg-secondary': '#BEE3F8',
        '--color-text-primary': '#1A202C',
        '--color-text-secondary': '#4A5568',
        '--color-primary': '#3182CE',
        '--color-primary-light': '#63B3ED',
        '--color-accent': '#BEE3F8',
    },
};

const MOOD_TO_THEME = {
    great: 'calm',
    okay: 'calm',
    struggling: 'lowStim',
    crisis: 'lowStim',
};

export function ThemeProvider({ children }) {
    const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('neuroTheme') || 'calm');
    const [fontSize, setFontSize] = useState(parseFloat(localStorage.getItem('neuroFontSize') || '1.1'));
    const [animationsEnabled, setAnimationsEnabled] = useState(localStorage.getItem('neuroAnimations') !== 'false');
    const [highContrast, setHighContrast] = useState(localStorage.getItem('neuroHighContrast') === 'true');
    const [dyslexiaFont, setDyslexiaFont] = useState(localStorage.getItem('neuroDyslexiaFont') === 'true');
    const [reducedMotion, setReducedMotion] = useState(localStorage.getItem('neuroReducedMotion') === 'true');
    const [currentMood, setCurrentMood] = useState(null);
    const [moodAutoTheme, setMoodAutoTheme] = useState(localStorage.getItem('neuroMoodAutoTheme') !== 'false');

    useEffect(() => {
        applyTheme(currentTheme);
        localStorage.setItem('neuroTheme', currentTheme);
    }, [currentTheme]);

    useEffect(() => {
        document.documentElement.style.setProperty('--base-font-size', `${fontSize}rem`);
        document.documentElement.style.fontSize = `${fontSize * 100}%`;
        localStorage.setItem('neuroFontSize', fontSize.toString());
    }, [fontSize]);

    useEffect(() => {
        document.body.classList.toggle('no-animations', !animationsEnabled || reducedMotion);
        localStorage.setItem('neuroAnimations', animationsEnabled.toString());
    }, [animationsEnabled, reducedMotion]);

    useEffect(() => {
        document.body.classList.toggle('high-contrast', highContrast);
        localStorage.setItem('neuroHighContrast', highContrast.toString());
    }, [highContrast]);

    useEffect(() => {
        document.body.classList.toggle('dyslexia-font', dyslexiaFont);
        localStorage.setItem('neuroDyslexiaFont', dyslexiaFont.toString());
    }, [dyslexiaFont]);

    useEffect(() => {
        localStorage.setItem('neuroReducedMotion', reducedMotion.toString());
    }, [reducedMotion]);

    const applyTheme = (themeName) => {
        const theme = THEME_PROFILES[themeName];
        if (!theme) return;
        const root = document.documentElement;
        Object.entries(theme).forEach(([prop, value]) => {
            root.style.setProperty(prop, value);
        });
    };

    const setMood = (mood) => {
        setCurrentMood(mood);
        if (moodAutoTheme && MOOD_TO_THEME[mood]) {
            setCurrentTheme(MOOD_TO_THEME[mood]);
        }
    };

    return (
        <ThemeContext.Provider value={{
            currentTheme, setCurrentTheme,
            fontSize, setFontSize,
            animationsEnabled, setAnimationsEnabled,
            highContrast, setHighContrast,
            dyslexiaFont, setDyslexiaFont,
            reducedMotion, setReducedMotion,
            currentMood, setMood,
            moodAutoTheme, setMoodAutoTheme,
            themeOptions: Object.keys(THEME_PROFILES),
        }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
}
