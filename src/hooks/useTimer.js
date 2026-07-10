export function formatTime(totalSeconds) {
  const abs = Math.abs(totalSeconds)
  const hours = Math.floor(abs / 3600)
  const minutes = Math.floor((abs % 3600) / 60)
  const seconds = abs % 60
  const parts = [
    String(minutes).padStart(2, '0'),
    String(seconds).padStart(2, '0'),
  ]
  if (hours > 0) {
    parts.unshift(String(hours).padStart(2, '0'))
  }
  return parts.join(':')
}
