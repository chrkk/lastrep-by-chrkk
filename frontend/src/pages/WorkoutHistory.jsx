import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'

function formatDuration(seconds) {
    if (!seconds) return null
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    if (h > 0) return `${h}h ${m}m`
    return `${m}m`
}

function formatDate(dateStr) {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    })
}

function formatTime(dateStr) {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    })
}

export default function WorkoutHistory() {
    const navigate = useNavigate()
    const [sessions, setSessions] = useState([])
    const [loading, setLoading] = useState(true)
    const [expandedId, setExpandedId] = useState(null)

    useEffect(() => {
        fetchSessions()
    }, [])

    async function fetchSessions() {
        try {
            const { data, error: fetchError } = await supabase
                .from('workout_sessions')
                .select(`
                    *,
                    workout_session_exercises(
                        *,
                        exercises(name, muscle_group),
                        workout_set_groups(
                            *,
                            workout_set_entries(*)
                        )
                    )
                `)
                .eq('status', 'COMPLETED')
                .order('created_at', { ascending: false })

            if (fetchError) throw fetchError

            const mapped = data.map(session => ({
                id: session.id,
                routineName: session.routine_name_snapshot || 'Custom Workout',
                status: session.status,
                createdAt: session.created_at,
                finishedAt: session.finished_at,
                exercises: (session.workout_session_exercises || [])
                    .sort((a, b) => a.order_index - b.order_index)
                    .map(se => ({
                        id: se.id,
                        exerciseId: se.exercise_id,
                        exerciseName: se.exercises.name,
                        muscleGroup: se.exercises.muscle_group,
                        setGroups: (se.workout_set_groups || [])
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
                    }))
            }))

            setSessions(mapped)
        } catch (err) {
            console.error('Failed to fetch sessions', err)
        } finally {
            setLoading(false)
        }
    }

    function getDuration(session) {
        if (!session.finishedAt) return null
        const diff = Math.floor(
            (new Date(session.finishedAt) - new Date(session.createdAt)) / 1000
        )
        return formatDuration(diff)
    }

    function getTotalSets(session) {
        return session.exercises?.reduce(
            (sum, se) => sum + (se.setGroups?.length || 0), 0
        ) || 0
    }

    return (
        <div className="min-h-screen bg-gray-950 pb-8">
            <Navbar />
            <div className="px-4 py-6">

                <div className="mb-6">
                    <h1 className="text-xl font-bold text-white">History</h1>
                    <p className="text-gray-500 text-xs mt-0.5">
                        {sessions.length} completed workout{sessions.length !== 1 ? 's' : ''}
                    </p>
                </div>

                {loading ? (
                    <div className="text-gray-600 text-sm text-center py-16">
                        Loading...
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-14 h-14 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-gray-500 text-sm">No workouts yet.</p>
                        <p className="text-gray-600 text-xs mt-1">
                            Complete your first workout to see it here.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {sessions.map(session => (
                            <div key={session.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                                <button
                                    onClick={() => setExpandedId(
                                        expandedId === session.id ? null : session.id
                                    )}
                                    className="w-full px-4 py-4 text-left active:bg-gray-800 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-white font-medium text-sm">
                                                {session.routineName}
                                            </p>
                                            <p className="text-gray-500 text-xs mt-0.5">
                                                {formatDate(session.createdAt)} · {formatTime(session.createdAt)}
                                            </p>
                                            <div className="flex gap-3 mt-1.5">
                                                {getDuration(session) && (
                                                    <span className="text-xs text-gray-400">
                                                        ⏱ {getDuration(session)}
                                                    </span>
                                                )}
                                                <span className="text-xs text-gray-400">
                                                    {getTotalSets(session)} sets
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {session.exercises?.length} exercises
                                                </span>
                                            </div>
                                        </div>
                                        <span className={`text-gray-600 text-lg transition-transform ${
                                            expandedId === session.id ? 'rotate-90' : ''
                                        }`}>
                                            ›
                                        </span>
                                    </div>
                                </button>

                                {expandedId === session.id && (
                                    <div className="border-t border-gray-800 px-4 py-3 space-y-3">
                                        {session.exercises?.map(se => (
                                            <div key={se.id}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="text-gray-300 text-xs font-medium">
                                                        {se.exerciseName}
                                                    </p>
                                                    <button
                                                        onClick={() => navigate(`/exercises/${se.exerciseId}/history`)}
                                                        className="text-orange-400 text-xs active:text-orange-300"
                                                    >
                                                        History →
                                                    </button>
                                                </div>
                                                {se.setGroups?.map(group => (
                                                    <div key={group.id} className="ml-2">
                                                        {group.entries.map((entry, ei) => (
                                                            <p key={ei} className="text-gray-600 text-xs py-0.5">
                                                                Set {group.setNumber}
                                                                {group.entries.length > 1 ? `.${ei + 1}` : ''}: {entry.weight}
                                                                {entry.weightUnit === 'KG' ? 'kg' : 'lbs'} × {entry.reps} reps
                                                                {group.setType !== 'NORMAL' && (
                                                                    <span className="text-gray-700 ml-1">
                                                                        ({group.setType === 'DROP_SET' ? 'Drop' :
                                                                        group.setType === 'PYRAMID_ASCENDING' ? 'Pyr↑' : 'Pyr↓'})
                                                                    </span>
                                                                )}
                                                            </p>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}