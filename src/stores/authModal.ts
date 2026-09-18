import { create } from "zustand"

export type AuthModalMode = "login" | "register_buyer" | "register_agency"

export interface AuthModalState {
  isOpen: boolean
  mode: AuthModalMode
  redirectPath: string | null
  openModal: (mode?: AuthModalMode, redirectPath?: string) => void
  closeModal: () => void
  setMode: (mode: AuthModalMode) => void
}

export const useAuthModalStore = create<AuthModalState>((set) => ({
  isOpen: false,
  mode: "login",
  redirectPath: null,

  openModal: (mode = "login", redirectPath) => {
    set({
      isOpen: true,
      mode,
      redirectPath: redirectPath ?? null,
    })
  },

  closeModal: () => {
    set({
      isOpen: false,
      redirectPath: null,
    })
  },

  setMode: (mode) => {
    set({ mode })
  },
}))
