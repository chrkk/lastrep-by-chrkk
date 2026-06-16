import { useState, useEffect } from 'react'
import api from '../api/axios'
import Navbar from '../components/Navbar'

const MUSCLE_GROUPS = [
    'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps',
    'Legs', 'Glutes', 'Core', 'Cardio', 'Full Body', 'Other'
]

const EQUIPMENT = [
    'Barbell', 'Dumbbell', 'Cable', 'Machine',
    'Bodyweight', 'Resistance Band', 'Kettlebell', 'Other'
]

export default function Exercises() {
    const [exercises, setExercises] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingExercise, setEditingExercise] = useState(null)
    const [form, setForm] = useState({ name: '', muscleGroup: '', equipment: '' })
    const [error, setError] = useState('')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchExercises()
    }, [])

    // Lock body scroll when modal is open
    useEffect(() => {
        if (showForm) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [showForm])

    async function fetchExercises() {
        try {
            const res = await api.get('/api/exercises')
            setExercises(res.data)
        } catch (err) {
            console.error('Failed to fetch exercises', err)
        } finally {
            setLoading(false)
        }
    }

    function openCreateForm() {
        setEditingExercise(null)
        setForm({ name: '', muscleGroup: '', equipment: '' })
        setError('')
        setShowForm(true)
    }

    function openEditForm(exercise) {
        setEditingExercise(exercise)
        setForm({
            name: exercise.name,
            muscleGroup: exercise.muscleGroup || '',
            equipment: exercise.equipment || ''
        })
        setError('')
        setShowForm(true)
    }

    function closeForm() {
        setShowForm(false)
        setEditingExercise(null)
        setForm({ name: '', muscleGroup: '', equipment: '' })
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
            if (editingExercise) {
                await api.put(`/api/exercises/${editingExercise.id}`, form)
            } else {
                await api.post('/api/exercises', form)
            }
            await fetchExercises()
            closeForm()
        } catch (err) {
            setError('Failed to save exercise. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete(id) {
        if (!confirm('Delete this exercise?')) return
        try {
            await api.delete(`/api/exercises/${id}`)
            setExercises(exercises.filter(e => e.id !== id))
        } catch (err) {
            console.error('Failed to delete exercise', err)
        }
    }

    return (
        <div className="min-h-screen bg-gray-950 pb-24">
            <Navbar />

            <div className="px-4 py-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h1 className="text-xl font-bold text-white">Exercises</h1>
                        <p className="text-gray-500 text-xs mt-0.5">Your exercise library</p>
                    </div>
                    <button
                        onClick={openCreateForm}
                        className="bg-orange-500 active:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                    >
                        + Add
                    </button>
                </div>

                {/* Exercise List */}
                {loading ? (
                    <div className="text-gray-600 text-sm text-center py-16">
                        Loading...
                    </div>
                ) : exercises.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-4xl mb-3">🏋️</p>
                        <p className="text-gray-500 text-sm">No exercises yet.</p>
                        <p className="text-gray-600 text-xs mt-1">
                            Tap + Add to create your first exercise.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {exercises.map(exercise => (
                            <div
                                key={exercise.id}
                                className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-4"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-medium text-sm truncate">
                                            {exercise.name}
                                        </p>
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            {exercise.muscleGroup && (
                                                <span className="text-xs text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">
                          {exercise.muscleGroup}
                        </span>
                                            )}
                                            {exercise.equipment && (
                                                <span className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded-full">
                          {exercise.equipment}
                        </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-1 flex-shrink-0">
                                        <button
                                            onClick={() => openEditForm(exercise)}
                                            className="text-gray-500 active:text-white text-xs px-3 py-1.5 rounded-lg active:bg-gray-800 transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(exercise.id)}
                                            className="text-gray-500 active:text-red-400 text-xs px-3 py-1.5 rounded-lg active:bg-gray-800 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Bottom Sheet Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex flex-col justify-end">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/70"
                        onClick={closeForm}
                    />

                    <div className="relative bg-gray-900 rounded-t-3xl px-5 pt-5 z-10" style={{ paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom))' }}>

                        {/* Handle bar */}
                        <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-5" />

                        <h2 className="text-white font-semibold text-lg mb-5">
                            {editingExercise ? 'Edit Exercise' : 'New Exercise'}
                        </h2>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-4">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-gray-400 text-sm mb-1.5">
                                    Exercise name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Bench Press"
                                    required
                                    autoFocus
                                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-400 text-sm mb-1.5">
                                    Muscle group
                                </label>
                                <select
                                    name="muscleGroup"
                                    value={form.muscleGroup}
                                    onChange={handleChange}
                                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                                >
                                    <option value="">Select muscle group</option>
                                    {MUSCLE_GROUPS.map(mg => (
                                        <option key={mg} value={mg}>{mg}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-400 text-sm mb-1.5">
                                    Equipment
                                </label>
                                <select
                                    name="equipment"
                                    value={form.equipment}
                                    onChange={handleChange}
                                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                                >
                                    <option value="">Select equipment</option>
                                    {EQUIPMENT.map(eq => (
                                        <option key={eq} value={eq}>{eq}</option>
                                    ))}
                                </select>
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
                                    {saving ? 'Saving...' : editingExercise ? 'Save changes' : 'Add exercise'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}