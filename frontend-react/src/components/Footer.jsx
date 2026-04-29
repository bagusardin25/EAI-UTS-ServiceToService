import { Link } from 'react-router-dom'
import { Github, Mail, MapPin } from 'lucide-react'

const Footer = () => {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-stone-900 text-stone-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-white flex items-center justify-center">
                <span className="text-stone-900 text-xs font-display font-bold">L</span>
              </div>
              <span className="font-display text-xl font-semibold text-white tracking-tight">LUXE</span>
            </div>
            <p className="font-body text-sm text-stone-400 leading-relaxed max-w-xs">
              Platform e-commerce modern yang dibangun dengan arsitektur microservices.
              Proyek Integrasi Aplikasi Enterprise — Semester 4.
            </p>
            <div className="flex items-center gap-1 mt-4 text-xs font-mono text-stone-500">
              <MapPin size={11} /> Surabaya, Indonesia
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-body text-xs font-semibold tracking-widest text-stone-400 uppercase mb-4">Navigation</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/',         label: 'Home'     },
                { to: '/products', label: 'Products' },
                { to: '/cart',     label: 'Cart'     },
                { to: '/orders',   label: 'Orders'   },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="font-body text-sm text-stone-400 hover:text-white transition-colors duration-200">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-body text-xs font-semibold tracking-widest text-stone-400 uppercase mb-4">Microservices</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'User Service',    tech: 'Laravel + MySQL',        port: ':8000' },
                { label: 'Product Service', tech: 'Laravel + MySQL',        port: ':8001' },
                { label: 'Order Service',   tech: 'Node.js + PostgreSQL',   port: ':5000' },
              ].map(({ label, tech, port }) => (
                <li key={label}>
                  <p className="font-body text-sm text-stone-300">{label}</p>
                  <p className="font-mono text-[11px] text-stone-500">{tech} <span className="text-stone-600">{port}</span></p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-body text-xs text-stone-500">
            © {year} LUXE E-Commerce · Integrasi Aplikasi Enterprise
          </p>
          <div className="flex items-center gap-4">
            <a href="mailto:team@luxe.dev" className="text-stone-500 hover:text-white transition-colors">
              <Mail size={15} />
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-stone-500 hover:text-white transition-colors">
              <Github size={15} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
