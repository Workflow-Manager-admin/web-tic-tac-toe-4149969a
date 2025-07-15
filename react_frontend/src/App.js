import React, { useState, useEffect, useRef } from "react";
import "./App.css";

// Theme Colors (Primary: #1976d2, Accent: #ff5722, Secondary: #ffffff)
const COLOR_PRIMARY = "#1976d2";
const COLOR_ACCENT = "#ff5722";
const COLOR_BG = "#ffffff";
const COLOR_GRID = "#ecedf1";
const COLOR_X = COLOR_PRIMARY;
const COLOR_O = COLOR_ACCENT;
const COLOR_HEADER = "#232f39";

// Sound effect files (data URI or use one-tone oscillator for simplicity)
function playTone(freq, duration = 120, vol = 0.12) {
  // Simple sound using Web Audio API
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    osc.type = "triangle";
    gain.gain.value = vol;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration / 1000);
    osc.onended = () => ctx.close();
  } catch (e) {
    // Audio failed (possibly due to user gesture requirements)
  }
}

// Utility - winning combos
const WIN_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6],            // diags
];

// PUBLIC_INTERFACE
function App() {
  // Board state: "X", "O", or null
  const [board, setBoard] = useState(Array(9).fill(null));
  // Player turn: "X" or "O"
  const [xIsNext, setXIsNext] = useState(true);
  // Game status: "playing" | "won" | "draw"
  const [status, setStatus] = useState("playing");
  // Winner: "X" | "O" | null
  const [winner, setWinner] = useState(null);
  // Cells in win line
  const [winLine, setWinLine] = useState([]);
  // Animation state for pop
  const [popIndexes, setPopIndexes] = useState([]);
  // Theme
  const [theme, setTheme] = useState("light");
  // Ref to prevent double sound on restart
  const didMount = useRef(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Check game result after each move
  useEffect(() => {
    const result = calculateWinner(board);
    if (result) {
      setWinner(result.player);
      setWinLine(result.line);
      setStatus("won");
      playTone(466, 200, 0.13);
    } else if (board.every(cell => cell !== null)) {
      setStatus("draw");
      setWinner(null);
      setWinLine([]);
      playTone(250, 90, 0.10);
    } else {
      setStatus("playing");
      setWinner(null);
      setWinLine([]);
    }
  }, [board]);

  // Play move sound on turn change
  useEffect(() => {
    if (didMount.current) {
      playTone(xIsNext ? 523 : 392, 120, 0.11);
    } else {
      didMount.current = true;
    }
  }, [xIsNext]);

  // Animate pop effect
  function markPop(index) {
    setPopIndexes([index]);
    setTimeout(() => setPopIndexes([]), 180);
  }

  // PUBLIC_INTERFACE
  function handleCellClick(idx) {
    if (board[idx] !== null || status !== "playing") return;
    const next = board.slice();
    next[idx] = xIsNext ? "X" : "O";
    setBoard(next);
    setXIsNext(!xIsNext);
    markPop(idx);
  }

  // PUBLIC_INTERFACE
  function handleRestart() {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setStatus("playing");
    setWinner(null);
    setWinLine([]);
    setPopIndexes([]);
    playTone(328, 80, 0.09);
  }

  // PUBLIC_INTERFACE
  function handleThemeToggle() {
    setTheme(prev => prev === "light" ? "dark" : "light");
    playTone(theme === "light" ? 315 : 415, 75, 0.07);
  }

  // Info displayed above the board
  let infoText;
  if (status === "playing") {
    infoText = (
      <span>
        <MarkText player={xIsNext ? "X" : "O"} />'s turn
      </span>
    );
  } else if (status === "won") {
    infoText = (
      <span>
        <MarkText player={winner} /> wins!
      </span>
    );
  } else {
    infoText = (
      <span>
        <span className="draw-text">Draw!</span>
      </span>
    );
  }

  return (
    <div className="main-bg" style={{ minHeight: "100vh", background: COLOR_BG, color: COLOR_HEADER }}>
      <div className="center-container">
        <header className="game-header">
          <h1 className="game-title">Tic Tac Toe</h1>
          <button className="theme-toggle-btn" onClick={handleThemeToggle}>
            {theme === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>
        </header>
        <div className="game-info" aria-live="polite">{infoText}</div>
        <GameBoard
          board={board}
          onCellClick={handleCellClick}
          winLine={winLine}
          popIndexes={popIndexes}
        />
        <div className="controls">
          <button className="btn" onClick={handleRestart}>
            {status === "playing" ? "Restart" : "New Game"}
          </button>
        </div>
        <footer className="footer">
          <span>
            <span className="credit">
              Modern Tic Tac Toe &mdash; Player vs Player &mdash; Minimal Design
            </span>
          </span>
        </footer>
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
function GameBoard({ board, onCellClick, winLine, popIndexes }) {
  return (
    <div
      className="board-grid"
      role="grid"
      aria-label="Tic Tac Toe Board"
    >
      {board.map((cell, i) => (
        <button
          key={i}
          className={
            "cell-btn" +
            (cell ? " filled" : "") +
            (winLine.includes(i) ? " win" : "") +
            (popIndexes.includes(i) ? " pop" : "")
          }
          onClick={() => onCellClick(i)}
          disabled={cell !== null || winLine.length > 0}
          aria-label={<MarkText player={cell} /> || "Empty"}
        >
          {cell && <MarkText player={cell} />}
        </button>
      ))}
    </div>
  );
}

// PUBLIC_INTERFACE
function MarkText({ player }) {
  // Style X and O differently
  if (player === "X") {
    return <span style={{ color: COLOR_X, fontWeight: 700 }}>X</span>;
  } else if (player === "O") {
    return <span style={{ color: COLOR_O, fontWeight: 700 }}>O</span>;
  }
  return null;
}

// Calculate winner helper (returns {player, line} or null)
function calculateWinner(squares) {
  for (const combo of WIN_COMBINATIONS) {
    const [a, b, c] = combo;
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c]
    ) {
      return { player: squares[a], line: combo };
    }
  }
  return null;
}

export default App;
