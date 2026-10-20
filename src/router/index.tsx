import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import PublicRoute from "./guards/publicRoute";
import ProtectedRoute from "./guards/protectedRoute";
import Home from "../pages/home";
import FavoritesPage from "../pages/favorites";
import MyTripsPage from "../pages/myTrips";
import LoginPage from "../pages/login";
import AdminPanelPage from "../pages/adminPanel";
import AgencyPanelPage from "../pages/agencyPanel";
import AuthModal from "../components/auth/AuthModal";
import UnauthorizedPage from "../pages/unauthorized";

export function AppRouter() {
    return (
        <BrowserRouter>
            <AuthModal />
            <Routes>
                {/* Redireccion raiz */}
                <Route path="/" element={<Navigate to="/home" replace />} />

                {/* Rutas publicas */}
                <Route path="/home" element = { <Home/> }/>
                <Route path="/unauthorized" element={<UnauthorizedPage />} />
                <Route path="/agency/:id" element = { <h1> ruta publica para mostrar el perfil de una agencia </h1> }/>

                {/* Rutas login */}
                <Route element = {<PublicRoute />}>
                    <Route path="/agency/register" element = {<LoginPage />} />
                    <Route path="/agency/login" element = {<LoginPage />} />
                    <Route path="/admin/login" element = {<LoginPage />} />
                    <Route path="/register" element = {<LoginPage />} />
                    <Route path="/login" element = {<LoginPage />} />
                </Route>

                

                {/*Rutas para Buyer */}
                <Route element = {<ProtectedRoute allowedRoles={['BUYER']}/>}>
                    <Route path="/favorites" element={<FavoritesPage />} />
                    <Route path="/my-trips" element = { <MyTripsPage /> } />
                </Route>

                {/*Rutas para Admin */}
                <Route element = {<ProtectedRoute allowedRoles={['ADMIN']}/>}>
                    <Route path="/admin/panel" element = { <AdminPanelPage /> }/>
                </Route>

                {/* Rutas para Agencia */}
                <Route element = {<ProtectedRoute allowedRoles={['AGENCY']}/>}>
                    <Route path="/agency/panel" element = {<AgencyPanelPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}
