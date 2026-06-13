import { useState, useEffect, useRef } from 'react'

const REST_OPTIONS = [
    { label: '30s', value: 30 },
    { label: '60s', value: 60 },
    { label: '90s', value: 90 },
    { label: '2min', value: 120 },
    { label: '3min', value: 180 },
    { label: '5min', value: 300 },
]

function formatRest(s) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export default function SetRow({
                                   setNumber,
                                   lastEntry,
                                   weight,
                                   weightUnit,
                                   reps,
                                   isChecked,
                                   isLoading,
                                   restSeconds,
                                   isTimerActive,
                                   showRestTimer,
                                   onWeightChange,
                                   onRepsChange,
                                   onUnitToggle,
                                   onToggleCheck,
                                   onDelete,
                                   onRestChange,
                                   onTimerDone,
                               }) {
    const [remaining, setRemaining] = useState(restSeconds)
    const intervalRef = useRef(null)

    useEffect(() => {
        setRemaining(restSeconds)
    }, [restSeconds])

    useEffect(() => {
        if (isTimerActive && isChecked) {
            setRemaining(restSeconds)
            intervalRef.current = setInterval(() => {
                setRemaining(prev => {
                    if (prev <= 1) {
                        clearInterval(intervalRef.current)
                        onTimerDone?.()
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        } else {
            clearInterval(intervalRef.current)
            setRemaining(restSeconds)
        }
        return () => clearInterval(intervalRef.current)
    }, [isTimerActive, isChecked])

    const progress = restSeconds > 0 ? remaining / restSeconds : 0

    return (
        <div>
            <div className={`px-4 py-3 flex items-center gap-3 transition-opacity ${
                isChecked ? 'opacity-70' : ''
            }`}>
                <div className="w-8 flex-shrink-0 text-center">
                    <p className="text-gray-500 text-xs font-medium">{setNumber}</p>
                    {lastEntry && (
                        <p className="text-gray-700 text-xs mt-0.5 leading-tight">
                            {lastEntry.weight}{lastEntry.weightUnit === 'KG' ? 'k' : 'l'}
                            ×{lastEntry.reps}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <input
                        type="text"
                        inputMode="decimal"
                        value={weight}
                        onChange={e => onWeightChange(e.target.value)}
                        placeholder={lastEntry ? String(lastEntry.weight) : '0'}
                        disabled={isChecked || isLoading}
                        className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-xl px-2 py-2.5 text-sm text-center focus:outline-none focus:border-orange-500 disabled:opacity-50 min-w-0"
                    />
                    <button
                        onClick={onUnitToggle}
                        disabled={isChecked || isLoading}
                        className="bg-gray-800 border border-gray-700 text-gray-400 text-xs px-2 py-2.5 rounded-xl flex-shrink-0 disabled:opacity-50 w-10"
                    >
                        {weightUnit === 'KG' ? 'kg' : 'lbs'}
                    </button>
                </div>

                <span className="text-gray-700 text-xs flex-shrink-0">×</span>

                <input
                    type="text"
                    inputMode="numeric"
                    value={reps}
                    onChange={e => onRepsChange(e.target.value)}
                    placeholder={lastEntry ? String(lastEntry.reps) : '0'}
                    disabled={isChecked || isLoading}
                    className="w-14 bg-gray-800 border border-gray-700 text-white rounded-xl px-2 py-2.5 text-sm text-center focus:outline-none focus:border-orange-500 disabled:opacity-50 flex-shrink-0"
                />

                <div className="flex items-center gap-1 flex-shrink-0">
                    {isChecked && (
                        <button
                            onClick={onDelete}
                            disabled={isLoading}
                            className="w-5 h-5 flex items-center justify-center text-gray-700 active:text-red-400 transition-colors disabled:opacity-50"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                    <button
                        onClick={onToggleCheck}
                        disabled={isLoading}
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                            isLoading
                                ? 'border-gray-700 opacity-50'
                                : isChecked
                                    ? 'bg-orange-500 border-orange-500'
                                    : 'border-gray-600 active:border-orange-400'
                        }`}
                    >
                        {isLoading ? (
                            <div className="w-3 h-3 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                        ) : isChecked ? (
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : null}
                    </button>
                </div>
            </div>

            {showRestTimer && (
                <div className="mx-4 mb-3 bg-gray-800/60 rounded-xl px-3 py-2.5">
                    {isChecked && isTimerActive ? (
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
                                    <p className="text-orange-400 text-xs font-medium">Resting</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <p className="text-white font-mono text-sm font-bold">
                                        {formatRest(remaining)}
                                    </p>
                                    <button
                                        onClick={onTimerDone}
                                        className="text-gray-500 active:text-white text-xs px-2 py-0.5 rounded-lg active:bg-gray-700 transition-colors"
                                    >
                                        Skip
                                    </button>
                                </div>
                            </div>
                            <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-orange-500 rounded-full transition-all duration-1000"
                                    style={{ width: `${progress * 100}%` }}
                                />
                            </div>
                        </div>
                    ) : isChecked ? (
                        <p className="text-gray-600 text-xs text-center">Rest done ✓</p>
                    ) : (
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-gray-500 text-xs">Rest after this set</p>
                                <p className="text-gray-400 text-xs font-mono">
                                    {formatRest(restSeconds)}
                                </p>
                            </div>
                            <div className="flex gap-1.5 flex-wrap">
                                {REST_OPTIONS.map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => onRestChange(opt.value)}
                                        className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${
                                            restSeconds === opt.value
                                                ? 'bg-orange-500 text-white'
                                                : 'bg-gray-700 text-gray-400 active:bg-gray-600'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}