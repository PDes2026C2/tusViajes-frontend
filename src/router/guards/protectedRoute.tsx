import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"
import type { Role } from "../../models/auth"

interface ProtectedRouteProps {
    allowedRoles?: Role[]
}

function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
    const { isAuthenticated, user } = useAuth()
    const { pathname } = useLocation()

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace state={pathname} />
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace/>
    }

    return (
        <Outlet/>
    )
}

export default ProtectedRoute