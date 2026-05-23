import React, { useContext, useState } from 'react'
import './cart.css'
import { StoreContext } from '../../../context/storeContext'
import { assets } from '../../../assets/assets'
import { useNavigate } from 'react-router-dom'

const Cart = () => {
  const { food_list, cartItems, removeAllFromCart, getTotalCartAmount } = useContext(StoreContext)
  const [promoCode, setPromoCode] = useState('')
  const navigate = useNavigate()

  const subtotal = getTotalCartAmount()
  const deliveryFee = subtotal > 0 ? 2 : 0
  const total = subtotal + deliveryFee
  const cartHasItems = food_list.some((item) => cartItems[item._id] > 0)

  return (
    <div className='cart'>

      <div className='cart-items'>
        <div className='cart-items-title'>
          <b>Items</b>
          <b>Title</b>
          <b>Price</b>
          <b>Quantity</b>
          <b>Total</b>
          <b>Remove</b>
        </div>
        <hr className='cart-divider' />

        {!cartHasItems && (
          <p className='cart-empty'>Your cart is empty. Add some items first!</p>
        )}

        {food_list.map((item) => {
          if (!cartItems[item._id] || cartItems[item._id] === 0) return null
          return (
            <React.Fragment key={item._id}>
              <div className='cart-items-item'>
                <img
                  src={
                    typeof item.image !== 'string' || item.image.startsWith('/') || item.image.startsWith('http')
                      ? item.image
                      : `/images/${item.image}`
                  }
                  alt={item.name}
                />
                <p>{item.name}</p>
                <p>${Number(item.price).toFixed(2)}</p>
                <p>{cartItems[item._id]}</p>
                <p>${(Number(item.price) * cartItems[item._id]).toFixed(2)}</p>
                <img
                  className='cart-items-remove-icon'
                  src={assets.cross_icon}
                  alt='remove'
                  onClick={() => removeAllFromCart(item._id)}
                />
              </div>
              <hr className='cart-divider' />
            </React.Fragment>
          )
        })}
      </div>

      <div className='cart-bottom'>
        <div className='cart-total'>
          <h2>Cart Totals</h2>
          <div className='cart-total-details'>
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <hr />
          <div className='cart-total-details'>
            <span>Delivery Fee</span>
            <span>${deliveryFee.toFixed(2)}</span>
          </div>
          <hr />
          <div className='cart-total-details cart-total-final'>
            <b>Total</b>
            <b>${total.toFixed(2)}</b>
          </div>
          <button
            className='checkout-btn'
            onClick={() => navigate('/order')}
            disabled={!cartHasItems}
          >
            PROCEED TO CHECKOUT
          </button>
        </div>

        <div className='cart-promocode'>
          <p>If you have a promo code, Enter it here</p>
          <div className='cart-promocode-input'>
            <input
              type='text'
              placeholder='Promo code'
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
            />
            <button>Submit</button>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Cart
