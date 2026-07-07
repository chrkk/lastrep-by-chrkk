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

    const pendingRows = await table.where('[userId+syncStatus]').equals([userId, 'pending']).toArray()

    for (const row of pendingRows) {
        const { syncStatus, ...payload } = row

        const { error } = await supabase
            .from(tableName)
            .upsert(payload, { onConflict: 'id' })

        if (error) {
            throw error
        }

        await table.update(row.id, {
            syncStatus: 'synced',
            updatedAt: new Date().toISOString(),
        })
    }

    const pendingDeletes = await table.where('[userId+syncStatus]').equals([userId, 'pending_delete']).toArray()

    for (const row of pendingDeletes) {
        const { error } = await supabase
            .from(tableName)
            .delete()
            .eq('id', row.id)

        if (error) {
            throw error
        }

        await table.delete(row.id)
    }
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
        const reachable = await checkServerReachable()

        useAuthStore.setState({ isServerReachable: reachable })

        if (!reachable) {
            return { skipped: true, reason: 'server-unreachable' }
        }

        for (const tableName of syncableTables) {
            await syncTable(tableName, userId)
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