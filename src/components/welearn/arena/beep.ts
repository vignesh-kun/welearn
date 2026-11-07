// Tiny audio cues for phase transitions in the GD Arena.

export function beep(freq = 880, duration = 1.1, volume = 0.22) {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = freq
    osc.type = "sine"
    gain.gain.setValueAtTime(volume, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    osc.start()
    osc.stop(ctx.currentTime + duration)
  } catch {
    // audio not available — visual cues are enough
  }
}

export function chimeSequence() {
  beep(660, 0.5)
  setTimeout(() => beep(880, 0.7), 180)
  setTimeout(() => beep(1180, 0.9), 380)
}
