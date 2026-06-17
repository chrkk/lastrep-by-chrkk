import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'

export default function Login() {
    const navigate = useNavigate()
    const [form, setForm] = useState({ username: '', password: '', rememberMe: false })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (sessionStorage.getItem('sessionExpired') === 'true') {
            setError('Your session expired. Please log in again.')
            sessionStorage.removeItem('sessionExpired')
        }
    }, [])

    function handleChange(e) {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
        setForm({ ...form, [e.target.name]: value })
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const res = await api.post('/api/auth/login', form)
            localStorage.setItem('token', res.data.token)
            localStorage.setItem('username', res.data.username)
            localStorage.setItem('name', res.data.name)
            navigate('/')
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid username or password.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
            <div className="w-full max-w-sm">

                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-white tracking-tight">LastRep</h1>
                    <p className="text-gray-500 text-sm mt-1">by chrkk</p>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
                    <h2 className="text-white font-semibold text-lg mb-6">Welcome back</h2>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-gray-400 text-sm mb-1.5">Username</label>
                            <input
                                type="text"
                                name="username"
                                value={form.username}
                                onChange={handleChange}
                                placeholder="Enter Username"
                                required
                                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 text-sm mb-1.5">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Enter Password"
                                required
                                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors"
                            />
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="rememberMe"
                                checked={form.rememberMe}
                                onChange={handleChange}
                                className="w-4 h-4 rounded accent-orange-500"
                            />
                            <span className="text-gray-400 text-sm">Stay logged in for 30 days</span>
                        </label>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-medium rounded-lg py-2.5 text-sm transition-colors mt-2"
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>
                </div>

                <p className="text-center text-gray-600 text-sm mt-6">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-orange-500 hover:text-orange-400">
                        Create one
                    </Link>
                </p>

            </div>
        </div>
    )
}