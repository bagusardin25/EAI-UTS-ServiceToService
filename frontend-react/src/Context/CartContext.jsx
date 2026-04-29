import { createContext, useContext, useReducer, useEffect } from 'react'

const CartContext = createContext(null)

const STORAGE_KEY = 'luxe_cart'

// ── Reducer ─────────────────────────────────────────────────
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const exists = state.items.find(i => i.id === action.payload.id)
      if (exists) {
        return {
          ...state,
          items: state.items.map(i =>
            i.id === action.payload.id
              ? { ...i, quantity: i.quantity + (action.payload.quantity || 1) }
              : i
          ),
        }
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: action.payload.quantity || 1 }],
      }
    }

    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.id !== action.payload) }

    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return { ...state, items: state.items.filter(i => i.id !== action.payload.id) }
      }
      return {
        ...state,
        items: state.items.map(i =>
          i.id === action.payload.id ? { ...i, quantity: action.payload.quantity } : i
        ),
      }
    }

    case 'CLEAR_CART':
      return { ...state, items: [] }

    case 'LOAD_CART':
      return { ...state, items: action.payload }

    default:
      return state
  }
}

// ── Provider ─────────────────────────────────────────────────
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] })

  // Rehydrate from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try { dispatch({ type: 'LOAD_CART', payload: JSON.parse(stored) }) }
      catch (_) {}
    }
  }, [])

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items))
  }, [state.items])

  const addItem     = (product, quantity = 1) => dispatch({ type: 'ADD_ITEM', payload: { ...product, quantity } })
  const removeItem  = (id)                    => dispatch({ type: 'REMOVE_ITEM', payload: id })
  const updateQty   = (id, quantity)          => dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
  const clearCart   = ()                      => dispatch({ type: 'CLEAR_CART' })

  const itemCount   = state.items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice  = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const isInCart    = (id) => state.items.some(i => i.id === id)

  return (
    <CartContext.Provider value={{
      items: state.items,
      itemCount,
      totalPrice,
      isInCart,
      addItem,
      removeItem,
      updateQty,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
