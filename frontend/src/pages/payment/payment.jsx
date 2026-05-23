import React, { useContext, useState, useEffect } from 'react'
import './payment.css'
import { useLocation, useNavigate } from 'react-router-dom'
import { StoreContext } from '../../context/storeContext'
import axios from 'axios'

const COUNTRIES = [
  'United States', 'United Kingdom', 'India', 'Canada', 'Australia',
  'Germany', 'France', 'Singapore', 'UAE', 'Other',
]

// Format card number with spaces every 4 digits
const fmtCard = (v) =>
  v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()

// Format expiry as MM / YY
const fmtExpiry = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 4)
  return d.length > 2 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d
}

const Payment = () => {
  const location = useLocation()
  const navigate  = useNavigate()
  const { token, setCartItems } = useContext(StoreContext)

  const orderData = location.state   // { address, items, amount }

  const [card, setCard] = useState({
    email: '', number: '', expiry: '', cvc: '', name: '', country: 'United States',
  })
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)
  const [toast,   setToast]   = useState(null)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => { if (!orderData) navigate('/order') }, [orderData, navigate])
  if (!orderData) return null

  const { address, items, amount } = orderData
  const subtotal    = amount - 2
  const deliveryFee = 2

  // ── Helpers ──────────────────────────────────────────────────────────────
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  const resolveImage = (image) => {
    if (!image || typeof image !== 'string') return ''
    if (image.startsWith('/') || image.startsWith('http')) return image
    return `/images/${image}`
  }

  // ── Card field change handlers ────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target
    let formatted = value
    if (name === 'number') formatted = fmtCard(value)
    if (name === 'expiry') formatted = fmtExpiry(value)
    if (name === 'cvc')    formatted = value.replace(/\D/g, '').slice(0, 4)
    setCard(prev => ({ ...prev, [name]: formatted }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const rules = [
      { field: 'email',   test: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), msg: 'Enter a valid email' },
      { field: 'number',  test: v => v.replace(/\s/g, '').length === 16,    msg: 'Enter a valid 16-digit card number' },
      { field: 'expiry',  test: v => /^\d{2} \/ \d{2}$/.test(v),           msg: 'Enter expiry as MM / YY' },
      { field: 'cvc',     test: v => v.length >= 3,                         msg: 'Enter a valid CVC' },
      { field: 'name',    test: v => v.trim().length > 1,                   msg: 'Enter the cardholder name' },
      { field: 'country', test: v => v.trim() !== '',                       msg: 'Select a country' },
    ]
    for (const rule of rules) {
      if (!rule.test(card[rule.field])) {
        setErrors({ [rule.field]: rule.msg })
        document.querySelector(`[name="${rule.field}"]`)?.focus()
        return false
      }
    }
    return true
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const handlePay = async (e) => {
    e.preventDefault()
    if (!token) { showToast('Please sign in to place an order', 'error'); return }
    if (!validate()) return

    setLoading(true)
    try {
      const { data } = await axios.post(
        '/api/order/place',
        { items, amount, address, paymentMethod: 'Stripe' },
        { headers: { token } }
      )
      if (data.success) {
        if (data.session_url) {
          window.location.href = data.session_url
        } else {
          setCartItems({})
          showToast('🎉 Order placed successfully!')
          setTimeout(() => navigate('/myorders'), 1800)
        }
      } else {
        showToast(data.message || 'Failed to place order', 'error')
      }
    } catch {
      showToast('Server error. Is the backend running?', 'error')
    } finally {
      setLoading(false)
    }
  }

  // ── Detect card brand icons ─────────────────────────────────────────────
  const cardBrand = () => {
    const n = card.number.replace(/\s/g, '')
    if (n.startsWith('4'))  return <><span title='Visa'>💳</span></>
    if (/^5[1-5]/.test(n)) return <><span title='Mastercard'>💳</span></>
    if (/^3[47]/.test(n))  return <><span title='Amex'>💳</span></>
    return <><span>💳</span><span>💳</span><span>💳</span></>
  }

  return (
    <div className='stripe-page'>

      {/* Toast */}
      {toast && (
        <div className={`stripe-toast stripe-toast-${toast.type}`}>
          <span>{toast.msg}</span>
          <button onClick={() => setToast(null)}>✕</button>
        </div>
      )}

      <div className='stripe-layout'>

        {/* ══════════════════════════════════════════
            LEFT — Order Summary
        ══════════════════════════════════════════ */}
        <div className='stripe-left'>

          {/* Back + test badge */}
          <div className='stripe-top-row'>
            <button className='stripe-back' onClick={() => navigate('/order')}>
              ← Back
            </button>
            <span className='stripe-test-badge'>TEST MODE</span>
          </div>

          {/* Merchant + amount */}
          <div className='stripe-merchant'>
            <div className='stripe-merchant-logo'>🍅</div>
            <div>
              <p className='stripe-merchant-name'>Tomato Food Delivery</p>
              <p className='stripe-amount'>${amount.toFixed(2)}</p>
            </div>
          </div>
          <p className='stripe-pay-heading'>Food delivery order</p>

          {/* Item list */}
          <div className='stripe-items'>
            {items.slice(0, showAll ? items.length : 2).map((item, i) => (
              <div key={i} className='stripe-item-row'>
                <div className='stripe-item-img-wrap'>
                  <img src={resolveImage(item.image)} alt={item.name} />
                  <span className='stripe-item-badge'>{item.quantity}</span>
                </div>
                <span className='stripe-item-name'>{item.name}</span>
                <span className='stripe-item-price'>
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          {items.length > 2 && (
            <button className='stripe-show-all' onClick={() => setShowAll(v => !v)}>
              {showAll ? '▲ Show less' : `▼ Show all ${items.length} items`}
            </button>
          )}

          {/* Totals */}
          <div className='stripe-totals'>
            <div className='stripe-total-row'>
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className='stripe-total-row'>
              <span>Delivery</span>
              <span>${deliveryFee.toFixed(2)}</span>
            </div>
            <div className='stripe-total-row stripe-total-final'>
              <span>Total due</span>
              <span>${amount.toFixed(2)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className='stripe-footer'>
            <span>Powered by <b>Stripe</b></span>
            <span className='stripe-footer-sep'>·</span>
            <a href='#'>Terms</a>
            <span className='stripe-footer-sep'>·</span>
            <a href='#'>Privacy</a>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            RIGHT — Payment Form
        ══════════════════════════════════════════ */}
        <div className='stripe-right'>
          <form className='stripe-form' onSubmit={handlePay} noValidate>

            <h2 className='stripe-form-title'>Pay with card</h2>

            {/* Email */}
            <div className='stripe-field'>
              <label>Email</label>
              <input
                name='email'
                type='email'
                placeholder='you@example.com'
                autoComplete='email'
                value={card.email}
                onChange={handleChange}
                className={errors.email ? 'err' : ''}
              />
              {errors.email && <span className='stripe-err'>{errors.email}</span>}
            </div>

            {/* Card information */}
            <div className='stripe-field'>
              <label>Card information</label>
              <div className='stripe-card-group'>
                {/* Card number */}
                <div className='stripe-card-number-wrap'>
                  <input
                    name='number'
                    type='text'
                    inputMode='numeric'
                    placeholder='1234 5678 9012 3456'
                    autoComplete='cc-number'
                    value={card.number}
                    onChange={handleChange}
                    className={`stripe-card-number ${errors.number ? 'err' : ''}`}
                  />
                  <span className='stripe-card-brand'>{cardBrand()}</span>
                </div>
                {/* Expiry + CVC */}
                <div className='stripe-card-row'>
                  <input
                    name='expiry'
                    type='text'
                    inputMode='numeric'
                    placeholder='MM / YY'
                    autoComplete='cc-exp'
                    value={card.expiry}
                    onChange={handleChange}
                    className={errors.expiry ? 'err' : ''}
                  />
                  <input
                    name='cvc'
                    type='text'
                    inputMode='numeric'
                    placeholder='CVC'
                    autoComplete='cc-csc'
                    value={card.cvc}
                    onChange={handleChange}
                    className={errors.cvc ? 'err' : ''}
                  />
                </div>
              </div>
              {(errors.number || errors.expiry || errors.cvc) && (
                <span className='stripe-err'>
                  {errors.number || errors.expiry || errors.cvc}
                </span>
              )}
            </div>

            {/* Cardholder name */}
            <div className='stripe-field'>
              <label>Cardholder name</label>
              <input
                name='name'
                type='text'
                placeholder='Full name on card'
                autoComplete='cc-name'
                value={card.name}
                onChange={handleChange}
                className={errors.name ? 'err' : ''}
              />
              {errors.name && <span className='stripe-err'>{errors.name}</span>}
            </div>

            {/* Country */}
            <div className='stripe-field'>
              <label>Country or region</label>
              <select
                name='country'
                value={card.country}
                onChange={handleChange}
                className={errors.country ? 'err' : ''}
              >
                {COUNTRIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.country && <span className='stripe-err'>{errors.country}</span>}
            </div>

            {/* Pay button */}
            <button type='submit' className='stripe-pay-btn' disabled={loading}>
              {loading ? (
                <span className='stripe-spinner-wrap'>
                  <span className='stripe-spinner' />
                  Processing...
                </span>
              ) : (
                `Pay $${amount.toFixed(2)}`
              )}
            </button>

            <p className='stripe-secure-note'>
              🔒 Payments are encrypted and secure
            </p>

          </form>
        </div>

      </div>
    </div>
  )
}

export default Payment
