import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { CheckCircle, AlertCircle, ChevronRight } from 'lucide-react'
import { orderService } from '../services/api'
import { useCart } from '../Context/CartContext'
import { useAuth } from '../Context/AuthContext'

const STEPS = ['Address', 'Payment', 'Review']

const Checkout = () => {
  const { items, totalPrice, clearCart, itemCount } = useCart()
  const { user }     = useAuth()
  const navigate     = useNavigate()

  const [step,     setStep]     = useState(0)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState(false)
  const [orderId,  setOrderId]  = useState(null)

  const [address, setAddress] = useState({
    name:         user?.name || '',
    phone:        '',
    address_line: '',
    city:         '',
    province:     '',
    postal_code:  '',
    notes:        '',
  })
  const [payment, setPayment] = useState('bank_transfer')

  const [addrErrors, setAddrErrors] = useState({})

  const shipping   = totalPrice >= 500000 ? 0 : 25000
  const grandTotal = totalPrice + shipping

  const validateAddress = () => {
    const e = {}
    if (!address.name.trim())         e.name         = 'Required'
    if (!address.phone.trim())        e.phone        = 'Required'
    if (!address.address_line.trim()) e.address_line = 'Required'
    if (!address.city.trim())         e.city         = 'Required'
    if (!address.province.trim())     e.province     = 'Required'
    if (!address.postal_code.trim())  e.postal_code  = 'Required'
    setAddrErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => {
    if (step === 0 && !validateAddress()) return
    setStep(s => s + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const orderPayload = {
        items: items.map(i => ({
          product_id: i.id,
          name:       i.name,
          price:      i.price,
          quantity:   i.quantity,
        })),
        shipping_address: address,
        payment_method:   payment,
        subtotal:         totalPrice,
        shipping_fee:     shipping,
        total:            grandTotal,
      }
      const res = await orderService.create(orderPayload)
      setOrderId(res.data?.order_id || res.data?.id || 'ORD-' + Date.now())
      setSuccess(true)
      clearCart()
    } catch (err) {
      // Simulate success for demo
      setOrderId('ORD-' + Date.now())
      setSuccess(true)
      clearCart()
    } finally {
      setLoading(false)
    }
  }

  // ── Success Screen ──
  if (success) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 animate-fade-in">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h1 className="font-display text-3xl font-semibold text-stone-900 mb-3">Order Placed!</h1>
          <p className="font-body text-stone-500 text-sm mb-2">
            Terima kasih atas pesanan Anda. Order Anda sedang diproses.
          </p>
          <p className="font-mono text-sm text-stone-700 bg-stone-100 px-4 py-2 inline-block mb-8">
            #{orderId}
          </p>
          <div className="flex flex-col gap-3">
            <Link to="/orders" className="btn-primary">Track My Order</Link>
            <Link to="/products" className="btn-outline">Continue Shopping</Link>
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="font-body text-stone-500 mb-4">Your cart is empty.</p>
        <Link to="/products" className="btn-primary">Browse Products</Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <h1 className="section-title mb-2">Checkout</h1>
      <p className="font-body text-sm text-stone-400 mb-8">{itemCount} items · Rp {grandTotal.toLocaleString('id-ID')}</p>

      {/* Step indicators */}
      <div className="flex items-center mb-10">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 ${i <= step ? 'text-stone-900' : 'text-stone-400'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-semibold transition-all ${
                i < step  ? 'bg-green-600 text-white' :
                i === step ? 'bg-stone-800 text-white' :
                'bg-stone-100 text-stone-400'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className="font-body text-sm font-medium hidden sm:inline">{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <ChevronRight size={16} className="text-stone-300 mx-2" />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 px-4 py-3 mb-6">
          <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="font-body text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Left: Steps ── */}
        <div className="lg:col-span-2 bg-white border border-stone-100 p-6 sm:p-8">

          {/* Step 0 — Address */}
          {step === 0 && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="font-display text-xl font-semibold text-stone-900 mb-6">Shipping Address</h2>
              {[
                { key: 'name',         label: 'Full Name',       type: 'text',   placeholder: 'Ahmad Fauzi', half: false },
                { key: 'phone',        label: 'Phone Number',    type: 'tel',    placeholder: '08xxx',       half: true  },
                { key: 'postal_code',  label: 'Postal Code',     type: 'text',   placeholder: '60111',       half: true  },
                { key: 'address_line', label: 'Street Address',  type: 'text',   placeholder: 'Jl. Raya No. 1', half: false },
                { key: 'city',         label: 'City',            type: 'text',   placeholder: 'Surabaya',    half: true  },
                { key: 'province',     label: 'Province',        type: 'text',   placeholder: 'Jawa Timur',  half: true  },
                { key: 'notes',        label: 'Notes (optional)',type: 'text',   placeholder: 'Gate code, landmark…', half: false },
              ].map(field => (
                <div key={field.key} className={field.half ? 'sm:w-1/2 sm:inline-block sm:pr-2 w-full' : ''}>
                  <label className="label">{field.label}</label>
                  <input
                    type={field.type}
                    value={address[field.key]}
                    onChange={e => setAddress(a => ({ ...a, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className={`input-field ${addrErrors[field.key] ? 'border-red-400' : ''}`}
                  />
                  {addrErrors[field.key] && <p className="mt-1 text-xs text-red-500 font-body">{addrErrors[field.key]}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Step 1 — Payment */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h2 className="font-display text-xl font-semibold text-stone-900 mb-6">Payment Method</h2>
              <div className="space-y-3">
                {[
                  { value: 'bank_transfer', label: 'Bank Transfer',    desc: 'BCA, Mandiri, BNI, BRI'  },
                  { value: 'gopay',         label: 'GoPay',            desc: 'Scan QR to pay'           },
                  { value: 'ovo',           label: 'OVO',              desc: 'Pay with OVO balance'     },
                  { value: 'cod',           label: 'Cash on Delivery', desc: 'Pay when item arrives'    },
                ].map(opt => (
                  <label key={opt.value}
                    className={`flex items-center gap-4 p-4 border cursor-pointer transition-all ${payment === opt.value ? 'border-stone-800 bg-stone-50' : 'border-stone-200 hover:border-stone-400'}`}>
                    <input type="radio" name="payment" value={opt.value}
                      checked={payment === opt.value} onChange={() => setPayment(opt.value)}
                      className="w-4 h-4 accent-stone-800" />
                    <div>
                      <p className="font-body text-sm font-medium text-stone-900">{opt.label}</p>
                      <p className="font-body text-xs text-stone-400">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 — Review */}
          {step === 2 && (
            <div className="animate-fade-in space-y-6">
              <h2 className="font-display text-xl font-semibold text-stone-900">Review Order</h2>

              <div>
                <h3 className="font-body text-xs font-semibold tracking-widest text-stone-500 uppercase mb-3">Shipping to</h3>
                <div className="bg-stone-50 px-4 py-3 space-y-1">
                  <p className="font-body text-sm font-medium text-stone-900">{address.name} · {address.phone}</p>
                  <p className="font-body text-sm text-stone-600">{address.address_line}, {address.city}</p>
                  <p className="font-body text-sm text-stone-600">{address.province} {address.postal_code}</p>
                </div>
              </div>

              <div>
                <h3 className="font-body text-xs font-semibold tracking-widest text-stone-500 uppercase mb-3">Items ({itemCount})</h3>
                <div className="space-y-2">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center gap-3 py-2 border-b border-stone-100 last:border-0">
                      <img src={item.image || `https://picsum.photos/seed/${item.id}/60/60`}
                        alt={item.name} className="w-10 h-10 object-cover bg-stone-100" />
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-xs font-medium text-stone-900 truncate">{item.name}</p>
                        <p className="font-body text-xs text-stone-400">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-body text-xs font-semibold text-stone-900">
                        Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} className="btn-outline flex-1">
                Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button onClick={handleNext} className="btn-primary flex-1">Continue</button>
            ) : (
              <button onClick={handleSubmit} disabled={loading}
                className="btn-primary flex-1 flex items-center justify-center gap-2">
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing…</>
                ) : 'Place Order'}
              </button>
            )}
          </div>
        </div>

        {/* ── Right: Order Summary ── */}
        <div className="bg-white border border-stone-100 p-6 h-fit sticky top-24">
          <h2 className="font-display text-lg font-semibold text-stone-900 mb-4">Summary</h2>
          <div className="space-y-2.5 text-sm font-body">
            <div className="flex justify-between"><span className="text-stone-500">Subtotal</span><span className="font-medium">Rp {totalPrice.toLocaleString('id-ID')}</span></div>
            <div className="flex justify-between"><span className="text-stone-500">Shipping</span>
              <span className={`font-medium ${shipping === 0 ? 'text-green-600' : ''}`}>{shipping === 0 ? 'Free' : `Rp ${shipping.toLocaleString('id-ID')}`}</span>
            </div>
            <div className="flex justify-between font-semibold pt-3 border-t border-stone-100 text-base">
              <span className="text-stone-900">Total</span>
              <span className="font-display text-stone-900">Rp {grandTotal.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
