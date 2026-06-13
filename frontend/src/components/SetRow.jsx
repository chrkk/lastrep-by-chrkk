export default function SetRow({
                                   setNumber,
                                   lastEntry,
                                   weight,
                                   weightUnit,
                                   reps,
                                   isChecked,
                                   isLoading,
                                   onWeightChange,
                                   onRepsChange,
                                   onUnitToggle,
                                   onToggleCheck,
                                   onDelete,
                               }) {
    return (
        <div className={`px-4 py-3 flex items-center gap-3 transition-opacity ${
            isChecked ? 'opacity-60' : ''
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

            <div className="flex items-center gap-1.5 flex-shrink-0">
                {isChecked && (
                    <button
                        onClick={onDelete}
                        disabled={isLoading}
                        className="w-6 h-6 flex items-center justify-center text-gray-700 active:text-red-400 transition-colors disabled:opacity-50"
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
    )
}