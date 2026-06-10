import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function Dashboard() {
    const name = localStorage.getItem('name')

    return (
        <div className="min-h-screen bg-gray-950">
            <Navbar />
            <div className="max-w-2xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-white mb-1">
                    Hey, {name} 👋
                </h1>
                <p className="text-gray-500 text-sm">
                    Dashboard coming in Phase 8. For now, use the nav above.
                </p>
            </div>
        </div>
    )
}