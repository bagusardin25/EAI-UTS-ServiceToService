import { Link } from 'react-router-dom'
import { ShoppingBag, Star, Eye } from 'lucide-react'
import { useCart } from '../Context/CartContext'

const ProductCard = ({ product, index = 0 }) => {
  const { addItem, isInCart } = useCart()
  const inCart = isInCart(product.id)

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product)
  }

  return (
    <Link to={`/products/${product.id}`} className="group block reveal-up" style={{ animationDelay: `${Math.min(index * 45, 360)}ms` }}>
      <div className="card overflow-hidden">
        {/* Image */}
        <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
          <img
            src={product.image || `https://picsum.photos/seed/${product.id}/400/300`}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Overlay actions */}
          <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/10 transition-all duration-300" />

          {/* Quick view button */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <span className="flex items-center gap-1.5 bg-white text-stone-800 px-4 py-2 text-xs font-body font-medium shadow-lifted">
              <Eye size={13} /> Quick View
            </span>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.stock === 0 && (
              <span className="badge bg-stone-800 text-white">Out of Stock</span>
            )}
            {product.is_new && (
              <span className="badge bg-amber-500 text-white">New</span>
            )}
            {product.discount > 0 && (
              <span className="badge bg-red-600 text-white">-{product.discount}%</span>
            )}
          </div>
        </div>

        {/* Info */}
          <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="min-w-0">
              {product.category && (
                <p className="font-body text-[11px] font-medium tracking-widest text-stone-400 uppercase mb-1">
                  {product.category}
                </p>
              )}
              <h3 className="font-body text-sm sm:text-[15px] font-semibold text-stone-900 leading-snug line-clamp-2 group-hover:text-stone-700 transition-colors">
                {product.name}
              </h3>
            </div>
          </div>

          {/* Rating */}
          {product.rating > 0 && (
            <div className="flex items-center gap-1 mb-3">
              <div className="flex">
                {[1,2,3,4,5].map(s => (
                  <Star
                    key={s}
                    size={11}
                    className={s <= Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'fill-stone-200 text-stone-200'}
                  />
                ))}
              </div>
              <span className="font-body text-[11px] text-stone-400">({product.review_count || 0})</span>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 mt-3">
            <div>
              <p className="font-display text-base sm:text-lg font-semibold text-stone-900">
                Rp {Number(product.price).toLocaleString('id-ID')}
              </p>
              {product.original_price && product.original_price > product.price && (
                <p className="font-body text-xs text-stone-400 line-through">
                  Rp {Number(product.original_price).toLocaleString('id-ID')}
                </p>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`p-2.5 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 ${
                inCart
                  ? 'bg-stone-800 text-white'
                  : 'border border-stone-300 text-stone-600 hover:bg-stone-800 hover:text-white hover:border-stone-800'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
              aria-label={inCart ? 'In cart' : 'Add to cart'}
            >
              <ShoppingBag size={15} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
