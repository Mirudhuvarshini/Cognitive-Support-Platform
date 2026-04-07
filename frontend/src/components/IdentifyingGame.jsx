import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

const CATEGORIES = {
    ALPHABET: 'alphabet',
    COLORS: 'colors',
    SHAPES: 'shapes',
    NUMBERS: 'numbers'
};

const DATA = {
    [CATEGORIES.ALPHABET]: Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)),
    [CATEGORIES.COLORS]: [
        { name: 'Red', hex: '#ef4444' },
        { name: 'Blue', hex: '#3b82f6' },
        { name: 'Green', hex: '#22c55e' },
        { name: 'Yellow', hex: '#eab308' },
        { name: 'Purple', hex: '#a855f7' },
        { name: 'Orange', hex: '#f97316' },
        { name: 'Pink', hex: '#ec4899' },
        { name: 'Teal', hex: '#14b8a6' },
        { name: 'Cyan', hex: '#06b6d4' },
        { name: 'Indigo', hex: '#6366f1' },
    ],
    [CATEGORIES.SHAPES]: [
        { name: 'Circle', shapeClass: 'shape-circle' },
        { name: 'Square', shapeClass: 'shape-square' },
        { name: 'Triangle', shapeClass: 'shape-triangle' },
        { name: 'Rectangle', shapeClass: 'shape-rectangle' },
        { name: 'Star', shapeClass: 'shape-star' },
    ],
    [CATEGORIES.NUMBERS]: Array.from({ length: 20 }, (_, i) => i + 1).map(String),
};

export default function IdentifyingGame({ onBack, addPoints }) {
    const [category, setCategory] = useState(null);
    const [currentItem, setCurrentItem] = useState(null);
    const [options, setOptions] = useState([]);
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState(null); // 'correct', 'incorrect'

    useEffect(() => {
        if (category) {
            generateQuestion();
        }
    }, [category]);

    const selectRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

    const shuffleArray = (array) => {
        const newArr = [...array];
        for (let i = newArr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
        }
        return newArr;
    };

    const generateQuestion = () => {
        setFeedback(null);
        let dataList = DATA[category];
        const correctItem = selectRandomElement(dataList);
        setCurrentItem(correctItem);

        // Generate 3 wrong options
        let wrongOptions = [];
        while (wrongOptions.length < 3) {
            const randomWrong = selectRandomElement(dataList);
            // Compare objects by name, primitives directly
            const isDuplicate = wrongOptions.some(item =>
                (typeof item === 'object' ? item.name === randomWrong.name : item === randomWrong)
            );
            const isCorrect = (typeof correctItem === 'object' ? correctItem.name === randomWrong.name : correctItem === randomWrong);

            if (!isDuplicate && !isCorrect) {
                wrongOptions.push(randomWrong);
            }
        }

        const allOptions = shuffleArray([correctItem, ...wrongOptions]);
        setOptions(allOptions);
    };

    const handleOptionClick = (option) => {
        if (feedback) return; // Wait for next question

        const isCorrect = (typeof currentItem === 'object' ? option.name === currentItem.name : option === currentItem);

        if (isCorrect) {
            setFeedback('correct');
            setScore(s => s + 1);
            addPoints(10); // Reward for correct answer
        } else {
            setFeedback('incorrect');
        }

        setTimeout(() => {
            generateQuestion();
        }, 1500);
    };

    const renderDisplayItem = () => {
        if (!currentItem) return null;

        if (category === CATEGORIES.COLORS) {
            return (
                <div
                    className="color-display-box"
                    style={{ backgroundColor: currentItem.hex }}
                ></div>
            );
        } else if (category === CATEGORIES.SHAPES) {
            return (
                <div className={`shape-display ${currentItem.shapeClass}`}></div>
            );
        } else {
            // Numbers and Alphabets
            return (
                <div className="text-display-box">
                    {currentItem}
                </div>
            );
        }
    };

    const renderOption = (option, index) => {
        const label = typeof option === 'object' ? option.name : option;

        let optionClass = "game-option-btn";
        if (feedback && typeof currentItem === 'object' ? option.name === currentItem.name : option === currentItem) {
            optionClass += " correct-anim";
        }

        return (
            <button
                key={index}
                className={optionClass}
                onClick={() => handleOptionClick(option)}
                disabled={feedback !== null}
            >
                {label}
            </button>
        );
    };

    if (!category) {
        return (
            <div className="game-container animate-fade-in">
                <button className="btn-secondary mb-4 flex align-center gap-2" onClick={onBack}>
                    <ArrowLeft size={18} /> Back to Hub
                </button>
                <div className="text-center mb-6">
                    <h2>Identifying Game</h2>
                    <p>Select a category to start practicing.</p>
                </div>

                <div className="category-grid">
                    <button className="game-category-card" onClick={() => setCategory(CATEGORIES.ALPHABET)}>
                        <h3>Aa</h3>
                        <p>Alphabets</p>
                    </button>
                    <button className="game-category-card" onClick={() => setCategory(CATEGORIES.NUMBERS)}>
                        <h3>123</h3>
                        <p>Numbers</p>
                    </button>
                    <button className="game-category-card" onClick={() => setCategory(CATEGORIES.COLORS)}>
                        <div className="color-swatches">
                            <span style={{ background: '#ef4444' }}></span>
                            <span style={{ background: '#3b82f6' }}></span>
                            <span style={{ background: '#22c55e' }}></span>
                        </div>
                        <p>Colors</p>
                    </button>
                    <button className="game-category-card" onClick={() => setCategory(CATEGORIES.SHAPES)}>
                        <div className="shape-mini-icons">
                            <div className="mini-circle"></div>
                            <div className="mini-square"></div>
                            <div className="mini-triangle"></div>
                        </div>
                        <p>Shapes</p>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="game-container animate-fade-in">
            <div className="flex justify-between align-center mb-6">
                <button className="btn-icon" onClick={() => setCategory(null)}>
                    <ArrowLeft size={24} />
                </button>
                <div className="score-badge">
                    Score: {score}
                </div>
            </div>

            <div className="game-play-area">
                <div className="question-header">
                    <h3>Identify the {category.slice(0, -1)}</h3>
                </div>

                <div className="display-area my-8 flex justify-center">
                    {renderDisplayItem()}
                </div>

                <div className="options-grid">
                    {options.map((option, index) => renderOption(option, index))}
                </div>

                {feedback && (
                    <div className={`feedback-message ${feedback}`}>
                        {feedback === 'correct' ? (
                            <><CheckCircle size={24} /> Correct!</>
                        ) : (
                            <><XCircle size={24} /> Try again next time!</>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
