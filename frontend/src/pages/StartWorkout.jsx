import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import ExerciseSetCard from '../components/ExerciseSetCard'
import ExerciseMenu from '../components/ExerciseMenu'

export default function StartWorkout() {
    const { sessionId } = useParams()
    const navigate = useNavigate()

    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)
    const [elapsed, setElapsed] = useState(0)
    const [showFinishModal, setShowFinishModal] = useState(false)
    const [showAddExercise, setShowAddExercise] = useState(false)
    const [showReplaceFor, setShowReplaceFor] = useState(null)
    const [allExercises, setAllExercises] = useState([])
    const [finishing, setFinishing] = useState(false)
    const [lastPerformances, setLastPerformances] = useState({})
    const [menuExercise, setMenuExercise] = useState(null)
    const [exerciseMeta, setExerciseMeta] = useState({})
    const timerRef = useRef(null)

    useEffect(() => {
        fetchSession()
        fetchAllExercises()
    }, [sessionId])

    useEffect(() => {
        if (!session) return
        timerRef.current = setInterval(() => {
            const start = new Date(session.createdAt)
            setElapsed(Math.floor((new Date() - start) / 1000))
        }, 1000)
        return () => clearInterval(timerRef.current)
    }, [session?.id])

    useEffect(() => {
        const open = showFinishModal || showAddExercise ||
            menuExercise !== null || showReplaceFor !== null
        document.body.style.overflow = open ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [showFinishModal, showAddExercise, menuExercise, showReplaceFor])

    async function fetchSession() {
        try {
            const res = await api.get(`/api/workout-sessions/${sessionId}`)
            setSession(res.data)
            await fetchLastPerformances(res.data.exercises)
            initMeta(res.data.exercises)
        } catch (err) {
            console.error('Failed to fetch session', err)
        } finally {
            setLoading(false)
        }
    }

    async function fetchAllExercises() {
        try {
            const res = await api.get('/api/exercises')
            setAllExercises(res.data)
        } catch (err) {
            console.error(err)
        }
    }

    async function fetchLastPerformances(sessionExercises) {
        const performances = {}
        await Promise.all(
            sessionExercises.map(async se => {
                try {
                    const res = await api.get(
                        `/api/workout-sessions/exercises/${se.exerciseId}/last-performance`
                    )
                    if (res.status === 200 && res.data) {
                        performances[se.exerciseId] = res.data
                    }
                } catch (_) {}
            })
        )
        setLastPerformances(performances)
    }

    function initMeta(sessionExercises) {
        const meta = {}
        sessionExercises.forEach(se => {
            meta[se.id] = {
                note: '',
                restDuration: se.restSeconds || 90,
                defaultUnit: 'KG',
            }
        })
        setExerciseMeta(meta)
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

    function getIncompleteCount() {
        if (!session) return 0
        return session.exercises.reduce((sum, se) => {
            const target = se.targetSets || 3
            const logged = se.setGroups?.length || 0
            return sum + Math.max(0, target - logged)
        }, 0)
    }

    async function handleLogSet(seId, payload) {
        try {
            const res = await api.post(
                `/api/workout-sessions/${sessionId}/exercises/${seId}/sets`,
                payload
            )
            setSession(res.data)
            return res.data
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
            const newSe = res.data.exercises.find(e => e.exerciseId === exerciseId)
            if (newSe) {
                setExerciseMeta(prev => ({
                    ...prev,
                    [newSe.id]: { note: '', restDuration: 90, defaultUnit: 'KG' }
                }))
                try {
                    const perfRes = await api.get(
                        `/api/workout-sessions/exercises/${exerciseId}/last-performance`
                    )
                    if (perfRes.status === 200 && perfRes.data) {
                        setLastPerformances(prev => ({
                            ...prev,
                            [exerciseId]: perfRes.data
                        }))
                    }
                } catch (_) {}
            }
            setSession(res.data)
            setShowAddExercise(false)
            setShowReplaceFor(null)
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
            console.error(err)
        } finally {
            setFinishing(false)
        }
    }

    async function handleAutoFinish() {
        setFinishing(true)
        try {
            for (const se of session.exercises) {
                const target = se.targetSets || 3
                const logged = se.setGroups?.length || 0
                if (logged >= target) continue
                const lastPerf = lastPerformances[se.exerciseId]
                for (let i = logged; i < target; i++) {
                    const lastEntry = lastPerf?.setGroups?.[i]?.entries?.[0]
                    if (!lastEntry) continue
                    await api.post(
                        `/api/workout-sessions/${sessionId}/exercises/${se.id}/sets`,
                        {
                            setType: 'NORMAL',
                            entries: [{
                                weight: lastEntry.weight,
                                weightUnit: lastEntry.weightUnit,
                                reps: lastEntry.reps,
                                reachedFailure: false,
                            }]
                        }
                    )
                }
            }
            await api.post(`/api/workout-sessions/${sessionId}/finish`)
            navigate('/history')
        } catch (err) {
            console.error('Auto-finish failed', err)
        } finally {
            setFinishing(false)
        }
    }

    async function handleDiscard() {
        try {
            await api.post(`/api/workout-sessions/${sessionId}/cancel`)
        } catch (_) {}
        navigate('/')
    }

    function updateMeta(seId, field, value) {
        setExerciseMeta(prev => ({
            ...prev,
            [seId]: { ...prev[seId], [field]: value }
        }))
    }

    const totalSets = session?.exercises?.reduce(
        (sum, se) => sum + (se.setGroups?.length || 0), 0
    ) || 0

    const availableExercises = allExercises.filter(
        ex => !session?.exercises?.some(se => se.exerciseId === ex.id)
    )

    const replaceAvailable = allExercises.filter(
        ex => ex.id !== showReplaceFor?.exerciseId &&
            !session?.exercises?.some(
                se => se.exerciseId === ex.id && se.id !== showReplaceFor?.id
            )
    )

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-950 pb-36">

            <div className="sticky top-0 z-40 bg-gray-950 border-b border-gray-800 px-4 py-3">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-white font-bold text-base leading-tight">
                            {session?.routineName}
                        </p>
                        <p className="text-orange-400 text-sm font-mono mt-0.5">
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
                    <div className="text-center py-16">
                        <p className="text-4xl mb-3">🏋️</p>
                        <p className="text-gray-500 text-sm">No exercises yet.</p>
                        <p className="text-gray-600 text-xs mt-1">
                            Tap + Add Exercise below.
                        </p>
                    </div>
                ) : (
                    session.exercises.map(se => (
                        <ExerciseSetCard
                            key={se.id}
                            se={se}
                            lastPerf={lastPerformances[se.exerciseId]}
                            defaultUnit={exerciseMeta[se.id]?.defaultUnit || 'KG'}
                            restDuration={exerciseMeta[se.id]?.restDuration || 90}
                            onLogSet={handleLogSet}
                            onDeleteSet={handleDeleteSet}
                            onOpenMenu={() => setMenuExercise(se)}
                        />
                    ))
                )}

                <button
                    onClick={() => setShowAddExercise(true)}
                    className="w-full border border-dashed border-gray-700 active:border-orange-500/40 text-gray-500 active:text-orange-400 text-sm py-4 rounded-2xl transition-colors"
                >
                    + Add Exercise
                </button>
            </div>

            {showFinishModal && (
                <div className="fixed inset-0 z-50 flex items-end">
                    <div
                        className="absolute inset-0 bg-black/70"
                        onClick={() => setShowFinishModal(false)}
                    />
                    <div className="relative bg-gray-900 rounded-t-3xl px-5 pt-5 pb-10 w-full z-10">
                        <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-5" />

                        {getIncompleteCount() > 0 ? (
                            <>
                                <div className="text-center mb-6">
                                    <p className="text-4xl mb-3">⚠️</p>
                                    <h2 className="text-white font-bold text-xl">
                                        Not quite done
                                    </h2>
                                    <p className="text-gray-500 text-sm mt-1">
                                        {getIncompleteCount()} set{getIncompleteCount() !== 1 ? 's' : ''} not logged yet
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    <button
                                        onClick={handleAutoFinish}
                                        disabled={finishing}
                                        className="w-full bg-orange-500 active:bg-orange-600 disabled:opacity-50 text-white font-semibold py-4 rounded-2xl transition-colors"
                                    >
                                        {finishing ? 'Saving...' : 'Auto-fill remaining sets'}
                                    </button>
                                    <button
                                        onClick={handleFinish}
                                        disabled={finishing}
                                        className="w-full bg-gray-800 active:bg-gray-700 disabled:opacity-50 text-gray-300 font-medium py-4 rounded-2xl transition-colors"
                                    >
                                        Finish as is
                                    </button>
                                    <button
                                        onClick={() => setShowFinishModal(false)}
                                        className="w-full text-gray-500 text-sm py-3"
                                    >
                                        Keep going
                                    </button>
                                    <button
                                        onClick={handleDiscard}
                                        className="w-full text-red-400/70 text-sm py-2"
                                    >
                                        Discard workout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="text-center mb-6">
                                    <p className="text-5xl mb-3">💪</p>
                                    <h2 className="text-white font-bold text-xl">
                                        Workout Complete
                                    </h2>
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
                            </>
                        )}
                    </div>
                </div>
            )}

            {(showAddExercise || showReplaceFor) && (
                <div className="fixed inset-0 z-50 flex flex-col justify-end">
                    <div
                        className="absolute inset-0 bg-black/70"
                        onClick={() => {
                            setShowAddExercise(false)
                            setShowReplaceFor(null)
                        }}
                    />
                    <div className="relative bg-gray-900 rounded-t-3xl z-10 flex flex-col max-h-[75vh]">
                        <div className="px-5 pt-5 pb-3 flex-shrink-0">
                            <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-4" />
                            <h2 className="text-white font-semibold text-lg">
                                {showReplaceFor ? 'Replace Exercise' : 'Add Exercise'}
                            </h2>
                            <p className="text-gray-500 text-xs mt-1">
                                {showReplaceFor
                                    ? `Replacing ${showReplaceFor.exerciseName}`
                                    : 'Add to current session'}
                            </p>
                        </div>
                        <div className="overflow-y-auto px-5 pb-10">
                            {(showReplaceFor ? replaceAvailable : availableExercises).length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 text-sm">
                                        No exercises available.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2 mt-2">
                                    {(showReplaceFor ? replaceAvailable : availableExercises).map(ex => (
                                        <button
                                            key={ex.id}
                                            onClick={() => handleAddExercise(ex.id)}
                                            className="w-full bg-gray-800 active:bg-gray-700 border border-gray-700 rounded-xl px-4 py-3 text-left transition-colors"
                                        >
                                            <p className="text-white text-sm font-medium">
                                                {ex.name}
                                            </p>
                                            <div className="flex gap-2 mt-1">
                                                {ex.muscleGroup && (
                                                    <span className="text-xs text-orange-400">
                                                        {ex.muscleGroup}
                                                    </span>
                                                )}
                                                {ex.equipment && (
                                                    <span className="text-xs text-gray-500">
                                                        {ex.equipment}
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

            {menuExercise && (
                <ExerciseMenu
                    exercise={menuExercise}
                    note={exerciseMeta[menuExercise.id]?.note || ''}
                    restDuration={exerciseMeta[menuExercise.id]?.restDuration || 90}
                    defaultUnit={exerciseMeta[menuExercise.id]?.defaultUnit || 'KG'}
                    onClose={() => setMenuExercise(null)}
                    onNoteChange={val => {
                        updateMeta(menuExercise.id, 'note', val)
                        setMenuExercise(null)
                    }}
                    onRestChange={val => updateMeta(menuExercise.id, 'restDuration', val)}
                    onUnitChange={val => updateMeta(menuExercise.id, 'defaultUnit', val)}
                    onReplace={() => {
                        setShowReplaceFor(menuExercise)
                        setMenuExercise(null)
                    }}
                />
            )}
        </div>
    )
}