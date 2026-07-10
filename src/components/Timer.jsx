import { useId } from 'react'
import { formatTime } from '../hooks/useTimer'
import { getDisplaySeconds, getProgress } from '../lib/timerStorage'
import './Timer.css'

const PRESETS = [
  { label: '1m', seconds: 60 },
  { label: '5m', seconds: 300 },
  { label: '10m', seconds: 600 },
  { label: '25m', seconds: 1500 },
]

function parseDurationInput(value) {
  const parts = value.split(':').map((p) => parseInt(p, 10) || 0)
  if (parts.length === 1) return parts[0]
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  return parts[0] * 3600 + parts[1] * 60 + parts[2]
}

export default function Timer({
  timer,
  onRemove,
  onStart,
  onPause,
  onReset,
  onSetDuration,
  onSetLabel,
}) {
  const inputId = useId()
  const { id, label, mode, duration, status, completedCount } = timer

  const isRunning = status === 'running'
  const isFinished = status === 'finished'
  const canEdit = status === 'idle' && mode === 'countdown'
  const displaySeconds = getDisplaySeconds(timer)
  const ringProgress = mode === 'countdown' ? getProgress(timer) : 0

  const handleDurationChange = (e) => {
    onSetDuration(id, parseDurationInput(e.target.value))
  }

  return (
    <article
      className={`timer-card ${isFinished ? 'timer-card--finished' : ''} ${isRunning ? 'timer-card--running' : ''}`}
      data-timer-id={id}
    >
      <header className="timer-card__header">
        <input
          className="timer-card__name"
          type="text"
          value={label}
          onChange={(e) => onSetLabel(id, e.target.value)}
          placeholder="Timer name"
          aria-label="Timer name"
        />
        <button
          type="button"
          className="timer-card__remove"
          onClick={() => onRemove(id)}
          aria-label="Remove timer"
        >
          ×
        </button>
      </header>

      {mode === 'countdown' && (
        <p className="timer-card__completed" aria-live="polite">
          Completed{' '}
          <span className="timer-card__completed-count">{completedCount ?? 0}</span>
          {(completedCount ?? 0) === 1 ? ' time' : ' times'}
        </p>
      )}

      <div className="timer-card__display">
        <svg className="timer-card__ring" viewBox="0 0 120 120" aria-hidden="true">
          <circle className="timer-card__ring-bg" cx="60" cy="60" r="54" />
          <circle
            className="timer-card__ring-progress"
            cx="60"
            cy="60"
            r="54"
            style={{
              strokeDashoffset: 339.292 * (1 - ringProgress),
            }}
          />
        </svg>
        <span
          className={`timer-card__time ${isFinished ? 'timer-card__time--finished' : ''}`}
          role="timer"
          aria-live="polite"
        >
          {formatTime(displaySeconds)}
        </span>
        {isFinished && <span className="timer-card__done">Done!</span>}
      </div>

      {mode === 'countdown' && (
        <div className="timer-card__setup">
          <label className="timer-card__label" htmlFor={inputId}>
            Duration (mm:ss or hh:mm:ss)
          </label>
          <input
            id={inputId}
            key={`${id}-${duration}-${status}`}
            className="timer-card__duration"
            type="text"
            defaultValue={formatTime(duration)}
            disabled={!canEdit}
            onBlur={handleDurationChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.target.blur()
            }}
          />
          <div className="timer-card__presets">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                className="timer-card__preset"
                disabled={!canEdit}
                onClick={() => onSetDuration(id, preset.seconds)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="timer-card__controls">
        {!isRunning ? (
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => onStart(id)}
            disabled={mode === 'countdown' && displaySeconds <= 0 && !isFinished}
          >
            {isFinished ? 'Restart' : 'Start'}
          </button>
        ) : (
          <button type="button" className="btn btn--primary" onClick={() => onPause(id)}>
            Pause
          </button>
        )}
        <button
          type="button"
          className="btn btn--secondary"
          onClick={() => onReset(id)}
          disabled={status === 'idle'}
        >
          Reset
        </button>
      </div>
    </article>
  )
}
