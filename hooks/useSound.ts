import { useRef, useCallback } from 'react'

export const useSound = (soundPath: string, volume: number = 0.5) => {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const play = useCallback(() => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(soundPath)
        audioRef.current.volume = volume
      }
      audioRef.current.currentTime = 0 // Reset to start
      audioRef.current.play().catch(() => {
        // Silently fail if audio can't play (user interaction required)
      })
    } catch (error) {
      console.warn('Audio playback failed:', error)
    }
  }, [soundPath, volume])

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }, [])

  return { play, stop }
}