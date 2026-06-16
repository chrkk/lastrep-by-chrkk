let audioContext = null

function getContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)()
    }
    return audioContext
}

export function playRestCompleteSound() {
    try {
        const ctx = getContext()
        const now = ctx.currentTime

        const tones = [
            { freq: 880, start: 0, duration: 0.15 },
            { freq: 1100, start: 0.18, duration: 0.2 },
        ]

        tones.forEach(tone => {
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()
            osc.type = 'sine'
            osc.frequency.value = tone.freq
            osc.connect(gain)
            gain.connect(ctx.destination)

            gain.gain.setValueAtTime(0, now + tone.start)
            gain.gain.linearRampToValueAtTime(0.3, now + tone.start + 0.02)
            gain.gain.linearRampToValueAtTime(0, now + tone.start + tone.duration)

            osc.start(now + tone.start)
            osc.stop(now + tone.start + tone.duration)
        })
    } catch (err) {
        console.error('Failed to play sound', err)
    }
}