import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

export default function SelectRoutine() {
    const navigate = useNavigate()
    const [routines, setRoutines] = useState([])
    const [loading, setLoading] = useState(true)
    const [starting, setStarting] = useState(null)

    useEffect(() => {
        fetchRoutines()
    }, [])

    async function fetchRoutines() {
        try {
            const res = await api.get('/api/routines')
            setRoutines(res.data)
        } catch (err) {
            console.error('Failed to fetch routines', err)
        } finally {
            setLoading(false)
        }
    }

    async function handleSelect(routineId) {
        setStarting(routineId)
        try {
            const res = await api.post('/api/workout-sessions/start', { routineId })
            navigate(`/workout/${res.data.id}`)
        } catch (err) {
            console.error('Failed to start session', err)
            setStarting(null)
        }
    }

    const DAY_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

    return (
        <div className="min-h-screen bg-gray-950">

            <div
                className="sticky top-0 z-30 bg-gray-950/95 backdrop-blur-lg border-b border-gray-800 px-4 py-3"
                style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
            >
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/')}
                        className="w-9 h-9 flex items-center justify-center text-gray-400 active:text-white active:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-white font-bold text-base">Start Workout</h1>
                        <p className="text-gray-500 text-xs">Choose a routine to begin</p>
                    </div>
                </div>
            </div>

            <div className="px-4 py-6">

                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div
                                key={i}
                                className="bg-gray-900 border border-gray-800 rounded-2xl px-5 py-5 animate-pulse"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 rounded-xl bg-gray-800 flex-shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3.5 bg-gray-800 rounded w-2/3" />
                                        <div className="h-2.5 bg-gray-800 rounded w-1/3" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : routines.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-14 h-14 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7a2 2 0 012-2h2a2 2 0 012 2v10M9 17H7a2 2 0 01-2-2V9a2 2 0 012-2h2m6 10h2a2 2 0 002-2V9a2 2 0 00-2-2h-2" />
                            </svg>
                        </div>
                        <p className="text-gray-500 text-sm">No routines yet.</p>
                        <p className="text-gray-600 text-xs mt-1 mb-6">
                            Create a routine first before starting a workout.
                        </p>
                        <button
                            onClick={() => navigate('/routines')}
                            className="bg-orange-500 active:bg-orange-600 text-white text-sm font-medium px-6 py-3 rounded-xl transition-colors"
                        >
                            Go to Routines
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {routines.map((routine, index) => (
                            <button
                                key={routine.id}
                                onClick={() => handleSelect(routine.id)}
                                disabled={starting !== null}
                                className="w-full bg-gray-900 border border-gray-800 active:border-orange-500/50 active:bg-gray-800 rounded-2xl px-5 py-5 text-left transition-colors disabled:opacity-50"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                                        {starting === routine.id ? (
                                            <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <span className="text-orange-400 font-bold">
                                                {DAY_LABELS[index] || index + 1}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-semibold text-base">
                                            {routine.name}
                                        </p>
                                        {routine.description && (
                                            <p className="text-gray-500 text-xs mt-0.5 truncate">
                                                {routine.description}
                                            </p>
                                        )}
                                        <p className="text-gray-600 text-xs mt-1">
                                            {routine.exercises?.length === 0
                                                ? 'No exercises'
                                                : `${routine.exercises?.length} exercise${routine.exercises?.length !== 1 ? 's' : ''}`}
                                        </p>
                                    </div>
                                    <span className="text-gray-600 text-lg">›</span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}