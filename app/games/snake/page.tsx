'use client'

import { useState, useEffect, useCallback } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useSound } from '@/hooks/useSound'

const GRID_SIZE = 20
const INITIAL_SNAKE = [{ x: 10, y: 10 }]
const INITIAL_FOOD = { x: 15, y: 15 }
const INITIAL_DIRECTION = { x: 0, y: -1 }

export default function SnakeGame() {
  const [snake, setSnake] = useState(INITIAL_SNAKE)
  const [food, setFood] = useState(INITIAL_FOOD)
  const [direction, setDirection] = useState(INITIAL_DIRECTION)
  const [gameRunning, setGameRunning] = useState(false)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'master'>('easy')
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)

  // Sound effects
  const gameStartSound = useSound('/sounds/game-start.mp3')
  const foodEatenSound = useSound('/sounds/game-win.mp3')
  const gameOverSound = useSound('/sounds/game-lose.mp3')

  // Difficulty settings
  const getGameSpeed = () => {
    switch (difficulty) {
      case 'easy': return 200
      case 'medium': return 150
      case 'hard': return 100
      case 'master': return 70
      default: return 150
    }
  }

  const getScoreMultiplier = () => {
    switch (difficulty) {
      case 'easy': return 1
      case 'medium': return 2
      case 'hard': return 3
      case 'master': return 4
      default: return 1
    }
  }

  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    }
    setFood(newFood)
  }, [])

  const resetGame = () => {
    setSnake(INITIAL_SNAKE)
    setDirection(INITIAL_DIRECTION)
    setScore(0)
    setGameOver(false)
    setGameRunning(false)
    generateFood()
  }

  const resetGameWithDifficulty = () => {
    setSnake(INITIAL_SNAKE)
    setDirection(INITIAL_DIRECTION)
    setScore(0)
    setGameOver(false)
    setGameRunning(false)
    generateFood()
  }

  const moveSnake = useCallback(() => {
    if (!gameRunning || gameOver) return

    setSnake(currentSnake => {
      const newSnake = [...currentSnake]
      const head = { ...newSnake[0] }

      head.x += direction.x
      head.y += direction.y

      // Check wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setGameOver(true)
        setGameRunning(false)
        gameOverSound.play()
        return currentSnake
      }

      // Check self collision
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true)
        setGameRunning(false)
        gameOverSound.play()
        return currentSnake
      }

      newSnake.unshift(head)

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + (10 * getScoreMultiplier()))
        foodEatenSound.play()
        generateFood()
      } else {
        newSnake.pop()
      }

      return newSnake
    })
  }, [direction, food, gameRunning, gameOver, generateFood])

  const changeDirection = useCallback((newDirection: { x: number; y: number }) => {
    // Prevent reverse direction
    if (
      (direction.x === 1 && newDirection.x === -1) ||
      (direction.x === -1 && newDirection.x === 1) ||
      (direction.y === 1 && newDirection.y === -1) ||
      (direction.y === -1 && newDirection.y === 1)
    ) {
      return
    }
    setDirection(newDirection)
  }, [direction])

  // Touch controls for mobile
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
      // Horizontal swipe
      if (Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0) {
          changeDirection({ x: 1, y: 0 }) // Right
        } else {
          changeDirection({ x: -1, y: 0 }) // Left
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > minSwipeDistance) {
        if (deltaY > 0) {
          changeDirection({ x: 0, y: 1 }) // Down
        } else {
          changeDirection({ x: 0, y: -1 }) // Up
        }
      }
    }
  }


  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault()
          changeDirection({ x: 0, y: -1 })
          break
        case 'ArrowDown':
          e.preventDefault()
          changeDirection({ x: 0, y: 1 })
          break
        case 'ArrowLeft':
          e.preventDefault()
          changeDirection({ x: -1, y: 0 })
          break
        case 'ArrowRight':
          e.preventDefault()
          changeDirection({ x: 1, y: 0 })
          break
        case ' ':
          e.preventDefault()
          if (gameOver) {
            resetGame()
          } else {
            setGameRunning(prev => !prev)
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [changeDirection, gameOver])

  useEffect(() => {
    const gameInterval = setInterval(moveSnake, getGameSpeed())
    return () => clearInterval(gameInterval)
  }, [moveSnake, difficulty])

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
              Snake Game
            </h1>
            <p className="text-xl text-gray-400">
              Classic snake game - eat food, grow longer, avoid walls and yourself!
            </p>
          </div>

          <div className="glass-premium rounded-2xl p-8 border border-white/20">
            {/* Difficulty Selector */}
            <div className="flex justify-center mb-6">
              <div className="flex gap-2 bg-white/5 rounded-lg p-1">
                {['easy', 'medium', 'hard', 'master'].map((level) => (
                  <button
                    key={level}
                    onClick={() => {
                      setDifficulty(level as typeof difficulty)
                      resetGameWithDifficulty()
                    }}
                    disabled={gameRunning}
                    className={`px-4 py-2 rounded-md text-sm font-semibold capitalize transition-colors ${
                      difficulty === level
                        ? 'bg-spelinx-primary text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Game Stats */}
            <div className="flex justify-between items-center mb-6">
              <div className="text-2xl font-bold text-white">
                Score: <span className="text-spelinx-accent">{score}</span>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setGameRunning(!gameRunning)}
                  disabled={gameOver}
                  className="px-6 py-2 bg-spelinx-primary hover:bg-spelinx-primary/80 rounded-lg text-white font-semibold transition-colors disabled:opacity-50"
                >
                  {gameRunning ? 'Pause' : 'Start'}
                </button>
                <button
                  onClick={resetGame}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-white font-semibold transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Game Board */}
            <div className="flex justify-center mb-6">
              <div
                className="grid gap-0 border-2 border-spelinx-primary rounded-lg overflow-hidden touch-none"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                style={{
                  gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                  width: 'min(400px, 90vw)',
                  height: 'min(400px, 90vw)',
                  aspectRatio: '1'
                }}
              >
                {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
                  const x = index % GRID_SIZE
                  const y = Math.floor(index / GRID_SIZE)

                  const isSnakeHead = snake[0]?.x === x && snake[0]?.y === y
                  const isSnakeBody = snake.slice(1).some(segment => segment.x === x && segment.y === y)
                  const isFood = food.x === x && food.y === y

                  return (
                    <div
                      key={index}
                      className={`border border-gray-700 ${
                        isSnakeHead
                          ? 'bg-spelinx-primary'
                          : isSnakeBody
                          ? 'bg-spelinx-secondary'
                          : isFood
                          ? 'bg-red-500 rounded-full animate-pulse'
                          : 'bg-black/50'
                      }`}
                      style={{
                        width: 'calc(min(400px, 90vw) / 20)',
                        height: 'calc(min(400px, 90vw) / 20)',
                        boxShadow: isFood ? '0 0 10px rgba(239, 68, 68, 0.5)' : 'none'
                      }}
                    />
                  )
                })}
              </div>
            </div>

            {/* Controls */}
            <div className="text-center">
              <div className="text-gray-400 mb-4">
                <p>🖥️ Use arrow keys to move • Spacebar to start/pause/reset</p>
                <p>📱 Swipe on the game board to control the snake on mobile devices</p>
              </div>

              {gameOver && (
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-red-400 mb-4">Game Over!</h2>
                  <p className="text-xl text-gray-300 mb-4">Final Score: {score}</p>
                  <button
                    onClick={resetGame}
                    className="px-8 py-3 bg-spelinx-primary hover:bg-spelinx-primary/80 rounded-lg text-white font-semibold transition-colors"
                  >
                    Play Again
                  </button>
                </div>
              )}

              {!gameRunning && !gameOver && (
                <div className="text-center">
                  <p className="text-xl text-gray-300 mb-4">Press Start to begin!</p>
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 glass rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">How to Play</h3>
            <ul className="text-gray-300 space-y-2">
              <li>• Use arrow keys to control the snake (desktop)</li>
              <li>• Swipe on the game board to control the snake (mobile)</li>
              <li>• Eat the red food to grow and increase score</li>
              <li>• Avoid hitting walls or yourself</li>
              <li>• Press spacebar to start/pause the game</li>
              <li>• Try to achieve the highest score possible!</li>
            </ul>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
