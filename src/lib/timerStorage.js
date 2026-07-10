export const STORAGE_KEY = 'timers-app-state'

export function createTimer(overrides = {}) {
  const duration = overrides.duration ?? overrides.initialSeconds ?? 300
  return {
    id: overrides.id ?? Date.now() + Math.random(),
    label: 'Timer',
    mode: 'countdown',
    duration,
    status: 'idle',
    remainingSeconds: duration,
    endsAt: null,
    startedAt: null,
    elapsedSeconds: 0,
    completedCount: 0,
    ...overrides,
    duration,
    remainingSeconds: overrides.remainingSeconds ?? duration,
  }
}

export function loadTimers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return [createTimer({ label: 'Focus' })]
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [createTimer({ label: 'Focus' })]
    }
    const hydrated = parsed.map((timer) => ({
      ...createTimer(timer),
      ...timer,
      completedCount: timer.completedCount ?? 0,
    })).map(hydrateTimer)
    if (JSON.stringify(hydrated) !== JSON.stringify(parsed)) {
      saveTimers(hydrated)
    }
    return hydrated
  } catch {
    return [createTimer({ label: 'Focus' })]
  }
}

export function saveTimers(timers) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(timers))
  } catch {
    // Ignore storage errors
  }
}

export function hydrateTimer(timer) {
  const now = Date.now()

  if (timer.mode === 'countdown') {
    if (timer.status === 'running' && timer.endsAt) {
      const remaining = Math.max(0, Math.ceil((timer.endsAt - now) / 1000))
      if (remaining === 0) {
        return {
          ...timer,
          status: 'finished',
          remainingSeconds: 0,
          endsAt: null,
          completedCount: (timer.completedCount ?? 0) + 1,
        }
      }
      return { ...timer, remainingSeconds: remaining }
    }
    return timer
  }

  return timer
}

export function getDisplaySeconds(timer) {
  if (timer.mode === 'countdown') {
    if (timer.status === 'running' && timer.endsAt) {
      return Math.max(0, Math.ceil((timer.endsAt - Date.now()) / 1000))
    }
    return timer.remainingSeconds ?? timer.duration
  }

  if (timer.status === 'running' && timer.startedAt) {
    return (
      (timer.elapsedSeconds ?? 0) +
      Math.floor((Date.now() - timer.startedAt) / 1000)
    )
  }
  return timer.elapsedSeconds ?? 0
}

export function getProgress(timer) {
  if (timer.mode !== 'countdown' || !timer.duration) return 0
  const remaining = getDisplaySeconds(timer)
  return (timer.duration - remaining) / timer.duration
}

export function startTimer(timer) {
  const now = Date.now()

  if (timer.mode === 'countdown') {
    let remaining = timer.remainingSeconds ?? timer.duration
    if (timer.status === 'finished' || remaining <= 0) {
      remaining = timer.duration
    }
    return {
      ...timer,
      status: 'running',
      remainingSeconds: remaining,
      endsAt: now + remaining * 1000,
      startedAt: now,
    }
  }

  return {
    ...timer,
    status: 'running',
    startedAt: now,
  }
}

export function pauseTimer(timer) {
  const now = Date.now()

  if (timer.mode === 'countdown') {
    const remaining =
      timer.status === 'running' && timer.endsAt
        ? Math.max(0, Math.ceil((timer.endsAt - now) / 1000))
        : timer.remainingSeconds

    return {
      ...timer,
      status: 'paused',
      remainingSeconds: remaining,
      endsAt: null,
      startedAt: null,
    }
  }

  const elapsed = getDisplaySeconds(timer)
  return {
    ...timer,
    status: 'paused',
    elapsedSeconds: elapsed,
    startedAt: null,
  }
}

export function resetTimer(timer) {
  if (timer.mode === 'countdown') {
    return {
      ...timer,
      status: 'idle',
      remainingSeconds: timer.duration,
      endsAt: null,
      startedAt: null,
    }
  }

  return {
    ...timer,
    status: 'idle',
    elapsedSeconds: 0,
    startedAt: null,
  }
}

export function setTimerDuration(timer, duration) {
  const value = Math.max(0, duration)
  if (timer.mode !== 'countdown' || timer.status !== 'idle') {
    return timer
  }
  return {
    ...timer,
    duration: value,
    remainingSeconds: value,
  }
}

export function tickTimer(timer) {
  if (timer.status !== 'running') return timer

  if (timer.mode === 'countdown' && timer.endsAt) {
    const remaining = Math.max(0, Math.ceil((timer.endsAt - Date.now()) / 1000))
    if (remaining === 0) {
      return {
        ...timer,
        status: 'finished',
        remainingSeconds: 0,
        endsAt: null,
        startedAt: null,
        completedCount: (timer.completedCount ?? 0) + 1,
      }
    }
    if (remaining === timer.remainingSeconds) return timer
    return { ...timer, remainingSeconds: remaining }
  }

  return timer
}
