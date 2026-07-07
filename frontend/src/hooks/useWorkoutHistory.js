import { useState, useEffect, useCallback } from 'react'
import { db } from '../lib/db'
import { useAuthStore } from '../store/authStore'

export function useWorkoutHistory() {
    const { userId } = useAuthStore()
    const [sessions, setSessions] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchHistory = useCallback(async () => {
        if (!userId) return
        try {
            const completedSessions = await db.workout_sessions
                .where('[userId+status]')
                .equals([userId, 'COMPLETED'])
                .reverse()
                .sortBy('createdAt')

            const withExercises = await Promise.all(
                completedSessions.map(async session => {
                    const sessionExercises = await db.workout_session_exercises
                        .where('workoutSessionId')
                        .equals(session.id)
                        .sortBy('orderIndex')

                    const exercisesWithSets = await Promise.all(
                        sessionExercises.map(async se => {
                            const exercise = await db.exercises.get(se.exerciseId)

                            const setGroups = await db.workout_set_groups
                                .where('sessionExerciseId')
                                .equals(se.id)
                                .sortBy('setNumber')

                            const setGroupsWithEntries = await Promise.all(
                                setGroups.map(async g => {
                                    const entries = await db.workout_set_entries
                                        .where('setGroupId')
                                        .equals(g.id)
                                        .sortBy('entryNumber')

                                    return {
                                        id: g.id,
                                        setNumber: g.set_number || g.setNumber,
                                        setType: g.set_type || g.setType,
                                        entries: entries.map(e => ({
                                            weight: e.weight,
                                            weightUnit: e.weight_unit || e.weightUnit,
                                            reps: e.reps,
                                        }))
                                    }
                                })
                            )

                            return {
                                id: se.id,
                                exerciseId: se.exercise_id || se.exerciseId,
                                exerciseName: exercise?.name || 'Unknown Exercise',
                                muscleGroup: exercise?.muscle_group || exercise?.muscleGroup || null,
                                setGroups: setGroupsWithEntries,
                            }
                        })
                    )

                    return {
                        id: session.id,
                        routineName: session.routine_name_snapshot || session.routineNameSnapshot || 'Custom Workout',
                        status: session.status,
                        createdAt: session.created_at || session.createdAt,
                        finishedAt: session.finished_at || session.finishedAt,
                        exercises: exercisesWithSets,
                    }
                })
            )

            setSessions(withExercises)
        } catch (err) {
            console.error('Failed to fetch workout history from local db', err)
        } finally {
            setLoading(false)
        }
    }, [userId])

    useEffect(() => {
        fetchHistory()
    }, [fetchHistory])

    return { sessions, loading, refetch: fetchHistory }
}