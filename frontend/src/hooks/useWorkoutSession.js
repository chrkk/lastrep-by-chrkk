import { useState, useEffect, useCallback } from 'react'
import { db } from '../lib/db'
import { useAuthStore } from '../store/authStore'

export function useWorkoutSession(sessionId) {
    const { userId } = useAuthStore()
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState(false)

    const fetchSession = useCallback(async () => {
        if (!userId || !sessionId) return
        try {
            const sessionData = await db.workout_sessions.get(sessionId)
            if (!sessionData) {
                setLoadError(true)
                return
            }

            const sessionExercises = await db.workout_session_exercises
                .where('workoutSessionId').equals(sessionId)
                .sortBy('orderIndex')

            const mappedExercises = await Promise.all(
                sessionExercises.map(async se => {
                    const exercise = await db.exercises.get(se.exerciseId)

                    const setGroups = await db.workout_set_groups
                        .where('sessionExerciseId').equals(se.id)
                        .sortBy('setNumber')

                    const setGroupsWithEntries = await Promise.all(
                        setGroups.map(async g => {
                            const entries = await db.workout_set_entries
                                .where('setGroupId').equals(g.id)
                                .sortBy('entryNumber')

                            return {
                                id: g.id,
                                setNumber: g.setNumber,
                                setType: g.setType,
                                entries: entries.map(e => ({
                                    id: e.id,
                                    weight: e.weight,
                                    weightUnit: e.weightUnit,
                                    reps: e.reps,
                                    reachedFailure: e.reachedFailure,
                                }))
                            }
                        })
                    )

                    return {
                        id: se.id,
                        exerciseId: se.exerciseId,
                        exerciseName: exercise?.name || 'Unknown',
                        muscleGroup: exercise?.muscleGroup || null,
                        orderIndex: se.orderIndex,
                        targetSets: se.targetSets,
                        targetMinReps: se.targetMinReps,
                        targetMaxReps: se.targetMaxReps,
                        restSeconds: se.restSeconds,
                        setGroups: setGroupsWithEntries,
                    }
                })
            )

            setSession({
                id: sessionData.id,
                routineId: sessionData.routineId,
                routineName: sessionData.routineNameSnapshot,
                status: sessionData.status,
                createdAt: sessionData.createdAt,
                finishedAt: sessionData.finishedAt,
                exercises: mappedExercises,
            })
        } catch (err) {
            console.error('Failed to fetch session from local db', err)
            setLoadError(true)
        } finally {
            setLoading(false)
        }
    }, [userId, sessionId])

    useEffect(() => {
        fetchSession()
    }, [fetchSession])

    async function logSet(seId, payload) {
        const now = new Date().toISOString()
        const currentSe = session?.exercises?.find(e => e.id === seId)
        const nextSetNumber = (currentSe?.setGroups?.length || 0) + 1
        const groupId = crypto.randomUUID()

        await db.transaction('rw',
            db.workout_set_groups,
            db.workout_set_entries,
            async () => {
                await db.workout_set_groups.put({
                    id: groupId,
                    userId,
                    sessionExerciseId: seId,
                    setNumber: nextSetNumber,
                    setType: payload.setType || 'NORMAL',
                    syncStatus: 'pending',
                    createdAt: now,
                    updatedAt: now,
                })

                const entries = payload.entries.map((entry, i) => ({
                    id: crypto.randomUUID(),
                    userId,
                    setGroupId: groupId,
                    entryNumber: i + 1,
                    weight: entry.weight,
                    weightUnit: entry.weightUnit,
                    reps: entry.reps,
                    reachedFailure: entry.reachedFailure || false,
                    syncStatus: 'pending',
                    createdAt: now,
                    updatedAt: now,
                }))

                await db.workout_set_entries.bulkPut(entries)
            }
        )

        await fetchSession()
        return session
    }

    async function deleteSet(seId, setGroupId) {
        await db.transaction('rw',
            db.workout_set_groups,
            db.workout_set_entries,
            async () => {
                const now = new Date().toISOString()
                await db.workout_set_entries
                    .where('setGroupId').equals(setGroupId)
                    .modify({
                        syncStatus: 'pending_delete',
                        updatedAt: now,
                    })
                await db.workout_set_groups.update(setGroupId, {
                    syncStatus: 'pending_delete',
                    updatedAt: now,
                })
            }
        )
        await fetchSession()
        return session
    }

    async function addExerciseToSession(exerciseId) {
        const now = new Date().toISOString()
        const exercise = await db.exercises.get(exerciseId)
        const nextIndex = session?.exercises?.length || 0
        const seId = crypto.randomUUID()

        await db.workout_session_exercises.put({
            id: seId,
            userId,
            workoutSessionId: sessionId,
            exerciseId,
            orderIndex: nextIndex,
            targetSets: null,
            targetMinReps: null,
            targetMaxReps: null,
            restSeconds: 90,
            syncStatus: 'pending',
            createdAt: now,
            updatedAt: now,
        })

        await fetchSession()
        return {
            id: seId,
            exerciseId,
            exerciseName: exercise?.name || 'Unknown',
            muscleGroup: exercise?.muscleGroup || null,
            setGroups: [],
            restSeconds: 90,
        }
    }

    async function finishSession() {
        const now = new Date().toISOString()
        await db.workout_sessions.update(sessionId, {
            status: 'COMPLETED',
            finishedAt: now,
            syncStatus: 'pending',
            updatedAt: now,
        })
        await fetchSession()
    }

    async function cancelSession() {
        const now = new Date().toISOString()
        await db.workout_sessions.update(sessionId, {
            status: 'CANCELLED',
            syncStatus: 'pending',
            updatedAt: now,
        })
    }

    async function getLastPerformance(exerciseId) {
        const completedSessions = await db.workout_sessions
            .where('[userId+status]')
            .equals([userId, 'COMPLETED'])
            .reverse()
            .sortBy('createdAt')

        for (const s of completedSessions) {
            if (s.id === sessionId) continue

            const se = await db.workout_session_exercises
                .where('workoutSessionId').equals(s.id)
                .filter(e => e.exerciseId === exerciseId)
                .first()

            if (!se) continue

            const setGroups = await db.workout_set_groups
                .where('sessionExerciseId').equals(se.id)
                .sortBy('setNumber')

            if (setGroups.length === 0) continue

            const setGroupsWithEntries = await Promise.all(
                setGroups.map(async g => {
                    const entries = await db.workout_set_entries
                        .where('setGroupId').equals(g.id)
                        .sortBy('entryNumber')
                    return {
                        id: g.id,
                        setNumber: g.setNumber,
                        setType: g.setType,
                        entries: entries.map(e => ({
                            weight: e.weight,
                            weightUnit: e.weightUnit,
                            reps: e.reps,
                        }))
                    }
                })
            )

            return {
                exerciseId,
                date: s.createdAt,
                setGroups: setGroupsWithEntries,
            }
        }

        return null
    }

    return {
        session,
        loading,
        loadError,
        logSet,
        deleteSet,
        addExerciseToSession,
        finishSession,
        cancelSession,
        getLastPerformance,
        refetch: fetchSession,
    }
}