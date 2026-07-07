import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../lib/db'
import { useAuthStore } from '../store/authStore'
import { useRoutines } from '../hooks/useRoutines'
import { useStartSession } from '../hooks/useStartSession'
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
    const now = new Date()
    const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24))
    if (diff === 0) return 'Today'
    if (diff === 1) return 'Yesterday'
    if (diff < 7) return `${diff} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function Dashboard() {
    const navigate = useNavigate()
    const { userId, isGuest } = useAuthStore()
    const { routines, loading: routinesLoading } = useRoutines()
    const { startSession } = useStartSession()

    const [name, setName] = useState('there')
    const [dashboard, setDashboard] = useState(null)
    const [loading, setLoading] = useState(true)
    const [starting, setStarting] = useState(false)

    useEffect(() => {
        if (!isGuest) {
            supabase.auth.getUser().then(({ data }) => {
                const user = data?.user
                if (user) {
                    const displayName = user.user_metadata?.name
                        || user.email?.split('@')[0]
                        || 'there'
                    setName(displayName)
                }
            })
        }
    }, [isGuest])

    useEffect(() => {
        if (userId) fetchDashboard()
    }, [userId, routines])

    async function fetchDashboard() {
        try {
            const exerciseCount = await db.exercises
                .where('userId').equals(userId)
                .filter(e => !e.deletedAt)
                .count()

            const hasExercises = exerciseCount > 0
            const hasRoutines = routines.length > 0

            const weekStart = new Date()
            weekStart.setDate(weekStart.getDate() - 7)

            const allCompleted = await db.workout_sessions
                .where('[userId+status]')
                .equals([userId, 'COMPLETED'])
                .reverse()
                .sortBy('createdAt')

            const lastSession = allCompleted[0] || null

            const weeklyCount = allCompleted.filter(s => {
                const date = new Date(s.createdAt || s.created_at)
                return date > weekStart
            }).length

            const lastDuration = lastSession?.finishedAt || lastSession?.finished_at
                ? Math.floor(
                    (new Date(lastSession.finishedAt || lastSession.finished_at) -
                        new Date(lastSession.createdAt || lastSession.created_at)) / 1000
                )
                : null

            let suggestedRoutineId = null
            let suggestedRoutineName = null

            if (routines.length > 0) {
                if (!lastSession || !lastSession.routineId) {
                    suggestedRoutineId = routines[0].id
                    suggestedRoutineName = routines[0].name
                } else {
                    const lastRoutineId = lastSession.routineId || lastSession.routine_id
                    const lastIndex = routines.findIndex(r => r.id === lastRoutineId)
                    const nextIndex = lastIndex === -1
                        ? 0
                        : (lastIndex + 1) % routines.length
                    suggestedRoutineId = routines[nextIndex].id
                    suggestedRoutineName = routines[nextIndex].name
                }
            }

            const recentSessions = allCompleted.slice(0, 5).map(s => ({
                id: s.id,
                routineName: s.routineNameSnapshot || s.routine_name_snapshot || 'Custom Workout',
                date: s.createdAt || s.created_at,
                durationSeconds: (s.finishedAt || s.finished_at)
                    ? Math.floor(
                        (new Date(s.finishedAt || s.finished_at) -
                            new Date(s.createdAt || s.created_at)) / 1000
                    )
                    : null,
            }))

            setDashboard({
                hasExercises,
                hasRoutines,
                suggestedRoutineId,
                suggestedRoutineName,
                lastWorkoutDate: lastSession?.createdAt || lastSession?.created_at || null,
                lastWorkoutDuration: lastDuration,
                weeklySessionCount: weeklyCount,
                recentSessions,
            })
        } catch (err) {
            console.error('Failed to fetch dashboard from local db', err)
        } finally {
            setLoading(false)
        }
    }

    async function handleStartSuggested() {
        if (!dashboard?.suggestedRoutineId) return
        setStarting(true)
        try {
            const sessionId = await startSession(dashboard.suggestedRoutineId)
            navigate(`/workout/${sessionId}`)
        } catch (err) {
            console.error('Failed to start workout', err)
        } finally {
            setStarting(false)
        }
    }

    const isNewUser = !loading && dashboard && !dashboard.hasExercises && !dashboard.hasRoutines
    const needsRoutine = !loading && dashboard && dashboard.hasExercises && !dashboard.hasRoutines

    return (
        <div className="min-h-screen bg-gray-950 pb-24">
            <Navbar />
            <div className="px-4 py-6">

                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-white">
                        Hey, {isGuest ? 'Guest' : name}
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {loading ? 'Loading...' : isNewUser
                            ? "Let's set up your first workout"
                            : dashboard?.lastWorkoutDate
                                ? `Last workout ${formatDate(dashboard.lastWorkoutDate)}`
                                : 'No workouts yet — start your first one'}
                    </p>
                </div>

                {isNewUser ? (
                    <div className="bg-gray-900 border border-orange-500/20 rounded-2xl p-5 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h2 className="text-white font-bold text-lg mb-1">
                            {isGuest ? 'Welcome to LastRep' : 'Welcome to LastRep'}
                        </h2>
                        <p className="text-gray-500 text-sm mb-5">
                            Two quick steps and you're ready to train.
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => navigate('/exercises')}
                                className="w-full flex items-center gap-4 bg-gray-800 active:bg-gray-700 rounded-2xl px-4 py-4 text-left transition-colors"
                            >
                                <div className="w-9 h-9 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                                    <span className="text-orange-400 font-bold text-sm">1</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-white text-sm font-medium">Add an exercise</p>
                                    <p className="text-gray-500 text-xs mt-0.5">Build your exercise library</p>
                                </div>
                                <span className="text-gray-600 text-lg">›</span>
                            </button>
                            <button
                                onClick={() => navigate('/routines')}
                                className="w-full flex items-center gap-4 bg-gray-800 active:bg-gray-700 rounded-2xl px-4 py-4 text-left transition-colors"
                            >
                                <div className="w-9 h-9 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                                    <span className="text-orange-400 font-bold text-sm">2</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-white text-sm font-medium">Create a routine</p>
                                    <p className="text-gray-500 text-xs mt-0.5">Group exercises into a workout plan</p>
                                </div>
                                <span className="text-gray-600 text-lg">›</span>
                            </button>
                        </div>
                    </div>
                ) : needsRoutine ? (
                    <div className="bg-gray-900 border border-orange-500/20 rounded-2xl p-5 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                        </div>
                        <h2 className="text-white font-bold text-lg mb-1">One more step</h2>
                        <p className="text-gray-500 text-sm mb-4">
                            You've got exercises ready. Now create a routine to group them into a workout.
                        </p>
                        <button
                            onClick={() => navigate('/routines')}
                            className="w-full bg-orange-500 active:bg-orange-600 text-white font-semibold py-4 rounded-2xl transition-colors"
                        >
                            Create your first routine
                        </button>
                    </div>
                ) : (
                    <>
                        {dashboard?.suggestedRoutineId ? (
                            <button
                                onClick={handleStartSuggested}
                                disabled={starting}
                                className="w-full bg-orange-500 active:bg-orange-600 disabled:opacity-50 text-white font-bold py-5 rounded-2xl mb-2 transition-colors"
                            >
                                {starting ? 'Starting...' : (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 6.5h2v11h-2zM4 9h1.5v6H4zM15.5 6.5h2v11h-2zM18.5 9H20v6h-1.5zM8.5 11h7v2h-7z" />
                                        </svg>
                                        Start {dashboard.suggestedRoutineName}
                                    </span>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={() => navigate('/select-routine')}
                                className="w-full bg-orange-500 active:bg-orange-600 text-white font-bold py-5 rounded-2xl mb-2 transition-colors"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 6.5h2v11h-2zM4 9h1.5v6H4zM15.5 6.5h2v11h-2zM18.5 9H20v6h-1.5zM8.5 11h7v2h-7z" />
                                    </svg>
                                    Start Workout
                                </span>
                            </button>
                        )}
                        <button
                            onClick={() => navigate('/select-routine')}
                            className="w-full bg-gray-900 border border-gray-800 active:bg-gray-800 text-gray-400 text-sm py-3 rounded-2xl mb-6 transition-colors"
                        >
                            Choose a different routine
                        </button>
                    </>
                )}

                {!loading && dashboard && !isNewUser && !needsRoutine && (
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-4">
                            <p className="text-gray-500 text-xs mb-1">This week</p>
                            <p className="text-white text-2xl font-bold">
                                {dashboard.weeklySessionCount}
                            </p>
                            <p className="text-gray-600 text-xs mt-0.5">sessions</p>
                        </div>
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-4">
                            <p className="text-gray-500 text-xs mb-1">Last session</p>
                            <p className="text-white text-2xl font-bold">
                                {dashboard.lastWorkoutDuration
                                    ? formatDuration(dashboard.lastWorkoutDuration)
                                    : '—'}
                            </p>
                            <p className="text-gray-600 text-xs mt-0.5">duration</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3 mb-6">
                    <button
                        onClick={() => navigate('/routines')}
                        className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-5 text-left active:bg-gray-800 transition-colors"
                    >
                        <div className="w-9 h-9 rounded-xl bg-gray-800 flex items-center justify-center mb-3">
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                        </div>
                        <p className="text-white text-sm font-medium">Routines</p>
                        <p className="text-gray-500 text-xs mt-0.5">Manage programs</p>
                    </button>
                    <button
                        onClick={() => navigate('/exercises')}
                        className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-5 text-left active:bg-gray-800 transition-colors"
                    >
                        <div className="w-9 h-9 rounded-xl bg-gray-800 flex items-center justify-center mb-3">
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <p className="text-white text-sm font-medium">Exercises</p>
                        <p className="text-gray-500 text-xs mt-0.5">Exercise library</p>
                    </button>
                    <button
                        onClick={() => navigate('/history')}
                        className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-5 text-left active:bg-gray-800 transition-colors"
                    >
                        <div className="w-9 h-9 rounded-xl bg-gray-800 flex items-center justify-center mb-3">
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-white text-sm font-medium">History</p>
                        <p className="text-gray-500 text-xs mt-0.5">Past workouts</p>
                    </button>
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-5">
                        <div className="w-9 h-9 rounded-xl bg-gray-800 flex items-center justify-center mb-3">
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 17l6-6 4 4 8-8" />
                            </svg>
                        </div>
                        <p className="text-white text-sm font-medium">Progress</p>
                        <p className="text-gray-500 text-xs mt-0.5">Coming soon</p>
                    </div>
                </div>

                {!loading && dashboard?.recentSessions?.length > 0 && (
                    <div>
                        <p className="text-gray-500 text-xs font-medium mb-3 uppercase tracking-wider">
                            Recent sessions
                        </p>
                        <div className="space-y-2">
                            {dashboard.recentSessions.map(session => (
                                <button
                                    key={session.id}
                                    onClick={() => navigate('/history')}
                                    className="w-full bg-gray-900 border border-gray-800 rounded-2xl px-4 py-3 text-left active:bg-gray-800 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-white text-sm font-medium">
                                                {session.routineName}
                                            </p>
                                            <p className="text-gray-500 text-xs mt-0.5">
                                                {formatDate(session.date)}
                                                {session.durationSeconds && ` · ${formatDuration(session.durationSeconds)}`}
                                            </p>
                                        </div>
                                        <span className="text-gray-700 text-lg">›</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}