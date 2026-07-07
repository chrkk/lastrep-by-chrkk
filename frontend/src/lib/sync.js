import { db } from './db'
import { supabase } from './supabase'
import { useAuthStore } from '../store/authStore'

let initialized = false
let running = false

const syncableTables = [
    'exercises',
    'routines',
    'routine_exercises',
    'workout_sessions',
    'workout_session_exercises',
    'workout_set_groups',
    'workout_set_entries',
]

function toRemoteRow(tableName, row) {
    const common = {
        id: row.id,
        user_id: row.userId,
        created_at: row.createdAt,
        updated_at: row.updatedAt,
        deleted_at: row.deletedAt,
    }

    switch (tableName) {
        case 'exercises':
            return {
                ...common,
                name: row.name,
                muscle_group: row.muscleGroup,
                equipment: row.equipment,
            }
        case 'routines':
            return {
                ...common,
                name: row.name,
                description: row.description,
                routine_order: row.routineOrder,
            }
        case 'routine_exercises':
            return {
                ...common,
                routine_id: row.routineId,
                exercise_id: row.exerciseId,
                order_index: row.orderIndex,
                target_sets: row.targetSets,
                target_min_reps: row.targetMinReps,
                target_max_reps: row.targetMaxReps,
                rest_seconds: row.restSeconds,
            }
        case 'workout_sessions':
            return {
                ...common,
                routine_id: row.routineId,
                routine_name_snapshot: row.routineNameSnapshot,
                status: row.status,
                notes: row.notes,
                finished_at: row.finishedAt,
            }
        case 'workout_session_exercises':
            return {
                ...common,
                workout_session_id: row.workoutSessionId,
                exercise_id: row.exerciseId,
                order_index: row.orderIndex,
                target_sets: row.targetSets,
                target_min_reps: row.targetMinReps,
                target_max_reps: row.targetMaxReps,
                rest_seconds: row.restSeconds,
            }
        case 'workout_set_groups':
            return {
                ...common,
                session_exercise_id: row.sessionExerciseId,
                set_number: row.setNumber,
                set_type: row.setType,
            }
        case 'workout_set_entries':
            return {
                ...common,
                set_group_id: row.setGroupId,
                entry_number: row.entryNumber,
                weight: row.weight,
                weight_unit: row.weightUnit,
                reps: row.reps,
                reached_failure: row.reachedFailure,
            }
        default:
            return common
    }
}

function fromRemoteRow(tableName, row) {
    const common = {
        id: row.id,
        userId: row.user_id ?? row.userId,
        createdAt: row.created_at ?? row.createdAt ?? null,
        updatedAt: row.updated_at ?? row.updatedAt ?? null,
        deletedAt: row.deleted_at ?? row.deletedAt ?? null,
        syncStatus: 'synced',
    }

    switch (tableName) {
        case 'exercises':
            return {
                ...common,
                name: row.name,
                muscleGroup: row.muscle_group ?? row.muscleGroup ?? null,
                equipment: row.equipment ?? null,
            }
        case 'routines':
            return {
                ...common,
                name: row.name,
                description: row.description ?? null,
                routineOrder: row.routine_order ?? row.routineOrder ?? 0,
            }
        case 'routine_exercises':
            return {
                ...common,
                routineId: row.routine_id ?? row.routineId,
                exerciseId: row.exercise_id ?? row.exerciseId,
                orderIndex: row.order_index ?? row.orderIndex ?? 0,
                targetSets: row.target_sets ?? row.targetSets ?? null,
                targetMinReps: row.target_min_reps ?? row.targetMinReps ?? null,
                targetMaxReps: row.target_max_reps ?? row.targetMaxReps ?? null,
                restSeconds: row.rest_seconds ?? row.restSeconds ?? null,
            }
        case 'workout_sessions':
            return {
                ...common,
                routineId: row.routine_id ?? row.routineId,
                routineNameSnapshot: row.routine_name_snapshot ?? row.routineNameSnapshot ?? null,
                status: row.status,
                notes: row.notes ?? null,
                finishedAt: row.finished_at ?? row.finishedAt ?? null,
            }
        case 'workout_session_exercises':
            return {
                ...common,
                workoutSessionId: row.workout_session_id ?? row.workoutSessionId,
                exerciseId: row.exercise_id ?? row.exerciseId,
                orderIndex: row.order_index ?? row.orderIndex ?? 0,
                targetSets: row.target_sets ?? row.targetSets ?? null,
                targetMinReps: row.target_min_reps ?? row.targetMinReps ?? null,
                targetMaxReps: row.target_max_reps ?? row.targetMaxReps ?? null,
                restSeconds: row.rest_seconds ?? row.restSeconds ?? null,
            }
        case 'workout_set_groups':
            return {
                ...common,
                sessionExerciseId: row.session_exercise_id ?? row.sessionExerciseId,
                setNumber: row.set_number ?? row.setNumber ?? 0,
                setType: row.set_type ?? row.setType ?? 'NORMAL',
            }
        case 'workout_set_entries':
            return {
                ...common,
                setGroupId: row.set_group_id ?? row.setGroupId,
                entryNumber: row.entry_number ?? row.entryNumber ?? 0,
                weight: row.weight,
                weightUnit: row.weight_unit ?? row.weightUnit,
                reps: row.reps,
                reachedFailure: row.reached_failure ?? row.reachedFailure ?? false,
            }
        default:
            return common
    }
}

async function checkServerReachable() {
    try {
        const { error } = await supabase
            .from('exercises')
            .select('id')
            .limit(1)

        return !error
    } catch {
        return false
    }
}

