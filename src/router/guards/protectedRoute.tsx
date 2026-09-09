import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom"
import { useAuthStore } from "../../stores/auth"
import type { Role } from "../../models/auth"

interface ProtectedRouteProps {
    allowedRoles?: Role[]
}

function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
    const user = useAuthStore((state) => state.user)
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