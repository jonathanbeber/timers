import Timer from './components/Timer'
import { usePersistedTimers } from './hooks/usePersistedTimers'
import './App.css'

export default function App() {
  const {
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
  } = usePersistedTimers()

  return (
    <div className="app">
      <header className="app__header">
        <h1>Timers</h1>
        <p className="app__subtitle">
          Timers keep running after you close the tab. Reload anytime to see
          accurate remaining time.
        </p>
      </header>

      <div className="app__actions">
        <button type="button" className="btn btn--primary" onClick={addCountdown}>
          + Countdown
        </button>
        <button type="button" className="btn btn--secondary" onClick={addStopwatch}>
          + Stopwatch
        </button>
        <button
          type="button"
          className="btn btn--secondary"
          onClick={resetCompletedCounts}
          disabled={!hasCompletedCounts}
        >
          Reset counts
        </button>
      </div>

      {timers.length === 0 ? (
        <div className="app__empty">
          <p>No timers yet. Add a countdown or stopwatch to get started.</p>
        </div>
      ) : (
        <div className="app__grid">
          {timers.map((timer) => (
            <Timer
              key={timer.id}
              timer={timer}
              onRemove={removeTimer}
              onStart={start}
              onPause={pause}
              onReset={reset}
              onSetDuration={setDuration}
              onSetLabel={setLabel}
            />
          ))}
        </div>
      )}
    </div>
  )
}
