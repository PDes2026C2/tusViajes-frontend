import type React from "react"
import { Slide, ToastContainer } from "react-toastify"
import { X } from "lucide-react"

export function ToastCloseButton({
  closeToast,
}: {
  closeToast?: (e: React.MouseEvent<HTMLElement>) => void
}) {
  return (
    <button
      type="button"
      onClick={closeToast}
      className="absolute top-2.5 right-2.5 p-1 rounded-md text-slate-400 hover:text-primary hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
      aria-label="Cerrar"
    >
      <X className="w-3.5 h-3.5 stroke-[2.2]" />
    </button>
  )
}

export function AppToastContainer() {
  return (
    <ToastContainer
      position="bottom-right"
      autoClose={4500}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick={false}
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      transition={Slide}
      closeButton={ToastCloseButton}
    />
  )
}
