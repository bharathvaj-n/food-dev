import React, { useContext, useState, useEffect } from 'react'
import './placeorder.css'
import { StoreContext } from '../../context/storeContext'
import { useNavigate } from 'react-router-dom'
import { SESSION_PREFIX } from '../checkout/CheckoutSession'

const DELIVERY_FEE = 2
const STORAGE_KEY  = 'tomato_delivery_form'

// Generate a Stripe-style session ID: cs_test_<22 random alphanumeric chars>
const generateSessionId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const rand  = Array.from({ length: 22 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `cs_test_${rand}`
}

const EMPTY_FORM = {
  firstName: '', lastName: '', email: '',
  street: '', city: '', state: '',
  zip: '', country: '', phone: '',
}

// Read saved form from localStorage, fall back to empty
const getSavedForm = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? { ...EMPTY_FORM, ...JSON.parse(saved) } : EMPTY_FORM
  } catch {
    return EMPTY_FORM
  }
}

const PlaceOrder = () => {
  const { food_list, cartItems, getTotalCartAmount, token } = useContext(StoreContext)
  const navigate = useNavigate()

  const [form, setForm] = useState(getSavedForm)
  const [errors, setErrors] = useState({})

  // Persist form to localStorage on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
  }, [form])

  const cartList = food_list.filter(item => cartItems[item._id] > 0)
  const subtotal  = getTotalCartAmount()
  const total     = subtotal > 0 ? subtotal + DELIVERY_FEE : 0

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  // Validation rules in order — stops at first failure
  const validationRules = [
    { field: 'firstName', label: 'First name',    test: v => v.trim() !== '',                          msg: 'This field is required' },
    { field: 'lastName',  label: 'Last name',     test: v => v.trim() !== '',                          msg: 'This field is required' },
    { field: 'email',     label: 'Email',         test: v => v.trim() !== '',                          msg: 'This field is required' },
    { field: 'email',     label: 'Email',         test: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),    msg: 'Enter a valid email address' },
    { field: 'phone',     label: 'Phone',         test: v => v.trim() !== '',                          msg: 'This field is required' },
    { field: 'phone',     label: 'Phone',         test: v => /^\+?[\d\s\-]{7,15}$/.test(v),           msg: 'Enter a valid phone number' },
    { field: 'street',    label: 'Street',        test: v => v.trim() !== '',                          msg: 'This field is required' },
    { field: 'city',      label: 'City',          test: v => v.trim() !== '',                          msg: 'This field is required' },
    { field: 'state',     label: 'State',         test: v => v.trim() !== '',                          msg: 'This field is required' },
    { field: 'zip',       label: 'ZIP code',      test: v => v.trim() !== '',                          msg: 'This field is required' },
    { field: 'country',   label: 'Country',       test: v => v.trim() !== '',                          msg: 'This field is required' },
  ]

  // Returns the first failing rule, or null if all pass
  const getFirstError = () => {
    for (const rule of validationRules) {
      if (!rule.test(form[rule.field])) {
        return { field: rule.field, msg: rule.msg }
      }
    }
    return null
  }

  // Normalize image to a plain string filename for DB storage
  const normalizeImage = (image) => {
    if (!image) return ''
    if (typeof image !== 'string') return '' // Vite module object — no filename available
    if (image.startsWith('/') || image.startsWith('http')) return image
    return image // plain filename like food_1.png
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!token) { alert('Please sign in to place an order'); return }
    if (cartList.length === 0) { alert('Your cart is empty'); return }

    // Clear all previous errors first
    setErrors({})

    const firstError = getFirstError()
    if (firstError) {
      // Show only the first failing field's error
      setErrors({ [firstError.field]: firstError.msg })
      // Auto-focus the invalid input
      const el = document.querySelector(`input[name="${firstError.field}"]`)
      if (el) { el.focus(); el.scrollIntoView({ behavior: 'smooth', block: 'center' }) }
      return
    }

    // Clear saved delivery form
    localStorage.removeItem(STORAGE_KEY)

    // Generate Stripe-style session ID and save order data
    const sessionId  = generateSessionId()
    const sessionData = {
      address: form,
      items: cartList.map(item => ({
        name:     item.name,
        price:    Number(item.price),
        quantity: cartItems[item._id],
        image:    normalizeImage(item.image),
      })),
      amount: total,
    }
    sessionStorage.setItem(SESSION_PREFIX + sessionId, JSON.stringify(sessionData))

    // Navigate to Stripe-style checkout URL
    navigate(`/c/pay/${sessionId}`)
  }

  const resolveImage = (image) => {
    if (!image || typeof image !== 'string') return ''
    if (image.startsWith('/') || image.startsWith('http')) return image
    return `/images/${image}`
  }

  return (
    <div className='order'>
      <form className='order-form' onSubmit={handleSubmit} noValidate>

        {/* ── LEFT: Delivery Info ── */}
        <div className='order-left'>
          <h2 className='order-title'>Delivery Information</h2>

          <div className='order-row'>
            <div className='order-field'>
              <input name='firstName' placeholder='First name' value={form.firstName} onChange={handleChange} className={errors.firstName ? 'input-error' : ''} />
              {errors.firstName && <span className='field-error'>{errors.firstName}</span>}
            </div>
            <div className='order-field'>
              <input name='lastName' placeholder='Last name' value={form.lastName} onChange={handleChange} className={errors.lastName ? 'input-error' : ''} />
              {errors.lastName && <span className='field-error'>{errors.lastName}</span>}
            </div>
          </div>

          <div className='order-field'>
            <input name='email' type='email' placeholder='Email address' value={form.email} onChange={handleChange} className={errors.email ? 'input-error' : ''} />
            {errors.email && <span className='field-error'>{errors.email}</span>}
          </div>

          <div className='order-field'>
            <input name='phone' type='tel' placeholder='Phone number' value={form.phone} onChange={handleChange} className={errors.phone ? 'input-error' : ''} />
            {errors.phone && <span className='field-error'>{errors.phone}</span>}
          </div>

          <div className='order-field'>
            <input name='street' placeholder='Street address' value={form.street} onChange={handleChange} className={errors.street ? 'input-error' : ''} />
            {errors.street && <span className='field-error'>{errors.street}</span>}
          </div>

          <div className='order-row'>
            <div className='order-field'>
              <input name='city' placeholder='City' value={form.city} onChange={handleChange} className={errors.city ? 'input-error' : ''} />
              {errors.city && <span className='field-error'>{errors.city}</span>}
            </div>
            <div className='order-field'>
              <input name='state' placeholder='State' value={form.state} onChange={handleChange} className={errors.state ? 'input-error' : ''} />
              {errors.state && <span className='field-error'>{errors.state}</span>}
            </div>
          </div>

          <div className='order-row'>
            <div className='order-field'>
              <input name='zip' placeholder='ZIP code' value={form.zip} onChange={handleChange} className={errors.zip ? 'input-error' : ''} />
              {errors.zip && <span className='field-error'>{errors.zip}</span>}
            </div>
            <div className='order-field'>
              <input name='country' placeholder='Country' value={form.country} onChange={handleChange} className={errors.country ? 'input-error' : ''} />
              {errors.country && <span className='field-error'>{errors.country}</span>}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Order Summary ── */}
        <div className='order-right'>
          <div className='order-summary-box'>

            {/* Cart items */}
            <h2 className='order-summary-title'>Order Summary</h2>
            <div className='order-items-list'>
              {cartList.length === 0 ? (
                <p className='order-empty'>Your cart is empty</p>
              ) : cartList.map(item => (
                <div key={item._id} className='order-item-row'>
                  <img src={resolveImage(item.image)} alt={item.name} className='order-item-img' />
                  <div className='order-item-details'>
                    <p className='order-item-name'>{item.name}</p>
                    <p className='order-item-qty'>Qty: {cartItems[item._id]}</p>
                  </div>
                  <p className='order-item-price'>${(item.price * cartItems[item._id]).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <hr className='order-divider' />

            {/* Totals */}
            <div className='order-total-row'><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className='order-total-row'><span>Delivery Fee</span><span>${subtotal > 0 ? DELIVERY_FEE.toFixed(2) : '0.00'}</span></div>
            <hr className='order-divider' />
            <div className='order-total-row order-total-final'><b>Total</b><b>${total.toFixed(2)}</b></div>

            {/* ── Stripe checkout strip ── */}
            <div className='stripe-strip'>
              <div className='stripe-strip-top'>
                <span className='stripe-lock'>🔒</span>
                <span className='stripe-strip-label'>Secure checkout powered by</span>
                <span className='stripe-strip-brand'>Stripe</span>
              </div>
              <div className='stripe-card-icons'>
                <span className='card-icon' title='Visa'>VISA</span>
                <span className='card-icon mc' title='Mastercard'>MC</span>
                <span className='card-icon amex' title='American Express'>AMEX</span>
                <span className='card-icon' title='Discover'>DISC</span>
              </div>
            </div>

            <button type='submit' className='order-pay-btn' disabled={cartList.length === 0}>
              🔒 PROCEED TO PAYMENT →
            </button>
          </div>
        </div>

      </form>
    </div>
  )
}

export default PlaceOrder
