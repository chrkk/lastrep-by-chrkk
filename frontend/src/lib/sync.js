import { db } from './db'
import { supabase } from './supabase'
import { useAuthStore } from '../store/authStore'

let initialized = false
let running = false

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
    const tableNames = [
        'exercises',
        'routines',
        'routine_exercises',
        'workout_sessions',
        'workout_session_exercises',
        'workout_set_groups',
        'workout_set_entries',
    ]

    const counts = {}

    for (const tableName of tableNames) {
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

        const counts = await getPendingCounts(userId)
        return { skipped: false, counts }
    } finally {
        running = false
    }
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