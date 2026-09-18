import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"

function PublicRoute() {
    const { isAuthenticated, user } = useAuth()
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