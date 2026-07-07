import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { db } from '../lib/db'
import { useAuthStore } from '../store/authStore'
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
    const { id: exerciseId } = useParams()
    const navigate = useNavigate()
    const { userId } = useAuthStore()
    const [history, setHistory] = useState([])
    const [exerciseName, setExerciseName] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (userId && exerciseId) fetchHistory()
    }, [userId, exerciseId])

    async function fetchHistory() {
        try {
            const exercise = await db.exercises.get(exerciseId)
            if (exercise) setExerciseName(exercise.name)

            const completedSessions = await db.workout_sessions
                .where('[userId+status]')
                .equals([userId, 'COMPLETED'])
                .reverse()
                .sortBy('createdAt')

            const relevant = []

            for (const session of completedSessions) {
                const se = await db.workout_session_exercises
                    .where('workoutSessionId')
                    .equals(session.id)
                    .filter(e => (e.exerciseId || e.exercise_id) === exerciseId)
                    .first()

                if (!se) continue

                const setGroups = await db.workout_set_groups
                    .where('sessionExerciseId')
                    .equals(se.id)
                    .sortBy('setNumber')

                if (setGroups.length === 0) continue

                const setGroupsWithEntries = await Promise.all(
                    setGroups.map(async g => {
                        const entries = await db.workout_set_entries
                            .where('setGroupId')
                            .equals(g.id)
                            .sortBy('entryNumber')

                        return {
                            id: g.id,
                            setNumber: g.setNumber || g.set_number,
                            setType: g.setType || g.set_type,
                            entries: entries.map(e => ({
                                weight: e.weight,
                                weightUnit: e.weightUnit || e.weight_unit,
                                reps: e.reps,
                            }))
                        }
                    })
                )

                relevant.push({
                    sessionId: session.id,
                    date: session.createdAt || session.created_at,
                    routineName: session.routineNameSnapshot || session.routine_name_snapshot || 'Custom',
                    setGroups: setGroupsWithEntries,
                })
            }

            setHistory(relevant)
        } catch (err) {
            console.error('Failed to fetch exercise history from local db', err)
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
                    <div className="space-y-3">
                        {[1, 2].map(i => (
                            <div
                                key={i}
                                className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-4 animate-pulse"
                            >
                                <div className="space-y-2">
                                    <div className="h-3.5 bg-gray-800 rounded w-1/3" />
                                    <div className="h-2.5 bg-gray-800 rounded w-1/4" />
                                    <div className="flex gap-4 mt-3">
                                        <div className="h-8 bg-gray-800 rounded w-16" />
                                        <div className="h-8 bg-gray-800 rounded w-16" />
                                        <div className="h-8 bg-gray-800 rounded w-16" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
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
                                <div
                                    key={entry.sessionId}
                                    className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-4"
                                >
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
                                        {entry.setGroups.map((group, gi) => (
                                            <div key={group.id || gi}>
                                                {group.entries.map((e, ei) => (
                                                    <p key={ei} className="text-gray-600 text-xs">
                                                        Set {group.setNumber}
                                                        {group.entries.length > 1 ? `.${ei + 1}` : ''}: {e.weight}
                                                        {e.weightUnit === 'KG' ? 'kg' : 'lbs'} × {e.reps} reps
                                                        {group.setType && group.setType !== 'NORMAL' && (
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