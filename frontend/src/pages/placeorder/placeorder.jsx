import React, { useContext, useState } from 'react'
import './placeorder.css'
import { StoreContext } from '../../context/storeContext'
import { useNavigate } from 'react-router-dom'

const PlaceOrder = () => {
  const { getTotalCartAmount } = useContext(StoreContext)
  const navigate = useNavigate()

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    street: '', city: '', state: '',
    zip: '', country: '', phone: '',
  })

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const subtotal = getTotalCartAmount()
  const deliveryFee = subtotal > 0 ? 2 : 0
  const total = subtotal + deliveryFee

  return (
    <div className='order'>
      <form className='order-form' onSubmit={(e) => e.preventDefault()}>

        {/* ── LEFT: Delivery Information ── */}
        <div className='order-left'>
          <h2 className='order-title'>Delivery Information</h2>

          <div className='order-row'>
            <input name='firstName' placeholder='First name'
              value={form.firstName} onChange={handleChange} />
            <input name='lastName' placeholder='Last name'
              value={form.lastName} onChange={handleChange} />
          </div>

          <input name='email' type='email' placeholder='Email address'
            value={form.email} onChange={handleChange} />

          <input name='street' placeholder='Street'
            value={form.street} onChange={handleChange} />

          <div className='order-row'>
            <input name='city' placeholder='City'
              value={form.city} onChange={handleChange} />
            <input name='state' placeholder='State'
              value={form.state} onChange={handleChange} />
          </div>

          <div className='order-row'>
            <input name='zip' placeholder='Zip code'
              value={form.zip} onChange={handleChange} />
            <input name='country' placeholder='Country'
              value={form.country} onChange={handleChange} />
          </div>

          <input name='phone' type='tel' placeholder='Phone'
            value={form.phone} onChange={handleChange} />
        </div>

        {/* ── RIGHT: Cart Totals ── */}
        <div className='order-right'>
          <div className='order-cart-total'>
            <h2>Cart Totals</h2>

            <div className='order-total-row'>
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <hr />
            <div className='order-total-row'>
              <span>Delivery Fee</span>
              <span>${deliveryFee.toFixed(2)}</span>
            </div>
            <hr />
            <div className='order-total-row order-total-final'>
              <b>Total</b>
              <b>${total.toFixed(2)}</b>
            </div>

            <button type='submit' className='order-pay-btn'>
              PROCEED TO PAYMENT
            </button>
          </div>
        </div>

      </form>
    </div>
  )
}

export default PlaceOrder
