import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'

const TABS = [
    {
        to: '/',
        label: 'Home',
        icon: (active) => (
            <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        )
    },
    {
        to: '/exercises',
        label: 'Exercises',
        icon: (active) => (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        )
    },
    {
        to: '/routines',
        label: 'Routines',
        icon: (active) => (
            <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
        )
    },
    {
        to: '/history',
        label: 'History',
        icon: (active) => (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    },
]

export default function Navbar() {
    const navigate = useNavigate()
    const { isGuest } = useAuthStore()

    async function handleLogout() {
        await supabase.auth.signOut()
        navigate('/login')
    }

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-30 bg-gray-950/95 backdrop-blur-lg border-t border-gray-800"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
            {isGuest && (
                <div className="flex items-center justify-center gap-2 py-1.5 bg-orange-500/10 border-b border-orange-500/20">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                    <p className="text-orange-400 text-xs font-medium">
                        Guest mode — data saved locally
                    </p>
                </div>
            )}
            <div className="flex items-center justify-between px-2 py-2">
                {TABS.map(tab => (
                    <NavLink
                        key={tab.to}
                        to={tab.to}
                        end={tab.to === '/'}
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-xl transition-colors ${
                                isActive ? 'text-orange-400' : 'text-gray-500 active:text-gray-300'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                {tab.icon(isActive)}
                                <span className="text-[10px] font-medium">{tab.label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
                {isGuest ? (
                    <button
                        onClick={() => navigate('/register')}
                        className="flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-xl text-orange-400 active:text-orange-300 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-[10px] font-medium">Sign Up</span>
                    </button>
                ) : (
                    <NavLink
                        to="/settings"
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-xl transition-colors ${
                                isActive ? 'text-orange-400' : 'text-gray-500 active:text-gray-300'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-[10px] font-medium">Settings</span>
                            </>
                        )}
                    </NavLink>
                )}
            </div>
        </nav>
    )
}