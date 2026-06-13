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
            <div className="px-4 pt-12 pb-8">

                <button
                    onClick={() => navigate('/')}
                    className="text-gray-500 text-sm mb-6 flex items-center gap-1"
                >
                    ← Back
                </button>

                <h1 className="text-2xl font-bold text-white mb-1">Start Workout</h1>
                <p className="text-gray-500 text-sm mb-8">Choose a routine to begin</p>

                {loading ? (
                    <div className="text-gray-600 text-sm text-center py-16">Loading...</div>
                ) : routines.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-4xl mb-3">📋</p>
                        <p className="text-gray-500 text-sm">No routines yet.</p>
                        <p className="text-gray-600 text-xs mt-1 mb-6">
                            Create a routine first before starting a workout.
                        </p>
                        <button
                            onClick={() => navigate('/routines')}
                            className="bg-orange-500 text-white text-sm font-medium px-6 py-3 rounded-xl"
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