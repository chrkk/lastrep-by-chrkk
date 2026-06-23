import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ExerciseSetCard from '../components/ExerciseSetCard'
import ExerciseMenu from '../components/ExerciseMenu'
import Toast from '../components/Toast'

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
    const [toast, setToast] = useState(null)
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

    const [loadError, setLoadError] = useState(false)

    async function fetchSession() {
        try {
            const { data: sessionData, error: sessionError } = await supabase
                .from('workout_sessions')
                .select('*')
                .eq('id', sessionId)
                .single()

            if (sessionError) throw sessionError

            const { data: exercisesData, error: exercisesError } = await supabase
                .from('workout_session_exercises')
                .select(`
                *,
                exercises(name, muscle_group),
                workout_set_groups(
                    *,
                    workout_set_entries(*)
                )
            `)
                .eq('workout_session_id', sessionId)
                .order('order_index', { ascending: true })

            if (exercisesError) throw exercisesError

            const mappedExercises = exercisesData.map(se => ({
                id: se.id,
                exerciseId: se.exercise_id,
                exerciseName: se.exercises.name,
                muscleGroup: se.exercises.muscle_group,
                orderIndex: se.order_index,
                targetSets: se.target_sets,
                targetMinReps: se.target_min_reps,
                targetMaxReps: se.target_max_reps,
                restSeconds: se.rest_seconds,
                setGroups: (se.workout_set_groups || [])
                    .sort((a, b) => a.set_number - b.set_number)
                    .map(g => ({
                        id: g.id,
                        setNumber: g.set_number,
                        setType: g.set_type,
                        entries: (g.workout_set_entries || [])
                            .sort((a, b) => a.entry_number - b.entry_number)
                            .map(e => ({
                                id: e.id,
                                weight: e.weight,
                                weightUnit: e.weight_unit,
                                reps: e.reps,
                                reachedFailure: e.reached_failure,
                            }))
                    }))
            }))

            const fullSession = {
                id: sessionData.id,
                routineId: sessionData.routine_id,
                routineName: sessionData.routine_name_snapshot,
                status: sessionData.status,
                createdAt: sessionData.created_at,
                finishedAt: sessionData.finished_at,
                exercises: mappedExercises,
            }

            setSession(fullSession)
            await fetchLastPerformances(mappedExercises)
            initMeta(mappedExercises)
        } catch (err) {
            console.error('Failed to fetch session', err)
            setLoadError(true)
        } finally {
            setLoading(false)
        }
    }

    async function fetchAllExercises() {
        try {
            const { data, error: fetchError } = await supabase
                .from('exercises')
                .select('*')
                .order('name', { ascending: true })

            if (fetchError) throw fetchError
            setAllExercises(data)
        } catch (err) {
            console.error('Failed to fetch exercises', err)
        }
    }

    async function fetchLastPerformances(sessionExercises) {
        const performances = {}
        await Promise.all(
            sessionExercises.map(async se => {
                try {
                    const { data, error: perfError } = await supabase
                        .from('workout_session_exercises')
                        .select(`
                        exercise_id,
                        exercises(name),
                        workout_session_id,
                        workout_sessions!inner(id, created_at, status),
                        workout_set_groups(
                            *,
                            workout_set_entries(*)
                        )
                    `)
                        .eq('exercise_id', se.exerciseId)
                        .eq('workout_sessions.status', 'COMPLETED')
                        .neq('workout_session_id', sessionId)
                        .order('workout_sessions(created_at)', { ascending: false })
                        .limit(1)

                    if (perfError || !data || data.length === 0) return

                    const last = data[0]
                    if (!last.workout_set_groups || last.workout_set_groups.length === 0) return

                    performances[se.exerciseId] = {
                        exerciseId: se.exerciseId,
                        exerciseName: last.exercises.name,
                        date: last.workout_sessions.created_at,
                        setGroups: last.workout_set_groups
                            .sort((a, b) => a.set_number - b.set_number)
                            .map(g => ({
                                id: g.id,
                                setNumber: g.set_number,
                                setType: g.set_type,
                                entries: (g.workout_set_entries || [])
                                    .sort((a, b) => a.entry_number - b.entry_number)
                                    .map(e => ({
                                        weight: e.weight,
                                        weightUnit: e.weight_unit,
                                        reps: e.reps,
                                    }))
                            }))
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

    async function refetchSession() {
        const { data: sessionData } = await supabase
            .from('workout_sessions')
            .select('*')
            .eq('id', sessionId)
            .single()

        const { data: exercisesData } = await supabase
            .from('workout_session_exercises')
            .select(`
            *,
            exercises(name, muscle_group),
            workout_set_groups(
                *,
                workout_set_entries(*)
            )
        `)
            .eq('workout_session_id', sessionId)
            .order('order_index', { ascending: true })

        const mappedExercises = (exercisesData || []).map(se => ({
            id: se.id,
            exerciseId: se.exercise_id,
            exerciseName: se.exercises.name,
            muscleGroup: se.exercises.muscle_group,
            orderIndex: se.order_index,
            targetSets: se.target_sets,
            targetMinReps: se.target_min_reps,
            targetMaxReps: se.target_max_reps,
            restSeconds: se.rest_seconds,
            setGroups: (se.workout_set_groups || [])
                .sort((a, b) => a.set_number - b.set_number)
                .map(g => ({
                    id: g.id,
                    setNumber: g.set_number,
                    setType: g.set_type,
                    entries: (g.workout_set_entries || [])
                        .sort((a, b) => a.entry_number - b.entry_number)
                        .map(e => ({
                            id: e.id,
                            weight: e.weight,
                            weightUnit: e.weight_unit,
                            reps: e.reps,
                            reachedFailure: e.reached_failure,
                        }))
                }))
        }))

        const updatedSession = {
            id: sessionData.id,
            routineId: sessionData.routine_id,
            routineName: sessionData.routine_name_snapshot,
            status: sessionData.status,
            createdAt: sessionData.created_at,
            finishedAt: sessionData.finished_at,
            exercises: mappedExercises,
        }

        setSession(updatedSession)
        return updatedSession
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
            const { data: userData } = await supabase.auth.getUser()
            const userId = userData.user.id

            const currentSe = session.exercises.find(e => e.id === seId)
            const nextSetNumber = (currentSe?.setGroups?.length || 0) + 1

            const { data: groupData, error: groupError } = await supabase
                .from('workout_set_groups')
                .insert({
                    user_id: userId,
                    session_exercise_id: seId,
                    set_number: nextSetNumber,
                    set_type: payload.setType || 'NORMAL',
                })
                .select()
                .single()

            if (groupError) throw groupError

            const entries = payload.entries.map((entry, i) => ({
                user_id: userId,
                set_group_id: groupData.id,
                entry_number: i + 1,
                weight: entry.weight,
                weight_unit: entry.weightUnit,
                reps: entry.reps,
                reached_failure: entry.reachedFailure || false,
            }))

            const { error: entriesError } = await supabase
                .from('workout_set_entries')
                .insert(entries)

            if (entriesError) throw entriesError

            const updatedSession = await refetchSession()
            return updatedSession
        } catch (err) {
            console.error('Failed to log set', err)
            setToast({
                message: 'Failed to save set. Check your connection and try again.',
                type: 'error'
            })
        }
    }

    async function handleDeleteSet(seId, setGroupId) {
        try {
            const { error: deleteError } = await supabase
                .from('workout_set_groups')
                .delete()
                .eq('id', setGroupId)

            if (deleteError) throw deleteError

            const updatedSession = await refetchSession()
            return updatedSession
        } catch (err) {
            console.error('Failed to delete set', err)
            setToast({
                message: 'Failed to remove set. Check your connection and try again.',
                type: 'error'
            })
        }
    }

    async function handleAddExercise(exerciseId) {
        try {
            const { data: userData } = await supabase.auth.getUser()
            const userId = userData.user.id

            const nextIndex = session.exercises.length

            const { data: seData, error: insertError } = await supabase
                .from('workout_session_exercises')
                .insert({
                    user_id: userId,
                    workout_session_id: sessionId,
                    exercise_id: exerciseId,
                    order_index: nextIndex,
                    rest_seconds: 90,
                })
                .select('*, exercises(name, muscle_group)')
                .single()

            if (insertError) throw insertError

            const newSe = {
                id: seData.id,
                exerciseId: seData.exercise_id,
                exerciseName: seData.exercises.name,
                muscleGroup: seData.exercises.muscle_group,
                orderIndex: seData.order_index,
                targetSets: null,
                targetMinReps: null,
                targetMaxReps: null,
                restSeconds: seData.rest_seconds,
                setGroups: [],
            }

            setExerciseMeta(prev => ({
                ...prev,
                [newSe.id]: { note: '', restDuration: 90, defaultUnit: 'KG' }
            }))

            try {
                const { data: perfData } = await supabase
                    .from('workout_session_exercises')
                    .select(`
                    exercise_id,
                    exercises(name),
                    workout_session_id,
                    workout_sessions!inner(id, created_at, status),
                    workout_set_groups(*, workout_set_entries(*))
                `)
                    .eq('exercise_id', exerciseId)
                    .eq('workout_sessions.status', 'COMPLETED')
                    .neq('workout_session_id', sessionId)
                    .order('workout_sessions(created_at)', { ascending: false })
                    .limit(1)

                if (perfData && perfData.length > 0) {
                    const last = perfData[0]
                    if (last.workout_set_groups?.length > 0) {
                        setLastPerformances(prev => ({
                            ...prev,
                            [exerciseId]: {
                                exerciseId,
                                setGroups: last.workout_set_groups
                                    .sort((a, b) => a.set_number - b.set_number)
                                    .map(g => ({
                                        id: g.id,
                                        setNumber: g.set_number,
                                        setType: g.set_type,
                                        entries: (g.workout_set_entries || [])
                                            .sort((a, b) => a.entry_number - b.entry_number)
                                            .map(e => ({
                                                weight: e.weight,
                                                weightUnit: e.weight_unit,
                                                reps: e.reps,
                                            }))
                                    }))
                            }
                        }))
                    }
                }
            } catch (_) {}

            setSession(prev => ({
                ...prev,
                exercises: [...prev.exercises, newSe]
            }))

            setShowAddExercise(false)
            setShowReplaceFor(null)
        } catch (err) {
            console.error('Failed to add exercise', err)
            setToast({
                message: 'Failed to add exercise. Try again.',
                type: 'error'
            })
        }
    }

    async function handleFinish() {
        setFinishing(true)
        try {
            const { error: finishError } = await supabase
                .from('workout_sessions')
                .update({
                    status: 'COMPLETED',
                    finished_at: new Date().toISOString(),
                })
                .eq('id', sessionId)

            if (finishError) throw finishError
            navigate('/history')
        } catch (err) {
            console.error(err)
            setToast({
                message: 'Failed to save workout. Try again.',
                type: 'error'
            })
        } finally {
            setFinishing(false)
        }
    }

    async function handleAutoFinish() {
        setFinishing(true)
        try {
            const { data: userData } = await supabase.auth.getUser()
            const userId = userData.user.id

            for (const se of session.exercises) {
                const target = se.targetSets || 3
                const logged = se.setGroups?.length || 0
                if (logged >= target) continue
                const lastPerf = lastPerformances[se.exerciseId]

                for (let i = logged; i < target; i++) {
                    const lastEntry = lastPerf?.setGroups?.[i]?.entries?.[0]
                    if (!lastEntry) continue

                    const nextSetNumber = i + 1

                    const { data: groupData, error: groupError } = await supabase
                        .from('workout_set_groups')
                        .insert({
                            user_id: userId,
                            session_exercise_id: se.id,
                            set_number: nextSetNumber,
                            set_type: 'NORMAL',
                        })
                        .select()
                        .single()

                    if (groupError) throw groupError

                    const { error: entryError } = await supabase
                        .from('workout_set_entries')
                        .insert({
                            user_id: userId,
                            set_group_id: groupData.id,
                            entry_number: 1,
                            weight: lastEntry.weight,
                            weight_unit: lastEntry.weightUnit,
                            reps: lastEntry.reps,
                            reached_failure: false,
                        })

                    if (entryError) throw entryError
                }
            }

            const { error: finishError } = await supabase
                .from('workout_sessions')
                .update({
                    status: 'COMPLETED',
                    finished_at: new Date().toISOString(),
                })
                .eq('id', sessionId)

            if (finishError) throw finishError
            navigate('/history')
        } catch (err) {
            console.error('Auto-finish failed', err)
            setToast({
                message: 'Failed to auto-fill and finish. Try again.',
                type: 'error'
            })
        } finally {
            setFinishing(false)
        }
    }

    async function handleDiscard() {
        try {
            await supabase
                .from('workout_sessions')
                .update({ status: 'CANCELLED' })
                .eq('id', sessionId)
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

    if (loadError || !session) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
                <div className="text-center">
                    <p className="text-4xl mb-3">⚠️</p>
                    <p className="text-white font-semibold mb-1">Couldn't load this workout</p>
                    <p className="text-gray-500 text-sm mb-5">
                        It may not exist or you may not have access to it.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-orange-500 active:bg-orange-600 text-white font-medium px-6 py-3 rounded-xl transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </div>
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