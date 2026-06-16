import { NavLink, useNavigate } from 'react-router-dom'

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
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.5 9.5l-11 11M9.5 3.5l11 11M4 14l1.5 1.5M8.5 18.5L10 20M14 4l1.5 1.5M18.5 8.5L20 10M3 17l4-4M17 3l4 4" />
            </svg>
        )
    },
    {
        to: '/routines',
        label: 'Routines',
        icon: (active) => (
            <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7a2 2 0 012-2h2a2 2 0 012 2v10M9 17H7a2 2 0 01-2-2V9a2 2 0 012-2h2m6 10h2a2 2 0 002-2V9a2 2 0 00-2-2h-2" />
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

    function handleLogout() {
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        localStorage.removeItem('name')
        navigate('/login')
    }

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-30 bg-gray-950/95 backdrop-blur-lg border-t border-gray-800"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
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
                <button
                    onClick={handleLogout}
                    className="flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-xl text-gray-500 active:text-red-400 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="text-[10px] font-medium">Out</span>
                </button>
            </div>
        </nav>
    )
}