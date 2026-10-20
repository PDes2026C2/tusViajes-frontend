import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"
import { getAuthRedirectPath } from "../../utils/authRedirect"

function PublicRoute() {
    const { isAuthenticated, user } = useAuth()
    const { state } = useLocation()
    if (isAuthenticated && user) {
        const requestedPath = typeof state === "string" ? state : undefined
        return <Navigate to={getAuthRedirectPath(user.role, requestedPath)} replace />
    } 

    return <Outlet/>
}

export default PublicRoute
