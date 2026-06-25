import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'
import Toast from '../components/Toast'

export default function Settings() {
    const navigate = useNavigate()
    const [toast, setToast] = useState(null)
    const [activeSection, setActiveSection] = useState(null)
    const [emailForm, setEmailForm] = useState({ email: '' })
    const [passwordForm, setPasswordForm] = useState({ password: '', confirmPassword: '' })
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    async function handleUpdateEmail(e) {
        e.preventDefault()
        setError('')
        setSaving(true)
        try {
            const { error: updateError } = await supabase.auth.updateUser({
                email: emailForm.email
            })
            if (updateError) throw updateError
            setToast({ message: 'Confirmation sent to your new email address.', type: 'success' })
            setActiveSection(null)
            setEmailForm({ email: '' })
        } catch (err) {
            setError(err.message || 'Failed to update email.')
        } finally {
            setSaving(false)
        }
    }

    async function handleUpdatePassword(e) {
        e.preventDefault()
        setError('')
        if (passwordForm.password.length < 6) {
            setError('Password must be at least 6 characters.')
            return
        }
        if (passwordForm.password !== passwordForm.confirmPassword) {
            setError('Passwords do not match.')
            return
        }
        setSaving(true)
        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: passwordForm.password
            })
            if (updateError) throw updateError
            setToast({ message: 'Password updated successfully.', type: 'success' })
            setActiveSection(null)
            setPasswordForm({ password: '', confirmPassword: '' })
        } catch (err) {
            setError(err.message || 'Failed to update password.')
        } finally {
            setSaving(false)
        }
    }

    async function handleSignOut() {
        await supabase.auth.signOut()
        navigate('/login')
    }

    return (
        <div className="min-h-screen bg-gray-950 pb-24">
            <Navbar />

            <Toast
                message={toast?.message}
                type={toast?.type}
                onDismiss={() => setToast(null)}
            />

            <div className="px-4 py-6">
                <div className="mb-6">
                    <h1 className="text-xl font-bold text-white">Settings</h1>
                    <p className="text-gray-500 text-xs mt-0.5">Manage your account</p>
                </div>

                <div className="space-y-2">

                    <button
                        onClick={() => {
                            setActiveSection(activeSection === 'email' ? null : 'email')
                            setError('')
                        }}
                        className="w-full bg-gray-900 border border-gray-800 rounded-2xl px-4 py-4 text-left active:bg-gray-800 transition-colors"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-gray-800 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-white text-sm font-medium">Change Email</p>
                                    <p className="text-gray-500 text-xs mt-0.5">Update your email address</p>
                                </div>
                            </div>
                            <svg className={`w-4 h-4 text-gray-600 transition-transform ${activeSection === 'email' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>

                        {activeSection === 'email' && (
                            <form
                                onSubmit={handleUpdateEmail}
                                className="mt-4 space-y-3"
                                onClick={e => e.stopPropagation()}
                            >
                                {error && (
                                    <p className="text-red-400 text-xs">{error}</p>
                                )}
                                <input
                                    type="email"
                                    value={emailForm.email}
                                    onChange={e => setEmailForm({ email: e.target.value })}
                                    placeholder="New email address"
                                    required
                                    autoComplete="off"
                                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors"
                                />
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full bg-orange-500 active:bg-orange-600 disabled:opacity-50 text-white text-sm font-medium py-3 rounded-xl transition-colors"
                                >
                                    {saving ? 'Saving...' : 'Update Email'}
                                </button>
                            </form>
                        )}
                    </button>

                    <button
                        onClick={() => {
                            setActiveSection(activeSection === 'password' ? null : 'password')
                            setError('')
                        }}
                        className="w-full bg-gray-900 border border-gray-800 rounded-2xl px-4 py-4 text-left active:bg-gray-800 transition-colors"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-gray-800 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-white text-sm font-medium">Change Password</p>
                                    <p className="text-gray-500 text-xs mt-0.5">Update your password</p>
                                </div>
                            </div>
                            <svg className={`w-4 h-4 text-gray-600 transition-transform ${activeSection === 'password' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>

                        {activeSection === 'password' && (
                            <form
                                onSubmit={handleUpdatePassword}
                                className="mt-4 space-y-3"
                                onClick={e => e.stopPropagation()}
                            >
                                {error && (
                                    <p className="text-red-400 text-xs">{error}</p>
                                )}
                                <input
                                    type="password"
                                    value={passwordForm.password}
                                    onChange={e => setPasswordForm(p => ({ ...p, password: e.target.value }))}
                                    placeholder="New password (min. 6 characters)"
                                    required
                                    minLength={6}
                                    autoComplete="new-password"
                                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors"
                                />
                                <input
                                    type="password"
                                    value={passwordForm.confirmPassword}
                                    onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                                    placeholder="Confirm new password"
                                    required
                                    minLength={6}
                                    autoComplete="new-password"
                                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors"
                                />
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full bg-orange-500 active:bg-orange-600 disabled:opacity-50 text-white text-sm font-medium py-3 rounded-xl transition-colors"
                                >
                                    {saving ? 'Saving...' : 'Update Password'}
                                </button>
                            </form>
                        )}
                    </button>

                    <div className="pt-4">
                        <button
                            onClick={handleSignOut}
                            className="w-full bg-gray-900 border border-red-500/20 rounded-2xl px-4 py-4 text-left active:bg-gray-800 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </div>
                                <p className="text-red-400 text-sm font-medium">Sign Out</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}