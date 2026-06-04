import { NavLink } from 'react-router-dom'
import { assets } from '../../assets/assets'
import './Slidebar.css'

const navItems = [
  { to: '/add',    label: 'Add Items',  icon: assets.add_icon },
  { to: '/list',   label: 'List Items', icon: assets.parcel_icon },
  { to: '/orders', label: 'Orders',     icon: assets.order_icon },
]

function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Dark overlay — mobile only */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}

      <aside className={`sidebar${isOpen ? ' sidebar-open' : ''}`}>
        {/* Mobile close button */}
        <button className="sidebar-close" onClick={onClose} aria-label="Close menu">✕</button>

        <p className="sidebar-heading">Menu</p>
        <nav className="sidebar-nav">
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                'sidebar-item' + (isActive ? ' active' : '')
              }
            >
              <img src={icon} alt="" className="sidebar-icon" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}

export default Sidebar
