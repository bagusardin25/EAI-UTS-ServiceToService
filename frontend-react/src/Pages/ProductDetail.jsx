import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShoppingBag, Star, ArrowLeft, Plus, Minus, Check, Truck, Shield } from 'lucide-react'
import { productService } from '../services/api'
import { useCart } from '../Context/CartContext'
import Loader from '../components/Loader'

const MOCK_PRODUCTS = {
  1: { id: 1, name: 'Wireless Noise-Cancelling Headphones', price: 2499000, original_price: 2999000, category: 'Electronics', stock: 10, rating: 4.8, review_count: 234, is_new: true, discount: 17,
       description: 'Headphone premium dengan teknologi active noise cancellation terdepan. Nikmati suara kristal jernih tanpa gangguan dengan battery life hingga 30 jam. Desain ergonomis membuatnya nyaman dipakai sepanjang hari.',
       features: ['Active Noise Cancellation', '30-hour battery', 'Bluetooth 5.0', 'Foldable design'] },
  2: { id: 2, name: 'Premium Leather Sneakers', price: 1299000, original_price: 1529000, category: 'Fashion', stock: 5, rating: 4.6, review_count: 89, discount: 15,
       description: 'Sneakers kulit premium dengan desain minimalis yang timeless. Cocok untuk casual dan semi-formal.',
       features: ['Full-grain leather', 'Rubber sole', 'Cushioned insole', 'Available sizes 38-45'] },
}

const ProductDetail = () => {
  const { id }         = useParams()
  const { addItem, isInCart, updateQty, items } = useCart()

  const [product,  setProduct]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [added,    setAdded]    = useState(false)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const res = await productService.getById(id)
        setProduct(res.data?.data || res.data)
      } catch {
        setProduct(MOCK_PRODUCTS[Number(id)] || null)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  const handleAddToCart = () => {
    if (!product) return
    addItem(product, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (loading) return <Loader fullPage text="Loading product…" />

  if (!product) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <p className="font-body text-stone-500">Product not found.</p>
      <Link to="/products" className="btn-primary">Back to Products</Link>
    </div>
  )

  const inCart = isInCart(product.id)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-body text-stone-400 mb-8">
        <Link to="/" className="hover:text-stone-700">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-stone-700">Products</Link>
        <span>/</span>
        <span className="text-stone-700">{product.name}</span>
      </nav>

      <Link to="/products" className="inline-flex items-center gap-2 font-body text-sm text-stone-500 hover:text-stone-900 mb-8 transition-colors">
        <ArrowLeft size={15} /> Back to Products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

        {/* Image */}
        <div className="space-y-4">
          <div className="aspect-square bg-stone-100 overflow-hidden relative">
            <img
              src={product.image || `https://picsum.photos/seed/${product.id}/600/600`}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.discount > 0 && (
              <span className="absolute top-4 left-4 badge bg-red-600 text-white text-sm px-3 py-1">
                -{product.discount}%
              </span>
            )}
            {product.is_new && (
              <span className="absolute top-4 right-4 badge bg-amber-500 text-white text-sm px-3 py-1">New</span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-6">
          {product.category && (
            <p className="font-body text-xs font-semibold tracking-widest text-amber-600 uppercase">{product.category}</p>
          )}
          <h1 className="font-display text-3xl lg:text-4xl font-semibold text-stone-900 leading-tight">{product.name}</h1>

          {/* Rating */}
          {product.rating > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={15} className={s <= Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'fill-stone-200 text-stone-200'} />
                ))}
              </div>
              <span className="font-body text-sm font-medium text-stone-700">{product.rating}</span>
              <span className="font-body text-sm text-stone-400">({product.review_count} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-end gap-3">
            <p className="font-display text-3xl font-semibold text-stone-900">
              Rp {Number(product.price).toLocaleString('id-ID')}
            </p>
            {product.original_price && product.original_price > product.price && (
              <p className="font-body text-lg text-stone-400 line-through mb-0.5">
                Rp {Number(product.original_price).toLocaleString('id-ID')}
              </p>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="font-body text-sm text-stone-600 leading-relaxed">{product.description}</p>
          )}

          {/* Features */}
          {product.features?.length > 0 && (
            <ul className="space-y-2">
              {product.features.map(f => (
                <li key={f} className="flex items-center gap-2 font-body text-sm text-stone-700">
                  <Check size={14} className="text-green-600 flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
          )}

          <div className="border-t border-stone-100 pt-6 space-y-4">
            {/* Stock */}
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="font-body text-sm text-stone-600">
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>

            {/* Quantity */}
            {product.stock > 0 && (
              <div className="flex items-center gap-4">
                <span className="font-body text-sm text-stone-600 w-16">Quantity</span>
                <div className="flex items-center border border-stone-200">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="p-2.5 text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-12 text-center font-body text-sm font-medium text-stone-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="p-2.5 text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Add to Cart */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-1 flex items-center justify-center gap-2 py-4 font-body font-semibold tracking-wide transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed ${
                  added ? 'bg-green-600 text-white' : 'bg-stone-800 text-white hover:bg-stone-900'
                }`}
              >
                {added ? (
                  <><Check size={16} /> Added to Cart</>
                ) : (
                  <><ShoppingBag size={16} /> Add to Cart</>
                )}
              </button>
              <Link
                to="/cart"
                className="border border-stone-200 px-5 py-4 text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors font-body text-sm font-medium"
              >
                View Cart
              </Link>
            </div>
          </div>

          {/* Trust signals */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Truck,   text: 'Free shipping over Rp 500k' },
              { icon: Shield,  text: '30-day return policy'        },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 bg-stone-50 px-3 py-2.5">
                <Icon size={14} className="text-stone-500 flex-shrink-0" />
                <span className="font-body text-xs text-stone-600">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
