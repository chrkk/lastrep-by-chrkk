import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function Dashboard() {
    const navigate = useNavigate()
    const name = localStorage.getItem('name')

    return (
        <div className="min-h-screen bg-gray-950 pb-8">
            <Navbar />
            <div className="px-4 py-6">

                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-white">
                        Hey, {name} 👋
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Ready to train?
                    </p>
                </div>

                <button
                    onClick={() => navigate('/select-routine')}
                    className="w-full bg-orange-500 active:bg-orange-600 text-white font-bold py-5 rounded-2xl text-lg mb-6 transition-colors"
                >
                    💪 Start Workout
                </button>

                <div className="grid grid-cols-2 gap-3 mb-6">
                    <button
                        onClick={() => navigate('/routines')}
                        className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-5 text-left active:bg-gray-800 transition-colors"
                    >
                        <p className="text-2xl mb-2">📋</p>
                        <p className="text-white text-sm font-medium">Routines</p>
                        <p className="text-gray-500 text-xs mt-0.5">Manage programs</p>
                    </button>
                    <button
                        onClick={() => navigate('/exercises')}
                        className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-5 text-left active:bg-gray-800 transition-colors"
                    >
                        <p className="text-2xl mb-2">🏋️</p>
                        <p className="text-white text-sm font-medium">Exercises</p>
                        <p className="text-gray-500 text-xs mt-0.5">Exercise library</p>
                    </button>
                    <button
                        onClick={() => navigate('/history')}
                        className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-5 text-left active:bg-gray-800 transition-colors"
                    >
                        <p className="text-2xl mb-2">📅</p>
                        <p className="text-white text-sm font-medium">History</p>
                        <p className="text-gray-500 text-xs mt-0.5">Past workouts</p>
                    </button>
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-5">
                        <p className="text-2xl mb-2">📈</p>
                        <p className="text-white text-sm font-medium">Progress</p>
                        <p className="text-gray-500 text-xs mt-0.5">Coming soon</p>
                    </div>
                </div>

            </div>
        </div>
    )
}