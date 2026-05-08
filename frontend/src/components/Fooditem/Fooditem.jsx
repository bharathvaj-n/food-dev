import React, { useContext } from 'react'
import './fooditem.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../context/storeContext'

const Fooditem = ({ id, name, price, description, image }) => {
  const { cartItems, addToCart, removeFromCart } = useContext(StoreContext)

  return (
    <div className='food-item'>
        <div className="food-item-img-container">
            <img className='food-item-image' src={image} alt={name} />

            {!cartItems[id] ? (
              <button className='add-btn' onClick={() => addToCart(id)} aria-label="Add item">
                <img src={assets.add_icon_white} alt="Add" />
              </button>
            ) : (
              <div className='counter'>
                <div className='minus' onClick={() => removeFromCart(id)} aria-label="Decrease">−</div>
                <span className='item-count'>{cartItems[id]}</span>
                <div className='plus' onClick={() => addToCart(id)} aria-label="Increase">+</div>
              </div>
            )}
        </div>
        <div className="food-item-info">
            <div className="food-item-name-rating">
                <p>{name}</p>
                <img src={assets.rating_starts} alt="Rating" />
            </div>
            <p className="food-item-desc">{description}</p>
            <p className="food-item-price">${price}</p>
        </div>
    </div>
  )
}

export default Fooditem
