import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/Navbar'

function formatDate(dateStr) {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    })
}

export default function ExerciseHistory() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [history, setHistory] = useState([])
    const [exerciseName, setExerciseName] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchHistory()
    }, [id])

    async function fetchHistory() {
        try {
            const sessionsRes = await api.get('/api/workout-sessions')
            const completed = sessionsRes.data.filter(s => s.status === 'COMPLETED')

            const exerciseId = parseInt(id)
            const relevant = []

            for (const session of completed) {
                const se = session.exercises?.find(
                    e => e.exerciseId === exerciseId
                )
                if (se && se.setGroups?.length > 0) {
                    if (!exerciseName) setExerciseName(se.exerciseName)
                    relevant.push({
                        sessionId: session.id,
                        date: session.createdAt,
                        routineName: session.routineName,
                        setGroups: se.setGroups,
                    })
                }
            }

            setHistory(relevant)
        } catch (err) {
            console.error('Failed to fetch exercise history', err)
        } finally {
            setLoading(false)
        }
    }

    function getBestSet(setGroups) {
        let best = null
        for (const group of setGroups) {
            for (const entry of group.entries) {
                if (!best || entry.weight > best.weight) {
                    best = entry
                }
            }
        }
        return best
    }

    function getTotalVolume(setGroups) {
        let total = 0
        for (const group of setGroups) {
            for (const entry of group.entries) {
                if (entry.weight && entry.reps) {
                    total += entry.weight * entry.reps
                }
            }
        }
        return Math.round(total)
    }

    return (
        <div className="min-h-screen bg-gray-950 pb-8">
            <Navbar />
            <div className="px-4 py-6">

                <button
                    onClick={() => navigate('/history')}
                    className="text-gray-500 text-sm mb-4 flex items-center gap-1"
                >
                    ← Back
                </button>

                <div className="mb-6">
                    <h1 className="text-xl font-bold text-white">
                        {exerciseName || 'Exercise History'}
                    </h1>
                    <p className="text-gray-500 text-xs mt-0.5">
                        {history.length} session{history.length !== 1 ? 's' : ''} logged
                    </p>
                </div>

                {loading ? (
                    <div className="text-gray-600 text-sm text-center py-16">
                        Loading...
                    </div>
                ) : history.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-4xl mb-3">📈</p>
                        <p className="text-gray-500 text-sm">No history yet.</p>
                        <p className="text-gray-600 text-xs mt-1">
                            Log this exercise in a workout to see progress here.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {history.map((entry, index) => {
                            const best = getBestSet(entry.setGroups)
                            const volume = getTotalVolume(entry.setGroups)
                            const totalSets = entry.setGroups.length

                            return (
                                <div key={entry.sessionId} className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <p className="text-white text-sm font-medium">
                                                {formatDate(entry.date)}
                                            </p>
                                            <p className="text-gray-500 text-xs mt-0.5">
                                                {entry.routineName || 'Custom'}
                                            </p>
                                        </div>
                                        {index === 0 && (
                                            <span className="text-xs text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">
                                                Latest
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex gap-4 mb-3">
                                        <div>
                                            <p className="text-gray-600 text-xs">Best set</p>
                                            <p className="text-white text-sm font-medium mt-0.5">
                                                {best
                                                    ? `${best.weight}${best.weightUnit === 'KG' ? 'kg' : 'lbs'} × ${best.reps}`
                                                    : '—'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600 text-xs">Volume</p>
                                            <p className="text-white text-sm font-medium mt-0.5">
                                                {volume > 0 ? `${volume.toLocaleString()}kg` : '—'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600 text-xs">Sets</p>
                                            <p className="text-white text-sm font-medium mt-0.5">
                                                {totalSets}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-0.5">
                                        {entry.setGroups.map(group => (
                                            <div key={group.id}>
                                                {group.entries.map((e, ei) => (
                                                    <p key={ei} className="text-gray-600 text-xs">
                                                        Set {group.setNumber}
                                                        {group.entries.length > 1 ? `.${ei + 1}` : ''}: {e.weight}
                                                        {e.weightUnit === 'KG' ? 'kg' : 'lbs'} × {e.reps} reps
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
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}