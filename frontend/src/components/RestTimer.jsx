import { useState, useEffect, useRef } from 'react'

export default function RestTimer({ duration, onDismiss }) {
    const [remaining, setRemaining] = useState(duration)
    const intervalRef = useRef(null)

    useEffect(() => {
        setRemaining(duration)
    }, [duration])

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current)
                    setTimeout(onDismiss, 300)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(intervalRef.current)
    }, [duration])

    function formatTime(s) {
        const m = Math.floor(s / 60)
        const sec = s % 60
        return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    }

    const progress = remaining / duration

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 border-t border-gray-800 px-5 py-4 safe-area-bottom">
            <div className="flex items-center justify-between mb-3">
                <p className="text-gray-400 text-sm font-medium">Rest Timer</p>
                <p className="text-white font-mono font-bold text-xl">
                    {formatTime(remaining)}
                </p>
                <button
                    onClick={onDismiss}
                    className="text-gray-500 text-sm active:text-white transition-colors px-3 py-1"
                >
                    Skip
                </button>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                    className="h-full bg-orange-500 rounded-full transition-all duration-1000"
                    style={{ width: `${progress * 100}%` }}
                />
            </div>
        </div>
    )
}