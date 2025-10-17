'use client'

import { useState, useEffect } from 'react'
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'

// Sample crossword data
const CROSSWORD_DATA = {
  grid: [
    ['C', 'O', 'M', 'P', 'U', 'T', 'E', 'R'],
    ['O', '', '', '', '', '', '', ''],
    ['M', '', '', '', '', '', '', ''],
    ['P', '', '', '', '', '', '', ''],
    ['U', '', '', '', '', '', '', ''],
    ['T', '', '', '', '', '', '', ''],
    ['E', '', '', '', '', '', '', ''],
    ['R', '', '', '', '', '', '', '']
  ],
  clues: {
    across: [
      { number: 1, clue: 'Electronic device for processing data', answer: 'COMPUTER', startX: 0, startY: 0, length: 8 }
    ],
    down: [
      { number: 1, clue: 'Basic unit of computation', answer: 'BIT', startX: 0, startY: 0, length: 3 },
      { number: 2, clue: 'High-level programming language', answer: 'JAVA', startX: 2, startY: 0, length: 4 }
    ]
  }
}

export default function CrosswordGame() {
  const [grid, setGrid] = useState<string[][]>(CROSSWORD_DATA.grid)
  const [selectedCell, setSelectedCell] = useState<{ x: number; y: number } | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [completed, setCompleted] = useState(false)

  const handleCellClick = (x: number, y: number) => {
    if (CROSSWORD_DATA.grid[y][x] !== '') {
      setSelectedCell({ x, y })
    }
  }

  const handleKeyPress = (e: KeyboardEvent) => {
    if (!selectedCell) return

    const { x, y } = selectedCell
    if (e.key.length === 1 && e.key.match(/[a-zA-Z]/)) {
      const newGrid = grid.map(row => [...row])
      newGrid[y][x] = e.key.toUpperCase()
      setGrid(newGrid)

      // Auto-move to next cell
      const nextX = x + 1
      if (nextX < 8 && CROSSWORD_DATA.grid[y][nextX] !== '') {
        setSelectedCell({ x: nextX, y })
      }
    } else if (e.key === 'Backspace') {
      const newGrid = grid.map(row => [...row])
      newGrid[y][x] = ''
      setGrid(newGrid)

      // Move to previous cell
      const prevX = x - 1
      if (prevX >= 0 && CROSSWORD_DATA.grid[y][prevX] !== '') {
        setSelectedCell({ x: prevX, y })
      }
    }
  }

  const checkCompletion = () => {
    // Simple completion check
    const filledCells = grid.flat().filter(cell => cell !== '' && cell !== ' ').length
    const totalCells = CROSSWORD_DATA.grid.flat().filter(cell => cell !== '').length
    setCompleted(filledCells === totalCells)
  }

  const resetPuzzle = () => {
    setGrid(CROSSWORD_DATA.grid.map(row => row.map(cell => cell === '' ? '' : '')))
    setSelectedCell(null)
    setCompleted(false)
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [selectedCell])

  useEffect(() => {
    checkCompletion()
  }, [grid])

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
              Crossword Puzzle
            </h1>
            <p className="text-xl text-gray-400">
              Test your vocabulary and solve the puzzle!
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Crossword Grid */}
            <div className="flex-1">
              <div className="glass-premium rounded-2xl p-8 border border-white/20">
                <div className="flex justify-center mb-6">
                  <div className="grid grid-cols-8 gap-1">
                    {grid.map((row, y) =>
                      row.map((cell, x) => {
                        const isOriginal = CROSSWORD_DATA.grid[y][x] !== ''
                        const isSelected = selectedCell?.x === x && selectedCell?.y === y

                        return (
                          <div
                            key={`${x}-${y}`}
                            onClick={() => handleCellClick(x, y)}
                            className={`w-12 h-12 border-2 flex items-center justify-center text-lg font-bold cursor-pointer transition-all duration-200 ${
                              isOriginal
                                ? isSelected
                                  ? 'border-spelinx-primary bg-spelinx-primary/20 text-white'
                                  : 'border-white/30 bg-white/10 text-white hover:bg-white/20'
                                : 'border-gray-600 bg-gray-800'
                            }`}
                          >
                            {cell}
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <button
                    onClick={resetPuzzle}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg text-white font-semibold transition-colors"
                  >
                    Reset Puzzle
                  </button>
                  {completed && (
                    <div className="text-2xl font-bold text-spelinx-accent">
                      🎉 Puzzle Completed! 🎉
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Clues */}
            <div className="lg:w-80">
              <div className="glass-premium rounded-2xl p-6 border border-white/20 mb-6">
                <h3 className="text-xl font-bold text-white mb-4">Across</h3>
                <div className="space-y-3">
                  {CROSSWORD_DATA.clues.across.map((clue) => (
                    <div key={clue.number} className="text-gray-300">
                      <span className="font-bold text-spelinx-primary">{clue.number}.</span> {clue.clue}
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-premium rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">Down</h3>
                <div className="space-y-3">
                  {CROSSWORD_DATA.clues.down.map((clue) => (
                    <div key={clue.number} className="text-gray-300">
                      <span className="font-bold text-spelinx-primary">{clue.number}.</span> {clue.clue}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 glass rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">How to Play</h3>
            <ul className="text-gray-300 space-y-2">
              <li>• Click on a white cell to select it</li>
              <li>• Type letters using your keyboard</li>
              <li>• Use Backspace to erase letters</li>
              <li>• Arrow keys will automatically move to the next cell</li>
              <li>• Fill in all the words based on the clues provided</li>
              <li>• The puzzle is complete when all cells are filled!</li>
            </ul>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
