import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
    const navigate = useNavigate()
    const name = localStorage.getItem('name')
    const username = localStorage.getItem('username')

    function handleLogout() {
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        localStorage.removeItem('name')
        navigate('/login')
    }

    return (
        <div className="min-h-screen bg-gray-950 p-8">
            <div className="max-w-sm mx-auto">
                <h1 className="text-2xl font-bold text-white mb-1">Hey, {name} 👋</h1>
                <p className="text-gray-500 text-sm mb-8">@{username}</p>
                <button
                    onClick={handleLogout}
                    className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm px-4 py-2 rounded-lg transition-colors"
                >
                    Log out
                </button>
            </div>
        </div>
    )
}