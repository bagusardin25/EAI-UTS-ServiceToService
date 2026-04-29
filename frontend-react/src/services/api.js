import axios from 'axios'

// ============================================================
// BASE URLs — Microservices Architecture
// ============================================================
const USER_SERVICE_URL    = import.meta.env.VITE_USER_SERVICE_URL    || 'http://localhost:8001/api'
const PRODUCT_SERVICE_URL = import.meta.env.VITE_PRODUCT_SERVICE_URL || 'http://localhost:8000/api'
const ORDER_SERVICE_URL   = import.meta.env.VITE_ORDER_SERVICE_URL   || 'http://localhost:8002/api'

// ============================================================
// AXIOS INSTANCES
// ============================================================
const createInstance = (baseURL) => {
  const instance = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
  })

  // Request interceptor — attach Bearer token
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('auth_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  // Response interceptor — handle 401 globally
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }
  )

  return instance
}

export const userApi    = createInstance(USER_SERVICE_URL)
export const productApi = createInstance(PRODUCT_SERVICE_URL)
export const orderApi   = createInstance(ORDER_SERVICE_URL)

// ============================================================
// USER SERVICE  →  http://localhost:8000/api
// ============================================================
export const authService = {
  register: (data) => userApi.post('/auth/register', data),
  login:    (data) => userApi.post('/auth/login', data),
  logout:   ()     => userApi.post('/auth/logout'),
  profile:  ()     => userApi.get('/auth/profile'),
  updateProfile: (data) => userApi.put('/auth/profile', data),
}

// ============================================================
// PRODUCT SERVICE  →  http://localhost:8001/api
// ============================================================
export const productService = {
  getAll:      (params) => productApi.get('/products', { params }),
  getById:     (id)     => productApi.get(`/products/${id}`),
  getCategories: ()     => productApi.get('/categories'),
  search:      (query)  => productApi.get('/products/search', { params: { q: query } }),
}

// ============================================================
// ORDER SERVICE  →  http://localhost:5000/api
// ============================================================
export const orderService = {
  create:  (data) => orderApi.post('/orders', data),
  getAll:  ()     => orderApi.get('/orders'),
  getById: (id)   => orderApi.get(`/orders/${id}`),
  cancel:  (id)   => orderApi.patch(`/orders/${id}/cancel`),
}
