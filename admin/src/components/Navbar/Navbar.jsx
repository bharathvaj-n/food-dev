import { assets } from '../../assets/assets'
import './Navbar.css'

function Navbar({ onMenuToggle }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        {/* Hamburger — mobile only */}
        <button className="navbar-hamburger" onClick={onMenuToggle} aria-label="Toggle menu">
          <span /><span /><span />
        </button>

        <img src={assets.logo} alt="Tomato" className="navbar-logo" />
        <div className="navbar-titles">
          <span className="navbar-name">Tomato</span>
          <span className="navbar-sub">Admin Panel</span>
        </div>
      </div>
      <img src={assets.profile_image} alt="Admin" className="navbar-avatar" />
    </nav>
  )
}

export default Navbar
