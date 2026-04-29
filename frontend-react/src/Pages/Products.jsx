import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { productService } from '../services/api'
import ProductCard from '../components/ProductCard'
import Loader from '../components/Loader'

const SORT_OPTIONS = [
  { value: 'newest',    label: 'Newest First'    },
  { value: 'price_asc', label: 'Price: Low to High'},
  { value: 'price_desc',label: 'Price: High to Low'},
  { value: 'rating',    label: 'Top Rated'        },
]

const MOCK_PRODUCTS = [
  { id: 1,  name: 'Wireless Noise-Cancelling Headphones', price: 2499000,  category: 'Electronics', stock: 10, rating: 4.8, review_count: 234, is_new: true  },
  { id: 2,  name: 'Premium Leather Sneakers',             price: 1299000,  category: 'Fashion',     stock: 5,  rating: 4.6, review_count: 89,  discount: 15  },
  { id: 3,  name: 'Minimalist Desk Lamp',                 price: 349000,   category: 'Home',        stock: 20, rating: 4.5, review_count: 56  },
  { id: 4,  name: 'Smart Fitness Watch',                  price: 3199000,  category: 'Electronics', stock: 8,  rating: 4.7, review_count: 312, is_new: true  },
  { id: 5,  name: 'Linen Button-Down Shirt',              price: 459000,   category: 'Fashion',     stock: 15, rating: 4.4, review_count: 67  },
  { id: 6,  name: 'Ceramic Pour-Over Coffee Set',         price: 289000,   category: 'Home',        stock: 30, rating: 4.9, review_count: 145 },
  { id: 7,  name: 'Yoga Mat Pro',                        price: 399000,   category: 'Sports',      stock: 12, rating: 4.6, review_count: 78  },
  { id: 8,  name: 'Mechanical Keyboard TKL',              price: 1850000,  category: 'Electronics', stock: 6,  rating: 4.8, review_count: 198, discount: 10  },
  { id: 9,  name: 'Tote Canvas Bag',                     price: 199000,   category: 'Fashion',     stock: 25, rating: 4.3, review_count: 42  },
  { id: 10, name: 'Standing Desk Mat',                   price: 279000,   category: 'Home',        stock: 18, rating: 4.5, review_count: 63  },
  { id: 11, name: 'Running Shoes Ultra',                 price: 1199000,  category: 'Sports',      stock: 9,  rating: 4.7, review_count: 156 },
  { id: 12, name: 'USB-C Hub 7-in-1',                   price: 599000,   category: 'Electronics', stock: 22, rating: 4.6, review_count: 88  },
]

