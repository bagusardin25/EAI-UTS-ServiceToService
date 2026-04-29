import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag } from 'lucide-react'
import { useCart } from '../context/CartContext'

const Cart = () => {
  const { items, removeItem, updateQty, totalPrice, clearCart, itemCount } = useCart()

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center animate-fade-in">
        <div className="max-w-sm mx-auto">
          <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={32} className="text-stone-400" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-stone-900 mb-3">Your cart is empty</h1>
          <p className="font-body text-sm text-stone-500 mb-8">Start adding products to your cart to see them here.</p>
          <Link to="/products" className="btn-primary inline-flex items-center gap-2">
            Browse Products <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    )
  }

  const shipping    = totalPrice >= 500000 ? 0 : 25000
  const subtotal    = totalPrice
  const grandTotal  = subtotal + shipping

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="section-title">Shopping Cart</h1>
          <p className="font-body text-sm text-stone-400 mt-1">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={clearCart} className="font-body text-xs text-red-500 hover:text-red-700 transition-colors underline underline-offset-2">
          Clear all
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Cart Items ── */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item, idx) => (
            <div key={item.id} className="bg-white border border-stone-100 p-4 sm:p-5 flex gap-4 animate-slide-up"
              style={{ animationDelay: `${idx * 50}ms` }}>

              {/* Image */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-stone-100 flex-shrink-0 overflow-hidden">
                <img
                  src={item.image || `https://picsum.photos/seed/${item.id}/100/100`}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-2">
                  <div className="min-w-0">
                    {item.category && (
                      <p className="font-body text-[11px] text-stone-400 uppercase tracking-wider mb-0.5">{item.category}</p>
                    )}
                    <Link to={`/products/${item.id}`} className="font-body text-sm font-medium text-stone-900 hover:text-stone-600 transition-colors line-clamp-2">
                      {item.name}
                    </Link>
                  </div>
                  <button onClick={() => removeItem(item.id)}
                    className="text-stone-300 hover:text-red-500 transition-colors flex-shrink-0 p-1">
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-3">
                  {/* Quantity */}
                  <div className="flex items-center border border-stone-200">
                    <button onClick={() => updateQty(item.id, item.quantity - 1)}
                      className="p-1.5 text-stone-400 hover:text-stone-900 hover:bg-stone-50 transition-colors">
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center font-body text-sm text-stone-900">{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, item.quantity + 1)}
                      className="p-1.5 text-stone-400 hover:text-stone-900 hover:bg-stone-50 transition-colors">
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* Line total */}
                  <div className="text-right">
                    <p className="font-display text-sm font-semibold text-stone-900">
                      Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                    </p>
                    <p className="font-body text-xs text-stone-400">
                      Rp {Number(item.price).toLocaleString('id-ID')} each
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Order Summary ── */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-stone-100 p-6 sticky top-24">
            <h2 className="font-display text-xl font-semibold text-stone-900 mb-6">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between font-body">
                <span className="text-stone-500">Subtotal ({itemCount} items)</span>
                <span className="text-stone-900 font-medium">Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between font-body">
                <span className="text-stone-500">Shipping</span>
                <span className={`font-medium ${shipping === 0 ? 'text-green-600' : 'text-stone-900'}`}>
                  {shipping === 0 ? 'Free' : `Rp ${shipping.toLocaleString('id-ID')}`}
                </span>
              </div>
              {shipping > 0 && (
                <p className="font-body text-xs text-amber-600">
                  Add Rp {(500000 - subtotal).toLocaleString('id-ID')} more for free shipping
                </p>
              )}
            </div>

            <div className="border-t border-stone-100 mt-4 pt-4 flex justify-between">
              <span className="font-body font-semibold text-stone-900">Total</span>
              <span className="font-display text-xl font-semibold text-stone-900">
                Rp {grandTotal.toLocaleString('id-ID')}
              </span>
            </div>

            {/* Coupon */}
            <div className="mt-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input type="text" placeholder="Promo code" className="input-field pl-9 text-sm py-2.5" />
                </div>
                <button className="btn-outline text-sm px-4 py-2.5">Apply</button>
              </div>
            </div>

            <Link
              to="/checkout"
              className="w-full mt-5 btn-primary flex items-center justify-center gap-2 py-4 text-center"
            >
              Proceed to Checkout <ArrowRight size={15} />
            </Link>

            <Link
              to="/products"
              className="block text-center font-body text-sm text-stone-500 hover:text-stone-900 mt-3 transition-colors"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
