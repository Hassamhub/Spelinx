'use client'

import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'

// Sample flag quiz data with actual flag images
const FLAGS_DATA = [
  { country: 'United States', flag: '🇺🇸', image: 'https://flagcdn.com/w320/us.png' },
  { country: 'United Kingdom', flag: '🇬🇧', image: 'https://flagcdn.com/w320/gb.png' },
  { country: 'France', flag: '🇫🇷', image: 'https://flagcdn.com/w320/fr.png' },
  { country: 'Germany', flag: '🇩🇪', image: 'https://flagcdn.com/w320/de.png' },
  { country: 'Japan', flag: '🇯🇵', image: 'https://flagcdn.com/w320/jp.png' },
  { country: 'Brazil', flag: '🇧🇷', image: 'https://flagcdn.com/w320/br.png' },
  { country: 'Canada', flag: '🇨🇦', image: 'https://flagcdn.com/w320/ca.png' },
  { country: 'Australia', flag: '🇦🇺', image: 'https://flagcdn.com/w320/au.png' },
  { country: 'India', flag: '🇮🇳', image: 'https://flagcdn.com/w320/in.png' },
  { country: 'China', flag: '🇨🇳', image: 'https://flagcdn.com/w320/cn.png' },
  { country: 'Russia', flag: '🇷🇺', image: 'https://flagcdn.com/w320/ru.png' },
  { country: 'Italy', flag: '🇮🇹', image: 'https://flagcdn.com/w320/it.png' },
  { country: 'Spain', flag: '🇪🇸', image: 'https://flagcdn.com/w320/es.png' },
  { country: 'Mexico', flag: '🇲🇽', image: 'https://flagcdn.com/w320/mx.png' },
  { country: 'South Korea', flag: '🇰🇷', image: 'https://flagcdn.com/w320/kr.png' }
]

