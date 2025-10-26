'use client'

import { useState, useEffect, useCallback } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useSound } from '@/hooks/useSound'

const GRID_SIZE = 4
const INITIAL_GRID = Array(GRID_SIZE).fill(Array(GRID_SIZE).fill(0))

export default function Game2048() {
  const [grid, setGrid] = useState<number[][]>(INITIAL_GRID)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)

  // Sound effects
  const moveSound = useSound('/sounds/game-start.mp3', 0.3)
  const mergeSound = useSound('/sounds/game-win.mp3', 0.5)
  const gameOverSound = useSound('/sounds/game-lose.mp3')

  const initializeGame = useCallback(() => {
    const newGrid = Array(GRID_SIZE).fill(Array(GRID_SIZE).fill(0))
    addRandomTile(newGrid)
    addRandomTile(newGrid)
    setGrid(newGrid)
    setScore(0)
    setGameOver(false)
    setWon(false)
  }, [])

  const addRandomTile = (currentGrid: number[][]) => {
    const emptyCells = []
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (currentGrid[i][j] === 0) {
          emptyCells.push({ row: i, col: j })
        }
      }
    }
    if (emptyCells.length > 0) {
      const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)]
      currentGrid[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4
    }
  }

  const moveTiles = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameOver || won) return

    let newGrid = grid.map(row => [...row])
    let scoreIncrease = 0
    let moved = false

    const moveLeft = (row: number[]) => {
      const newRow = row.filter(val => val !== 0)
      for (let i = 0; i < newRow.length - 1; i++) {
        if (newRow[i] === newRow[i + 1]) {
          newRow[i] *= 2
          scoreIncrease += newRow[i]
          newRow[i + 1] = 0
          moved = true
        }
      }
      const filteredRow = newRow.filter(val => val !== 0)
      while (filteredRow.length < GRID_SIZE) {
        filteredRow.push(0)
      }
      return { row: filteredRow, moved: JSON.stringify(row) !== JSON.stringify(filteredRow) }
    }

    if (direction === 'left') {
      for (let i = 0; i < GRID_SIZE; i++) {
        const result = moveLeft(newGrid[i])
        newGrid[i] = result.row
        if (result.moved) moved = true
      }
    } else if (direction === 'right') {
      for (let i = 0; i < GRID_SIZE; i++) {
        const result = moveLeft([...newGrid[i]].reverse())
        newGrid[i] = result.row.reverse()
        if (result.moved) moved = true
      }
    } else if (direction === 'up') {
      for (let j = 0; j < GRID_SIZE; j++) {
        const column = newGrid.map(row => row[j])
        const result = moveLeft(column)
        for (let i = 0; i < GRID_SIZE; i++) {
          newGrid[i][j] = result.row[i]
        }
        if (result.moved) moved = true
      }
    } else if (direction === 'down') {
      for (let j = 0; j < GRID_SIZE; j++) {
        const column = newGrid.map(row => row[j]).reverse()
        const result = moveLeft(column)
        for (let i = 0; i < GRID_SIZE; i++) {
          newGrid[GRID_SIZE - 1 - i][j] = result.row[i]
        }
        if (result.moved) moved = true
      }
    }

    if (moved) {
      addRandomTile(newGrid)
      setGrid(newGrid)
      setScore(prev => prev + scoreIncrease)
      checkGameState(newGrid)
      try {
        moveSound.play?.()
      } catch (e) {
        // Ignore audio play errors
      }
    }
  }

  const checkGameState = (currentGrid: number[][]) => {
    // Check for 2048
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (currentGrid[i][j] === 2048) {
          setWon(true)
          return
        }
      }
    }

    // Check for possible moves
    const hasEmptyCells = currentGrid.some(row => row.includes(0))
    if (hasEmptyCells) return

    // Check for possible merges
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE - 1; j++) {
        if (currentGrid[i][j] === currentGrid[i][j + 1]) return
        if (currentGrid[j][i] === currentGrid[j + 1][i]) return
      }
    }

    setGameOver(true)
    try {
      gameOverSound.play?.()
    } catch (e) {
      // Ignore audio play errors
    }
  }

  const getTileColor = (value: number) => {
    const colors: { [key: number]: string } = {
      0: 'bg-gray-700',
      2: 'bg-gray-600 text-white',
      4: 'bg-gray-500 text-white',
      8: 'bg-orange-400 text-white',
      16: 'bg-orange-500 text-white',
      32: 'bg-red-400 text-white',
      64: 'bg-red-500 text-white',
      128: 'bg-yellow-400 text-black font-bold',
      256: 'bg-yellow-500 text-black font-bold',
      512: 'bg-green-400 text-black font-bold',
      1024: 'bg-blue-400 text-black font-bold',
      2048: 'bg-purple-500 text-white font-bold',
    }
    return colors[value] || 'bg-purple-600 text-white font-bold'
  }

  useEffect(() => {
    initializeGame()
  }, [initializeGame])

  // Touch controls for mobile
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    setTouchStart({ x: touch.clientX, y: touch.clientY })
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStart.x
    const deltaY = touch.clientY - touchStart.y
    const minSwipeDistance = 50

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > minSwipeDistance) {
        moveTiles(deltaX > 0 ? 'right' : 'left')
      }
    } else {
      if (Math.abs(deltaY) > minSwipeDistance) {
        moveTiles(deltaY > 0 ? 'down' : 'up')
      }
    }
  }

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          moveTiles('left')
          break
        case 'ArrowRight':
          e.preventDefault()
          moveTiles('right')
          break
        case 'ArrowUp':
          e.preventDefault()
          moveTiles('up')
          break
        case 'ArrowDown':
          e.preventDefault()
          moveTiles('down')
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [grid, gameOver, won])

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
              2048 Game
            </h1>
            <p className="text-xl text-gray-400">
              Combine tiles to reach 2048! Use arrow keys or buttons to move tiles.
            </p>
          </div>

          <div className="glass-premium rounded-2xl p-8 border border-white/20">
            {/* Score */}
            <div className="flex justify-center mb-6">
              <div className="text-2xl font-bold text-white">
                Score: <span className="text-spelinx-accent">{score}</span>
              </div>
            </div>

            {/* Game Board */}
            <div className="flex justify-center mb-6">
              <div
                className="grid grid-cols-4 gap-2 p-4 bg-gray-800 rounded-lg touch-none max-w-md w-full"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                {grid.map((row, i) =>
                  row.map((cell, j) => (
                    <div
                      key={`${i}-${j}`}
                      className={`w-16 h-16 flex items-center justify-center rounded-lg text-lg font-bold transition-all duration-200 ${getTileColor(cell)}`}
                    >
                      {cell !== 0 && cell}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4 mb-6">
              <button
                type="button"
                onClick={() => moveTiles('up')}
                disabled={gameOver || won}
                className="px-4 py-2 bg-spelinx-primary hover:bg-spelinx-primary/80 rounded-lg text-white font-semibold transition-colors disabled:opacity-50"
              >
                ↑
              </button>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => moveTiles('left')}
                  disabled={gameOver || won}
                  className="px-4 py-2 bg-spelinx-primary hover:bg-spelinx-primary/80 rounded-lg text-white font-semibold transition-colors disabled:opacity-50"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => moveTiles('down')}
                  disabled={gameOver || won}
                  className="px-4 py-2 bg-spelinx-primary hover:bg-spelinx-primary/80 rounded-lg text-white font-semibold transition-colors disabled:opacity-50"
                >
                  ↓
                </button>
              </div>
              <button
                type="button"
                onClick={() => moveTiles('right')}
                disabled={gameOver || won}
                className="px-4 py-2 bg-spelinx-primary hover:bg-spelinx-primary/80 rounded-lg text-white font-semibold transition-colors disabled:opacity-50"
              >
                →
              </button>
            </div>

            {/* Game Status */}
            <div className="text-center">
              {won && (
                <div className="mb-4">
                  <h2 className="text-3xl font-bold text-spelinx-accent mb-4">🎉 You Win! 🎉</h2>
                  <p className="text-xl text-gray-300 mb-4">You reached 2048!</p>
                </div>
              )}

              {gameOver && !won && (
                <div className="mb-4">
                  <h2 className="text-3xl font-bold text-red-400 mb-4">Game Over!</h2>
                  <p className="text-xl text-gray-300 mb-4">No more moves available</p>
                </div>
              )}

              <button
                onClick={initializeGame}
                className="px-8 py-3 bg-spelinx-primary hover:bg-spelinx-primary/80 rounded-lg text-white font-semibold transition-colors"
              >
                New Game
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 glass rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">How to Play</h3>
            <ul className="text-gray-300 space-y-2">
              <li>• Use arrow keys to move all tiles in that direction (desktop)</li>
              <li>• Swipe on the game board to move tiles (mobile)</li>
              <li>• When two tiles with the same number touch, they merge into one</li>
              <li>• Every move adds a new tile (2 or 4) to the board</li>
              <li>• Try to reach the 2048 tile!</li>
              <li>• The game ends when the board is full and no moves are possible</li>
            </ul>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
