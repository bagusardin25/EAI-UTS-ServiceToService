import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Truck, ShieldCheck, RefreshCw, Headphones } from 'lucide-react'
import { productService } from '../services/api'
import ProductCard from '../components/ProductCard'
import Loader from '../components/Loader'

// ── Mock categories for display ──
const CATEGORIES = [
  { name: 'Electronics',  emoji: '💻', count: 120 },
  { name: 'Fashion',      emoji: '👗', count: 85  },
  { name: 'Home & Living',emoji: '🏠', count: 64  },
  { name: 'Sports',       emoji: '⚡', count: 48  },
]

const FEATURES = [
  { icon: Truck,        title: 'Free Shipping',   desc: 'On orders over Rp 500.000' },
  { icon: ShieldCheck,  title: 'Secure Payment',  desc: '100% secure transactions'  },
  { icon: RefreshCw,    title: 'Easy Returns',    desc: '30-day return policy'       },
  { icon: Headphones,   title: '24/7 Support',    desc: 'Always here to help'        },
]

const Home = () => {
  const [featured, setFeatured] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await productService.getAll({ limit: 8, featured: true })
        // Handle Laravel paginated response: res.data.data.data
        const productsArray = res.data?.data?.data || res.data?.data || []
        setFeatured(Array.isArray(productsArray) ? productsArray : [])
      } catch {
        // Use mock products for demo / when service is down
        setFeatured(MOCK_PRODUCTS)
      } finally {
        setLoading(false)
      }
    }
    fetchFeatured()
  }, [])

  return (
    <div className="animate-fade-in">

      {/* ── Hero ── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-stone-900">
        {/* Background texture */}
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #d97706 0%, transparent 50%), radial-gradient(circle at 80% 20%, #44403c 0%, transparent 50%)' }}
        />
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 mb-8">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
              <span className="font-body text-xs font-medium text-amber-300 tracking-wider uppercase">New Collection 2025</span>
            </div>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-semibold text-white leading-[1.05] mb-6">
              Discover
              <span className="block text-amber-400">Premium</span>
              Products
            </h1>

            <p className="font-body text-lg text-stone-300 leading-relaxed mb-10 max-w-lg">
              Temukan ribuan produk berkualitas tinggi dengan pengalaman belanja yang mudah dan aman.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/products" className="inline-flex items-center gap-2 bg-amber-500 text-stone-900 px-7 py-3.5 font-body font-semibold tracking-wide hover:bg-amber-400 active:scale-[0.98] transition-all duration-200">
                Shop Now <ArrowRight size={16} />
              </Link>
              <Link to="/products" className="inline-flex items-center gap-2 border border-stone-600 text-stone-200 px-7 py-3.5 font-body font-medium tracking-wide hover:border-stone-400 hover:text-white transition-all duration-200">
                Explore All
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-10 mt-14 pt-10 border-t border-stone-800">
              {[
                { value: '10K+', label: 'Products'  },
                { value: '50K+', label: 'Customers' },
                { value: '4.9★', label: 'Rating'    },
              ].map(s => (
                <div key={s.label}>
                  <p className="font-display text-2xl font-semibold text-white">{s.value}</p>
                  <p className="font-body text-xs text-stone-500 uppercase tracking-wider mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Bar ── */}
      <section className="bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-stone-100">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4 p-6">
                <div className="w-10 h-10 bg-stone-100 flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-stone-700" />
                </div>
                <div>
                  <p className="font-body text-sm font-semibold text-stone-900">{title}</p>
                  <p className="font-body text-xs text-stone-400 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="font-body text-xs font-semibold tracking-widest text-amber-600 uppercase mb-2">Browse By</p>
            <h2 className="section-title">Categories</h2>
          </div>
          <Link to="/products" className="hidden sm:flex items-center gap-2 font-body text-sm text-stone-500 hover:text-stone-900 transition-colors">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.name}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              className="group relative bg-stone-100 hover:bg-stone-800 p-6 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-stone-200/50 group-hover:to-stone-900/50 transition-all duration-300" />
              <div className="relative">
                <span className="text-4xl mb-4 block">{cat.emoji}</span>
                <h3 className="font-body text-sm font-semibold text-stone-900 group-hover:text-white transition-colors">{cat.name}</h3>
                <p className="font-body text-xs text-stone-400 group-hover:text-stone-300 mt-0.5 transition-colors">{cat.count} products</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="bg-stone-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="font-body text-xs font-semibold tracking-widest text-amber-600 uppercase mb-2">Handpicked</p>
              <h2 className="section-title">Featured Products</h2>
            </div>
            <Link to="/products" className="hidden sm:flex items-center gap-2 font-body text-sm text-stone-500 hover:text-stone-900 transition-colors">
              See all <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <Loader text="Loading products…" />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {featured.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          <div className="text-center mt-10">
            <Link to="/products" className="btn-outline inline-flex items-center gap-2">
              View All Products <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-stone-800 px-8 md:px-16 py-14 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-white mb-3">Ready to start shopping?</h2>
            <p className="font-body text-stone-400 text-sm">Daftar sekarang dan dapatkan penawaran eksklusif untuk member baru.</p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <Link to="/register" className="bg-amber-500 text-stone-900 px-6 py-3 font-body font-semibold tracking-wide hover:bg-amber-400 transition-colors whitespace-nowrap">
              Get Started
            </Link>
            <Link to="/products" className="border border-stone-600 text-stone-300 px-6 py-3 font-body font-medium tracking-wide hover:border-stone-400 hover:text-white transition-colors whitespace-nowrap">
              Browse
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

// ── Mock data (used as fallback when API is offline) ──────────
const MOCK_PRODUCTS = [
  { id: 1,  name: 'Wireless Noise-Cancelling Headphones', price: 2499000,  category: 'Electronics', stock: 10, rating: 4.8, review_count: 234, is_new: true  },
  { id: 2,  name: 'Premium Leather Sneakers',             price: 1299000,  category: 'Fashion',     stock: 5,  rating: 4.6, review_count: 89,  discount: 15  },
  { id: 3,  name: 'Minimalist Desk Lamp',                 price: 349000,   category: 'Home',        stock: 20, rating: 4.5, review_count: 56  },
  { id: 4,  name: 'Smart Fitness Watch',                  price: 3199000,  category: 'Electronics', stock: 8,  rating: 4.7, review_count: 312, is_new: true  },
  { id: 5,  name: 'Linen Button-Down Shirt',              price: 459000,   category: 'Fashion',     stock: 15, rating: 4.4, review_count: 67  },
  { id: 6,  name: 'Ceramic Pour-Over Coffee Set',         price: 289000,   category: 'Home',        stock: 30, rating: 4.9, review_count: 145 },
  { id: 7,  name: 'Yoga Mat Pro',                        price: 399000,   category: 'Sports',      stock: 12, rating: 4.6, review_count: 78  },
  { id: 8,  name: 'Mechanical Keyboard TKL',              price: 1850000,  category: 'Electronics', stock: 6,  rating: 4.8, review_count: 198, discount: 10  },
]

export default Home
