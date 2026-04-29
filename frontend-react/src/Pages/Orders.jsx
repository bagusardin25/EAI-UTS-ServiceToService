
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, ChevronRight, Clock, CheckCircle, XCircle, Truck } from 'lucide-react'
import { orderService } from '../services/api'
import Loader from '../components/Loader'

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    icon: Clock,        color: 'text-amber-600',  bg: 'bg-amber-50  border-amber-200'  },
  processing: { label: 'Processing', icon: Package,      color: 'text-blue-600',   bg: 'bg-blue-50   border-blue-200'   },
  shipped:    { label: 'Shipped',    icon: Truck,        color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' },
  delivered:  { label: 'Delivered',  icon: CheckCircle,  color: 'text-green-600',  bg: 'bg-green-50  border-green-200'  },
  cancelled:  { label: 'Cancelled',  icon: XCircle,      color: 'text-red-600',    bg: 'bg-red-50    border-red-200'    },
}

const MOCK_ORDERS = [
  { id: 'ORD-2025-001', created_at: '2025-03-15T10:30:00', status: 'delivered', total: 3798000, items_count: 2,
    items: [{ name: 'Wireless Headphones', quantity: 1, price: 2499000 }, { name: 'Yoga Mat Pro', quantity: 1, price: 399000 }] },
  { id: 'ORD-2025-002', created_at: '2025-03-22T14:15:00', status: 'shipped', total: 1299000, items_count: 1,
    items: [{ name: 'Premium Leather Sneakers', quantity: 1, price: 1299000 }] },
  { id: 'ORD-2025-003', created_at: '2025-04-01T09:00:00', status: 'processing', total: 2449000, items_count: 3,
    items: [{ name: 'USB-C Hub', quantity: 1, price: 599000 }, { name: 'Desk Lamp', quantity: 2, price: 349000 }] },
]

const Orders = () => {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [selected,setSelected]= useState(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await orderService.getAll()
        setOrders(res.data?.data || res.data || [])
      } catch {
        setOrders(MOCK_ORDERS)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  if (loading) return <Loader text="Loading orders…" />

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="mb-8">
        <h1 className="section-title">Order History</h1>
        <p className="font-body text-sm text-stone-400 mt-1">{orders.length} orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package size={32} className="text-stone-400" />
          </div>
          <h2 className="font-display text-xl font-semibold text-stone-900 mb-3">No orders yet</h2>
          <p className="font-body text-sm text-stone-500 mb-6">Start shopping to see your orders here.</p>
          <Link to="/products" className="btn-primary">Shop Now</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, idx) => {
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
            const StatusIcon = cfg.icon
            const isOpen = selected === order.id

            return (
              <div key={order.id} className="bg-white border border-stone-100 overflow-hidden animate-slide-up"
                style={{ animationDelay: `${idx * 50}ms` }}>

                {/* Header */}
                <button
                  onClick={() => setSelected(isOpen ? null : order.id)}
                  className="w-full flex items-center justify-between p-5 hover:bg-stone-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-stone-100 flex items-center justify-center flex-shrink-0">
                      <Package size={18} className="text-stone-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono text-sm font-medium text-stone-900">{order.id}</span>
                        <span className={`badge border text-xs px-2.5 py-1 ${cfg.bg} ${cfg.color}`}>
                          <StatusIcon size={11} className="inline mr-1" />
                          {cfg.label}
                        </span>
                      </div>
                      <p className="font-body text-xs text-stone-400 mt-0.5">
                        {new Date(order.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'long', year: 'numeric',
                        })}
                        {order.items_count && ` · ${order.items_count} item${order.items_count > 1 ? 's' : ''}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <p className="font-display text-base font-semibold text-stone-900 hidden sm:block">
                      Rp {Number(order.total).toLocaleString('id-ID')}
                    </p>
                    <ChevronRight size={16} className={`text-stone-400 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
                  </div>
                </button>

                {/* Expanded */}
                {isOpen && (
                  <div className="border-t border-stone-100 px-5 py-4 bg-stone-50 animate-fade-in">
                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex items-center gap-0">
                        {Object.entries(STATUS_CONFIG).filter(([k]) => k !== 'cancelled').map(([key, c], i, arr) => {
                          const statuses = ['pending','processing','shipped','delivered']
                          const currentIdx = statuses.indexOf(order.status)
                          const thisIdx = statuses.indexOf(key)
                          const done = thisIdx <= currentIdx
                          return (
                            <div key={key} className="flex items-center flex-1 last:flex-none">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono transition-all ${done ? 'bg-stone-800 text-white' : 'bg-stone-200 text-stone-400'}`}>
                                {done ? '✓' : i + 1}
                              </div>
                              <p className={`hidden sm:block text-[10px] font-body ml-1 ${done ? 'text-stone-700' : 'text-stone-400'}`}>{c.label}</p>
                              {i < arr.length - 1 && <div className={`flex-1 h-px mx-2 ${done ? 'bg-stone-800' : 'bg-stone-200'}`} />}
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Items */}
                    {order.items?.length > 0 && (
                      <div className="space-y-2 mt-4">
                        <p className="font-body text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Items</p>
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between items-center font-body text-sm">
                            <span className="text-stone-700">{item.name} × {item.quantity}</span>
                            <span className="text-stone-900 font-medium">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                          </div>
                        ))}
                        <div className="flex justify-between items-center font-body text-sm pt-2 border-t border-stone-200">
                          <span className="font-semibold text-stone-900">Total</span>
                          <span className="font-display font-semibold text-stone-900">Rp {Number(order.total).toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Orders
