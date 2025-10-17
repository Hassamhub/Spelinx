'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20
const INITIAL_BOARD = Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0))

// Tetris pieces (tetrominoes)
const TETROMINOES = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    color: 'cyan'
  },
  O: {
    shape: [
      [1, 1],
      [1, 1]
    ],
    color: 'yellow'
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: 'purple'
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0]
    ],
    color: 'green'
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0]
    ],
    color: 'red'
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: 'blue'
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: 'orange'
  }
}

type TetrominoType = keyof typeof TETROMINOES

interface Piece {
  shape: number[][]
  color: string
  x: number
  y: number
}

export default function TetrisGame() {
  const [board, setBoard] = useState<number[][]>(INITIAL_BOARD)
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null)
  const [nextPiece, setNextPiece] = useState<Piece | null>(null)
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [lines, setLines] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const gameLoopRef = useRef<NodeJS.Timeout>()

  const generatePiece = (type?: TetrominoType): Piece => {
    const types = Object.keys(TETROMINOES) as TetrominoType[]
    const randomType = type || types[Math.floor(Math.random() * types.length)]
    const tetromino = TETROMINOES[randomType]

    return {
      shape: tetromino.shape.map(row => [...row]),
      color: tetromino.color,
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(tetromino.shape[0].length / 2),
      y: 0
    }
  }

  const rotatePiece = (piece: Piece): Piece => {
    const rotated = piece.shape[0].map((_, index) =>
      piece.shape.map(row => row[index]).reverse()
    )

    return {
      ...piece,
      shape: rotated
    }
  }

  const isValidMove = (piece: Piece, board: number[][], newX?: number, newY?: number): boolean => {
    const x = newX !== undefined ? newX : piece.x
    const y = newY !== undefined ? newY : piece.y

    for (let py = 0; py < piece.shape.length; py++) {
      for (let px = 0; px < piece.shape[py].length; px++) {
        if (piece.shape[py][px] !== 0) {
          const newX = x + px
          const newY = y + py

          if (
            newX < 0 ||
            newX >= BOARD_WIDTH ||
            newY >= BOARD_HEIGHT ||
            (newY >= 0 && board[newY][newX] !== 0)
          ) {
            return false
          }
        }
      }
    }
    return true
  }

  const placePiece = (piece: Piece, board: number[][]): number[][] => {
    const newBoard = board.map(row => [...row])

    for (let py = 0; py < piece.shape.length; py++) {
      for (let px = 0; px < piece.shape[py].length; px++) {
        if (piece.shape[py][px] !== 0) {
          const y = piece.y + py
          const x = piece.x + px
          if (y >= 0) {
            newBoard[y][x] = 1 // Place piece
          }
        }
      }
    }

    return newBoard
  }

  const clearLines = (board: number[][]): { newBoard: number[][], linesCleared: number } => {
    const newBoard = [...board]
    let linesCleared = 0

    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (newBoard[y].every(cell => cell !== 0)) {
        newBoard.splice(y, 1)
        newBoard.unshift(Array(BOARD_WIDTH).fill(0))
        linesCleared++
        y++ // Check the same line again
      }
    }

    return { newBoard, linesCleared }
  }

  const movePiece = (direction: 'left' | 'right' | 'down') => {
    if (!currentPiece || gameOver || isPaused) return

    let newX = currentPiece.x
    let newY = currentPiece.y

    switch (direction) {
      case 'left':
        newX -= 1
        break
      case 'right':
        newX += 1
        break
      case 'down':
        newY += 1
        break
    }

    if (isValidMove(currentPiece, board, newX, newY)) {
      setCurrentPiece({ ...currentPiece, x: newX, y: newY })
    } else if (direction === 'down') {
      // Piece can't move down, place it
      const newBoard = placePiece(currentPiece, board)
      const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard)

      setBoard(clearedBoard)
      setLines(prev => prev + linesCleared)
      setScore(prev => prev + linesCleared * 100 * level)

      // Spawn next piece
      setCurrentPiece(nextPiece)
      setNextPiece(generatePiece())

      // Check game over
      if (!isValidMove(nextPiece!, clearedBoard, nextPiece!.x, nextPiece!.y)) {
        setGameOver(true)
      }
    }
  }

  const rotateCurrentPiece = () => {
    if (!currentPiece || gameOver || isPaused) return

    const rotated = rotatePiece(currentPiece)
    if (isValidMove(rotated, board)) {
      setCurrentPiece(rotated)
    }
  }

  const dropPiece = () => {
    if (!currentPiece || gameOver || isPaused) return

    let newY = currentPiece.y
    while (isValidMove(currentPiece, board, currentPiece.x, newY + 1)) {
      newY++
    }

    setCurrentPiece({ ...currentPiece, y: newY })
    movePiece('down') // This will place the piece
  }

  const resetGame = () => {
    setBoard(INITIAL_BOARD)
    setCurrentPiece(generatePiece())
    setNextPiece(generatePiece())
    setScore(0)
    setLevel(1)
    setLines(0)
    setGameOver(false)
    setIsPaused(false)
  }

  const togglePause = () => {
    if (gameOver) return
    setIsPaused(!isPaused)
  }

  // Game loop
  useEffect(() => {
    if (gameOver || isPaused || !currentPiece) return

    const speed = Math.max(50, 1000 - (level - 1) * 50)
    gameLoopRef.current = setInterval(() => {
      movePiece('down')
    }, speed)

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
      }
    }
  }, [currentPiece, gameOver, isPaused, level])

  // Initialize game
  useEffect(() => {
    resetGame()
  }, [])

  // Update level
  useEffect(() => {
    setLevel(Math.floor(lines / 10) + 1)
  }, [lines])

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          movePiece('left')
          break
        case 'ArrowRight':
          e.preventDefault()
          movePiece('right')
          break
        case 'ArrowDown':
          e.preventDefault()
          movePiece('down')
          break
        case 'ArrowUp':
        case ' ': // Spacebar for rotation
          e.preventDefault()
          rotateCurrentPiece()
          break
        case 'Enter':
          e.preventDefault()
          dropPiece()
          break
        case 'p':
        case 'P':
          e.preventDefault()
          togglePause()
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentPiece, board, gameOver, isPaused])

  const getCellColor = (value: number, pieceColor?: string) => {
    if (value === 1) return pieceColor || 'gray'
    return 'transparent'
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDarkMode
        ? 'bg-gradient-to-br from-spelinx-dark via-spelinx-gray to-spelinx-dark'
        : 'bg-gradient-to-br from-white via-gray-50 to-gray-100'
    }`}>
      <Header isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

      <div className="container mx-auto px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-spelinx-primary to-spelinx-secondary bg-clip-text text-transparent mb-4">
              Tetris
            </h1>
            <p className="text-xl text-gray-400">
              Classic block-stacking game - arrange pieces to clear lines!
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Game Board */}
            <div className="flex-1">
              <div className="glass-premium rounded-2xl p-6 border border-white/20">
                <div className="flex justify-center mb-4">
                  <div className="grid gap-0 border-2 border-white/20 rounded-lg overflow-hidden">
                    {board.map((row, y) =>
                      row.map((cell, x) => {
                        const isCurrentPiece = currentPiece &&
                          y >= currentPiece.y &&
                          y < currentPiece.y + currentPiece.shape.length &&
                          x >= currentPiece.x &&
                          x < currentPiece.x + currentPiece.shape[0].length &&
                          currentPiece.shape[y - currentPiece.y]?.[x - currentPiece.x] === 1

                        return (
                          <div
                            key={`${x}-${y}`}
                            className={`w-6 h-6 border border-gray-700 ${
                              isCurrentPiece
                                ? `bg-${currentPiece.color}-500`
                                : cell === 1
                                ? 'bg-gray-600'
                                : 'bg-black/50'
                            }`}
                          />
                        )
                      })
                    )}
                  </div>
                </div>

                {/* Game Controls */}
                <div className="flex justify-center gap-4 mb-4">
                  <button
                    onClick={() => movePiece('left')}
                    disabled={gameOver || isPaused}
                    className="px-4 py-2 bg-spelinx-primary hover:bg-spelinx-primary/80 rounded-lg text-white font-semibold transition-colors disabled:opacity-50"
                  >
                    ←
                  </button>
                  <button
                    onClick={rotateCurrentPiece}
                    disabled={gameOver || isPaused}
                    className="px-4 py-2 bg-spelinx-secondary hover:bg-spelinx-secondary/80 rounded-lg text-white font-semibold transition-colors disabled:opacity-50"
                  >
                    ↻
                  </button>
                  <button
                    onClick={() => movePiece('right')}
                    disabled={gameOver || isPaused}
                    className="px-4 py-2 bg-spelinx-primary hover:bg-spelinx-primary/80 rounded-lg text-white font-semibold transition-colors disabled:opacity-50"
                  >
                    →
                  </button>
                </div>

                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => movePiece('down')}
                    disabled={gameOver || isPaused}
                    className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-white font-semibold transition-colors disabled:opacity-50"
                  >
                    ↓
                  </button>
                  <button
                    onClick={dropPiece}
                    disabled={gameOver || isPaused}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-semibold transition-colors disabled:opacity-50"
                  >
                    🚀 Drop
                  </button>
                </div>
              </div>
            </div>

            {/* Game Info */}
            <div className="lg:w-80">
              <div className="glass-premium rounded-2xl p-6 border border-white/20 mb-6">
                <h3 className="text-xl font-bold text-white mb-4">Game Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Score:</span>
                    <span className="text-spelinx-accent font-bold">{score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Level:</span>
                    <span className="text-spelinx-primary font-bold">{level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Lines:</span>
                    <span className="text-spelinx-secondary font-bold">{lines}</span>
                  </div>
                </div>
              </div>

              {/* Next Piece */}
              {nextPiece && (
                <div className="glass-premium rounded-2xl p-6 border border-white/20 mb-6">
                  <h3 className="text-xl font-bold text-white mb-4">Next Piece</h3>
                  <div className="flex justify-center">
                    <div className="grid gap-0">
                      {nextPiece.shape.map((row, y) => (
                        <div key={y} className="flex">
                          {row.map((cell, x) => (
                            <div
                              key={x}
                              className={`w-4 h-4 border border-gray-700 ${
                                cell === 1 ? `bg-${nextPiece.color}-500` : 'bg-transparent'
                              }`}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="glass-premium rounded-2xl p-6 border border-white/20">
                <div className="space-y-3">
                  <button
                    onClick={togglePause}
                    disabled={gameOver}
                    className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-lg text-white font-semibold transition-colors disabled:opacity-50"
                  >
                    {isPaused ? 'Resume' : 'Pause'}
                  </button>
                  <button
                    onClick={resetGame}
                    className="w-full px-4 py-2 bg-spelinx-primary hover:bg-spelinx-primary/80 rounded-lg text-white font-semibold transition-colors"
                  >
                    New Game
                  </button>
                </div>

                {gameOver && (
                  <div className="mt-4 text-center">
                    <h3 className="text-2xl font-bold text-red-400 mb-2">Game Over!</h3>
                    <p className="text-gray-300">Final Score: {score}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 glass rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">How to Play</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-300 mb-2">Controls:</h4>
                <ul className="text-gray-400 space-y-1 text-sm">
                  <li>• ← → Arrow keys: Move left/right</li>
                  <li>• ↓ Arrow key: Move down faster</li>
                  <li>• ↑ Arrow key or Spacebar: Rotate piece</li>
                  <li>• Enter: Drop piece instantly</li>
                  <li>• P: Pause/Resume game</li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-300 mb-2">Objective:</h4>
                <ul className="text-gray-400 space-y-1 text-sm">
                  <li>• Arrange falling pieces to create complete rows</li>
                  <li>• Complete rows disappear and give points</li>
                  <li>• Game speeds up as you clear more lines</li>
                  <li>• Try to achieve the highest score!</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}