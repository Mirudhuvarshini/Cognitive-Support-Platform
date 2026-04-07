import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Trophy } from 'lucide-react';

export default function PuzzleGame({ onBack, addPoints }) {
    const GRID_SIZE = 3;
    const [tiles, setTiles] = useState([]);
    const [isSolved, setIsSolved] = useState(false);
    const [moves, setMoves] = useState(0);

    // Initialize and shuffle
    useEffect(() => {
        initGame();
    }, []);

    const initGame = () => {
        let initialTiles = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => i);
        // Ensure solvable by shuffling using valid moves from solved state
        let currentTiles = [...initialTiles];
        let emptyIdx = 0; // 0 is empty block at top-left

        for (let i = 0; i < 100; i++) {
            const possibleMoves = getValidMoves(emptyIdx);
            const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];

            // Swap
            let temp = currentTiles[emptyIdx];
            currentTiles[emptyIdx] = currentTiles[randomMove];
            currentTiles[randomMove] = temp;
            emptyIdx = randomMove;
        }

        setTiles(currentTiles);
        setMoves(0);
        setIsSolved(false);
    };

    const getValidMoves = (emptyIndex) => {
        const moves = [];
        const row = Math.floor(emptyIndex / GRID_SIZE);
        const col = emptyIndex % GRID_SIZE;

        if (row > 0) moves.push(emptyIndex - GRID_SIZE); // Up
        if (row < GRID_SIZE - 1) moves.push(emptyIndex + GRID_SIZE); // Down
        if (col > 0) moves.push(emptyIndex - 1); // Left
        if (col < GRID_SIZE - 1) moves.push(emptyIndex + 1); // Right

        return moves;
    };

    const handleTileClick = (index) => {
        if (isSolved) return;

        const emptyIndex = tiles.indexOf(0);
        const validMoves = getValidMoves(emptyIndex);

        if (validMoves.includes(index)) {
            const newTiles = [...tiles];
            newTiles[emptyIndex] = newTiles[index];
            newTiles[index] = 0;

            setTiles(newTiles);
            setMoves(m => m + 1);
            checkWin(newTiles);
        }
    };

    const checkWin = (currentTiles) => {
        const isWinning = currentTiles.every((val, index) => {
            if (index === currentTiles.length - 1) return val === 0;
            return val === index + 1;
        });

        if (isWinning) {
            setIsSolved(true);
            addPoints(50); // Big reward for solving the puzzle
        }
    };

    return (
        <div className="game-container animate-fade-in">
            <div className="flex justify-between align-center mb-6">
                <button className="btn-secondary flex align-center gap-2" onClick={onBack}>
                    <ArrowLeft size={18} /> Back to Hub
                </button>
                <div className="score-badge">
                    Moves: {moves}
                </div>
            </div>

            <div className="text-center mb-6">
                <h2>Sliding Puzzle</h2>
                <p>Order the numbers from 1 to 8. The empty space should be at the end.</p>
            </div>

            <div className="puzzle-board-container flex justify-center">
                <div className="puzzle-grid">
                    {tiles.map((tile, index) => (
                        <div
                            key={index}
                            className={`puzzle-tile ${tile === 0 ? 'empty' : ''}`}
                            onClick={() => handleTileClick(index)}
                        >
                            {tile !== 0 && tile}
                        </div>
                    ))}
                </div>
            </div>

            {isSolved && (
                <div className="win-message-container mt-6 flex flex-col align-center text-center">
                    <Trophy size={48} color="#f59e0b" className="mb-2" />
                    <h3>Puzzle Solved!</h3>
                    <p>You completed it in {moves} moves. +50 Points!</p>
                    <button className="btn-primary mt-4 flex align-center gap-2" onClick={initGame}>
                        <RefreshCw size={18} /> Play Again
                    </button>
                </div>
            )}
        </div>
    );
}