const MOCK_CATEGORIES = ['Electronics', 'Fashion', 'Home', 'Sports']

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const [products,    setProducts]    = useState([])
  const [categories,  setCategories]  = useState([])
  const [loading,     setLoading]     = useState(true)
  const [filterOpen,  setFilterOpen]  = useState(false)

  const [search,       setSearch]      = useState(searchParams.get('q') || '')
  const [activeSearch, setActiveSearch] = useState(searchParams.get('q') || '')
  const [category,     setCategory]    = useState(searchParams.get('category') || '')
  const [sort,         setSort]        = useState('newest')
  const [priceRange,   setPriceRange]  = useState({ min: '', max: '' })

  // Fetch categories
  useEffect(() => {
    productService.getCategories()
      .then(res => {
        const cats = res.data?.data || res.data || []
        // API returns objects {id, name, ...}, extract names for filter
        const catNames = Array.isArray(cats)
          ? cats.map(c => (typeof c === 'string' ? c : c.name))
          : MOCK_CATEGORIES
        setCategories(catNames)
      })
      .catch(() => setCategories(MOCK_CATEGORIES))
  }, [])

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (activeSearch) params.q        = activeSearch
      if (category)     params.category = category
      if (sort)         params.sort     = sort
      if (priceRange.min) params.min_price = priceRange.min
      if (priceRange.max) params.max_price = priceRange.max

      const res = await productService.getAll(params)
      // Handle paginated response: res.data = {status, data: {data: [...], per_page, ...}}
      // or non-paginated: res.data = {status, data: [...]}
      const payload = res.data?.data
      const items = Array.isArray(payload) ? payload : (payload?.data || [])
      setProducts(items)
    } catch {
      // Filter mock products client-side for demo
      let filtered = [...MOCK_PRODUCTS]
      if (activeSearch) filtered = filtered.filter(p => p.name.toLowerCase().includes(activeSearch.toLowerCase()))
      if (category)     filtered = filtered.filter(p => p.category === category)
      setProducts(filtered)
    } finally {
      setLoading(false)
    }
  }, [activeSearch, category, sort, priceRange])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const handleSearch = (e) => {
    e.preventDefault()
    setActiveSearch(search)
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      search ? next.set('q', search) : next.delete('q')
      return next
    })
  }

  const clearFilters = () => {
    setSearch('')
    setActiveSearch('')
    setCategory('')
    setPriceRange({ min: '', max: '' })
    setSearchParams({})
  }

  const hasFilters = activeSearch || category || priceRange.min || priceRange.max

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 animate-fade-in">

      {/* Header */}
      <div className="mb-8">
        <h1 className="section-title mb-1">All Products</h1>
        <p className="font-body text-sm text-stone-400">
          {loading ? 'Loading...' : `${products.length} products found`}
          {hasFilters && (
            <button onClick={clearFilters} className="ml-3 text-amber-600 hover:text-amber-700 underline">
              Clear filters
            </button>
          )}
        </p>
      </div>

      {/* Search + Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="input-field pl-10 pr-10"
          />
          {search && (
            <button type="button" onClick={() => { setSearch(''); setActiveSearch('') }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700">
              <X size={14} />
            </button>
          )}
        </form>

        {/* Sort */}
        <div className="relative sm:w-56">
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="input-field pr-9 appearance-none min-w-[180px] cursor-pointer"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
        </div>

        {/* Filter toggle (mobile) */}
        <button
          onClick={() => setFilterOpen(v => !v)}
          className="sm:hidden flex items-center gap-2 btn-outline text-sm"
        >
          <SlidersHorizontal size={15} /> Filters
          {hasFilters && <span className="w-2 h-2 bg-amber-500 rounded-full" />}
        </button>
      </div>

      <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">

        {/* ── Sidebar Filters ── */}
        <aside className={`${filterOpen ? 'block' : 'hidden'} sm:block w-full sm:w-60 flex-shrink-0`}>
          <div className="surface p-5 space-y-6 sm:sticky sm:top-24 reveal-up">
            <div>
              <h3 className="font-body text-xs font-semibold tracking-widest text-stone-500 uppercase mb-3">Category</h3>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => setCategory('')}
                    className={`w-full text-left text-sm font-body px-2 py-1.5 rounded-sm transition-colors ${!category ? 'text-stone-900 font-medium bg-stone-100' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'}`}
                  >
                    All Categories
                  </button>
                </li>
                {categories.map(cat => (
                  <li key={cat}>
                    <button
                      onClick={() => setCategory(cat)}
                      className={`w-full text-left text-sm font-body px-2 py-1.5 rounded-sm transition-colors ${category === cat ? 'text-stone-900 font-medium bg-stone-100' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'}`}
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-body text-xs font-semibold tracking-widest text-stone-500 uppercase mb-3">Price Range</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={e => setPriceRange(p => ({ ...p, min: e.target.value }))}
                  className="input-field text-xs px-3 py-2"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={e => setPriceRange(p => ({ ...p, max: e.target.value }))}
                  className="input-field text-xs px-3 py-2"
                />
              </div>
            </div>

            {hasFilters && (
              <button onClick={clearFilters} className="w-full text-xs font-body text-red-500 hover:text-red-700 py-2 border border-red-200 hover:border-red-300 transition-colors">
                Clear All Filters
              </button>
            )}
          </div>
        </aside>

        {/* ── Product Grid ── */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <Loader text="Loading products..." />
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-body text-stone-400 text-sm">No products found.</p>
              <button onClick={clearFilters} className="mt-4 btn-outline text-sm">Clear filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {products.map((p, idx) => <ProductCard key={p.id} product={p} index={idx} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Products
