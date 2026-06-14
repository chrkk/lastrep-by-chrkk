import { useState } from 'react'

const REST_OPTIONS = [
    { label: '30s', value: 30 },
    { label: '60s', value: 60 },
    { label: '90s', value: 90 },
    { label: '2min', value: 120 },
    { label: '3min', value: 180 },
    { label: '5min', value: 300 },
]

export default function ExerciseMenu({
                                         exercise,
                                         restDuration,
                                         defaultUnit,
                                         onClose,
                                         onNoteChange,
                                         onRestChange,
                                         onUnitChange,
                                         onReplace,
                                         note,
                                     }) {
    const [activeTab, setActiveTab] = useState(null)
    const [noteInput, setNoteInput] = useState(note || '')

    const safeBottom = { paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom))' }

    function handleNoteSave() {
        onNoteChange(noteInput)
        setActiveTab(null)
    }

    return (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
            <div className="absolute inset-0 bg-black/70" onClick={onClose} />
            <div className="relative bg-gray-900 rounded-t-3xl z-10">
                <div className="px-5 pt-5 pb-2">
                    <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-4" />
                    <p className="text-white font-semibold text-base mb-1">
                        {exercise.exerciseName}
                    </p>
                    <p className="text-gray-500 text-xs mb-4">{exercise.muscleGroup}</p>
                </div>

                {activeTab === null && (
                    <div className="px-4 space-y-1" style={safeBottom}>
                        <button
                            onClick={() => setActiveTab('note')}
                            className="w-full flex items-center gap-4 px-4 py-4 active:bg-gray-800 rounded-2xl transition-colors text-left"
                        >
                            <span className="text-xl">📝</span>
                            <div>
                                <p className="text-white text-sm font-medium">Add note</p>
                                {note && (
                                    <p className="text-gray-500 text-xs mt-0.5 truncate max-w-xs">
                                        {note}
                                    </p>
                                )}
                            </div>
                        </button>

                        <button
                            onClick={() => setActiveTab('rest')}
                            className="w-full flex items-center gap-4 px-4 py-4 active:bg-gray-800 rounded-2xl transition-colors text-left"
                        >
                            <span className="text-xl">⏱</span>
                            <div>
                                <p className="text-white text-sm font-medium">Rest timer</p>
                                <p className="text-gray-500 text-xs mt-0.5">
                                    Currently {restDuration}s
                                </p>
                            </div>
                        </button>

                        <button
                            onClick={() => setActiveTab('unit')}
                            className="w-full flex items-center gap-4 px-4 py-4 active:bg-gray-800 rounded-2xl transition-colors text-left"
                        >
                            <span className="text-xl">⚖️</span>
                            <div>
                                <p className="text-white text-sm font-medium">Weight unit</p>
                                <p className="text-gray-500 text-xs mt-0.5">
                                    Default: {defaultUnit === 'KG' ? 'kg' : 'lbs'}
                                </p>
                            </div>
                        </button>

                        <button
                            onClick={() => { onReplace(); onClose() }}
                            className="w-full flex items-center gap-4 px-4 py-4 active:bg-gray-800 rounded-2xl transition-colors text-left"
                        >
                            <span className="text-xl">🔄</span>
                            <div>
                                <p className="text-white text-sm font-medium">Replace exercise</p>
                                <p className="text-gray-500 text-xs mt-0.5">
                                    Swap with a different exercise
                                </p>
                            </div>
                        </button>
                    </div>
                )}

                {activeTab === 'note' && (
                    <div className="px-5" style={safeBottom}>
                        <button
                            onClick={() => setActiveTab(null)}
                            className="text-gray-500 text-sm mb-4 flex items-center gap-1"
                        >
                            ← Back
                        </button>
                        <label className="block text-gray-400 text-sm mb-2">
                            Exercise note
                        </label>
                        <textarea
                            value={noteInput}
                            onChange={e => setNoteInput(e.target.value)}
                            placeholder="e.g. Keep elbows tucked, pause at bottom"
                            rows={3}
                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500 resize-none"
                        />
                        <button
                            onClick={handleNoteSave}
                            className="w-full bg-orange-500 active:bg-orange-600 text-white font-medium py-3 rounded-xl mt-3 transition-colors"
                        >
                            Save note
                        </button>
                    </div>
                )}

                {activeTab === 'rest' && (
                    <div className="px-5" style={safeBottom}>
                        <button
                            onClick={() => setActiveTab(null)}
                            className="text-gray-500 text-sm mb-4 flex items-center gap-1"
                        >
                            ← Back
                        </button>
                        <p className="text-gray-400 text-sm mb-3">Select rest duration</p>
                        <div className="grid grid-cols-3 gap-2">
                            {REST_OPTIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => { onRestChange(opt.value); setActiveTab(null) }}
                                    className={`py-3 rounded-xl text-sm font-medium transition-colors ${
                                        restDuration === opt.value
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-gray-800 text-gray-400'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'unit' && (
                    <div className="px-5" style={safeBottom}>
                        <button
                            onClick={() => setActiveTab(null)}
                            className="text-gray-500 text-sm mb-4 flex items-center gap-1"
                        >
                            ← Back
                        </button>
                        <p className="text-gray-400 text-sm mb-3">
                            Default unit for new sets
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => { onUnitChange('KG'); setActiveTab(null) }}
                                className={`flex-1 py-4 rounded-xl text-sm font-semibold transition-colors ${
                                    defaultUnit === 'KG'
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-gray-800 text-gray-400'
                                }`}
                            >
                                kg
                            </button>
                            <button
                                onClick={() => { onUnitChange('LBS'); setActiveTab(null) }}
                                className={`flex-1 py-4 rounded-xl text-sm font-semibold transition-colors ${
                                    defaultUnit === 'LBS'
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-gray-800 text-gray-400'
                                }`}
                            >
                                lbs
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}