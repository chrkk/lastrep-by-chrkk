import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Exercises from './pages/Exercises'
import Routines from './pages/Routines'
import RoutineDetail from './pages/RoutineDetail'
import StartWorkout from './pages/StartWorkout'
import WorkoutHistory from './pages/WorkoutHistory'
import ExerciseHistory from './pages/ExerciseHistory'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected routes */}
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
    )
}

export default App