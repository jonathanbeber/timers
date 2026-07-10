let audioContext = null

function getContext() {
  const Ctx = window.AudioContext || window.webkitAudioContext
  if (!Ctx) return null
  if (!audioContext) audioContext = new Ctx()
  return audioContext
}

export function unlockAudio() {
  const ctx = getContext()
  if (ctx && ctx.state === 'suspended') {
    ctx.resume()
  }
}

function playChime() {
  const ctx = getContext()
  if (!ctx) return
  const now = ctx.currentTime
  ;[880, 1320].forEach((frequency, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const startAt = now + i * 0.18
    osc.type = 'sine'
    osc.frequency.value = frequency
    gain.gain.setValueAtTime(0.0001, startAt)
    gain.gain.exponentialRampToValueAtTime(0.3, startAt + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.7)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(startAt)
    osc.stop(startAt + 0.75)
  })
}

let alarmIntervalId = null

export function startAlarm() {
  if (alarmIntervalId) return
  playChime()
  alarmIntervalId = setInterval(playChime, 1200)
}

export function stopAlarm() {
  if (alarmIntervalId) {
    clearInterval(alarmIntervalId)
    alarmIntervalId = null
  }
}
