import Dexie from 'dexie'

export const db = new Dexie('LastRepDB')

db.version(1).stores({
    exercises: [
        'id',
        'userId',
        'syncStatus',
        'updatedAt',
        'deletedAt',
        '[userId+syncStatus]',
        '[userId+updatedAt]',
    ].join(', '),

    routines: [
        'id',
        'userId',
        'syncStatus',
        'updatedAt',
        'deletedAt',
        '[userId+syncStatus]',
        '[userId+updatedAt]',
    ].join(', '),

    routine_exercises: [
        'id',
        'userId',
        'routineId',
        'exerciseId',
        'syncStatus',
        'updatedAt',
        'deletedAt',
        '[userId+syncStatus]',
        '[routineId+deletedAt]',
    ].join(', '),

    workout_sessions: [
        'id',
        'userId',
        'routineId',
        'status',
        'syncStatus',
        'updatedAt',
        'deletedAt',
        '[userId+syncStatus]',
        '[userId+status]',
        '[userId+updatedAt]',
    ].join(', '),

    workout_session_exercises: [
        'id',
        'userId',
        'workoutSessionId',
        'exerciseId',
        'syncStatus',
        'updatedAt',
        '[userId+syncStatus]',
        '[workoutSessionId+updatedAt]',
    ].join(', '),

    workout_set_groups: [
        'id',
        'userId',
        'sessionExerciseId',
        'syncStatus',
        'updatedAt',
        '[userId+syncStatus]',
        '[sessionExerciseId+updatedAt]',
    ].join(', '),

    workout_set_entries: [
        'id',
        'userId',
        'setGroupId',
        'syncStatus',
        'updatedAt',
        '[userId+syncStatus]',
        '[setGroupId+updatedAt]',
    ].join(', '),

    meta: [
        'key',
    ].join(', '),
})

export default db