import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Dumbbell,
  Headphones,
  Laptop,
  RefreshCw,
  ShieldCheck,
  Shirt,
  Sofa,
  Truck,
} from 'lucide-react'
import { productService } from '../services/api'
import ProductCard from '../components/ProductCard'
import Loader from '../components/Loader'
import heroImage from '../assets/hero.png'

const CATEGORIES = [
  { name: 'Electronics', icon: Laptop, count: 120 },
  { name: 'Fashion', icon: Shirt, count: 85 },
  { name: 'Home & Living', icon: Sofa, count: 64 },
  { name: 'Sports', icon: Dumbbell, count: 48 },
]

const FEATURES = [
  { icon: Truck, title: 'Free Shipping', desc: 'On orders over Rp 500.000' },
  { icon: ShieldCheck, title: 'Secure Payment', desc: '100% secure transactions' },
  { icon: RefreshCw, title: 'Easy Returns', desc: '30-day return policy' },
  { icon: Headphones, title: '24/7 Support', desc: 'Always here to help' },
]

const MOCK_PRODUCTS = [
  { id: 1, name: 'Wireless Noise-Cancelling Headphones', price: 2499000, category: 'Electronics', stock: 10, rating: 4.8, review_count: 234, is_new: true },
  { id: 2, name: 'Premium Leather Sneakers', price: 1299000, category: 'Fashion', stock: 5, rating: 4.6, review_count: 89, discount: 15 },
  { id: 3, name: 'Minimalist Desk Lamp', price: 349000, category: 'Home', stock: 20, rating: 4.5, review_count: 56 },
  { id: 4, name: 'Smart Fitness Watch', price: 3199000, category: 'Electronics', stock: 8, rating: 4.7, review_count: 312, is_new: true },
  { id: 5, name: 'Linen Button-Down Shirt', price: 459000, category: 'Fashion', stock: 15, rating: 4.4, review_count: 67 },
  { id: 6, name: 'Ceramic Pour-Over Coffee Set', price: 289000, category: 'Home', stock: 30, rating: 4.9, review_count: 145 },
  { id: 7, name: 'Yoga Mat Pro', price: 399000, category: 'Sports', stock: 12, rating: 4.6, review_count: 78 },
  { id: 8, name: 'Mechanical Keyboard TKL', price: 1850000, category: 'Electronics', stock: 6, rating: 4.8, review_count: 198, discount: 10 },
]

