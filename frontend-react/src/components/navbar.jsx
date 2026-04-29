import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ShoppingBag, User, LogOut, Menu, X, Search, Package } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()

  const [scrolled,     setScrolled]     = useState(false)
  const [mobileOpen,   setMobileOpen]   = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = async () => {
    await logout()
    setUserMenuOpen(false)
    navigate('/')
  }

  const navLinks = [
    { to: '/',         label: 'Home'     },
    { to: '/products', label: 'Products' },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-elegant' : 'bg-white border-b border-stone-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-stone-800 flex items-center justify-center">
              <span className="text-white text-xs font-display font-bold">L</span>
            </div>
            <span className="font-display text-xl font-semibold text-stone-900 tracking-tight">LUXE</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `font-body text-sm font-medium tracking-wide transition-colors duration-200 ${
                    isActive ? 'text-stone-900 border-b border-stone-800 pb-0.5' : 'text-stone-500 hover:text-stone-900'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <button
              onClick={() => navigate('/products')}
              className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-sm transition-colors duration-200"
              aria-label="Search"
            >
              <Search size={18} />
            </button>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-sm transition-colors duration-200"
              aria-label={`Cart (${itemCount})`}
            >
              <ShoppingBag size={18} />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-stone-800 text-white text-[10px] font-mono font-medium rounded-full flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(v => !v)}
                  className="flex items-center gap-2 p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-sm transition-colors duration-200"
                >
                  <div className="w-7 h-7 bg-stone-800 text-white text-xs font-display font-semibold rounded-full flex items-center justify-center">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-stone-100 shadow-lifted animate-slide-up z-50">
                    <div className="px-4 py-3 border-b border-stone-100">
                      <p className="font-body text-sm font-medium text-stone-900 truncate">{user?.name}</p>
                      <p className="font-body text-xs text-stone-400 truncate">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-body text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors"
                      >
                        <Package size={15} /> Order History
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-body text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={15} /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:flex items-center gap-2 bg-stone-800 text-white px-4 py-2 text-sm font-body font-medium tracking-wide hover:bg-stone-900 transition-colors duration-200"
              >
                <User size={14} /> Sign In
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="md:hidden p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-sm transition-colors"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-stone-100 bg-white animate-slide-up">
          <nav className="px-4 py-4 space-y-1">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 font-body text-sm font-medium rounded-sm transition-colors ${
                    isActive ? 'bg-stone-100 text-stone-900' : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            {isAuthenticated ? (
              <>
                <NavLink
                  to="/orders"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 font-body text-sm font-medium text-stone-600 hover:bg-stone-50 rounded-sm"
                >
                  Orders
                </NavLink>
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false) }}
                  className="block w-full text-left px-3 py-2 font-body text-sm font-medium text-red-600 hover:bg-red-50 rounded-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="pt-2 flex gap-2">
                <Link to="/login"    onClick={() => setMobileOpen(false)} className="flex-1 btn-primary text-center text-sm py-2.5">Sign In</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1 btn-outline text-center text-sm py-2.5">Register</Link>
              </div>
            )}
          </nav>
        </div>
      )}

      {/* Overlay to close user menu */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
      )}
    </header>
  )
}

export default Navbar