export default function GuessTheFlagGame() {
  const [currentFlag, setCurrentFlag] = useState(FLAGS_DATA[0])
  const [options, setOptions] = useState<string[]>([])
  const [score, setScore] = useState(0)
  const [questionNumber, setQuestionNumber] = useState(1)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [gameOver, setGameOver] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'master'>('easy')

  // Difficulty settings - fewer options for harder difficulties
  const getOptionsCount = () => {
    switch (difficulty) {
      case 'easy': return 4
      case 'medium': return 6
      case 'hard': return 8
      case 'master': return 12
      default: return 4
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

  const generateQuestion = () => {
    const randomFlag = FLAGS_DATA[Math.floor(Math.random() * FLAGS_DATA.length)]
    const correctAnswer = randomFlag.country

    // Generate wrong answers based on difficulty
    const optionsCount = getOptionsCount()
    const wrongAnswers = FLAGS_DATA
      .filter(flag => flag.country !== correctAnswer)
      .sort(() => Math.random() - 0.5)
      .slice(0, optionsCount - 1) // -1 because we add the correct answer
      .map(flag => flag.country)

    const allOptions = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5)

    setCurrentFlag(randomFlag)
    setOptions(allOptions)
    setSelectedAnswer(null)
    setIsCorrect(null)
  }

  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswer) return

    setSelectedAnswer(answer)
    const correct = answer === currentFlag.country
    setIsCorrect(correct)

    if (correct) {
      setScore(prev => prev + (10 * getScoreMultiplier()))
    }

    // Next question after delay
    setTimeout(() => {
      if (questionNumber >= 10) {
        setGameOver(true)
      } else {
        setQuestionNumber(prev => prev + 1)
        generateQuestion()
      }
    }, 2000)
  }

  const resetGame = () => {
    setScore(0)
    setQuestionNumber(1)
    setGameOver(false)
    setSelectedAnswer(null)
    setIsCorrect(null)
    generateQuestion()
  }

  const resetGameWithDifficulty = () => {
    setScore(0)
    setQuestionNumber(1)
    setGameOver(false)
    setSelectedAnswer(null)
    setIsCorrect(null)
    generateQuestion()
  }

  useEffect(() => {
    generateQuestion()
  }, [])

  const getScoreMessage = () => {
    if (score >= 90) return '🏆 Excellent! You\'re a geography expert!'
    if (score >= 70) return '🌟 Great job! Well done!'
    if (score >= 50) return '👍 Good effort! Keep practicing!'
    return '📚 Keep learning about world flags!'
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
              Guess the Flag
            </h1>
            <p className="text-xl text-gray-400">
              Test your geography knowledge - identify the country flags!
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
                    disabled={questionNumber > 1}
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
            <div className="flex justify-between items-center mb-8">
              <div className="text-xl font-bold text-white">
                Question <span className="text-spelinx-accent">{questionNumber}</span> of 10
              </div>
              <div className="text-xl font-bold text-white">
                Score: <span className="text-spelinx-primary">{score}</span>
              </div>
            </div>

            {!gameOver ? (
              <>
                {/* Flag Display */}
                <div className="flex justify-center mb-8">
                  <div className="bg-white/10 rounded-2xl p-8 border border-white/20 overflow-hidden">
                    <img
                      src={currentFlag.image}
                      alt={`${currentFlag.country} flag`}
                      className="w-48 h-32 object-cover rounded-lg shadow-lg"
                    />
                  </div>
                </div>

                {/* Options */}
                <div className={`grid gap-4 mb-6 ${
                  options.length <= 4 ? 'grid-cols-1 md:grid-cols-2' :
                  options.length <= 6 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
                  options.length <= 8 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' :
                  'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'
                }`}>
                  {options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(option)}
                      disabled={selectedAnswer !== null}
                      className={`p-4 rounded-lg text-lg font-semibold transition-all duration-300 ${
                        selectedAnswer === null
                          ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                          : selectedAnswer === option
                          ? isCorrect
                            ? 'bg-green-500 text-white border border-green-400'
                            : 'bg-red-500 text-white border border-red-400'
                          : option === currentFlag.country && selectedAnswer !== null
                          ? 'bg-green-500 text-white border border-green-400'
                          : 'bg-white/10 text-white border border-white/20 opacity-50'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                {/* Feedback */}
                {selectedAnswer && (
                  <div className="text-center mb-6">
                    {isCorrect ? (
                      <div className="text-2xl font-bold text-green-400">
                        ✅ Correct! +10 points
                      </div>
                    ) : (
                      <div className="text-2xl font-bold text-red-400">
                        ❌ Wrong! The correct answer was {currentFlag.country}
                      </div>
                    )}
                  </div>
                )}

                {/* Progress Bar */}
                <div className="w-full bg-white/20 rounded-full h-3 mb-4">
                  <div
                    className="bg-spelinx-primary h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(questionNumber / 10) * 100}%` }}
                  />
                </div>
                <div className="text-center text-gray-400">
                  {questionNumber - 1}/10 questions completed
                </div>
              </>
            ) : (
              /* Game Over Screen */
              <div className="text-center">
                <div className="text-6xl mb-6">🎉</div>
                <h2 className="text-3xl font-bold text-white mb-4">Game Complete!</h2>
                <div className="text-2xl font-bold text-spelinx-accent mb-4">
                  Final Score: {score}/100
                </div>
                <div className="text-xl text-gray-300 mb-6">
                  {getScoreMessage()}
                </div>
                <button
                  onClick={resetGame}
                  className="px-8 py-4 bg-spelinx-primary hover:bg-spelinx-primary/80 rounded-lg text-white font-semibold transition-colors"
                >
                  Play Again
                </button>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-8 glass rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">How to Play</h3>
            <ul className="text-gray-300 space-y-2">
              <li>• Look at the flag displayed on screen</li>
              <li>• Choose the correct country name from the 4 options</li>
              <li>• Each correct answer gives you 10 points</li>
              <li>• Answer 10 questions to complete the game</li>
              <li>• Try to achieve the highest score possible!</li>
              <li>• Test your knowledge of world geography</li>
            </ul>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
