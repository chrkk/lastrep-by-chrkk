import { useState, useEffect } from 'react'
import { db } from '../lib/db'
import { useAuthStore } from '../store/authStore'

export default function InstallBanner() {
    const { userId } = useAuthStore()
    const [show, setShow] = useState(false)
    const isStandalone = window.navigator.standalone === true
        || window.matchMedia('(display-mode: standalone)').matches

    useEffect(() => {
        if (isStandalone) return
        checkShouldShow()
    }, [userId])

    async function checkShouldShow() {
        try {
            const dismissed = await db.meta.get('installBannerDismissed')
            if (dismissed) return

            const exerciseCount = await db.exercises
                .where('userId').equals(userId)
                .count()

            if (exerciseCount >= 1) setShow(true)
        } catch (_) {}
    }

    async function handleDismiss() {
        await db.meta.put({ key: 'installBannerDismissed', value: true })
        setShow(false)
    }

    if (!show || isStandalone) return null

    return (
        <div className="mx-4 mt-4 bg-gray-900 border border-orange-500/20 rounded-2xl px-4 py-3 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-medium">Add to Home Screen</p>
                <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">
                    Tap <span className="text-gray-300">Share → Add to Home Screen</span> for the full offline experience with no browser bar.
                </p>
            </div>
            <button
                onClick={handleDismiss}
                className="text-gray-600 active:text-gray-400 flex-shrink-0 mt-0.5"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    )
}