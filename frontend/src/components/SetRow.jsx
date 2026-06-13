import { useState } from 'react'

const REST_OPTIONS = [30, 60, 90, 120, 180, 300]

function formatRest(s) {
    if (s < 60) return `${s}s`
    if (s === 60) return '1min'
    if (s === 90) return '1.5min'
    if (s === 120) return '2min'
    if (s === 180) return '3min'
    return '5min'
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
                                   onWeightChange,
                                   onRepsChange,
                                   onUnitToggle,
                                   onToggleCheck,
                                   onDelete,
                                   onRestChange,
                               }) {
    const [showRestPicker, setShowRestPicker] = useState(false)

    return (
        <>
            <div className={`px-4 py-3 transition-opacity ${isChecked ? 'opacity-60' : ''}`}>
                <div className="flex items-center gap-3">
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
                        <button
                            onClick={() => setShowRestPicker(prev => !prev)}
                            disabled={isChecked || isLoading}
                            className="text-gray-600 active:text-orange-400 disabled:opacity-30 transition-colors"
                            title="Set rest timer"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </button>

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

                {showRestPicker && (
                    <div className="mt-2 ml-8">
                        <p className="text-gray-600 text-xs mb-1.5">Rest after this set</p>
                        <div className="flex gap-1.5 flex-wrap">
                            {REST_OPTIONS.map(s => (
                                <button
                                    key={s}
                                    onClick={() => {
                                        onRestChange(s)
                                        setShowRestPicker(false)
                                    }}
                                    className={`text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
                                        restSeconds === s
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-gray-800 text-gray-400 active:bg-gray-700'
                                    }`}
                                >
                                    {formatRest(s)}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}