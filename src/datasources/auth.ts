import type { AgencyRegistrationRequestDTO, AgencyRegistrationResponseDTO, BuyerRegistrationRequestDTO, LoginRequestDTO, LoginResponseDTO } from "../types/auth"
import publicClient from "./public-client"


export const authDataSource = {
    async login(credentials: LoginRequestDTO): Promise<LoginResponseDTO> {
        const response = await publicClient.post<LoginResponseDTO>('/auth/login', credentials)
        return response.data
    },

    async registerAgency(data: AgencyRegistrationRequestDTO): Promise<AgencyRegistrationResponseDTO> {
        const response = await publicClient.post<AgencyRegistrationResponseDTO>('/auth/register/agency', data)
        return response.data
    },

    async registerBuyer(data: BuyerRegistrationRequestDTO): Promise<LoginResponseDTO> {
        const response = await publicClient.post<LoginResponseDTO>('/auth/register/buyer', data)
        return response.data
    },

    async refresh(refreshToken: string): Promise<LoginResponseDTO> {
        const response = await publicClient.post<LoginResponseDTO>('/auth/refresh', { refreshToken })
        return response.data
    }
}