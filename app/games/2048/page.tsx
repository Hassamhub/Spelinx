'use client'

import { useState, useEffect, useCallback } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const GRID_SIZE = 4
const INITIAL_GRID = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0))

export default function Game2048() {
  const [grid, setGrid] = useState<number[][]>(INITIAL_GRID)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)

  const generateRandomTile = (currentGrid: number[][]) => {
    const emptyCells: { x: number; y: number }[] = []
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (currentGrid[i][j] === 0) {
          emptyCells.push({ x: i, y: j })
        }
      }
    }

    if (emptyCells.length === 0) return currentGrid

    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)]
    const newGrid = currentGrid.map(row => [...row])
    newGrid[randomCell.x][randomCell.y] = Math.random() < 0.9 ? 2 : 4
    return newGrid
  }

  const initializeGame = () => {
    let newGrid = [...INITIAL_GRID.map(row => [...row])]
    newGrid = generateRandomTile(newGrid)
    newGrid = generateRandomTile(newGrid)
    setGrid(newGrid)
    setScore(0)
    setGameOver(false)
    setWon(false)
  }

  const moveLeft = (currentGrid: number[][]) => {
    const newGrid = currentGrid.map(row => [...row])
    let moved = false
    let newScore = score

    for (let i = 0; i < GRID_SIZE; i++) {
      // Compress
      const compressed = newGrid[i].filter(val => val !== 0)

      // Merge
      for (let j = 0; j < compressed.length - 1; j++) {
        if (compressed[j] === compressed[j + 1]) {
          compressed[j] *= 2
          newScore += compressed[j]
          compressed[j + 1] = 0
          moved = true
        }
      }

      // Compress again
      const finalCompressed = compressed.filter(val => val !== 0)

      // Fill with zeros
      while (finalCompressed.length < GRID_SIZE) {
        finalCompressed.push(0)
      }

      // Check if moved
      if (JSON.stringify(newGrid[i]) !== JSON.stringify(finalCompressed)) {
        moved = true
      }

      newGrid[i] = finalCompressed
    }

    if (moved) {
      setScore(newScore)
      const gridWithNewTile = generateRandomTile(newGrid)
      setGrid(gridWithNewTile)
      checkGameState(gridWithNewTile)
    }

    return moved
  }

  const rotateGrid = (grid: number[][]) => {
    const rotated = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0))
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        rotated[j][GRID_SIZE - 1 - i] = grid[i][j]
      }
    }
    return rotated
  }

  const move = (direction: string) => {
    if (gameOver || won) return

    let newGrid = grid.map(row => [...row])
    let moved = false

    switch (direction) {
      case 'left':
        moved = moveLeft(newGrid)
        break
      case 'right':
        newGrid = rotateGrid(rotateGrid(newGrid))
        moved = moveLeft(newGrid)
        newGrid = rotateGrid(rotateGrid(newGrid))
        break
      case 'up':
        newGrid = rotateGrid(rotateGrid(rotateGrid(newGrid)))
        moved = moveLeft(newGrid)
        newGrid = rotateGrid(newGrid)
        break
      case 'down':
        newGrid = rotateGrid(newGrid)
        moved = moveLeft(newGrid)
        newGrid = rotateGrid(rotateGrid(rotateGrid(newGrid)))
        break
    }

    if (moved) {
      setGrid(newGrid)
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

    // Check if moves are possible
    const hasEmptyCells = currentGrid.some(row => row.includes(0))
    if (hasEmptyCells) return

    // Check if merges are possible
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE - 1; j++) {
        if (currentGrid[i][j] === currentGrid[i][j + 1] ||
            currentGrid[j][i] === currentGrid[j + 1][i]) {
          return
        }
      }
    }

    setGameOver(true)
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
  }, [])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          move('left')
          break
        case 'ArrowRight':
          e.preventDefault()
          move('right')
          break
        case 'ArrowUp':
          e.preventDefault()
          move('up')
          break
        case 'ArrowDown':
          e.preventDefault()
          move('down')
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
              Combine tiles to reach 2048! Use arrow keys to move tiles.
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
              <div className="grid grid-cols-4 gap-2 p-4 bg-gray-800 rounded-lg">
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
                onClick={() => move('up')}
                disabled={gameOver || won}
                className="px-4 py-2 bg-spelinx-primary hover:bg-spelinx-primary/80 rounded-lg text-white font-semibold transition-colors disabled:opacity-50"
              >
                ↑
              </button>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => move('left')}
                  disabled={gameOver || won}
                  className="px-4 py-2 bg-spelinx-primary hover:bg-spelinx-primary/80 rounded-lg text-white font-semibold transition-colors disabled:opacity-50"
                >
                  ←
                </button>
                <button
                  onClick={() => move('down')}
                  disabled={gameOver || won}
                  className="px-4 py-2 bg-spelinx-primary hover:bg-spelinx-primary/80 rounded-lg text-white font-semibold transition-colors disabled:opacity-50"
                >
                  ↓
                </button>
              </div>
              <button
                onClick={() => move('right')}
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
              <li>• Use arrow keys to move all tiles in that direction</li>
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
