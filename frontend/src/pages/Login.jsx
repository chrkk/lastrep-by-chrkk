import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
    const navigate = useNavigate()
    const [form, setForm] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (sessionStorage.getItem('sessionExpired') === 'true') {
            setError('Your session expired. Please log in again.')
            sessionStorage.removeItem('sessionExpired')
        }
    }, [])

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email: form.email,
                password: form.password,
            })

            if (signInError) {
                if (signInError.message.toLowerCase().includes('email not confirmed')) {
                    setError('Please confirm your email before logging in. Check your inbox.')
                } else {
                    setError('Invalid email or password.')
                }
                return
            }

            navigate('/')
        } catch (err) {
            setError('Login failed. Please try again.')
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
                            <label className="block text-gray-400 text-sm mb-1.5">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                required
                                autoComplete="off"
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
                                autoComplete="off"
                                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors"
                            />
                        </div>

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