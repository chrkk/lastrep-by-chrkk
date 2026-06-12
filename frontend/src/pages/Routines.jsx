import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/Navbar'

export default function Routines() {
    const navigate = useNavigate()
    const [routines, setRoutines] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingRoutine, setEditingRoutine] = useState(null)
    const [form, setForm] = useState({ name: '', description: '' })
    const [error, setError] = useState('')
    const [saving, setSaving] = useState(false)

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

    async function handleDelete(id, e) {
        e.stopPropagation()
        if (!confirm('Delete this routine?')) return
        try {
            await api.delete(`/api/routines/${id}`)
            setRoutines(routines.filter(r => r.id !== id))
        } catch (err) {
            console.error('Failed to delete routine', err)
        }
    }

    const DAY_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

    return (
        <div className="min-h-screen bg-gray-950 pb-8">
            <Navbar />

            <div className="px-4 py-6">

                {/* Header */}
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

                {/* Routine List */}
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
                                        {/* Day badge */}
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
                                    <div className="flex gap-1 flex-shrink-0">
                                        <button
                                            onClick={(e) => openEditForm(routine, e)}
                                            className="text-gray-500 text-xs px-3 py-1.5 rounded-lg active:bg-gray-700 transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(routine.id, e)}
                                            className="text-gray-500 text-xs px-3 py-1.5 rounded-lg active:bg-gray-700 transition-colors"
                                        >
                                            Delete
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

            {/* Bottom Sheet Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex flex-col justify-end">
                    <div
                        className="absolute inset-0 bg-black/70"
                        onClick={closeForm}
                    />
                    <div className="relative bg-gray-900 rounded-t-3xl px-5 pt-5 pb-10 z-10">
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
        </div>
    )
}