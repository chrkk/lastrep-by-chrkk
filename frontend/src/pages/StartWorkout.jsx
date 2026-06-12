import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'

export default function StartWorkout() {
    const { sessionId } = useParams()
    const navigate = useNavigate()

    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)
    const [elapsed, setElapsed] = useState(0)
    const [showFinishModal, setShowFinishModal] = useState(false)
    const [showAddExercise, setShowAddExercise] = useState(false)
    const [exercises, setExercises] = useState([])
    const [finishing, setFinishing] = useState(false)
    const [lastPerformances, setLastPerformances] = useState({})
    const [setInputs, setSetInputs] = useState({})
    const timerRef = useRef(null)

    useEffect(() => {
        fetchSession()
        fetchExercises()
    }, [sessionId])

    useEffect(() => {
        if (session) {
            timerRef.current = setInterval(() => {
                const start = new Date(session.createdAt)
                const now = new Date()
                setElapsed(Math.floor((now - start) / 1000))
            }, 1000)
        }
        return () => clearInterval(timerRef.current)
    }, [session])

    useEffect(() => {
        const open = showFinishModal || showAddExercise
        document.body.style.overflow = open ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [showFinishModal, showAddExercise])

    async function fetchSession() {
        try {
            const res = await api.get(`/api/workout-sessions/${sessionId}`)
            setSession(res.data)
            await fetchLastPerformances(res.data.exercises)
            initSetInputs(res.data.exercises)
        } catch (err) {
            console.error('Failed to fetch session', err)
        } finally {
            setLoading(false)
        }
    }

    async function fetchExercises() {
        try {
            const res = await api.get('/api/exercises')
            setExercises(res.data)
        } catch (err) {
            console.error('Failed to fetch exercises', err)
        }
    }

    async function fetchLastPerformances(sessionExercises) {
        const performances = {}
        await Promise.all(
            sessionExercises.map(async (se) => {
                try {
                    const res = await api.get(
                        `/api/workout-sessions/exercises/${se.exerciseId}/last-performance`
                    )
                    if (res.status === 200 && res.data) {
                        performances[se.exerciseId] = res.data
                    }
                } catch (err) {
                }
            })
        )
        setLastPerformances(performances)
    }

    function initSetInputs(sessionExercises) {
        const inputs = {}
        sessionExercises.forEach(se => {
            inputs[se.id] = {
                weight: '',
                weightUnit: 'KG',
                reps: '',
                setType: 'NORMAL',
                drops: [{ weight: '', weightUnit: 'KG', reps: '' }]
            }
        })
        setSetInputs(inputs)
    }

    function formatTime(seconds) {
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        const s = seconds % 60
        if (h > 0) {
            return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
        }
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    }

    function updateSetInput(seId, field, value) {
        setSetInputs(prev => ({
            ...prev,
            [seId]: { ...prev[seId], [field]: value }
        }))
    }

    function updateDrop(seId, dropIndex, field, value) {
        setSetInputs(prev => {
            const drops = [...prev[seId].drops]
            drops[dropIndex] = { ...drops[dropIndex], [field]: value }
            return { ...prev, [seId]: { ...prev[seId], drops } }
        })
    }

    function addDrop(seId) {
        setSetInputs(prev => {
            const drops = [...prev[seId].drops, { weight: '', weightUnit: 'KG', reps: '' }]
            return { ...prev, [seId]: { ...prev[seId], drops } }
        })
    }

    function removeDrop(seId, dropIndex) {
        setSetInputs(prev => {
            const drops = prev[seId].drops.filter((_, i) => i !== dropIndex)
            return { ...prev, [seId]: { ...prev[seId], drops } }
        })
    }

    async function handleLogSet(se) {
        const input = setInputs[se.id]
        if (!input) return

        let entries = []

        if (input.setType === 'NORMAL' || input.setType === 'WARMUP') {
            if (!input.weight || !input.reps) return
            entries = [{
                weight: parseFloat(input.weight),
                weightUnit: input.weightUnit,
                reps: parseInt(input.reps),
                reachedFailure: false
            }]
        } else {
            entries = input.drops
                .filter(d => d.weight && d.reps)
                .map(d => ({
                    weight: parseFloat(d.weight),
                    weightUnit: d.weightUnit,
                    reps: parseInt(d.reps),
                    reachedFailure: false
                }))
            if (entries.length === 0) return
        }

        try {
            const res = await api.post(
                `/api/workout-sessions/${sessionId}/exercises/${se.id}/sets`,
                { setType: input.setType, entries }
            )
            setSession(res.data)
            updateSetInput(se.id, 'weight', '')
            updateSetInput(se.id, 'reps', '')
            updateSetInput(se.id, 'drops', [{ weight: '', weightUnit: 'KG', reps: '' }])
        } catch (err) {
            console.error('Failed to log set', err)
        }
    }

    async function handleDeleteSet(seId, setGroupId) {
        try {
            const res = await api.delete(
                `/api/workout-sessions/${sessionId}/exercises/${seId}/sets/${setGroupId}`
            )
            setSession(res.data)
        } catch (err) {
            console.error('Failed to delete set', err)
        }
    }

    async function handleAddExercise(exerciseId) {
        try {
            const res = await api.post(
                `/api/workout-sessions/${sessionId}/exercises`,
                { exerciseId }
            )
            setSession(res.data)
            const newSe = res.data.exercises.find(e => e.exerciseId === exerciseId)
            if (newSe) {
                setSetInputs(prev => ({
                    ...prev,
                    [newSe.id]: {
                        weight: '',
                        weightUnit: 'KG',
                        reps: '',
                        setType: 'NORMAL',
                        drops: [{ weight: '', weightUnit: 'KG', reps: '' }]
                    }
                }))
                const perfRes = await api.get(
                    `/api/workout-sessions/exercises/${exerciseId}/last-performance`
                )
                if (perfRes.status === 200 && perfRes.data) {
                    setLastPerformances(prev => ({
                        ...prev,
                        [exerciseId]: perfRes.data
                    }))
                }
            }
            setShowAddExercise(false)
        } catch (err) {
            console.error('Failed to add exercise', err)
        }
    }

    async function handleFinish() {
        setFinishing(true)
        try {
            await api.post(`/api/workout-sessions/${sessionId}/finish`)
            navigate('/history')
        } catch (err) {
            console.error('Failed to finish session', err)
        } finally {
            setFinishing(false)
        }
    }

    async function handleDiscard() {
        try {
            await api.post(`/api/workout-sessions/${sessionId}/cancel`)
            navigate('/')
        } catch (err) {
            console.error('Failed to cancel session', err)
            navigate('/')
        }
    }

    const SET_TYPES = [
        { value: 'NORMAL', label: 'Normal' },
        { value: 'WARMUP', label: 'Warm-up' },
        { value: 'DROP_SET', label: 'Drop Set' },
        { value: 'PYRAMID_ASCENDING', label: 'Pyramid ↑' },
        { value: 'PYRAMID_DESCENDING', label: 'Pyramid ↓' },
    ]

    const isMultiEntry = (type) =>
        type === 'DROP_SET' || type === 'PYRAMID_ASCENDING' || type === 'PYRAMID_DESCENDING'

    const availableExercises = exercises.filter(
        ex => !session?.exercises?.some(se => se.exerciseId === ex.id)
    )

    const totalSets = session?.exercises?.reduce(
        (sum, se) => sum + (se.setGroups?.length || 0), 0
    ) || 0

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-950 pb-32">

            {/* Sticky Header */}
            <div className="sticky top-0 z-40 bg-gray-950 border-b border-gray-800 px-4 py-3">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-white font-bold text-base">
                            {session?.routineName}
                        </p>
                        <p className="text-orange-400 text-sm font-mono">
                            ⏱ {formatTime(elapsed)}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowFinishModal(true)}
                        className="bg-orange-500 active:bg-orange-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                    >
                        Finish
                    </button>
                </div>
            </div>

            <div className="px-4 py-4 space-y-4">

                {session?.exercises?.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-4xl mb-3">🏋️</p>
                        <p className="text-gray-500 text-sm">No exercises in this session.</p>
                        <p className="text-gray-600 text-xs mt-1">
                            Tap + Add Exercise below to get started.
                        </p>
                    </div>
                ) : (
                    session?.exercises?.map((se) => {
                        const input = setInputs[se.id] || {
                            weight: '', weightUnit: 'KG', reps: '',
                            setType: 'NORMAL',
                            drops: [{ weight: '', weightUnit: 'KG', reps: '' }]
                        }
                        const lastPerf = lastPerformances[se.exerciseId]
                        const multi = isMultiEntry(input.setType)

                        return (
                            <div
                                key={se.id}
                                className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden"
                            >
                                {/* Exercise Header */}
                                <div className="px-4 py-3 border-b border-gray-800">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-white font-semibold text-sm">
                                                {se.exerciseName}
                                            </p>
                                            {se.muscleGroup && (
                                                <span className="text-xs text-orange-400">
                          {se.muscleGroup}
                        </span>
                                            )}
                                        </div>
                                        <span className="text-gray-600 text-xs">
                      {se.setGroups?.length || 0} sets logged
                    </span>
                                    </div>
                                </div>

                                {/* Last Performance */}
                                {lastPerf && lastPerf.setGroups?.length > 0 && (
                                    <div className="px-4 py-3 bg-gray-800/50 border-b border-gray-800">
                                        <p className="text-gray-500 text-xs font-medium mb-2">
                                            Last time
                                        </p>
                                        {lastPerf.setGroups.map((group, gi) => (
                                            <div key={gi} className="mb-1">
                                                {group.entries.map((entry, ei) => (
                                                    <p key={ei} className="text-gray-400 text-xs">
                                                        {group.setType !== 'NORMAL' && ei === 0 && (
                                                            <span className="text-gray-600 mr-1">
                                {group.setType === 'DROP_SET' ? 'Drop' : 'Step'} —
                              </span>
                                                        )}
                                                        Set {group.setNumber}
                                                        {group.entries.length > 1 ? `.${ei + 1}` : ''}: {entry.weight}
                                                        {entry.weightUnit === 'KG' ? 'kg' : 'lbs'} × {entry.reps}
                                                    </p>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Logged Sets */}
                                {se.setGroups?.length > 0 && (
                                    <div className="px-4 py-3 border-b border-gray-800 space-y-1">
                                        {se.setGroups.map((group) => (
                                            <div
                                                key={group.id}
                                                className="flex items-center justify-between"
                                            >
                                                <div>
                                                    {group.entries.map((entry, ei) => (
                                                        <p key={ei} className="text-gray-300 text-xs">
                                                            Set {group.setNumber}
                                                            {group.entries.length > 1 ? `.${ei + 1}` : ''}: {entry.weight}
                                                            {entry.weightUnit === 'KG' ? 'kg' : 'lbs'} × {entry.reps}
                                                        </p>
                                                    ))}
                                                    {group.setType !== 'NORMAL' && (
                                                        <span className="text-xs text-orange-400/70">
                              {SET_TYPES.find(t => t.value === group.setType)?.label}
                            </span>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteSet(se.id, group.id)}
                                                    className="text-gray-700 text-xs px-2 py-1 active:text-red-400 transition-colors"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Set Type Selector */}
                                <div className="px-4 pt-3">
                                    <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                                        {SET_TYPES.map(type => (
                                            <button
                                                key={type.value}
                                                onClick={() => updateSetInput(se.id, 'setType', type.value)}
                                                className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-lg transition-colors ${
                                                    input.setType === type.value
                                                        ? 'bg-orange-500 text-white'
                                                        : 'bg-gray-800 text-gray-400'
                                                }`}
                                            >
                                                {type.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Set Input */}
                                <div className="px-4 pt-3 pb-4">
                                    {!multi ? (
                                        <div className="flex gap-2 items-end">
                                            <div className="flex-1">
                                                <p className="text-gray-600 text-xs mb-1">Weight</p>
                                                <div className="flex gap-1">
                                                    <input
                                                        type="number"
                                                        value={input.weight}
                                                        onChange={e => updateSetInput(se.id, 'weight', e.target.value)}
                                                        placeholder="0"
                                                        className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm text-center focus:outline-none focus:border-orange-500 min-w-0"
                                                    />
                                                    <button
                                                        onClick={() => updateSetInput(
                                                            se.id, 'weightUnit',
                                                            input.weightUnit === 'KG' ? 'LBS' : 'KG'
                                                        )}
                                                        className="bg-gray-800 border border-gray-700 text-gray-400 text-xs px-2.5 rounded-xl flex-shrink-0"
                                                    >
                                                        {input.weightUnit === 'KG' ? 'kg' : 'lbs'}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-gray-600 text-xs mb-1">Reps</p>
                                                <input
                                                    type="number"
                                                    value={input.reps}
                                                    onChange={e => updateSetInput(se.id, 'reps', e.target.value)}
                                                    placeholder="0"
                                                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm text-center focus:outline-none focus:border-orange-500"
                                                />
                                            </div>
                                            <button
                                                onClick={() => handleLogSet(se)}
                                                className="bg-orange-500 active:bg-orange-600 text-white text-sm font-bold w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
                                            >
                                                ✓
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {input.drops.map((drop, di) => (
                                                <div key={di} className="flex gap-2 items-center">
                          <span className="text-gray-600 text-xs w-4 flex-shrink-0">
                            {di + 1}
                          </span>
                                                    <input
                                                        type="number"
                                                        value={drop.weight}
                                                        onChange={e => updateDrop(se.id, di, 'weight', e.target.value)}
                                                        placeholder="Weight"
                                                        className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm text-center focus:outline-none focus:border-orange-500 min-w-0"
                                                    />
                                                    <button
                                                        onClick={() => updateDrop(
                                                            se.id, di, 'weightUnit',
                                                            drop.weightUnit === 'KG' ? 'LBS' : 'KG'
                                                        )}
                                                        className="bg-gray-800 border border-gray-700 text-gray-400 text-xs px-2 py-2.5 rounded-xl flex-shrink-0"
                                                    >
                                                        {drop.weightUnit === 'KG' ? 'kg' : 'lbs'}
                                                    </button>
                                                    <input
                                                        type="number"
                                                        value={drop.reps}
                                                        onChange={e => updateDrop(se.id, di, 'reps', e.target.value)}
                                                        placeholder="Reps"
                                                        className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm text-center focus:outline-none focus:border-orange-500 min-w-0"
                                                    />
                                                    {input.drops.length > 1 && (
                                                        <button
                                                            onClick={() => removeDrop(se.id, di)}
                                                            className="text-gray-700 text-sm active:text-red-400 flex-shrink-0"
                                                        >
                                                            ✕
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            <div className="flex gap-2 pt-1">
                                                <button
                                                    onClick={() => addDrop(se.id)}
                                                    className="flex-1 border border-dashed border-gray-700 text-gray-500 text-xs py-2 rounded-xl active:border-gray-500 transition-colors"
                                                >
                                                    + Add {input.setType === 'DROP_SET' ? 'Drop' : 'Step'}
                                                </button>
                                                <button
                                                    onClick={() => handleLogSet(se)}
                                                    className="bg-orange-500 active:bg-orange-600 text-white text-sm font-bold w-11 rounded-xl flex items-center justify-center transition-colors"
                                                >
                                                    ✓
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })
                )}

                {/* Add Exercise Button */}
                <button
                    onClick={() => setShowAddExercise(true)}
                    className="w-full border border-dashed border-gray-700 active:border-gray-600 text-gray-500 active:text-gray-400 text-sm py-4 rounded-2xl transition-colors"
                >
                    + Add Exercise
                </button>
            </div>

            {/* Finish Modal */}
            {showFinishModal && (
                <div className="fixed inset-0 z-50 flex items-end justify-center">
                    <div
                        className="absolute inset-0 bg-black/70"
                        onClick={() => setShowFinishModal(false)}
                    />
                    <div className="relative bg-gray-900 rounded-t-3xl px-5 pt-5 pb-10 w-full z-10">
                        <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-5" />

                        <div className="text-center mb-6">
                            <p className="text-4xl mb-3">💪</p>
                            <h2 className="text-white font-bold text-xl">Workout Complete</h2>
                            <p className="text-gray-500 text-sm mt-1">
                                {session?.routineName} · {formatTime(elapsed)}
                            </p>
                            <p className="text-gray-600 text-xs mt-1">
                                {session?.exercises?.length} exercises · {totalSets} sets logged
                            </p>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={handleFinish}
                                disabled={finishing}
                                className="w-full bg-orange-500 active:bg-orange-600 disabled:opacity-50 text-white font-semibold py-4 rounded-2xl transition-colors"
                            >
                                {finishing ? 'Saving...' : 'Save Workout'}
                            </button>
                            <button
                                onClick={handleDiscard}
                                className="w-full bg-gray-800 active:bg-gray-700 text-gray-400 font-medium py-4 rounded-2xl transition-colors"
                            >
                                Discard Workout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Exercise Sheet */}
            {showAddExercise && (
                <div className="fixed inset-0 z-50 flex flex-col justify-end">
                    <div
                        className="absolute inset-0 bg-black/70"
                        onClick={() => setShowAddExercise(false)}
                    />
                    <div className="relative bg-gray-900 rounded-t-3xl z-10 flex flex-col max-h-[75vh]">
                        <div className="px-5 pt-5 pb-3 flex-shrink-0">
                            <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-5" />
                            <h2 className="text-white font-semibold text-lg">Add Exercise</h2>
                            <p className="text-gray-500 text-xs mt-1">
                                Add to current workout session
                            </p>
                        </div>
                        <div className="overflow-y-auto px-5 pb-10">
                            {availableExercises.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 text-sm">
                                        All exercises already added.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2 mt-2">
                                    {availableExercises.map(exercise => (
                                        <button
                                            key={exercise.id}
                                            onClick={() => handleAddExercise(exercise.id)}
                                            className="w-full bg-gray-800 active:bg-gray-700 border border-gray-700 rounded-xl px-4 py-3 text-left transition-colors"
                                        >
                                            <p className="text-white text-sm font-medium">
                                                {exercise.name}
                                            </p>
                                            <div className="flex gap-2 mt-1">
                                                {exercise.muscleGroup && (
                                                    <span className="text-xs text-orange-400">
                            {exercise.muscleGroup}
                          </span>
                                                )}
                                                {exercise.equipment && (
                                                    <span className="text-xs text-gray-500">
                            {exercise.equipment}
                          </span>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}