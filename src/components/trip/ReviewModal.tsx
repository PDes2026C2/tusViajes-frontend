import { useEffect } from "react"
import { type UseFormReturn } from "react-hook-form"
import { Loader2, Star, X } from "lucide-react"
import type { BuyerPurchase } from "../../models/purchase"
import type { ReviewFormData } from "../../models/review.schema"
import { Button } from "../ui/button"

export interface ReviewModalProps {
  isOpen: boolean
  trip: BuyerPurchase | null
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>
  form: UseFormReturn<ReviewFormData>
}

function getScoreLabel(score: number): string {
  if (score >= 10) return "¡Excelente! (10/10)"
  if (score >= 8) return `Muy bueno (${score}/10)`
  if (score >= 6) return `Bueno (${score}/10)`
  if (score >= 4) return `Regular (${score}/10)`
  return `Malo (${score}/10)`
}

export function ReviewModal({
  isOpen,
  trip,
  isSubmitting,
  onClose,
  onSubmit,
  form,
}: ReviewModalProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form

  const currentScore = watch("score") ?? 10
  const currentComment = watch("comment") ?? ""

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, isSubmitting, onClose])

  if (!isOpen || !trip) return null

  const pkg = trip.travelPackage

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 border border-amber-100">
              <Star className="w-6 h-6 fill-current" aria-hidden="true" />
            </div>
            <div>
              <h2 id="review-modal-title" className="text-lg font-bold text-slate-900 leading-snug">
                ¿Cómo fue tu viaje?
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                {pkg.name} • {pkg.hotel.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Cerrar modal"
            className="text-slate-400 hover:text-slate-600 rounded-full p-1.5 transition-colors cursor-pointer disabled:opacity-40"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          {/* Score selection */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label htmlFor="score-selector" className="text-xs font-semibold text-slate-700">
                Puntuación general *
              </label>
              <span className="text-xs font-bold text-amber-600">
                {getScoreLabel(currentScore)}
              </span>
            </div>

            <div
              id="score-selector"
              role="radiogroup"
              aria-label="Seleccionar puntuación del 1 al 10"
              className="grid grid-cols-5 sm:grid-cols-10 gap-1.5"
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((val) => {
                const isSelected = currentScore === val
                return (
                  <button
                    key={val}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={`Puntaje ${val} de 10`}
                    disabled={isSubmitting}
                    onClick={() => setValue("score", val, { shouldValidate: true })}
                    className={`h-10 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                      isSelected
                        ? "bg-amber-500 text-white shadow-xs scale-105"
                        : "bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/60"
                    }`}
                  >
                    {val}
                  </button>
                )
              })}
            </div>
            {errors.score && (
              <span className="text-xs font-medium text-error mt-0.5">{errors.score.message}</span>
            )}
          </div>

          {/* Comment */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="review-comment" className="text-xs font-semibold text-slate-700">
                Tu opinión (opcional)
              </label>
              <span className="text-[11px] text-slate-400">
                {currentComment.length} / 1000
              </span>
            </div>
            <textarea
              id="review-comment"
              rows={4}
              maxLength={1000}
              disabled={isSubmitting}
              placeholder="Contanos qué te pareció el hotel, los vuelos, la atención y el destino..."
              {...register("comment")}
              className="w-full p-3.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800 placeholder:text-slate-400 resize-none"
            />
            {errors.comment && (
              <span className="text-xs font-medium text-error mt-0.5">{errors.comment.message}</span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl px-5 py-2 text-xs bg-amber-500 hover:bg-amber-600 text-white font-semibold flex items-center gap-2 cursor-pointer shadow-xs transition-all"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />}
              <span>{isSubmitting ? "Publicando..." : "Publicar reseña"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
