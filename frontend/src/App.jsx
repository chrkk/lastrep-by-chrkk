import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { supabase } from './lib/supabase'
import { initializeSyncEngine, migrateGuestData } from './lib/sync'
import MobileOnly from './components/MobileOnly'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Exercises from './pages/Exercises'
import Routines from './pages/Routines'
import RoutineDetail from './pages/RoutineDetail'
import StartWorkout from './pages/StartWorkout'
import WorkoutHistory from './pages/WorkoutHistory'
import ExerciseHistory from './pages/ExerciseHistory'
import SelectRoutine from './pages/SelectRoutine'
import Settings from './pages/Settings'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
    const { initialize, signIn, signOut, setMigrating, initialized } = useAuthStore()

    useEffect(() => {
        initialize()
        const stopSyncEngine = initializeSyncEngine()

        const { data: listener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_IN' && session) {
                    const currentState = useAuthStore.getState()
                    if (currentState.isGuest && currentState.userId?.startsWith('guest_')) {
                        setMigrating(true)
                        try {
                            await migrateGuestData(currentState.userId, session.user.id)
                        } finally {
                            setMigrating(false)
                        }
                    }

                    signIn(session.user.id)
                }
                if (event === 'SIGNED_OUT') {
                    signOut()
                }
            }
        )

        return () => {
            stopSyncEngine()
            listener.subscription.unsubscribe()
        }
    }, [])

    if (!initialized) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <MobileOnly>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={
                        <ProtectedRoute><Dashboard /></ProtectedRoute>
                    } />
                    <Route path="/exercises" element={
                        <ProtectedRoute><Exercises /></ProtectedRoute>
                    } />
                    <Route path="/routines" element={
                        <ProtectedRoute><Routines /></ProtectedRoute>
                    } />
                    <Route path="/routines/:id" element={
                        <ProtectedRoute><RoutineDetail /></ProtectedRoute>
                    } />
                    <Route path="/select-routine" element={
                        <ProtectedRoute><SelectRoutine /></ProtectedRoute>
                    } />
                    <Route path="/workout/:sessionId" element={
                        <ProtectedRoute><StartWorkout /></ProtectedRoute>
                    } />
                    <Route path="/history" element={
                        <ProtectedRoute><WorkoutHistory /></ProtectedRoute>
                    } />
                    <Route path="/exercises/:id/history" element={
                        <ProtectedRoute><ExerciseHistory /></ProtectedRoute>
                    } />
                    <Route path="/settings" element={
                        <ProtectedRoute><Settings /></ProtectedRoute>
                    } />
                </Routes>
            </BrowserRouter>
        </MobileOnly>
    )
}

export default App