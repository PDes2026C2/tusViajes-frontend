import { createJSONStorage, persist } from "zustand/middleware"
import { authDataSource } from "../datasources/auth"
import { authMappers, type AuthTokens, type LoginCredentials, type RegisterAgencyData, type RegisterBuyerData, type User } from "../models/auth"
import { create } from "zustand"


export interface AuthState {
    isAuthenticated: boolean
    isLoading: boolean
    user: User | null
    accessToken: string | null
    refreshToken: string | null
    setRefreshedSession: (tokens: AuthTokens) => void
    login: (credentials: LoginCredentials) => Promise<void>
    registerBuyer: (data: RegisterBuyerData) => Promise<void>
    registerAgency: (data: RegisterAgencyData) => Promise<void>
    logout: () => void
}

export const useAuthStore = create<AuthState>()(
        persist(
            (set) => ({
                isAuthenticated: false,
                isLoading: false,
                user: null,
                accessToken: null,
                refreshToken: null,

                setRefreshedSession: (tokens: AuthTokens) => {
                    set({
                        accessToken: tokens.accessToken,
                        refreshToken: tokens.refreshToken
                    })
                },

                login: async (credentials: LoginCredentials) => {
                    set({
                        isLoading: true
                    })
                    
                    try {
                        const loginDTO = authMappers.mapLoginCredentialsToDTO(credentials)
                        const responseDTO = await authDataSource.login(loginDTO)

                        const user: User = {
                            id: responseDTO.id,
                            email: responseDTO.email,
                            role: responseDTO.role
                        }

                        set({
                            isAuthenticated: true,
                            isLoading: false,
                            user: user,
                            accessToken: responseDTO.token,
                            refreshToken: responseDTO.refreshToken,
                        })
                    } catch (error) {
                        console.error('Login failed', error)
                        throw error
                    } finally {
                        set({isLoading: false})
                    }
                },

                registerBuyer: async (data) => {
                    set({
                        isLoading: true
                    })

                    try {
                        const registerDTO = authMappers.mapRegisterBuyerToDTO(data)
                        const responseDTO = await authDataSource.registerBuyer(registerDTO)
                        const user: User = {
                            id: responseDTO.id,
                            email: responseDTO.email,
                            role: responseDTO.role
                        }

                        set({
                            isAuthenticated: true,
                            isLoading: false,
                            user: user,
                            accessToken: responseDTO.token,
                            refreshToken: responseDTO.refreshToken,
                        })
                    } catch (error) {
                        console.error('Login failed', error)
                        throw error
                    } finally {
                        set({isLoading: false})
                    }
                },

                registerAgency: async (data) => {
                    set({
                        isLoading: true
                    })

                    try {
                        const registerDTO = authMappers.mapRegisterAgencyToDTO(data)
                        const responseDTO = await authDataSource.registerAgency(registerDTO)

                        const user: User = {
                            id: responseDTO.id,
                            email: responseDTO.email,
                            role: 'AGENCY'
                        }

                        set({
                            isAuthenticated: true,
                            isLoading: false,
                            user: user
                        })
                    } catch (error) {
                        console.error('Login failed', error)
                        throw error
                    } finally {
                        set({isLoading: false})
                    }
                },

                logout: () => {
                    set({
                            isAuthenticated: false,
                            user: null,
                            accessToken: null,
                            refreshToken: null,
                        })
                },
            }),
            {
                name: 'auth-storage',
                storage: createJSONStorage(() => sessionStorage),
                partialize: (state) => ({
                    user: state.user,
                    accessToken: state.accessToken,
                    refreshToken: state.refreshToken,
                    isAuthenticated: state.isAuthenticated
                }),
            }
        )
    )