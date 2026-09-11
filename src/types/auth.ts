import type { Role } from "../models/auth"

export interface LoginRequestDTO {
    email:string
    password: string
}

export interface AgencyRegistrationRequestDTO {
    businessName: string
    taxId: string
    email: string
    password: string
}

export interface BuyerRegistrationRequestDTO {
    firstName: string
    lastName: string
    email: string
    password: string
    nationalId: string
    phoneNumber: string
}

export interface LoginResponseDTO {
    token: string
    refreshToken: string
    tokenType: string
    id: number
    email: string
    role: Role
}

export interface AgencyRegistrationResponseDTO {
    id: number
    email: string
    businessName: string
    taxId: string
    status: AgencyStatus,
    message: string
}

export interface BuyerResponseDTO {
    id: number
    firstName: string
    lastName: string 
    email: string
    phoneNumber: string
    nationalId: string
}

export type AgencyStatus = 'PENDING' | 'AUTHORIZED' | 'REJECTED'

export interface ExceptionDTO {
    message: string
    status: number
    description: string
    timestamp: string
}