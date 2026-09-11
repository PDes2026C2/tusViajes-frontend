import axios from "axios"
import { useAuthStore } from "../stores/auth"

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

apiClient.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().accessToken
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true
        

            try {
                const { refreshToken } = useAuthStore.getState()
            
                if (!refreshToken) {
                    throw new Error('No refresh token available')
                }

                const { authDataSource } = await import('./auth')
                const { token: accessToken, refreshToken: newRefreshToken } = await authDataSource.refresh(refreshToken)

                useAuthStore.getState().setRefreshedSession({accessToken, refreshToken: newRefreshToken })

                originalRequest.headers.Authorization = `Bearer ${accessToken}`
                return apiClient(originalRequest)
            } catch (refreshError) {
                useAuthStore.getState().logout()
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
)

export default apiClient