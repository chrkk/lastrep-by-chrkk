import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../lib/db'

export default function OnboardingModal() {
    const navigate = useNavigate()
    const [show, setShow] = useState(false)

    useEffect(() => {
        checkOnboarding()
    }, [])

    async function checkOnboarding() {
        try {
            const done = await db.meta.get('onboardingComplete')
            if (!done) setShow(true)
        } catch (_) {
            setShow(true)
        }
    }

    async function handleContinueAsGuest() {
        await db.meta.put({ key: 'onboardingComplete', value: true })
        setShow(false)
    }

    async function handleCreateAccount() {
        await db.meta.put({ key: 'onboardingComplete', value: true })
        setShow(false)
        navigate('/register')
    }

    if (!show) return null

    return (
        <div className="fixed inset-0 z-[100] bg-gray-950 flex flex-col items-center justify-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            </div>

            <h1 className="text-white text-3xl font-bold text-center mb-2">
                LastRep
            </h1>
            <p className="text-gray-500 text-sm text-center mb-1">by chrkk</p>

            <p className="text-gray-400 text-sm text-center mt-6 mb-10 leading-relaxed max-w-xs">
                Track your workouts, log sets in real time, and see your progress — fully offline at the gym.
            </p>

            <div className="w-full max-w-xs space-y-3">
                <button
                    onClick={handleCreateAccount}
                    className="w-full bg-orange-500 active:bg-orange-600 text-white font-semibold py-4 rounded-2xl transition-colors"
                >
                    Create a free account
                </button>
                <button
                    onClick={handleContinueAsGuest}
                    className="w-full bg-gray-900 border border-gray-800 active:bg-gray-800 text-gray-300 font-medium py-4 rounded-2xl transition-colors"
                >
                    Try as guest
                </button>
                <p className="text-gray-600 text-xs text-center pt-1">
                    Guest data is saved on this device only.
                    Create an account to sync across devices.
                </p>
            </div>
        </div>
    )
}