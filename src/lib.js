import axios from 'axios'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
export const cn = (...inputs) => twMerge(clsx(inputs))
export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api', withCredentials: true })
api.interceptors.response.use(r => r, error => Promise.reject(new Error(error.response?.data?.message || 'Unable to complete the request')))
export const messageOf = error => error?.message || 'Something went wrong. Please try again.'
