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
        <div className="min-h-screen bg-orange-500 p-8">
            <h1 className="text-white text-2xl font-bold">Hey, {name}</h1>
            <p className="text-white">@{username}</p>
            <button onClick={handleLogout} className="mt-4 bg-black text-white px-4 py-2 rounded">
                Log out
            </button>
        </div>
    )
}