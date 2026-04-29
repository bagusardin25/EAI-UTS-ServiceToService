import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, AlertCircle, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const getApiErrorMessage = (err, fallback) => {
  const data = err?.response?.data
  const validationErrors = data?.errors

  if (validationErrors && typeof validationErrors === 'object') {
    const firstField = Object.keys(validationErrors)[0]
    const firstMessage = validationErrors[firstField]?.[0]
    if (firstMessage) return firstMessage
  }

  if (typeof data?.message === 'string' && data.message) return data.message
  if (typeof err?.message === 'string' && err.message) return err.message
  return fallback
}

const Register = () => {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const validate = () => {
    const nextErrors = {}

    if (!form.name.trim()) nextErrors.name = 'Full name is required'
    else if (form.name.length < 3) nextErrors.name = 'Minimum 3 characters'

    if (!form.email) nextErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) nextErrors.email = 'Invalid email address'

    if (!form.password) nextErrors.password = 'Password is required'
    else if (form.password.length < 8) nextErrors.password = 'Minimum 8 characters'

    if (form.password !== form.password_confirmation) {
      nextErrors.password_confirmation = 'Passwords do not match'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))

    if (errors[name]) setErrors((current) => ({ ...current, [name]: '' }))
    if (apiError) setApiError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      await register(form)
      navigate('/')
    } catch (err) {
      setApiError(getApiErrorMessage(err, 'Registration failed. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  const passwordStrength = () => {
    const password = form.password
    if (!password) return null
    if (password.length < 6) return { level: 1, label: 'Weak', color: 'bg-red-400' }
    if (password.length < 10) return { level: 2, label: 'Fair', color: 'bg-amber-400' }
    return { level: 3, label: 'Strong', color: 'bg-green-500' }
  }

  const strength = passwordStrength()

  return (
    <div className="min-h-screen flex animate-fade-in">
      <div className="hidden lg:flex lg:w-1/2 bg-stone-800 flex-col justify-between p-16 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, #d97706 0%, transparent 50%)' }}
        />
        <Link to="/" className="flex items-center gap-2 relative">
          <div className="w-9 h-9 bg-white flex items-center justify-center">
            <span className="text-stone-900 text-sm font-display font-bold">L</span>
          </div>
          <span className="font-display text-2xl font-semibold text-white tracking-tight">LUXE</span>
        </Link>
        <div className="relative space-y-6">
          <p className="font-display text-4xl font-semibold text-white leading-tight">
            Join LUXE
            <br />
            today.
          </p>
          <ul className="space-y-3">
            {['Access thousands of products', 'Exclusive member deals', 'Fast & secure checkout', 'Order tracking'].map((item) => (
              <li key={item} className="flex items-center gap-3 font-body text-sm text-stone-300">
                <div className="w-5 h-5 bg-amber-500/20 border border-amber-500/40 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check size={11} className="text-amber-400" />
                </div>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="font-body text-xs text-stone-500 relative">
          (c) {new Date().getFullYear()} LUXE - Integrasi Aplikasi Enterprise
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-16 bg-white">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-stone-800 flex items-center justify-center">
                <span className="text-white text-xs font-display font-bold">L</span>
              </div>
              <span className="font-display text-xl font-semibold text-stone-900">LUXE</span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-3xl font-semibold text-stone-900 mb-2">Create account</h1>
            <p className="font-body text-sm text-stone-500">
              Already have an account?{' '}
              <Link to="/login" className="text-stone-800 font-medium underline underline-offset-2 hover:text-stone-600">
                Sign in
              </Link>
            </p>
          </div>

          {apiError && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 px-4 py-3 mb-6 animate-slide-up">
              <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="font-body text-sm text-red-700">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="name" className="label">
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Ahmad Fauzi"
                className={`input-field ${errors.name ? 'border-red-400' : ''}`}
              />
              {errors.name && <p className="mt-1.5 text-xs text-red-500 font-body">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="label">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`input-field ${errors.email ? 'border-red-400' : ''}`}
              />
              {errors.email && <p className="mt-1.5 text-xs text-red-500 font-body">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters"
                  className={`input-field pr-10 ${errors.password ? 'border-red-400' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {strength && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          level <= strength.level ? strength.color : 'bg-stone-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-body text-[11px] text-stone-400">{strength.label}</span>
                </div>
              )}
              {errors.password && <p className="mt-1.5 text-xs text-red-500 font-body">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="password_confirmation" className="label">
                Confirm password
              </label>
              <input
                id="password_confirmation"
                name="password_confirmation"
                type={showPw ? 'text' : 'password'}
                autoComplete="new-password"
                value={form.password_confirmation}
                onChange={handleChange}
                placeholder="Repeat your password"
                className={`input-field ${errors.password_confirmation ? 'border-red-400' : ''}`}
              />
              {errors.password_confirmation && (
                <p className="mt-1.5 text-xs text-red-500 font-body">{errors.password_confirmation}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3.5 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>

            <p className="text-center font-body text-xs text-stone-400 mt-3">
              By registering, you agree to our{' '}
              <span className="underline cursor-pointer hover:text-stone-700">Terms of Service</span>{' '}
              and{' '}
              <span className="underline cursor-pointer hover:text-stone-700">Privacy Policy</span>.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register
