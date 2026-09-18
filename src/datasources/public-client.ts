import axios from 'axios'
import { errorMappers } from '../models/error'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const publicClient = axios.create(
    {
        baseURL: API_URL,
        headers: {
            'Content-Type': 'application/json'
        },
    }
)

publicClient.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(errorMappers.fromAxiosError(error))
)

export default publicClient