const Home = () => {
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await productService.getAll({ limit: 8, featured: true })
        // Handle paginated response from Laravel
        const payload = res.data?.data
        const items = Array.isArray(payload) ? payload : (payload?.data || [])
        setFeatured(items)
      } catch {
        setFeatured(MOCK_PRODUCTS)
      } finally {
        setLoading(false)
      }
    }

    fetchFeatured()
  }, [])

  return (
    <div className="animate-fade-in">
      <section className="relative min-h-[calc(100svh-4rem)] overflow-hidden bg-stone-950">
        <img
          src={heroImage}
          alt="Premium products collection"
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/85 to-stone-950/20" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-stone-950 to-transparent" />

        <div className="relative mx-auto flex min-h-[calc(100svh-4rem)] max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl reveal-up">
            <div className="mb-8 inline-flex items-center gap-2 border border-amber-400/30 bg-amber-400/15 px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="font-body text-xs font-medium uppercase tracking-wider text-amber-300">New Collection 2025</span>
            </div>

            <h1 className="font-display text-5xl font-semibold leading-[1.04] text-white sm:text-6xl lg:text-7xl">
              Discover
              <span className="block text-amber-400">Premium</span>
              Products
            </h1>

            <p className="mt-6 max-w-xl font-body text-base leading-8 text-stone-300 sm:text-lg">
              Temukan ribuan produk berkualitas tinggi dengan pengalaman belanja yang mudah, aman, dan nyaman di semua ukuran layar.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link to="/products" className="btn-accent gap-2 px-7 py-3.5">
                Shop Now <ArrowRight size={16} />
              </Link>
              <Link to="/products" className="inline-flex items-center justify-center gap-2 border border-white/20 bg-white/5 px-7 py-3.5 font-body text-sm font-semibold text-white backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10">
                Explore All
              </Link>
            </div>

            <div className="mt-12 grid max-w-lg grid-cols-3 gap-3 border-t border-white/10 pt-8 sm:gap-8">
              {[
                { value: '10K+', label: 'Products' },
                { value: '50K+', label: 'Customers' },
                { value: '4.9', label: 'Rating' },
              ].map((stat) => (
                <div key={stat.label} className="min-w-0">
                  <p className="font-display text-2xl font-semibold text-white sm:text-3xl">{stat.value}</p>
                  <p className="mt-0.5 font-body text-xs uppercase tracking-wider text-stone-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border-b border-stone-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 divide-y divide-stone-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, desc }, idx) => (
              <div key={title} className="flex items-center gap-4 p-5 reveal-up sm:p-6" style={{ animationDelay: `${idx * 70}ms` }}>
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center bg-stone-100 transition-transform duration-300 hover:-translate-y-1">
                  <Icon size={18} className="text-stone-700" />
                </div>
                <div>
                  <p className="font-body text-sm font-semibold text-stone-900">{title}</p>
                  <p className="mt-0.5 font-body text-xs text-stone-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-2 font-body text-xs font-semibold uppercase tracking-widest text-amber-600">Browse By</p>
            <h2 className="section-title">Categories</h2>
          </div>
          <Link to="/products" className="hidden items-center gap-2 font-body text-sm text-stone-500 transition-colors hover:text-stone-900 sm:flex">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {CATEGORIES.map((cat, idx) => {
            const Icon = cat.icon

            return (
              <Link
                key={cat.name}
                to={`/products?category=${encodeURIComponent(cat.name)}`}
                className="group relative overflow-hidden bg-white p-5 shadow-card ring-1 ring-stone-200/80 transition-all duration-300 hover:-translate-y-1 hover:bg-stone-900 hover:shadow-lifted reveal-up sm:p-6"
                style={{ animationDelay: `${idx * 70}ms` }}
              >
                <span className="mb-5 flex h-12 w-12 items-center justify-center bg-stone-100 text-stone-900 transition-colors duration-300 group-hover:bg-white/10 group-hover:text-white">
                  <Icon size={22} />
                </span>
                <h3 className="font-body text-sm font-semibold text-stone-900 transition-colors group-hover:text-white">{cat.name}</h3>
                <p className="mt-0.5 font-body text-xs text-stone-400 transition-colors group-hover:text-stone-300">{cat.count} products</p>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="bg-stone-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-2 font-body text-xs font-semibold uppercase tracking-widest text-amber-600">Handpicked</p>
              <h2 className="section-title">Featured Products</h2>
            </div>
            <Link to="/products" className="hidden items-center gap-2 font-body text-sm text-stone-500 transition-colors hover:text-stone-900 sm:flex">
              See all <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <Loader text="Loading products..." />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {featured.map((product, idx) => <ProductCard key={product.id} product={product} index={idx} />)}
            </div>
          )}

          <div className="mt-10 text-center">
            <Link to="/products" className="btn-outline gap-2">
              View All Products <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-8 overflow-hidden bg-stone-900 px-6 py-10 shadow-lifted sm:px-8 md:flex-row md:items-center md:px-16 md:py-14">
          <div>
            <h2 className="font-display text-3xl font-semibold text-white md:text-4xl">Ready to start shopping?</h2>
            <p className="mt-3 font-body text-sm text-stone-400">Daftar sekarang dan dapatkan penawaran eksklusif untuk member baru.</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link to="/register" className="btn-accent whitespace-nowrap">
              Get Started
            </Link>
            <Link to="/products" className="inline-flex items-center justify-center border border-stone-600 px-6 py-3 font-body text-sm font-semibold text-stone-300 transition-colors hover:border-stone-400 hover:text-white">
              Browse
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
