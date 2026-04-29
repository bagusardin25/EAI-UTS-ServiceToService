import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from?.pathname || '/'

  const [form,    setForm]    = useState({ email: '', password: '' })
  const [errors,  setErrors]  = useState({})
  const [apiError,setApiError]= useState('')
  const [loading, setLoading] = useState(false)
  const [showPw,  setShowPw]  = useState(false)

  const validate = () => {
    const e = {}
    if (!form.email)          e.email    = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address'
    if (!form.password)       e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'Minimum 6 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }))
    if (apiError) setApiError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await login(form)
      navigate(from, { replace: true })
    } catch (err) {
      setApiError(err.response?.data?.message || 'Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex animate-fade-in">

      {/* Left — decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-stone-900 flex-col justify-between p-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 70%, #d97706 0%, transparent 50%)' }} />
        <Link to="/" className="flex items-center gap-2 relative">
          <div className="w-9 h-9 bg-white flex items-center justify-center">
            <span className="text-stone-900 text-sm font-display font-bold">L</span>
          </div>
          <span className="font-display text-2xl font-semibold text-white tracking-tight">LUXE</span>
        </Link>
        <div className="relative">
          <p className="font-display text-4xl font-semibold text-white leading-tight mb-4">
            Welcome<br />back.
          </p>
          <p className="font-body text-stone-400 text-sm leading-relaxed">
            Masuk ke akun Anda untuk melanjutkan<br />pengalaman berbelanja terbaik.
          </p>
        </div>
        <p className="font-body text-xs text-stone-600 relative">
          © {new Date().getFullYear()} LUXE · Integrasi Aplikasi Enterprise
        </p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 bg-white">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-stone-800 flex items-center justify-center">
                <span className="text-white text-xs font-display font-bold">L</span>
              </div>
              <span className="font-display text-xl font-semibold text-stone-900">LUXE</span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-3xl font-semibold text-stone-900 mb-2">Sign in</h1>
            <p className="font-body text-sm text-stone-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-stone-800 font-medium underline underline-offset-2 hover:text-stone-600">
                Create one
              </Link>
            </p>
          </div>

          {/* API Error */}
          {apiError && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 px-4 py-3 mb-6 animate-slide-up">
              <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="font-body text-sm text-red-700">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email */}
            <div>
              <label htmlFor="email" className="label">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`input-field ${errors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : ''}`}
              />
              {errors.email && <p className="mt-1.5 text-xs text-red-500 font-body">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="label">Password</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`input-field pr-10 ${errors.password ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-red-500 font-body">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3.5 mt-2"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in…</>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-8 p-4 bg-stone-50 border border-stone-100">
            <p className="font-body text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Demo Credentials</p>
            <p className="font-mono text-xs text-stone-600">Email: demo@luxe.dev</p>
            <p className="font-mono text-xs text-stone-600">Password: demo123</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
