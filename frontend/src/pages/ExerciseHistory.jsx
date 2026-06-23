import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
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
            const { data, error: fetchError } = await supabase
                .from('workout_session_exercises')
                .select(`
                    *,
                    exercises(name),
                    workout_sessions!inner(id, created_at, status, routine_name_snapshot),
                    workout_set_groups(*, workout_set_entries(*))
                `)
                .eq('exercise_id', id)
                .eq('workout_sessions.status', 'COMPLETED')
                .order('workout_sessions(created_at)', { ascending: false })

            if (fetchError) throw fetchError

            const relevant = data.filter(
                se => se.workout_set_groups && se.workout_set_groups.length > 0
            )

            if (relevant.length > 0) {
                setExerciseName(relevant[0].exercises.name)
            }

            const mapped = relevant.map(se => ({
                sessionId: se.workout_session_id,
                date: se.workout_sessions.created_at,
                routineName: se.workout_sessions.routine_name_snapshot || 'Custom',
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

            setHistory(mapped)
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
                if (!best || entry.weight > best.weight) best = entry
            }
        }
        return best
    }

    function getTotalVolume(setGroups) {
        let total = 0
        for (const group of setGroups) {
            for (const entry of group.entries) {
                if (entry.weight && entry.reps) total += entry.weight * entry.reps
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
                    <div className="text-gray-600 text-sm text-center py-16">Loading...</div>
                ) : history.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-14 h-14 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 17l6-6 4 4 8-8" />
                            </svg>
                        </div>
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
                                                {entry.routineName}
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