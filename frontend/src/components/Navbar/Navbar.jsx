import React, { useState, useContext, useRef, useEffect } from 'react'
import './Navbar.css'
import { assets } from '../../assets/assets.js'
import { useNavigate, useLocation } from 'react-router-dom'
import { StoreContext } from '../../context/storeContext'

const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu]           = useState('home')
  const [dropOpen, setDropOpen]   = useState(false)
  const { token, setToken }       = useContext(StoreContext)
  const navigate                  = useNavigate()
  const location                  = useLocation()
  const dropRef                   = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const scrollTo = (id, name) => {
    setMenu(name)
    if (location.pathname !== '/') {
      sessionStorage.setItem('scrollTo', id)
      navigate('/')
    } else {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken('')
    setDropOpen(false)
    navigate('/')
  }

  return (
    <div className="navbar">
      {/* Logo */}
      <img
        src={assets.logo}
        alt="Tomato"
        className="logo"
        onClick={() => scrollTo('home', 'home')}
      />

      {/* Nav links */}
      <ul className="navbar-menu">
        <li onClick={() => scrollTo('home', 'home')}
            className={menu === 'home' ? 'active' : ''}>home</li>
        <li onClick={() => scrollTo('menu', 'menu')}
            className={menu === 'menu' ? 'active' : ''}>menu</li>
        <li onClick={() => scrollTo('app-download', 'mobile-app')}
            className={menu === 'mobile-app' ? 'active' : ''}>mobile-app</li>
        <li onClick={() => scrollTo('footer', 'contact-us')}
            className={menu === 'contact-us' ? 'active' : ''}>contact us</li>
      </ul>

      {/* Right section */}
      <div className="navbar-right">
        <img src={assets.search_icon} alt="search" className="icon" />

        {/* Cart */}
        <div className="navbar-search-icon" onClick={() => navigate('/cart')}>
          <img src={assets.basket_icon} alt="cart" className="icon" />
          <div className="dot" />
        </div>

        {/* Auth — sign in OR profile dropdown */}
        {!token ? (
          <button className="signin-btn" onClick={() => setShowLogin(true)}>
            sign in
          </button>
        ) : (
          <div className="profile-wrap" ref={dropRef}>
            {/* Profile avatar button */}
            <button
              className="profile-btn"
              onClick={() => setDropOpen((v) => !v)}
              aria-label="Profile menu"
              aria-expanded={dropOpen}
            >
              <img src={assets.profile_icon} alt="profile" className="profile-icon" />
            </button>

            {/* Dropdown */}
            <div className={`profile-dropdown ${dropOpen ? 'open' : ''}`}>
              <ul>
                <li onClick={() => { navigate('/myorders'); setDropOpen(false) }}>
                  <img src={assets.bag_icon} alt="" />
                  <span>Orders</span>
                </li>
                <li className="logout-item" onClick={handleLogout}>
                  <img src={assets.logout_icon} alt="" />
                  <span>Logout</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Navbar
