import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const publicClient = axios.create(
    {
        baseURL: API_URL,
        headers: {
            'Content-Type': 'application/json'
        },
    }
)

export default publicClient