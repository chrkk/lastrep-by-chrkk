import { useEffect } from 'react'

export default function Toast({ message, type, onDismiss }) {
    useEffect(() => {
        const timer = setTimeout(onDismiss, 4000)
        return () => clearTimeout(timer)
    }, [message])

    if (!message) return null

    const isError = type === 'error'

    return (
        <div
            className="fixed top-0 left-0 right-0 z-[60] px-4 pt-4 flex justify-center"
            style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
        >
            <div
                className={`flex items-start gap-3 px-4 py-3 rounded-2xl shadow-lg max-w-sm w-full ${
                    isError
                        ? 'bg-red-500/95 text-white'
                        : 'bg-gray-800/95 text-white'
                }`}
            >
                <span className="text-lg flex-shrink-0">
                    {isError ? '⚠️' : '✓'}
                </span>
                <p className="text-sm font-medium flex-1">{message}</p>
                <button
                    onClick={onDismiss}
                    className="text-white/70 active:text-white text-sm flex-shrink-0"
                >
                    ✕
                </button>
            </div>
        </div>
    )
}