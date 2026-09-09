import type { AgencyRegistrationRequestDTO, BuyerRegistrationRequestDTO, LoginRequestDTO } from "../types/auth"

export type Role = 'ADMIN' | 'AGENCY' | 'BUYER'

export interface User {
    id: number
    email: string
    role: Role
}

export interface AuthTokens {
    accessToken: string
    refreshToken: string
}

export interface LoginCredentials {
    email: string
    password: string
}

export interface RegisterBuyerData {
    email: string
    password: string
    firstName: string
    lastName: string
    nationalId: string
    phoneNumber: string
}

export interface RegisterAgencyData {
    email: string
    taxId: string
    password: string
    businessName: string
}

export const authMappers = {
    mapRegisterBuyerToDTO: (data: RegisterBuyerData): BuyerRegistrationRequestDTO => ({
        firstName : data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        nationalId: data.nationalId,
        phoneNumber: data.phoneNumber
    }),

    mapRegisterAgencyToDTO: (data: RegisterAgencyData): AgencyRegistrationRequestDTO => ({
        email: data.email,
        password: data.password,
        taxId: data.taxId,
        businessName: data.businessName
    }),

    mapLoginCredentialsToDTO: (credentials: LoginCredentials): LoginRequestDTO => ({
        email: credentials.email,
        password: credentials.password
    })
}