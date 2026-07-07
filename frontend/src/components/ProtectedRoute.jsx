import { useAuthStore } from '../store/authStore'
import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
    const { userId, initialized } = useAuthStore()

    if (!initialized) return null

    if (!userId) return <Navigate to="/login" replace />

    return children
}