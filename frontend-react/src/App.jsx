import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'

import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import NotFound from './pages/NotFound'

const Layout = ({ children }) => (
  <>
    <Navbar />
    <main className="min-h-screen pt-16">
      {children}
    </main>
    <Footer />
  </>
)

const AuthLayout = ({ children }) => (
  <main>{children}</main>
)

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/products" element={<Layout><Products /></Layout>} />
            <Route path="/products/:id" element={<Layout><ProductDetail /></Layout>} />
            <Route path="/cart" element={<Layout><Cart /></Layout>} />

            <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
            <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />

            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Layout><Checkout /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Layout><Orders /></Layout>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Layout><NotFound /></Layout>} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
