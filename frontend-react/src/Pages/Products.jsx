import { useState, useEffect, useMemo, useCallback } from 'react'
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
  { id: 1,  name: 'Smartphone Samsung Galaxy S24',      price: 15000000, category: 'Elektronik',        stock: 10, rating: 4.8, review_count: 234, is_new: true  },
  { id: 2,  name: 'Laptop ASUS ROG Zephyrus',           price: 25000000, category: 'Elektronik',        stock: 5,  rating: 4.6, review_count: 89,  discount: 15  },
  { id: 3,  name: 'Sony Noise Cancelling Headphones',   price: 4500000,  category: 'Elektronik',        stock: 20, rating: 4.5, review_count: 56  },
  { id: 4,  name: 'Kemeja Flanel Kotak-kotak',          price: 250000,    category: 'Pakaian Pria',      stock: 8,  rating: 4.7, review_count: 312, is_new: true  },
  { id: 5,  name: 'Celana Chino Slim Fit',              price: 350000,    category: 'Pakaian Pria',      stock: 15, rating: 4.4, review_count: 67  },
  { id: 6,  name: 'Jaket Bomber Navy',                  price: 500000,    category: 'Pakaian Pria',      stock: 30, rating: 4.9, review_count: 145 },
  { id: 7,  name: 'Kopi Arabika Gayo 250g',             price: 85000,     category: 'Makanan & Minuman', stock: 12, rating: 4.6, review_count: 78  },
  { id: 8,  name: 'Cokelat Batangan Premium',           price: 45000,     category: 'Makanan & Minuman', stock: 6,  rating: 4.8, review_count: 198, discount: 10  },
  { id: 9,  name: 'Teh Hijau Jepang Matcha',            price: 120000,    category: 'Makanan & Minuman', stock: 25, rating: 4.3, review_count: 42  },
]

const MOCK_CATEGORIES = [
  { name: 'Elektronik', products_count: 3 },
  { name: 'Pakaian Pria', products_count: 3 },
  { name: 'Makanan & Minuman', products_count: 3 },
]

const normalizeCategoryName = (category) => {
  if (!category) return ''
  if (typeof category === 'string') return category
  return category.name || category.slug || ''
}

const getCategoryCount = (category) => {
  if (!category || typeof category !== 'object') return 0
  return category.products_count ?? category.count ?? 0
}

const matchesSearch = (product, query) => {
  const needle = query.trim().toLowerCase()
  if (!needle) return true

  const haystack = [
    product.name,
    product.description,
    product.sku,
    normalizeCategoryName(product.category),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return haystack.includes(needle)
}

const sortProducts = (items, sort) => {
  const next = [...items]

  switch (sort) {
    case 'price_asc':
      return next.sort((a, b) => Number(a.price || 0) - Number(b.price || 0))
    case 'price_desc':
      return next.sort((a, b) => Number(b.price || 0) - Number(a.price || 0))
    case 'rating':
      return next.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
    case 'newest':
    default:
      return next
  }
}

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const [allProducts, setAllProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterOpen, setFilterOpen] = useState(false)

  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [sort, setSort] = useState('newest')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })

  useEffect(() => {
    setSearch(searchParams.get('q') || '')
    setCategory(searchParams.get('category') || '')
  }, [searchParams])

  // Fetch categories
  useEffect(() => {
    productService.getCategories()
      .then(res => {
        const cats = res.data?.data || res.data || []
        // API returns objects {id, name, products_count, ...}
        const normalized = Array.isArray(cats)
          ? cats.map((c) => ({
              name: normalizeCategoryName(c),
              products_count: getCategoryCount(c),
            })).filter((c) => c.name)
          : []
        setCategories(normalized.length > 0 ? normalized : MOCK_CATEGORIES)
      })
      .catch(() => setCategories(MOCK_CATEGORIES))
  }, [])

  // Fetch products once, then filter locally so search/category works in the UI
  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await productService.getAll()
      // Handle paginated response: res.data = {status, data: {data: [...], per_page, ...}}
      // or non-paginated: res.data = {status, data: [...]}
      const payload = res.data?.data
      const items = Array.isArray(payload) ? payload : (payload?.data || [])
      setAllProducts(items)
    } catch {
      setAllProducts(MOCK_PRODUCTS)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const filteredProducts = useMemo(() => {
    const selectedCategory = category.trim().toLowerCase()
    const minPrice = priceRange.min === '' ? null : Number(priceRange.min)
    const maxPrice = priceRange.max === '' ? null : Number(priceRange.max)

    const filtered = allProducts.filter((product) => {
      const productCategory = normalizeCategoryName(product.category).toLowerCase()
      const price = Number(product.price || 0)

      if (selectedCategory && productCategory !== selectedCategory) return false
      if (!matchesSearch(product, search)) return false
      if (minPrice !== null && price < minPrice) return false
      if (maxPrice !== null && price > maxPrice) return false
      return true
    })

    return sortProducts(filtered, sort)
  }, [allProducts, search, category, priceRange.min, priceRange.max, sort])

  const syncUrl = (nextSearch, nextCategory) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      nextSearch ? next.set('q', nextSearch) : next.delete('q')
      nextCategory ? next.set('category', nextCategory) : next.delete('category')
      return next
    })
  }

  const handleSearch = (e) => {
    e.preventDefault()
    syncUrl(search, category)
  }

  const handleCategoryChange = (nextCategory) => {
    setCategory(nextCategory)
    syncUrl(search, nextCategory)
  }

  const clearFilters = () => {
    setSearch('')
    setCategory('')
    setPriceRange({ min: '', max: '' })
    setSort('newest')
    setSearchParams({})
  }

  const hasFilters = search || category || priceRange.min || priceRange.max || sort !== 'newest'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 animate-fade-in">

      {/* Header */}
      <div className="mb-8">
        <h1 className="section-title mb-1">All Products</h1>
        <p className="font-body text-sm text-stone-400">
          {loading ? 'Loading...' : `${filteredProducts.length} products found`}
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
            <button type="button" onClick={() => { setSearch(''); syncUrl('', category) }}
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
                    onClick={() => handleCategoryChange('')}
                    className={`w-full text-left text-sm font-body px-2 py-1.5 rounded-sm transition-colors ${!category ? 'text-stone-900 font-medium bg-stone-100' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'}`}
                  >
                    All Categories
                  </button>
                </li>
                {categories.map(cat => (
                  <li key={cat.name}>
                    <button
                      onClick={() => handleCategoryChange(cat.name)}
                      className={`w-full text-left text-sm font-body px-2 py-1.5 rounded-sm transition-colors ${category.toLowerCase() === cat.name.toLowerCase() ? 'text-stone-900 font-medium bg-stone-100' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'}`}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span>{cat.name}</span>
                        <span className="text-xs text-stone-400">{cat.products_count || 0}</span>
                      </span>
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
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-body text-stone-400 text-sm">No products found.</p>
              <button onClick={clearFilters} className="mt-4 btn-outline text-sm">Clear filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredProducts.map((p, idx) => <ProductCard key={p.id} product={p} index={idx} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Products
