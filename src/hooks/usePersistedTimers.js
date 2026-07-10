import { useCallback, useEffect, useRef, useState } from 'react'
import { playChime, unlockAudio } from '../lib/sound'
import {
  createTimer,
  loadTimers,
  pauseTimer,
  resetTimer,
  saveTimers,
  setTimerDuration,
  startTimer,
  tickTimer,
} from '../lib/timerStorage'

export function usePersistedTimers() {
  const [timers, setTimers] = useState(() => loadTimers())
  const [, setTick] = useState(0)
  const hasRunning = timers.some((timer) => timer.status === 'running')

  const persist = useCallback((updater) => {
    setTimers((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveTimers(next)
      return next
    })
  }, [])

  const updateTimer = useCallback(
    (id, updater) => {
      persist((prev) =>
        prev.map((timer) => (timer.id === id ? updater(timer) : timer)),
      )
    },
    [persist],
  )

  const addCountdown = useCallback(() => {
    persist((prev) => [...prev, createTimer()])
  }, [persist])

  const addStopwatch = useCallback(() => {
    persist((prev) => [
      ...prev,
      createTimer({ label: 'Stopwatch', mode: 'stopwatch', duration: 0, remainingSeconds: 0 }),
    ])
  }, [persist])

  const removeTimer = useCallback(
    (id) => {
      persist((prev) => prev.filter((timer) => timer.id !== id))
    },
    [persist],
  )

  const start = useCallback(
    (id) => {
      unlockAudio()
      updateTimer(id, startTimer)
    },
    [updateTimer],
  )

  const pause = useCallback(
    (id) => updateTimer(id, pauseTimer),
    [updateTimer],
  )

  const reset = useCallback(
    (id) => updateTimer(id, resetTimer),
    [updateTimer],
  )

  const setDuration = useCallback(
    (id, duration) => updateTimer(id, (timer) => setTimerDuration(timer, duration)),
    [updateTimer],
  )

  const setLabel = useCallback(
    (id, label) => updateTimer(id, (timer) => ({ ...timer, label })),
    [updateTimer],
  )

  const resetCompletedCounts = useCallback(() => {
    persist((prev) =>
      prev.map((timer) =>
        timer.mode === 'countdown'
          ? { ...timer, completedCount: 0 }
          : timer,
      ),
    )
  }, [persist])

  const hasCompletedCounts = timers.some(
    (timer) => timer.mode === 'countdown' && (timer.completedCount ?? 0) > 0,
  )

  const prevStatusesRef = useRef(null)

  useEffect(() => {
    const prevStatuses = prevStatusesRef.current
    if (
      prevStatuses &&
      timers.some(
        (timer) =>
          timer.status === 'finished' &&
          prevStatuses.get(timer.id) === 'running',
      )
    ) {
      playChime()
    }
    prevStatusesRef.current = new Map(
      timers.map((timer) => [timer.id, timer.status]),
    )
  }, [timers])

  useEffect(() => {
    if (!hasRunning) return

    const intervalId = setInterval(() => {
      setTimers((prev) => {
        let changed = false
        const next = prev.map((timer) => {
          const updated = tickTimer(timer)
          if (updated !== timer) changed = true
          return updated
        })
        if (changed) saveTimers(next)
        return changed ? next : prev
      })
      setTick((n) => n + 1)
    }, 1000)

    return () => clearInterval(intervalId)
  }, [hasRunning])

  return {
    timers,
    addCountdown,
    addStopwatch,
    removeTimer,
    start,
    pause,
    reset,
    setDuration,
    setLabel,
    resetCompletedCounts,
    hasCompletedCounts,
  }
}
