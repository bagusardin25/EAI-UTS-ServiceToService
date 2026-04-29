import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './Context/AuthContext'
import { CartProvider } from './Context/CartContext'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'

import Home from './Pages/Home'
import Products from './Pages/Products'
import ProductDetail from './Pages/ProductDetail'
import Login from './Pages/Login'
import Register from './Pages/Register'
import Cart from './Pages/Cart'
import Checkout from './Pages/Checkout'
import Orders from './Pages/Orders'
import NotFound from './Pages/NotFound'

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
