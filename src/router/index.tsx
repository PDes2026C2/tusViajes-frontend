import { BrowserRouter, Route, Routes } from "react-router-dom";
import PublicRoute from "./guards/publicRoute";
import ProtectedRoute from "./guards/protectedRoute";
import Home from "../pages/home";

export function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Rutas publicas */}
                <Route path="/home" element = { <Home/> }/>
                <Route path="/agency/:id" element = { <h1> ruta publica para mostrar el perfil de una agencia </h1> }/>

                {/* Rutas login */}
                <Route element = {<PublicRoute />}>
                    <Route path="/agency/register" element = {<h1> Registro de agencia </h1>} />
                    <Route path="/agency/login" element = {<h1> Login de agencia </h1>} />
                    <Route path="/admin/login" element = {<h1> Login de admin </h1>} />
                    <Route path="/register" element = {<h1> Register de buyer </h1>} />
                    <Route path="/login" element = {<h1> Login de buyer </h1>} />
                </Route>

                

                {/*Rutas para Buyer */}
                <Route element = {<ProtectedRoute allowedRoles={['BUYER']}/>}>
                    <Route path="/cart" element = { <h1> ruta privada para buyer </h1> } />
                </Route>

                {/*Rutas para Admin */}
                <Route element = {<ProtectedRoute allowedRoles={['ADMIN']}/>}>
                    <Route path="/admin/panel" element = { <h1> ruta privada admin </h1> }/>
                </Route>

                {/* Rutas para Agencia */}
                <Route element = {<ProtectedRoute allowedRoles={['AGENCY']}/>}>
                    <Route path="/agency/panel" element = {<h1> ruta privada agencia </h1>} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}