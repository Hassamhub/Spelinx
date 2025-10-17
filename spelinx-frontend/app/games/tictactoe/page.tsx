'use client'

import { useState, useEffect } from 'react'
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'

type Player = 'X' | 'O' | null
type Board = Player[]

export default function TicTacToeGame() {
  const [board, setBoard] = useState<Board>(Array(9).fill(null))
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X')
  const [winner, setWinner] = useState<Player>(null)
  const [gameOver, setGameOver] = useState(false)
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 })
  const [isDarkMode, setIsDarkMode] = useState(true)

  const checkWinner = (board: Board): Player => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ]

    for (let line of lines) {
      const [a, b, c] = line
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a]
      }
    }
    return null
  }

  const handleClick = (index: number) => {
    if (board[index] || winner || gameOver) return

    const newBoard = [...board]
    newBoard[index] = currentPlayer
    setBoard(newBoard)

    const gameWinner = checkWinner(newBoard)
    if (gameWinner) {
      setWinner(gameWinner)
      setScores(prev => ({ ...prev, [gameWinner]: prev[gameWinner] + 1 }))
      setGameOver(true)
    } else if (newBoard.every(cell => cell !== null)) {
      setScores(prev => ({ ...prev, draws: prev.draws + 1 }))
      setGameOver(true)
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X')
    }
  }

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setCurrentPlayer('X')
    setWinner(null)
    setGameOver(false)
  }

  const resetScores = () => {
    setScores({ X: 0, O: 0, draws: 0 })
    resetGame()
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDarkMode
        ? 'bg-gradient-to-br from-spelinx-dark via-spelinx-gray to-spelinx-dark'
        : 'bg-gradient-to-br from-white via-gray-50 to-gray-100'
    }`}>
      <Header isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

      <div className="container mx-auto px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-spelinx-primary to-spelinx-secondary bg-clip-text text-transparent mb-4">
              Tic Tac Toe
            </h1>
            <p className="text-xl text-gray-400">
              Classic strategy game - get three in a row to win!
            </p>
          </div>

          <div className="glass-premium rounded-2xl p-8 border border-white/20">
            {/* Scores */}
            <div className="flex justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-spelinx-primary">X</div>
                <div className="text-xl text-white">{scores.X}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-400">Draws</div>
                <div className="text-xl text-white">{scores.draws}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-spelinx-secondary">O</div>
                <div className="text-xl text-white">{scores.O}</div>
              </div>
            </div>

            {/* Game Status */}
            <div className="text-center mb-6">
              {winner ? (
                <h2 className="text-3xl font-bold text-spelinx-accent">
                  🎉 Player {winner} Wins! 🎉
                </h2>
              ) : gameOver ? (
                <h2 className="text-3xl font-bold text-gray-400">It's a Draw!</h2>
              ) : (
                <h2 className="text-2xl font-bold text-white">
                  Player <span className={currentPlayer === 'X' ? 'text-spelinx-primary' : 'text-spelinx-secondary'}>
                    {currentPlayer}
                  </span>'s Turn
                </h2>
              )}
            </div>

            {/* Game Board */}
            <div className="flex justify-center mb-8">
              <div className="grid grid-cols-3 gap-2 w-80 h-80">
                {board.map((cell, index) => (
                  <button
                    key={index}
                    onClick={() => handleClick(index)}
                    disabled={cell !== null || gameOver}
                    className="w-full h-full bg-black/50 border-2 border-white/30 rounded-lg text-4xl font-bold transition-all duration-200 hover:bg-white/10 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {cell && (
                      <span className={cell === 'X' ? 'text-spelinx-primary' : 'text-spelinx-secondary'}>
                        {cell}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4">
              <button
                onClick={resetGame}
                className="px-6 py-3 bg-spelinx-primary hover:bg-spelinx-primary/80 rounded-lg text-white font-semibold transition-colors"
              >
                New Game
              </button>
              <button
                onClick={resetScores}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg text-white font-semibold transition-colors"
              >
                Reset Scores
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 glass rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">How to Play</h3>
            <ul className="text-gray-300 space-y-2">
              <li>• Players take turns placing X's and O's on the board</li>
              <li>• Get three of your marks in a row (horizontal, vertical, or diagonal) to win</li>
              <li>• If all squares are filled without a winner, it's a draw</li>
              <li>• Think strategically and try to block your opponent!</li>
            </ul>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
