import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "react-toastify"
import { reviewSchema, type ReviewFormData } from "../models/review.schema"
import type { BuyerPurchase } from "../models/purchase"
import { useMyTripsStore } from "../stores/myTrips"

interface ReviewModalState {
  isOpen: boolean
  selectedTrip: BuyerPurchase | null
}

export function useReviewModal() {
  const [modalState, setModalState] = useState<ReviewModalState>({
    isOpen: false,
    selectedTrip: null,
  })

  const { submitReview, isSubmittingReview } = useMyTripsStore()

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      score: 10,
      comment: "",
    },
  })

  const openReviewModal = (trip: BuyerPurchase) => {
    form.reset({ score: 10, comment: "" })
    setModalState({ isOpen: true, selectedTrip: trip })
  }

  const closeReviewModal = () => {
    if (isSubmittingReview) return
    form.reset({ score: 10, comment: "" })
    setModalState({ isOpen: false, selectedTrip: null })
  }

  const handleFormSubmit = async (data: ReviewFormData) => {
    if (!modalState.selectedTrip) return

    try {
      await submitReview(modalState.selectedTrip.travelPackage.id, data)
      toast.success("¡Tu reseña fue publicada con éxito!")
      closeReviewModal()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : ""
      if (message.includes("409") || message.toLowerCase().includes("ya opinó")) {
        toast.info("Ya habías dejado una opinión para este viaje.")
        closeReviewModal()
      } else {
        toast.error(message || "No pudimos publicar tu reseña. Por favor reintentá.")
      }
    }
  }

  return {
    isOpen: modalState.isOpen,
    selectedTrip: modalState.selectedTrip,
    openReviewModal,
    closeReviewModal,
    isSubmitting: isSubmittingReview,
    form,
    onSubmit: form.handleSubmit(handleFormSubmit),
  }
}
