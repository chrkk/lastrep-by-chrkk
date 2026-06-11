import { Link, useNavigate, useLocation } from 'react-router-dom'

export default function Navbar() {
    const navigate = useNavigate()
    const location = useLocation()

    function handleLogout() {
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        localStorage.removeItem('name')
        navigate('/login')
    }

    function isActive(path) {
        return location.pathname === path
    }

    return (
        <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
            <div className="px-4 h-14 flex items-center justify-between">
                <Link to="/" className="text-white font-bold text-lg tracking-tight">
                    LastRep
                </Link>

                <div className="flex items-center gap-1">
                    <Link
                        to="/"
                        className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                            isActive('/')
                                ? 'text-white bg-gray-800'
                                : 'text-gray-500'
                        }`}
                    >
                        Home
                    </Link>
                    <Link
                        to="/exercises"
                        className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                            isActive('/exercises')
                                ? 'text-white bg-gray-800'
                                : 'text-gray-500'
                        }`}
                    >
                        Exercises
                    </Link>
                    <Link
                        to="/routines"
                        className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                            isActive('/routines')
                                ? 'text-white bg-gray-800'
                                : 'text-gray-500'
                        }`}
                    >
                        Routines
                    </Link>
                    <Link
                        to="/history"
                        className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                            isActive('/history')
                                ? 'text-white bg-gray-800'
                                : 'text-gray-500'
                        }`}
                    >
                        History
                    </Link>
                </div>

                <button
                    onClick={handleLogout}
                    className="text-gray-600 text-xs"
                >
                    Out
                </button>
            </div>
        </nav>
    )
}