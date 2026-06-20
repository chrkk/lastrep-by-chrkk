import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { supabase } from './lib/supabase'
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
import ProtectedRoute from './components/ProtectedRoute'

function App() {
    useEffect(() => {
        supabase.auth.getSession().then(({ data, error }) => {
            if (error) console.error('Supabase connection error:', error)
            else console.log('Supabase connected. Session:', data.session)
        })
    }, [])

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
                </Routes>
            </BrowserRouter>
        </MobileOnly>
    )
}

export default App