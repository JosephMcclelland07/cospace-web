"use client";

import { useState } from 'react';
import styles from './Game.module.css';

type SquareValue = 'X' | 'O' | null;

interface SquareProps {
  value: SquareValue;
  onSquareClick: () => void;
}

interface BoardProps {
  xIsNext: boolean;
  squares: SquareValue[];
  onPlay: (squares: SquareValue[]) => void;
}

function Square({value, onSquareClick}: SquareProps) {
  return (
    <button type="button" className={styles.square} aria-label={value ? `Square ${value}` : 'Empty square'} onClick={onSquareClick}>
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay }: BoardProps) {
  function handleClick(index: number) {
    if (calculateWinner(squares) || squares[index]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[index] = 'X';
    } else {
      nextSquares[index] = 'O';
    }
    onPlay(nextSquares);
  }

  const winner = calculateWinner(squares);
  let status;
  if (winner) {
    status = 'Winner: ' + winner;
  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  }

  return (
    <>
      <div className={styles.status} role="status">{status}</div>
      <div className={styles.boardRow}>
        <Square value={squares[0]} onSquareClick={() => handleClick(0)} />
        <Square value={squares[1]} onSquareClick={() => handleClick(1)} />
        <Square value={squares[2]} onSquareClick={() => handleClick(2)} />
      </div>
      <div className={styles.boardRow}>
        <Square value={squares[3]} onSquareClick={() => handleClick(3)} />
        <Square value={squares[4]} onSquareClick={() => handleClick(4)} />
        <Square value={squares[5]} onSquareClick={() => handleClick(5)} />
      </div>
      <div className={styles.boardRow}>
        <Square value={squares[6]} onSquareClick={() => handleClick(6)} />
        <Square value={squares[7]} onSquareClick={() => handleClick(7)} />
        <Square value={squares[8]} onSquareClick={() => handleClick(8)} />
      </div>
    </>
  );
}

export default function Game() {
  const [xIsNext, setXIsNext] = useState(true);
  const [history, setHistory] = useState<SquareValue[][]>([Array<SquareValue>(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares: SquareValue[]) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
    setXIsNext(!xIsNext);
  }

  function jumpTo(nextMove: number) {
    setCurrentMove(nextMove);
    setXIsNext(nextMove % 2 === 0);
  }

  const moves = history.map((_, move) => {
    let description;
    if (move > 0) {
      description = 'Go to move #' + move;
    } else {
      description = 'Go to game start';
    }
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  return (
    <section className={styles.game} aria-label="Tic-tac-toe">
      <div className={styles.gameBoard}>
        <h2>Tic-tac-toe</h2>
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className={styles.gameInfo}>
        <ol>{moves}</ol>
      </div>
    </section>
  );
}

function calculateWinner(squares: SquareValue[]) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let index = 0; index < lines.length; index++) {
    const [first, second, third] = lines[index];
    if (squares[first] && squares[first] === squares[second] && squares[first] === squares[third]) {
      return squares[first];
    }
  }
  return null;
}
