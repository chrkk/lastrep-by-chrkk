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
        <nav className="bg-gray-900 border-b border-gray-800">
            <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">

                {/* Logo */}
                <Link to="/" className="text-white font-bold text-lg tracking-tight">
                    LastRep
                </Link>

                {/* Nav Links */}
                <div className="flex items-center gap-1">
                    <Link
                        to="/"
                        className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                            isActive('/')
                                ? 'text-white bg-gray-800'
                                : 'text-gray-500 hover:text-white hover:bg-gray-800'
                        }`}
                    >
                        Dashboard
                    </Link>
                    <Link
                        to="/exercises"
                        className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                            isActive('/exercises')
                                ? 'text-white bg-gray-800'
                                : 'text-gray-500 hover:text-white hover:bg-gray-800'
                        }`}
                    >
                        Exercises
                    </Link>
                    <Link
                        to="/routines"
                        className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                            isActive('/routines')
                                ? 'text-white bg-gray-800'
                                : 'text-gray-500 hover:text-white hover:bg-gray-800'
                        }`}
                    >
                        Routines
                    </Link>
                    <Link
                        to="/history"
                        className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                            isActive('/history')
                                ? 'text-white bg-gray-800'
                                : 'text-gray-500 hover:text-white hover:bg-gray-800'
                        }`}
                    >
                        History
                    </Link>
                </div>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-white text-sm transition-colors"
                >
                    Log out
                </button>

            </div>
        </nav>
    )
}