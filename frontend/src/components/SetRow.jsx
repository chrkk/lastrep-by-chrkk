export default function SetRow({
                                   setNumber,
                                   lastEntry,
                                   weight,
                                   weightUnit,
                                   reps,
                                   isChecked,
                                   onWeightChange,
                                   onRepsChange,
                                   onUnitToggle,
                                   onToggleCheck,
                               }) {
    return (
        <div className={`px-4 py-3 flex items-center gap-3 transition-colors ${
            isChecked ? 'opacity-60' : ''
        }`}>
            <div className="w-8 flex-shrink-0">
                <p className="text-gray-500 text-xs font-medium text-center">
                    {setNumber}
                </p>
                {lastEntry && (
                    <p className="text-gray-700 text-xs text-center mt-0.5 leading-tight">
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
                    disabled={isChecked}
                    className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-xl px-2 py-2.5 text-sm text-center focus:outline-none focus:border-orange-500 disabled:opacity-50 min-w-0"
                />
                <button
                    onClick={onUnitToggle}
                    disabled={isChecked}
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
                disabled={isChecked}
                className="w-14 bg-gray-800 border border-gray-700 text-white rounded-xl px-2 py-2.5 text-sm text-center focus:outline-none focus:border-orange-500 disabled:opacity-50 flex-shrink-0"
            />

            <button
                onClick={onToggleCheck}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    isChecked
                        ? 'bg-orange-500 border-orange-500'
                        : 'border-gray-600 active:border-orange-400'
                }`}
            >
                {isChecked && (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                )}
            </button>
        </div>
    )
}