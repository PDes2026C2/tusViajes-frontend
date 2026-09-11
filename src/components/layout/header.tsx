import { Button } from "../ui/button";

interface HeaderProps {
    cartCount?: number
}

export function Header( {cartCount = 0} : HeaderProps) {
    return (
        <header className="w-full bg-white border-b border-slate-100 flex justify-between items-center px-8 py-4">
            <span className="text-2xl font-bold text-[#084d6e] gap-2">
                Tus Viajes
            </span>
            <div className="hidden md:flex items-center gap-3 border border-slate-200 rounded-full pl-5 pr-1.5 bg-white shadow-xs">
                <span className="text-sm font-medium text-[#084d6e]">
                    ¿Querés ofrecer paquetes?
                </span>
                <Button className="rounded-full text-white w-1xs font-medium hover:bg-primary/90 transition-all duration-200 px-5 py-2 h-auto shadow-sm">
                    Postulate como Agencia
                </Button>
            </div>
            <div className="flex gap-2.5">
                <Button variant="outline" className="rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium px-6 py-2 h-auto shadow-xs transition-all">
                    Mis Viajes
                </Button>
                <Button variant="outline" className="rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium px-6 py-2 h-auto shadow-xs transition-all gap-2.5">
                    <span> Carrito </span>
                    <span className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white text-xs">
                        {cartCount}
                    </span>
                </Button>
            </div>
        </header>
    )
} 

export default Header;