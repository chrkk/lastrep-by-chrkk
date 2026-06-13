import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/Navbar'

export default function RoutineDetail() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [routine, setRoutine] = useState(null)
    const [exercises, setExercises] = useState([])
    const [loading, setLoading] = useState(true)
    const [showAddExercise, setShowAddExercise] = useState(false)
    const [showTargetForm, setShowTargetForm] = useState(false)
    const [selectedExercise, setSelectedExercise] = useState(null)
    const [targetForm, setTargetForm] = useState({
        exerciseId: '',
        targetSets: 3,
        targetMinReps: 8,
        targetMaxReps: 12
    })
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchRoutine()
        fetchExercises()
    }, [id])

    useEffect(() => {
        const open = showAddExercise || showTargetForm
        document.body.style.overflow = open ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [showAddExercise, showTargetForm])

    async function fetchRoutine() {
        try {
            const res = await api.get(`/api/routines/${id}`)
            setRoutine(res.data)
        } catch (err) {
            console.error('Failed to fetch routine', err)
        } finally {
            setLoading(false)
        }
    }

    async function fetchExercises() {
        try {
            const res = await api.get('/api/exercises')
            setExercises(res.data)
        } catch (err) {
            console.error('Failed to fetch exercises', err)
        }
    }

    function openAddExercise() {
        setSelectedExercise(null)
        setError('')
        setShowAddExercise(true)
    }

    function selectExercise(exercise) {
        setSelectedExercise(exercise)
        setTargetForm({
            exerciseId: exercise.id,
            targetSets: 3,
            targetMinReps: 8,
            targetMaxReps: 12,
            restSeconds: 90
        })
        setShowAddExercise(false)
        setShowTargetForm(true)
    }

    async function handleAddExercise(e) {
        e.preventDefault()
        setSaving(true)
        setError('')
        try {
            await api.post(`/api/routines/${id}/exercises`, targetForm)
            await fetchRoutine()
            setShowTargetForm(false)
            setSelectedExercise(null)
        } catch (err) {
            setError('Failed to add exercise.')
        } finally {
            setSaving(false)
        }
    }

    async function handleRemoveExercise(routineExerciseId) {
        if (!confirm('Remove this exercise from the routine?')) return
        try {
            await api.delete(`/api/routines/${id}/exercises/${routineExerciseId}`)
            await fetchRoutine()
        } catch (err) {
            console.error('Failed to remove exercise', err)
        }
    }


    const availableExercises = exercises.filter(
        ex => !routine?.exercises?.some(re => re.exerciseId === ex.id)
    )

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950">
                <Navbar />
                <div className="text-gray-600 text-sm text-center py-16">Loading...</div>
            </div>
        )
    }

    if (!routine) {
        return (
            <div className="min-h-screen bg-gray-950">
                <Navbar />
                <div className="text-gray-600 text-sm text-center py-16">Routine not found.</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-950 pb-8">
            <Navbar />

            <div className="px-4 py-6">


                <div className="mb-6">
                    <button
                        onClick={() => navigate('/routines')}
                        className="text-gray-500 text-xs mb-3 flex items-center gap-1"
                    >
                        ← Back to Routines
                    </button>
                    <h1 className="text-xl font-bold text-white">{routine.name}</h1>
                    {routine.description && (
                        <p className="text-gray-500 text-xs mt-1">{routine.description}</p>
                    )}
                    <p className="text-gray-600 text-xs mt-1">
                        {routine.exercises?.length === 0
                            ? 'No exercises yet'
                            : `${routine.exercises?.length} exercise${routine.exercises?.length !== 1 ? 's' : ''}`}
                    </p>
                </div>


                {routine.exercises?.length > 0 && (
                    <button
                        onClick={() => navigate(`/workout/new?routineId=${routine.id}`)}
                        className="w-full bg-orange-500 active:bg-orange-600 text-white font-semibold py-4 rounded-2xl text-sm mb-6 transition-colors"
                    >
                        Start Workout 💪
                    </button>
                )}


                {routine.exercises?.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-4xl mb-3">🏋️</p>
                        <p className="text-gray-500 text-sm">No exercises in this routine.</p>
                        <p className="text-gray-600 text-xs mt-1">
                            Tap + Add Exercise to get started.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2 mb-6">
                        {routine.exercises.map((re, index) => (
                            <div
                                key={re.id}
                                className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-4"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        {/* Order number */}
                                        <div className="w-7 h-7 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-400 text-xs font-medium">
                        {index + 1}
                      </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-medium text-sm truncate">
                                                {re.exerciseName}
                                            </p>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {re.muscleGroup && (
                                                    <span className="text-xs text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">
                            {re.muscleGroup}
                          </span>
                                                )}
                                                {re.targetSets && (
                                                    <span className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded-full">
                            {re.targetSets} sets
                                                        {re.targetMinReps && ` × ${re.targetMinReps}`}
                                                        {re.targetMaxReps && `–${re.targetMaxReps} reps`}
                          </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveExercise(re.id)}
                                        className="text-gray-600 text-xs px-3 py-1.5 rounded-lg active:bg-gray-800 transition-colors flex-shrink-0"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}


                <button
                    onClick={openAddExercise}
                    className="w-full border border-dashed border-gray-700 active:border-gray-600 text-gray-500 active:text-gray-400 text-sm py-4 rounded-2xl transition-colors"
                >
                    + Add Exercise
                </button>
            </div>


            {showAddExercise && (
                <div className="fixed inset-0 z-50 flex flex-col justify-end">
                    <div
                        className="absolute inset-0 bg-black/70"
                        onClick={() => setShowAddExercise(false)}
                    />
                    <div className="relative bg-gray-900 rounded-t-3xl z-10 flex flex-col max-h-[80vh]">
                        <div className="px-5 pt-5 pb-3 flex-shrink-0">
                            <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-5" />
                            <h2 className="text-white font-semibold text-lg">
                                Choose Exercise
                            </h2>
                            <p className="text-gray-500 text-xs mt-1">
                                Tap an exercise to add it to this routine
                            </p>
                        </div>


                        <div className="overflow-y-auto px-5 pb-10">
                            {availableExercises.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 text-sm">
                                        All exercises are already in this routine.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2 mt-2">
                                    {availableExercises.map(exercise => (
                                        <button
                                            key={exercise.id}
                                            onClick={() => selectExercise(exercise)}
                                            className="w-full bg-gray-800 active:bg-gray-700 border border-gray-700 rounded-xl px-4 py-3 text-left transition-colors"
                                        >
                                            <p className="text-white text-sm font-medium">
                                                {exercise.name}
                                            </p>
                                            <div className="flex gap-2 mt-1">
                                                {exercise.muscleGroup && (
                                                    <span className="text-xs text-orange-400">
                            {exercise.muscleGroup}
                          </span>
                                                )}
                                                {exercise.equipment && (
                                                    <span className="text-xs text-gray-500">
                            {exercise.equipment}
                          </span>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}


            {showTargetForm && selectedExercise && (
                <div className="fixed inset-0 z-50 flex flex-col justify-end">
                    <div
                        className="absolute inset-0 bg-black/70"
                        onClick={() => setShowTargetForm(false)}
                    />
                    <div className="relative bg-gray-900 rounded-t-3xl px-5 pt-5 pb-10 z-10">
                        <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-5" />

                        <h2 className="text-white font-semibold text-lg mb-1">
                            Set Targets
                        </h2>
                        <p className="text-gray-500 text-xs mb-5">
                            {selectedExercise.name}
                        </p>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-4">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleAddExercise} className="space-y-4">

                            <div>
                                <label className="block text-gray-400 text-sm mb-3">
                                    Target sets
                                </label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map(n => (
                                        <button
                                            key={n}
                                            type="button"
                                            onClick={() => setTargetForm({ ...targetForm, targetSets: n })}
                                            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                                                targetForm.targetSets === n
                                                    ? 'bg-orange-500 text-white'
                                                    : 'bg-gray-800 text-gray-400'
                                            }`}
                                        >
                                            {n}
                                        </button>
                                    ))}
                                </div>
                            </div>


                            <div>
                                <label className="block text-gray-400 text-sm mb-3">
                                    Rep range
                                </label>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1">
                                        <p className="text-gray-600 text-xs mb-1.5 text-center">Min</p>
                                        <input
                                            type="number"
                                            value={targetForm.targetMinReps}
                                            onChange={e => setTargetForm({
                                                ...targetForm,
                                                targetMinReps: parseInt(e.target.value)
                                            })}
                                            min="1"
                                            max="100"
                                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm text-center focus:outline-none focus:border-orange-500"
                                        />
                                    </div>
                                    <span className="text-gray-600 mt-5">–</span>
                                    <div className="flex-1">
                                        <p className="text-gray-600 text-xs mb-1.5 text-center">Max</p>
                                        <input
                                            type="number"
                                            value={targetForm.targetMaxReps}
                                            onChange={e => setTargetForm({
                                                ...targetForm,
                                                targetMaxReps: parseInt(e.target.value)
                                            })}
                                            min="1"
                                            max="100"
                                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm text-center focus:outline-none focus:border-orange-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-400 text-sm mb-3">
                                    Default rest timer
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[30, 60, 90, 120, 180, 300].map(s => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setTargetForm({ ...targetForm, restSeconds: s })}
                                            className={`py-2.5 rounded-xl text-sm font-medium transition-colors ${
                                                targetForm.restSeconds === s
                                                    ? 'bg-orange-500 text-white'
                                                    : 'bg-gray-800 text-gray-400'
                                            }`}
                                        >
                                            {s < 60 ? `${s}s` : s === 60 ? '1min' : s === 90 ? '1.5min' : s === 120 ? '2min' : s === 180 ? '3min' : '5min'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setShowTargetForm(false)}
                                    className="flex-1 bg-gray-800 active:bg-gray-700 text-gray-300 text-sm font-medium py-3 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 bg-orange-500 active:bg-orange-600 disabled:opacity-50 text-white text-sm font-medium py-3 rounded-xl transition-colors"
                                >
                                    {saving ? 'Adding...' : 'Add to routine'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}