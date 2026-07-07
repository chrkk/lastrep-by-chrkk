import { useState, useEffect, useCallback } from 'react'
import { db } from '../lib/db'
import { useAuthStore } from '../store/authStore'

export function useExercises() {
    const { userId } = useAuthStore()
    const [exercises, setExercises] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchExercises = useCallback(async () => {
        if (!userId) return
        try {
            const data = await db.exercises
                .where('userId').equals(userId)
                .filter(e => !e.deletedAt)
                .sortBy('createdAt')

            setExercises(data.reverse())
        } catch (err) {
            console.error('Failed to fetch exercises from local db', err)
        } finally {
            setLoading(false)
        }
    }, [userId])

    useEffect(() => {
        fetchExercises()
    }, [fetchExercises])

    async function addExercise(form) {
        const now = new Date().toISOString()
        const exercise = {
            id: crypto.randomUUID(),
            userId,
            name: form.name,
            muscleGroup: form.muscleGroup || null,
            equipment: form.equipment || null,
            syncStatus: 'pending',
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
        }
        await db.exercises.put(exercise)
        await fetchExercises()
        return exercise
    }

    async function updateExercise(id, form) {
        const now = new Date().toISOString()
        await db.exercises.update(id, {
            name: form.name,
            muscleGroup: form.muscleGroup || null,
            equipment: form.equipment || null,
            syncStatus: 'pending',
            updatedAt: now,
        })
        await fetchExercises()
    }

    async function deleteExercise(id) {
        const inRoutine = await db.routine_exercises
            .where('exerciseId').equals(id)
            .filter(re => !re.deletedAt)
            .count()

        const inWorkout = await db.workout_session_exercises
            .where('exerciseId').equals(id)
            .count()

        if (inRoutine > 0) {
            throw new Error('This exercise is used in a routine. Remove it from those routines first.')
        }

        if (inWorkout > 0) {
            throw new Error('This exercise has workout history and cannot be deleted.')
        }

        const now = new Date().toISOString()
        await db.exercises.update(id, {
            deletedAt: now,
            syncStatus: 'pending_delete',
            updatedAt: now,
        })
        await fetchExercises()
    }

    return { exercises, loading, addExercise, updateExercise, deleteExercise, refetch: fetchExercises }
}