import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import Toast from '../components/Toast'

export default function Routines() {
    const navigate = useNavigate()
    const [routines, setRoutines] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingRoutine, setEditingRoutine] = useState(null)
    const [form, setForm] = useState({ name: '', description: '' })
    const [error, setError] = useState('')
    const [saving, setSaving] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [deleting, setDeleting] = useState(false)
    const [duplicating, setDuplicating] = useState(null)
    const [toast, setToast] = useState(null)

    useEffect(() => {
        fetchRoutines()
    }, [])

    useEffect(() => {
        if (showForm) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [showForm])

    async function fetchRoutines() {
        try {
            const res = await api.get('/api/routines')
            setRoutines(res.data)
        } catch (err) {
            console.error('Failed to fetch routines', err)
        } finally {
            setLoading(false)
        }
    }

    function openCreateForm() {
        setEditingRoutine(null)
        setForm({ name: '', description: '' })
        setError('')
        setShowForm(true)
    }

    function openEditForm(routine, e) {
        e.stopPropagation()
        setEditingRoutine(routine)
        setForm({ name: routine.name, description: routine.description || '' })
        setError('')
        setShowForm(true)
    }

    function closeForm() {
        setShowForm(false)
        setEditingRoutine(null)
        setForm({ name: '', description: '' })
        setError('')
    }

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setSaving(true)
        try {
            if (editingRoutine) {
                await api.put(`/api/routines/${editingRoutine.id}`, form)
            } else {
                await api.post('/api/routines', form)
            }
            await fetchRoutines()
            closeForm()
        } catch (err) {
            setError('Failed to save routine. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    async function handleDuplicate(routine, e) {
        e.stopPropagation()
        setDuplicating(routine.id)
        try {
            await api.post(`/api/routines/${routine.id}/duplicate`)
            await fetchRoutines()
        } catch (err) {
            console.error('Failed to duplicate routine', err)
            setToast({ message: 'Failed to duplicate routine. Try again.', type: 'error' })
        } finally {
            setDuplicating(null)
        }
    }

    function confirmDelete(routine) {
        setDeleteTarget(routine)
    }

    async function handleDelete() {
        if (!deleteTarget) return
        setDeleting(true)
        try {
            await api.delete(`/api/routines/${deleteTarget.id}`)
            setRoutines(prev => prev.filter(r => r.id !== deleteTarget.id))
        } catch (err) {
            console.error('Failed to delete routine', err)
        } finally {
            setDeleting(false)
            setDeleteTarget(null)
        }
    }

    const DAY_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

    return (
        <div className="min-h-screen bg-gray-950 pb-24">
            <Navbar />

            <Toast
                message={toast?.message}
                type={toast?.type}
                onDismiss={() => setToast(null)}
            />

            <div className="px-4 py-6">

                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h1 className="text-xl font-bold text-white">Routines</h1>
                        <p className="text-gray-500 text-xs mt-0.5">Your workout programs</p>
                    </div>
                    <button
                        onClick={openCreateForm}
                        className="bg-orange-500 active:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                    >
                        + Add
                    </button>
                </div>

                {loading ? (
                    <div className="text-gray-600 text-sm text-center py-16">
                        Loading...
                    </div>
                ) : routines.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-4xl mb-3">📋</p>
                        <p className="text-gray-500 text-sm">No routines yet.</p>
                        <p className="text-gray-600 text-xs mt-1">
                            Tap + Add to create your first routine.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {routines.map((routine, index) => (
                            <div
                                key={routine.id}
                                onClick={() => navigate(`/routines/${routine.id}`)}
                                className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-4 active:bg-gray-800 transition-colors cursor-pointer"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                                            <span className="text-orange-400 text-sm font-bold">
                                                {DAY_LABELS[index] || index + 1}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-medium text-sm truncate">
                                                {routine.name}
                                            </p>
                                            <p className="text-gray-500 text-xs mt-0.5">
                                                {routine.exercises?.length === 0
                                                    ? 'No exercises yet'
                                                    : `${routine.exercises?.length} exercise${routine.exercises?.length !== 1 ? 's' : ''}`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        <button
                                            onClick={(e) => handleDuplicate(routine, e)}
                                            disabled={duplicating === routine.id}
                                            title="Duplicate"
                                            className="w-9 h-9 flex items-center justify-center text-gray-500 active:text-orange-400 active:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            {duplicating === routine.id ? (
                                                <div className="w-3.5 h-3.5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V5a2 2 0 012-2h9a2 2 0 012 2v9a2 2 0 01-2 2h-2M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-2" />
                                                </svg>
                                            )}
                                        </button>
                                        <button
                                            onClick={(e) => openEditForm(routine, e)}
                                            title="Edit"
                                            className="w-9 h-9 flex items-center justify-center text-gray-500 active:text-white active:bg-gray-800 rounded-lg transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); confirmDelete(routine) }}
                                            title="Delete"
                                            className="w-9 h-9 flex items-center justify-center text-gray-500 active:text-red-400 active:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                {routine.description && (
                                    <p className="text-gray-600 text-xs mt-2 ml-12 truncate">
                                        {routine.description}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showForm && (
                <div className="fixed inset-0 z-50 flex flex-col justify-end">
                    <div
                        className="absolute inset-0 bg-black/70"
                        onClick={closeForm}
                    />
                    <div className="relative bg-gray-900 rounded-t-3xl px-5 pt-5 z-10" style={{ paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom))' }}>
                        <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-5" />

                        <h2 className="text-white font-semibold text-lg mb-5">
                            {editingRoutine ? 'Edit Routine' : 'New Routine'}
                        </h2>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-4">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-gray-400 text-sm mb-1.5">
                                    Routine name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Push Day"
                                    required
                                    autoFocus
                                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-400 text-sm mb-1.5">
                                    Description
                                    <span className="text-gray-600 ml-1">(optional)</span>
                                </label>
                                <input
                                    type="text"
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="e.g. Chest, shoulders, triceps"
                                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors"
                                />
                            </div>

                            <div className="flex gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={closeForm}
                                    className="flex-1 bg-gray-800 active:bg-gray-700 text-gray-300 text-sm font-medium py-3 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 bg-orange-500 active:bg-orange-600 disabled:opacity-50 text-white text-sm font-medium py-3 rounded-xl transition-colors"
                                >
                                    {saving ? 'Saving...' : editingRoutine ? 'Save changes' : 'Add routine'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex flex-col justify-end">
                    <div
                        className="absolute inset-0 bg-black/70"
                        onClick={() => setDeleteTarget(null)}
                    />
                    <div
                        className="relative bg-gray-900 rounded-t-3xl px-5 pt-5 z-10"
                        style={{ paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom))' }}
                    >
                        <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-5" />
                        <div className="text-center mb-6">
                            <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>
                            <h2 className="text-white font-bold text-lg">Delete routine?</h2>
                            <p className="text-gray-500 text-sm mt-1">
                                "{deleteTarget.name}" will be permanently removed
                            </p>
                        </div>
                        <div className="space-y-3">
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="w-full bg-red-500/10 active:bg-red-500/20 border border-red-500/30 text-red-400 font-semibold py-4 rounded-2xl transition-colors disabled:opacity-50"
                            >
                                {deleting ? 'Deleting...' : 'Delete Routine'}
                            </button>
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="w-full bg-gray-800 active:bg-gray-700 text-gray-400 font-medium py-4 rounded-2xl transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}