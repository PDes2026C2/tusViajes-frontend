import { ArrowLeft, ShieldAlert } from "lucide-react"
import { Header, type HeaderProps } from "../layout/header"
import { Button } from "../ui/button"

interface UnauthorizedViewProps {
  headerProps: HeaderProps
}

export function UnauthorizedView({ headerProps }: UnauthorizedViewProps) {
  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col">
      <Header {...headerProps} />
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <section aria-labelledby="unauthorized-title" className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-sky-50 text-primary">
            <ShieldAlert className="size-8" aria-hidden="true" />
          </div>
          <h1 id="unauthorized-title" className="text-2xl font-bold tracking-tight text-slate-900">No tenés acceso a esta página</h1>
          <Button type="button" onClick={headerProps.onNavigateHome} className="mt-8 h-11 rounded-xl px-6 cursor-pointer">
            <ArrowLeft aria-hidden="true" />
            Volver al inicio
          </Button>
        </section>
      </main>
    </div>
  )
}
