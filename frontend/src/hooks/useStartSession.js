import { db } from '../lib/db'
import { useAuthStore } from '../store/authStore'

export function useStartSession() {
    const { userId } = useAuthStore()

    async function startSession(routineId) {
        const routine = await db.routines.get(routineId)
        if (!routine) throw new Error('Routine not found')

        const routineExercises = await db.routine_exercises
            .where('routineId').equals(routineId)
            .filter(re => !re.deletedAt)
            .sortBy('orderIndex')

        const now = new Date().toISOString()
        const sessionId = crypto.randomUUID()

        await db.transaction('rw',
            db.workout_sessions,
            db.workout_session_exercises,
            async () => {
                await db.workout_sessions.put({
                    id: sessionId,
                    userId,
                    routineId,
                    routineNameSnapshot: routine.name,
                    status: 'IN_PROGRESS',
                    notes: null,
                    syncStatus: 'pending',
                    createdAt: now,
                    updatedAt: now,
                    finishedAt: null,
                    deletedAt: null,
                })

                for (const re of routineExercises) {
                    await db.workout_session_exercises.put({
                        id: crypto.randomUUID(),
                        userId,
                        workoutSessionId: sessionId,
                        exerciseId: re.exerciseId,
                        orderIndex: re.orderIndex,
                        targetSets: re.targetSets,
                        targetMinReps: re.targetMinReps,
                        targetMaxReps: re.targetMaxReps,
                        restSeconds: re.restSeconds || 90,
                        syncStatus: 'pending',
                        createdAt: now,
                        updatedAt: now,
                    })
                }
            }
        )

        return sessionId
    }

    return { startSession }
}