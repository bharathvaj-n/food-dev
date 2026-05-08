import React, { useState } from 'react'
import './Navbar.css'
import { assets } from '../../assets/assets.js'
import { useNavigate, useLocation } from 'react-router-dom'

const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState('home')
  const navigate = useNavigate()
  const location = useLocation()

  const scrollTo = (id, name) => {
    setMenu(name)
    if (location.pathname !== '/') {
      // not on home — navigate there and store scroll target
      sessionStorage.setItem('scrollTo', id)
      navigate('/')
    } else {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="navbar">
      <img
        src={assets.logo}
        alt="Tomato"
        className="logo"
        onClick={() => scrollTo('home', 'home')}
      />

      <ul className="navbar-menu">
        <li
          onClick={() => scrollTo('home', 'home')}
          className={menu === 'home' ? 'active' : ''}
        >
          home
        </li>
        <li
          onClick={() => scrollTo('menu', 'menu')}
          className={menu === 'menu' ? 'active' : ''}
        >
          menu
        </li>
        <li
          onClick={() => scrollTo('app-download', 'mobile-app')}
          className={menu === 'mobile-app' ? 'active' : ''}
        >
          mobile-app
        </li>
        <li
          onClick={() => scrollTo('footer', 'contact-us')}
          className={menu === 'contact-us' ? 'active' : ''}
        >
          contact us
        </li>
      </ul>

      <div className="navbar-right">
        <img src={assets.search_icon} alt="search" className="icon" />
        <div className='navbar-search-icon' onClick={() => navigate('/cart')} style={{ cursor: 'pointer' }}>
          <img src={assets.basket_icon} alt="cart" className="icon" />
          <div className="dot"></div>
        </div>
        <button className='signin-btn' onClick={() => setShowLogin(true)}>sign in</button>
      </div>
    </div>
  )
}

export default Navbar
