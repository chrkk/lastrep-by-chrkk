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

function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/exercises" element={<Exercises />} />
          <Route path="/routines" element={<Routines />} />
          <Route path="/routines/:id" element={<RoutineDetail />} />
          <Route path="/workout/:sessionId" element={<StartWorkout />} />
          <Route path="/history" element={<WorkoutHistory />} />
          <Route path="/exercises/:id/history" element={<ExerciseHistory />} />
        </Routes>
      </BrowserRouter>
  )
}

export default App