import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Register() {
    const navigate = useNavigate()

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    })

    const [error, setError] = useState('')
    const [registered, setRegistered] = useState(false)
    const [loading, setLoading] = useState(false)

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')

        if (form.password.length < 6) {
            setError('Password must be at least 6 characters.')
            return
        }

        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match.')
            return
        }

        setLoading(true)

        try {
            const { data, error: signUpError } = await supabase.auth.signUp({
                email: form.email,
                password: form.password,
                options: {
                    data: {
                        name: form.name
                    }
                }
            })

            if (signUpError) {
                setError(signUpError.message)
                return
            }

            if (data.session) {
                navigate('/')
            } else {
                setRegistered(true)
            }
        } catch (err) {
            setError('Registration failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (registered) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
                <div className="w-full max-w-sm text-center">

                    <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                        <svg
                            className="w-8 h-8 text-orange-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.8}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                        </svg>
                    </div>

                    <h1 className="text-white font-bold text-xl mb-2">
                        Check your email
                    </h1>

                    <p className="text-gray-400 text-sm mb-1">
                        We sent a confirmation link to
                    </p>

                    <p className="text-orange-400 text-sm font-medium mb-5 break-all">
                        {form.email}
                    </p>

                    <p className="text-gray-600 text-xs mb-8">
                        Click the link in the email to activate your account, then come back to log in.
                    </p>

                    <button
                        onClick={() => navigate('/login')}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg py-3 text-sm transition-colors"
                    >
                        Go to Login
                    </button>

                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
            <div className="w-full max-w-sm">

                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        LastRep
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        by chrkk
                    </p>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
                    <h2 className="text-white font-semibold text-lg mb-6">
                        Create your account
                    </h2>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">

                        <div>
                            <label className="block text-gray-400 text-sm mb-1.5">
                                Full name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Enter Full Name"
                                required
                                autoComplete="off"
                                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 text-sm mb-1.5">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                required
                                autoComplete="off"
                                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 text-sm mb-1.5">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Min. 6 characters"
                                required
                                minLength={6}
                                autoComplete="new-password"
                                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 text-sm mb-1.5">
                                Confirm password
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                placeholder="Re-enter your password"
                                required
                                minLength={6}
                                autoComplete="new-password"
                                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-medium rounded-lg py-2.5 text-sm transition-colors mt-2"
                        >
                            {loading ? 'Creating account...' : 'Create account'}
                        </button>

                    </form>
                </div>

                <p className="text-center text-gray-600 text-sm mt-6">
                    Already have an account?{' '}
                    <Link
                        to="/login"
                        className="text-orange-500 hover:text-orange-400"
                    >
                        Sign in
                    </Link>
                </p>

            </div>
        </div>
    )
}