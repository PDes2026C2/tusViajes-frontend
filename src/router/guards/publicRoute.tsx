import { Navigate, Outlet } from "react-router-dom"
import { useAuthStore } from "../../stores/auth"

function PublicRoute() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
    const user = useAuthStore((state) => state.user)
    if (isAuthenticated && user) {
        switch (user.role) {
            case 'BUYER':
                return <Navigate to="/" replace />
            case 'AGENCY':
                return <Navigate to="/agency/panel" replace/>
            case 'ADMIN':
                return <Navigate to="/admin/panel" replace />
            default:
                return <Navigate to="/login" replace />
        }
    } 

    return <Outlet/>
}

export default PublicRoute