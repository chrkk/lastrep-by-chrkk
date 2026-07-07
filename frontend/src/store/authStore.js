import { create } from 'zustand'
import { db } from '../lib/db'
import { supabase } from '../lib/supabase'

function generateGuestId() {
    return 'guest_' + crypto.randomUUID()
}

async function getOrCreateGuestId() {
    const existing = await db.meta.get('guestUserId')
    if (existing) return existing.value

    const newGuestId = generateGuestId()
    await db.meta.put({ key: 'guestUserId', value: newGuestId })
    return newGuestId
}

export const useAuthStore = create((set, get) => ({
    userId: null,
    isGuest: true,
    isOnline: navigator.onLine,
    isServerReachable: false,
    isMigrating: false,
    initialized: false,

    initialize: async () => {
        await db.open()


        const { data: { session } } = await supabase.auth.getSession()

        if (session) {
            set({
                userId: session.user.id,
                isGuest: false,
                initialized: true,
            })
        } else {
            const guestId = await getOrCreateGuestId()
            set({
                userId: guestId,
                isGuest: true,
                initialized: true,
            })
        }

        window.addEventListener('online', () => {
            set({ isOnline: true })
            get().checkServerReachable()
        })

        window.addEventListener('offline', () => {
            set({ isOnline: false, isServerReachable: false })
        })

        if (navigator.onLine) {
            get().checkServerReachable()
        }
    },

    checkServerReachable: async () => {
        try {
            const { error } = await supabase
                .from('exercises')
                .select('id')
                .limit(1)

            set({ isServerReachable: !error })
        } catch {
            set({ isServerReachable: false })
        }
    },

    setOnlineStatus: (isOnline) => set({ isOnline }),

    signIn: (userId) => set({
        userId,
        isGuest: false,
    }),

    signOut: async () => {
        const guestId = await getOrCreateGuestId()
        set({
            userId: guestId,
            isGuest: true,
            isServerReachable: false,
        })
    },

    setMigrating: (isMigrating) => set({ isMigrating }),
}))