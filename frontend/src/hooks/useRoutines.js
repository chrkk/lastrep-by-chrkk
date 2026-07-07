import { useState, useEffect, useCallback } from 'react'
import { db } from '../lib/db'
import { useAuthStore } from '../store/authStore'

export function useRoutines() {
    const { userId } = useAuthStore()
    const [routines, setRoutines] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchRoutines = useCallback(async () => {
        if (!userId) return
        try {
            const routineData = await db.routines
                .where('userId').equals(userId)
                .filter(r => !r.deletedAt)
                .sortBy('routineOrder')

            const withExercises = await Promise.all(
                routineData.map(async r => {
                    const exercises = await db.routine_exercises
                        .where('routineId').equals(r.id)
                        .filter(re => !re.deletedAt)
                        .sortBy('orderIndex')
                    return { ...r, exercises }
                })
            )

            setRoutines(withExercises)
        } catch (err) {
            console.error('Failed to fetch routines from local db', err)
        } finally {
            setLoading(false)
        }
    }, [userId])

    useEffect(() => {
        fetchRoutines()
    }, [fetchRoutines])

    async function addRoutine(form) {
        const now = new Date().toISOString()
        const maxOrder = routines.length > 0
            ? Math.max(...routines.map(r => r.routineOrder))
            : -1

        const routine = {
            id: crypto.randomUUID(),
            userId,
            name: form.name,
            description: form.description || null,
            routineOrder: maxOrder + 1,
            syncStatus: 'pending',
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
        }
        await db.routines.put(routine)
        await fetchRoutines()
        return routine
    }

    async function updateRoutine(id, form) {
        const now = new Date().toISOString()
        await db.routines.update(id, {
            name: form.name,
            description: form.description || null,
            syncStatus: 'pending',
            updatedAt: now,
        })
        await fetchRoutines()
    }

    async function deleteRoutine(id) {
        const now = new Date().toISOString()
        await db.routines.update(id, {
            deletedAt: now,
            syncStatus: 'pending_delete',
            updatedAt: now,
        })
        await db.routine_exercises
            .where('routineId').equals(id)
            .modify({
                deletedAt: now,
                syncStatus: 'pending_delete',
                updatedAt: now,
            })
        await fetchRoutines()
    }

    async function duplicateRoutine(id) {
        const original = await db.routines.get(id)
        if (!original) throw new Error('Routine not found')

        const originalExercises = await db.routine_exercises
            .where('routineId').equals(id)
            .filter(re => !re.deletedAt)
            .sortBy('orderIndex')

        const now = new Date().toISOString()
        const maxOrder = routines.length > 0
            ? Math.max(...routines.map(r => r.routineOrder))
            : -1

        const newRoutineId = crypto.randomUUID()

        await db.transaction('rw', db.routines, db.routine_exercises, async () => {
            await db.routines.put({
                ...original,
                id: newRoutineId,
                name: original.name + ' (Copy)',
                routineOrder: maxOrder + 1,
                syncStatus: 'pending',
                createdAt: now,
                updatedAt: now,
            })

            for (const re of originalExercises) {
                await db.routine_exercises.put({
                    ...re,
                    id: crypto.randomUUID(),
                    routineId: newRoutineId,
                    syncStatus: 'pending',
                    createdAt: now,
                    updatedAt: now,
                })
            }
        })

        await fetchRoutines()
        return newRoutineId
    }

    return {
        routines,
        loading,
        addRoutine,
        updateRoutine,
        deleteRoutine,
        duplicateRoutine,
        refetch: fetchRoutines,
    }
}