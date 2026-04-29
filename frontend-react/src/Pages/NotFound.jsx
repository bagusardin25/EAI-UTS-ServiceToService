import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Home } from 'lucide-react'

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 animate-fade-in">
      <div className="text-center max-w-md">
        <p className="font-mono text-8xl font-bold text-stone-200 leading-none mb-6">404</p>
        <h1 className="font-display text-3xl font-semibold text-stone-900 mb-4">Page not found</h1>
        <p className="font-body text-stone-500 text-sm leading-relaxed mb-10">
          Halaman yang Anda cari tidak ditemukan atau mungkin sudah dipindahkan.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => navigate(-1)} className="btn-outline flex items-center gap-2">
            <ArrowLeft size={15} /> Go Back
          </button>
          <Link to="/" className="btn-primary flex items-center gap-2">
            <Home size={15} /> Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound
