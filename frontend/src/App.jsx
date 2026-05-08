import React, { useState } from 'react'
import Navbar from './components/Navbar/Navbar'
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary'
import './App.css'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/home/home'
import Cart from './pages/home/cart/cart'
import PlaceOrder from './pages/placeorder/placeorder'
import Footer from './components/footer/Footer'
import LoginPopup from './components/LoginPopup/LoginPopup'

function App() {
  const [showLogin, setShowLogin] = useState(false)

  return (
    <>
      {showLogin && <LoginPopup setShowLogin={setShowLogin} />}
      <ErrorBoundary>
        <div className='app'>
          <Navbar setShowLogin={setShowLogin} />
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/cart' element={<Cart />} />
            <Route path='/placeorder' element={<PlaceOrder />} />
            <Route path='/order' element={<PlaceOrder />} />
          </Routes>
        </div>
        <Footer />
      </ErrorBoundary>
    </>
  )
}

export default App