async function getPendingCounts(userId) {
    const counts = {}

    for (const tableName of syncableTables) {
        const table = db[tableName]
        const pending = await table.where('[userId+syncStatus]').equals([userId, 'pending']).count()
        const pendingDelete = await table.where('[userId+syncStatus]').equals([userId, 'pending_delete']).count()

        counts[tableName] = {
            pending,
            pendingDelete,
        }
    }

    return counts
}

async function syncTable(tableName, userId) {
    const table = db[tableName]

    const pendingRows = [
        ...(await table.where('[userId+syncStatus]').equals([userId, 'pending']).toArray()),
        ...(await table.where('[userId+syncStatus]').equals([userId, 'sync_error']).toArray()),
    ]

    for (const row of pendingRows) {
        try {
            const { error } = await supabase
                .from(tableName)
                .upsert(toRemoteRow(tableName, row), { onConflict: 'id' })

            if (error) {
                throw error
            }

            await table.update(row.id, {
                syncStatus: 'synced',
                updatedAt: new Date().toISOString(),
            })
        } catch (error) {
            await table.update(row.id, {
                syncStatus: 'sync_error',
                updatedAt: new Date().toISOString(),
            })
            console.error(`Failed to sync ${tableName} row`, error)
        }
    }

    const pendingDeletes = [
        ...(await table.where('[userId+syncStatus]').equals([userId, 'pending_delete']).toArray()),
        ...(await table.where('[userId+syncStatus]').equals([userId, 'sync_error']).toArray()),
    ]

    for (const row of pendingDeletes) {
        try {
            const { error } = await supabase
                .from(tableName)
                .delete()
                .eq('id', row.id)

            if (error) {
                throw error
            }

            await table.delete(row.id)
        } catch (error) {
            await table.update(row.id, {
                syncStatus: 'sync_error',
                updatedAt: new Date().toISOString(),
            })
            console.error(`Failed to delete ${tableName} row`, error)
        }
    }
}

async function pullTable(tableName, userId, lastSyncedAt) {
    let query = supabase
        .from(tableName)
        .select('*')
        .eq('user_id', userId)

    if (lastSyncedAt) {
        query = query.gt('updated_at', lastSyncedAt)
    }

    const { data, error } = await query

    if (error) {
        throw error
    }

    if (!data || data.length === 0) {
        return
    }

    const localById = new Map(
        await db[tableName]
            .where('userId')
            .equals(userId)
            .toArray()
            .then(rows => rows.map(row => [row.id, row]))
    )

    const localRows = data
        .map(row => {
            const incoming = fromRemoteRow(tableName, row)
            const existing = localById.get(incoming.id)

            if (!existing) {
                return incoming
            }

            const incomingUpdatedAt = new Date(incoming.updatedAt || 0).getTime()
            const existingUpdatedAt = new Date(existing.updatedAt || 0).getTime()

            if (existing.syncStatus !== 'synced' && existingUpdatedAt >= incomingUpdatedAt) {
                return null
            }

            if (existing.deletedAt && existing.syncStatus !== 'synced') {
                return null
            }

            if (existingUpdatedAt > incomingUpdatedAt) {
                return null
            }

            return incoming
        })
        .filter(Boolean)

    await db[tableName].bulkPut(localRows)
}

export async function syncNow() {
    if (running) return { skipped: true, reason: 'already-running' }

    const { userId, isGuest, isMigrating } = useAuthStore.getState()

    if (!userId || isGuest || isMigrating) {
        return { skipped: true, reason: 'not-eligible' }
    }

    if (!navigator.onLine) {
        return { skipped: true, reason: 'offline' }
    }

    running = true

    try {
        const previousSyncMeta = await db.meta.get('lastSyncedAt')
        const lastSyncedAt = previousSyncMeta?.value || null

        const reachable = await checkServerReachable()

        useAuthStore.setState({ isServerReachable: reachable })

        if (!reachable) {
            return { skipped: true, reason: 'server-unreachable' }
        }

        for (const tableName of syncableTables) {
            await syncTable(tableName, userId)
        }

        for (const tableName of syncableTables) {
            await pullTable(tableName, userId, lastSyncedAt)
        }

        await db.meta.put({
            key: 'lastSyncedAt',
            value: new Date().toISOString(),
        })

        const counts = await getPendingCounts(userId)
        return { skipped: false, counts }
    } finally {
        running = false
    }
}

export async function migrateGuestData(guestUserId, realUserId) {
    if (!guestUserId || !realUserId || guestUserId === realUserId) {
        return { skipped: true, reason: 'invalid-arguments' }
    }

    const now = new Date().toISOString()

    await db.transaction('rw', db.meta, ...syncableTables.map(tableName => db[tableName]), async () => {
        for (const tableName of syncableTables) {
            const table = db[tableName]
            const records = await table.where('userId').equals(guestUserId).toArray()

            if (records.length === 0) continue

            const migratedRecords = records.map(record => ({
                ...record,
                userId: realUserId,
                syncStatus: 'pending',
                updatedAt: now,
            }))

            await table.bulkPut(migratedRecords)
        }

        await db.meta.delete('guestUserId')
    })

    return { skipped: false }
}

export function initializeSyncEngine() {
    if (initialized) {
        return () => {}
    }

    initialized = true

    const handleOnline = () => {
        syncNow().catch(error => {
            console.error('Failed to run sync on reconnect', error)
        })
    }

    window.addEventListener('online', handleOnline)

    syncNow().catch(error => {
        console.error('Failed to run initial sync pass', error)
    })

    return () => {
        window.removeEventListener('online', handleOnline)
        initialized = false
    }
}