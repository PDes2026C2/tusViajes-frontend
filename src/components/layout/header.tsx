import { Heart } from "lucide-react";
import type { Role } from "../../models/auth";
import { Button } from "../ui/button";

export interface HeaderProps {
    isAuthenticated?: boolean;
    userEmail?: string;
    userRole?: Role;
    onNavigateHome?: () => void;
    onMyTripsClick?: () => void;
    onFavoritesClick?: () => void;
    onAgencyClick?: () => void;
    onAdminClick?: () => void;
    onLoginClick?: () => void;
    onLogoutClick?: () => void;
}

export function Header({
    isAuthenticated = false,
    userEmail,
    userRole,
    onNavigateHome,
    onMyTripsClick,
    onFavoritesClick,
    onAgencyClick,
    onAdminClick,
    onLoginClick,
    onLogoutClick,
}: HeaderProps) {
    return (
        <header className="w-full bg-white border-b border-slate-100 flex flex-wrap sm:flex-nowrap gap-3 justify-between items-center px-4 sm:px-8 py-4">
            <button
                type="button"
                onClick={onNavigateHome}
                className="text-2xl font-bold text-primary tracking-tight hover:opacity-90 transition-opacity cursor-pointer bg-transparent border-0 p-0"
            >
                Tus Viajes
            </button>

            {/* Postulate como Agencia banner/button */}
            {userRole !== "ADMIN" && (
                <div className="hidden md:flex items-center gap-3 border border-slate-200 rounded-full pl-5 pr-1.5 bg-white shadow-xs">
                    <span className="hidden xl:inline text-sm font-medium text-primary">
                        {userRole === "AGENCY" ? "Tu panel de gestión" : "¿Querés ofrecer paquetes?"}
                    </span>
                    <Button
                        type="button"
                        onClick={onAgencyClick}
                        className="rounded-full text-white font-medium hover:bg-primary/90 transition-all duration-200 px-5 py-2 h-auto shadow-sm cursor-pointer"
                    >
                        {userRole === "AGENCY" ? "Ir al Panel" : "Postulate como Agencia"}
                    </Button>
                </div>
            )}

            {userRole === "ADMIN" && (
                <div className="hidden md:flex items-center gap-2">
                    <Button
                        type="button"
                        onClick={onAdminClick}
                        className="rounded-full bg-primary hover:bg-primary/90 text-white text-xs font-semibold px-4 py-2 h-auto cursor-pointer"
                    >
                        Panel Administrador
                    </Button>
                </div>
            )}

            {/* Actions */}
            <nav aria-label="Navegación principal" className="ml-auto flex items-center gap-2 sm:gap-2.5">
                {(!isAuthenticated || userRole === "BUYER") && (
                    <Button
                        type="button"
                        variant="outline"
                        size="icon-lg"
                        aria-label="Mis favoritos"
                        title="Mis favoritos"
                        onClick={onFavoritesClick}
                        className="rounded-full border-slate-200 text-primary hover:bg-primary/5 hover:border-primary/30 cursor-pointer"
                    >
                        <Heart aria-hidden="true" />
                    </Button>
                )}
                <Button
                    type="button"
                    onClick={onMyTripsClick}
                    variant="outline"
                    className="rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium px-4 sm:px-6 py-2 h-auto shadow-xs transition-all cursor-pointer"
                >
                    Mis Viajes
                </Button>

                {isAuthenticated ? (
                    <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-200">
                        <span className="text-xs font-medium text-slate-600 hidden lg:inline max-w-[140px] truncate" title={userEmail}>
                            {userEmail}
                        </span>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onLogoutClick}
                            className="rounded-full border border-slate-200 text-slate-600 hover:text-error hover:border-error/30 hover:bg-error/5 text-xs font-medium px-3.5 py-2 h-auto transition-all cursor-pointer"
                        >
                            Cerrar sesión
                        </Button>
                    </div>
                ) : (
                    <Button
                        type="button"
                        onClick={onLoginClick}
                        className="rounded-full bg-primary hover:bg-primary/90 text-white font-medium px-5 py-2 h-auto shadow-xs transition-all cursor-pointer"
                    >
                        Ingresar
                    </Button>
                )}
            </nav>
        </header>
    );
}

export const SiteHeader = Header;
export default Header;
