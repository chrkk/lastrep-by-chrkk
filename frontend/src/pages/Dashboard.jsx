import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
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
    const name = localStorage.getItem('name')
    const [dashboard, setDashboard] = useState(null)
    const [loading, setLoading] = useState(true)
    const [starting, setStarting] = useState(false)

    useEffect(() => {
        fetchDashboard()
    }, [])

    async function fetchDashboard() {
        try {
            const res = await api.get('/api/dashboard')
            setDashboard(res.data)
        } catch (err) {
            console.error('Failed to fetch dashboard', err)
        } finally {
            setLoading(false)
        }
    }

    async function handleStartSuggested() {
        if (!dashboard?.suggestedRoutineId) return
        setStarting(true)
        try {
            const res = await api.post('/api/workout-sessions/start', {
                routineId: dashboard.suggestedRoutineId
            })
            navigate(`/workout/${res.data.id}`)
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
                        Hey, {name} 👋
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
                        <p className="text-3xl mb-3">👋</p>
                        <h2 className="text-white font-bold text-lg mb-1">
                            Welcome to LastRep
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
                                    <p className="text-gray-500 text-xs mt-0.5">
                                        Build your exercise library
                                    </p>
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
                                    <p className="text-gray-500 text-xs mt-0.5">
                                        Group exercises into a workout plan
                                    </p>
                                </div>
                                <span className="text-gray-600 text-lg">›</span>
                            </button>
                        </div>
                    </div>
                ) : needsRoutine ? (
                    <div className="bg-gray-900 border border-orange-500/20 rounded-2xl p-5 mb-6">
                        <p className="text-3xl mb-3">📋</p>
                        <h2 className="text-white font-bold text-lg mb-1">
                            One more step
                        </h2>
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
                                {starting ? 'Starting...' : `💪 Start ${dashboard.suggestedRoutineName}`}
                            </button>
                        ) : (
                            <button
                                onClick={() => navigate('/select-routine')}
                                className="w-full bg-orange-500 active:bg-orange-600 text-white font-bold py-5 rounded-2xl mb-2 transition-colors"
                            >
                                💪 Start Workout
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
                        <p className="text-2xl mb-2">📋</p>
                        <p className="text-white text-sm font-medium">Routines</p>
                        <p className="text-gray-500 text-xs mt-0.5">Manage programs</p>
                    </button>
                    <button
                        onClick={() => navigate('/exercises')}
                        className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-5 text-left active:bg-gray-800 transition-colors"
                    >
                        <p className="text-2xl mb-2">🏋️</p>
                        <p className="text-white text-sm font-medium">Exercises</p>
                        <p className="text-gray-500 text-xs mt-0.5">Exercise library</p>
                    </button>
                    <button
                        onClick={() => navigate('/history')}
                        className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-5 text-left active:bg-gray-800 transition-colors"
                    >
                        <p className="text-2xl mb-2">📅</p>
                        <p className="text-white text-sm font-medium">History</p>
                        <p className="text-gray-500 text-xs mt-0.5">Past workouts</p>
                    </button>
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-5">
                        <p className="text-2xl mb-2">📈</p>
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
                                                {session.totalSets > 0 && ` · ${session.totalSets} sets`}
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