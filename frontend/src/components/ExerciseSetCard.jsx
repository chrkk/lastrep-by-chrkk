import { useState, useEffect } from 'react'
import SetRow from './SetRow'

const SET_TYPES = [
    { value: 'NORMAL', label: 'Normal' },
    { value: 'DROP_SET', label: 'Drop Set' },
    { value: 'PYRAMID_ASCENDING', label: 'Pyramid ↑' },
    { value: 'PYRAMID_DESCENDING', label: 'Pyramid ↓' },
]

export default function ExerciseSetCard({
                                            se,
                                            lastPerf,
                                            onLogSet,
                                            onDeleteSet,
                                            onOpenMenu,
                                            defaultUnit,
                                            restDuration,
                                        }) {
    const targetSets = se.targetSets || 3

    function buildInitialRows() {
        const rows = []
        for (let i = 0; i < targetSets; i++) {
            const lastGroup = lastPerf?.setGroups?.[i]
            const lastEntry = lastGroup?.entries?.[0]
            rows.push({
                weight: lastEntry ? String(lastEntry.weight) : '',
                weightUnit: lastEntry?.weightUnit || defaultUnit || 'KG',
                reps: lastEntry ? String(lastEntry.reps) : '',
                isChecked: false,
                setGroupId: null,
                restSeconds: restDuration || 90,
            })
        }
        return rows
    }

    const [rows, setRows] = useState(buildInitialRows)
    const [setType, setSetType] = useState('NORMAL')
    const [dropRows, setDropRows] = useState([
        { weight: '', weightUnit: defaultUnit || 'KG', reps: '' }
    ])
    const [checkingIndex, setCheckingIndex] = useState(null)
    const [checkingAll, setCheckingAll] = useState(false)
    const [activeTimerIndex, setActiveTimerIndex] = useState(null)

    useEffect(() => {
        setRows(prev => prev.map(r =>
            r.isChecked ? r : { ...r, weightUnit: defaultUnit || 'KG' }
        ))
        setDropRows(prev => prev.map(d => ({ ...d, weightUnit: defaultUnit || 'KG' })))
    }, [defaultUnit])

    const noRest = setType === 'DROP_SET'

    function updateRow(index, field, value) {
        setRows(prev => prev.map((r, i) =>
            i === index ? { ...r, [field]: value } : r
        ))
    }

    function updateDrop(index, field, value) {
        setDropRows(prev => prev.map((d, i) =>
            i === index ? { ...d, [field]: value } : d
        ))
    }

    function resolveWeight(row, index) {
        return row.weight ||
            String(lastPerf?.setGroups?.[index]?.entries?.[0]?.weight || '')
    }

    function resolveReps(row, index) {
        return row.reps ||
            String(lastPerf?.setGroups?.[index]?.entries?.[0]?.reps || '')
    }

    async function handleToggleCheck(index) {
        if (checkingIndex !== null || checkingAll) return

        const row = rows[index]

        if (row.isChecked) {
            if (!row.setGroupId) return
            setCheckingIndex(index)
            if (activeTimerIndex === index) setActiveTimerIndex(null)
            try {
                await onDeleteSet(se.id, row.setGroupId)
                setRows(prev => prev.map((r, i) =>
                    i === index ? { ...r, isChecked: false, setGroupId: null } : r
                ))
            } finally {
                setCheckingIndex(null)
            }
            return
        }

        const weightVal = resolveWeight(row, index)
        const repsVal = resolveReps(row, index)
        if (!weightVal || !repsVal) return

        setCheckingIndex(index)
        try {
            const res = await onLogSet(se.id, {
                setType,
                entries: [{
                    weight: parseFloat(weightVal),
                    weightUnit: row.weightUnit,
                    reps: parseInt(repsVal),
                    reachedFailure: false,
                }]
            })

            const updatedSe = res?.exercises?.find(e => e.id === se.id)
            const newGroup = updatedSe?.setGroups?.[updatedSe.setGroups.length - 1]

            setRows(prev => prev.map((r, i) =>
                i === index
                    ? { ...r, isChecked: true, setGroupId: newGroup?.id || null }
                    : r
            ))

            if (!noRest) {
                setActiveTimerIndex(index)
            }
        } finally {
            setCheckingIndex(null)
        }
    }

    async function handleCheckAll() {
        if (checkingIndex !== null || checkingAll) return

        const unchecked = rows
            .map((r, i) => ({ r, i }))
            .filter(({ r }) => !r.isChecked)

        const valid = unchecked.filter(({ r, i }) =>
            resolveWeight(r, i) && resolveReps(r, i)
        )

        if (valid.length === 0) return

        setCheckingAll(true)
        try {
            for (const { r, i } of valid) {
                const weightVal = resolveWeight(r, i)
                const repsVal = resolveReps(r, i)
                const res = await onLogSet(se.id, {
                    setType: 'NORMAL',
                    entries: [{
                        weight: parseFloat(weightVal),
                        weightUnit: r.weightUnit,
                        reps: parseInt(repsVal),
                        reachedFailure: false,
                    }]
                })
                const updatedSe = res?.exercises?.find(e => e.id === se.id)
                const newGroup = updatedSe?.setGroups?.[updatedSe.setGroups.length - 1]
                setRows(prev => prev.map((row, idx) =>
                    idx === i
                        ? { ...row, isChecked: true, setGroupId: newGroup?.id || null }
                        : row
                ))
            }
            if (!noRest && valid.length > 0) {
                const lastValidIndex = valid[valid.length - 1].i
                setActiveTimerIndex(lastValidIndex)
            }
        } finally {
            setCheckingAll(false)
        }
    }

    async function handleAddSet() {
        if (isMulti) {
            const entries = dropRows
                .filter(d => d.weight && d.reps)
                .map(d => ({
                    weight: parseFloat(d.weight),
                    weightUnit: d.weightUnit,
                    reps: parseInt(d.reps),
                    reachedFailure: false,
                }))
            if (entries.length === 0) return
            await onLogSet(se.id, { setType, entries })
            setDropRows([{ weight: '', weightUnit: defaultUnit || 'KG', reps: '' }])
            return
        }

        const lastRow = rows[rows.length - 1]
        setRows(prev => [...prev, {
            weight: lastRow?.weight || '',
            weightUnit: lastRow?.weightUnit || defaultUnit || 'KG',
            reps: lastRow?.reps || '',
            isChecked: false,
            setGroupId: null,
            restSeconds: restDuration || 90,
        }])
    }

    const isMulti = setType === 'DROP_SET' ||
        setType === 'PYRAMID_ASCENDING' ||
        setType === 'PYRAMID_DESCENDING'

    const allChecked = rows.length > 0 && rows.every(r => r.isChecked)
    const hasValidUnchecked = rows.some((r, i) =>
        !r.isChecked && resolveWeight(r, i) && resolveReps(r, i)
    )
    const loggedCount = se.setGroups?.length || 0

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-800">
                <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm truncate">
                            {se.exerciseName}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                            {se.muscleGroup && (
                                <span className="text-orange-400 text-xs">{se.muscleGroup}</span>
                            )}
                            <span className="text-gray-600 text-xs">
                {loggedCount}/{rows.length} sets
              </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                            onClick={handleCheckAll}
                            disabled={allChecked || !hasValidUnchecked || checkingAll || checkingIndex !== null}
                            className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                                allChecked || !hasValidUnchecked
                                    ? 'text-gray-700 bg-gray-800 opacity-50'
                                    : 'text-orange-400 bg-orange-500/10 active:bg-orange-500/20'
                            }`}
                        >
                            {checkingAll ? '...' : '✓ All'}
                        </button>
                        <button
                            onClick={onOpenMenu}
                            className="w-8 h-8 flex items-center justify-center text-gray-500 active:text-white rounded-lg active:bg-gray-800 transition-colors"
                        >
                            <span className="text-lg leading-none">⋮</span>
                        </button>
                    </div>
                </div>
            </div>

            {!isMulti ? (
                <div className="divide-y divide-gray-800/50">
                    {rows.map((row, i) => (
                        <SetRow
                            key={i}
                            setNumber={i + 1}
                            lastEntry={lastPerf?.setGroups?.[i]?.entries?.[0]}
                            weight={row.weight}
                            weightUnit={row.weightUnit}
                            reps={row.reps}
                            isChecked={row.isChecked}
                            isLoading={checkingIndex === i || checkingAll}
                            restSeconds={row.restSeconds}
                            isTimerActive={activeTimerIndex === i}
                            showRestTimer={true}
                            onWeightChange={val => updateRow(i, 'weight', val)}
                            onRepsChange={val => updateRow(i, 'reps', val)}
                            onUnitToggle={() => updateRow(i, 'weightUnit',
                                row.weightUnit === 'KG' ? 'LBS' : 'KG'
                            )}
                            onToggleCheck={() => handleToggleCheck(i)}
                            onDelete={() => handleToggleCheck(i)}
                            onRestChange={val => updateRow(i, 'restSeconds', val)}
                            onTimerDone={() => setActiveTimerIndex(null)}
                        />
                    ))}
                </div>
            ) : (
                <div className="px-4 pt-3 pb-2 space-y-2">
                    {dropRows.map((drop, di) => (
                        <div key={di} className="flex items-center gap-2">
              <span className="text-gray-600 text-xs w-4 text-center flex-shrink-0">
                {di + 1}
              </span>
                            <input
                                type="text"
                                inputMode="decimal"
                                value={drop.weight}
                                onChange={e => updateDrop(di, 'weight', e.target.value)}
                                placeholder="Weight"
                                className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm text-center focus:outline-none focus:border-orange-500 min-w-0"
                            />
                            <button
                                onClick={() => updateDrop(di, 'weightUnit',
                                    drop.weightUnit === 'KG' ? 'LBS' : 'KG'
                                )}
                                className="bg-gray-800 border border-gray-700 text-gray-400 text-xs px-2 py-2.5 rounded-xl flex-shrink-0 w-10"
                            >
                                {drop.weightUnit === 'KG' ? 'kg' : 'lbs'}
                            </button>
                            <span className="text-gray-700 text-xs flex-shrink-0">×</span>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={drop.reps}
                                onChange={e => updateDrop(di, 'reps', e.target.value)}
                                placeholder="Reps"
                                className="w-14 bg-gray-800 border border-gray-700 text-white rounded-xl px-2 py-2.5 text-sm text-center focus:outline-none focus:border-orange-500 flex-shrink-0"
                            />
                            {dropRows.length > 1 && (
                                <button
                                    onClick={() => setDropRows(prev => prev.filter((_, i) => i !== di))}
                                    className="text-gray-700 active:text-red-400 text-sm flex-shrink-0 w-4"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        onClick={() => setDropRows(prev => [
                            ...prev,
                            { weight: '', weightUnit: defaultUnit || 'KG', reps: '' }
                        ])}
                        className="w-full border border-dashed border-gray-700 text-gray-500 text-xs py-2 rounded-xl active:border-gray-500 transition-colors"
                    >
                        + Add {setType === 'DROP_SET' ? 'Drop' : 'Step'}
                    </button>
                </div>
            )}

            <div className="px-4 pt-2 pb-3 border-t border-gray-800 mt-1">
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 mb-2">
                    {SET_TYPES.map(type => (
                        <button
                            key={type.value}
                            onClick={() => setSetType(type.value)}
                            className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-lg transition-colors ${
                                setType === type.value
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-gray-800 text-gray-400'
                            }`}
                        >
                            {type.label}
                        </button>
                    ))}
                </div>
                <button
                    onClick={handleAddSet}
                    className="w-full border border-dashed border-gray-700 active:border-orange-500/50 text-gray-500 active:text-orange-400 text-xs py-2.5 rounded-xl transition-colors"
                >
                    + Add Set
                </button>
            </div>
        </div>
    )
}