import { useState, useEffect, useCallback } from 'react'
import { db } from '../lib/db'
import { useAuthStore } from '../store/authStore'

export function useRoutineDetail(routineId) {
    const { userId } = useAuthStore()
    const [routine, setRoutine] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchRoutine = useCallback(async () => {
        if (!userId || !routineId) return
        try {
            const routineData = await db.routines.get(routineId)
            if (!routineData || routineData.deletedAt) {
                setRoutine(null)
                return
            }

            const exercises = await db.routine_exercises
                .where('routineId').equals(routineId)
                .filter(re => !re.deletedAt)
                .sortBy('orderIndex')

            const withExerciseNames = await Promise.all(
                exercises.map(async re => {
                    const exercise = await db.exercises.get(re.exerciseId)
                    return {
                        id: re.id,
                        exerciseId: re.exerciseId,
                        exerciseName: exercise?.name || 'Unknown',
                        muscleGroup: exercise?.muscleGroup || null,
                        orderIndex: re.orderIndex,
                        targetSets: re.targetSets,
                        targetMinReps: re.targetMinReps,
                        targetMaxReps: re.targetMaxReps,
                        restSeconds: re.restSeconds,
                    }
                })
            )

            setRoutine({ ...routineData, exercises: withExerciseNames })
        } catch (err) {
            console.error('Failed to fetch routine detail from local db', err)
        } finally {
            setLoading(false)
        }
    }, [userId, routineId])

    useEffect(() => {
        fetchRoutine()
    }, [fetchRoutine])

    async function addExerciseToRoutine(exercise, targetForm) {
        const now = new Date().toISOString()
        const nextIndex = routine?.exercises?.length || 0

        const re = {
            id: crypto.randomUUID(),
            userId,
            routineId,
            exerciseId: exercise.id,
            orderIndex: nextIndex,
            targetSets: targetForm.targetSets,
            targetMinReps: targetForm.targetMinReps,
            targetMaxReps: targetForm.targetMaxReps,
            restSeconds: targetForm.restSeconds || 90,
            syncStatus: 'pending',
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
        }

        await db.routine_exercises.put(re)
        await fetchRoutine()
    }

    async function removeExerciseFromRoutine(routineExerciseId) {
        const now = new Date().toISOString()
        await db.routine_exercises.update(routineExerciseId, {
            deletedAt: now,
            syncStatus: 'pending_delete',
            updatedAt: now,
        })
        await fetchRoutine()
    }

    async function reorderExercises(reorderedExercises) {
        const now = new Date().toISOString()
        await db.transaction('rw', db.routine_exercises, async () => {
            for (let i = 0; i < reorderedExercises.length; i++) {
                await db.routine_exercises.update(reorderedExercises[i].id, {
                    orderIndex: i,
                    syncStatus: 'pending',
                    updatedAt: now,
                })
            }
        })
        await fetchRoutine()
    }

    return {
        routine,
        loading,
        addExerciseToRoutine,
        removeExerciseFromRoutine,
        reorderExercises,
        refetch: fetchRoutine,
    }
}