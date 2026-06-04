import React, { useContext, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { StoreContext } from '../../context/storeContext'
import axios from 'axios'
import '../payment/payment.css'

const SESSION_PREFIX = 'tomato_session_'

const COUNTRIES = [
  'United States', 'United Kingdom', 'India', 'Canada', 'Australia',
  'Germany', 'France', 'Singapore', 'UAE', 'Other',
]

const fmtCard   = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
const fmtExpiry = (v) => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length > 2 ? `${d.slice(0,2)} / ${d.slice(2)}` : d }

const IconVisa = () => (
  <svg viewBox='0 0 38 24' width='34' height='22' xmlns='http://www.w3.org/2000/svg'>
    <rect width='38' height='24' rx='4' fill='#fff' stroke='#d1d9e0'/>
    <text x='5' y='17' fontFamily='Arial' fontWeight='700' fontSize='11' fill='#1a1f71'>VISA</text>
  </svg>
)
const IconMC = () => (
  <svg viewBox='0 0 38 24' width='34' height='22' xmlns='http://www.w3.org/2000/svg'>
    <rect width='38' height='24' rx='4' fill='#fff' stroke='#d1d9e0'/>
    <circle cx='15' cy='12' r='7' fill='#eb001b' opacity='0.9'/>
    <circle cx='23' cy='12' r='7' fill='#f79e1b' opacity='0.9'/>
    <path d='M19 6.8a7 7 0 0 1 0 10.4A7 7 0 0 1 19 6.8z' fill='#ff5f00'/>
  </svg>
)
const IconAmex = () => (
  <svg viewBox='0 0 38 24' width='34' height='22' xmlns='http://www.w3.org/2000/svg'>
    <rect width='38' height='24' rx='4' fill='#007bc1'/>
    <text x='4' y='17' fontFamily='Arial' fontWeight='700' fontSize='9' fill='#fff'>AMEX</text>
  </svg>
)
const IconLock = () => (
  <svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
    <rect x='3' y='11' width='18' height='11' rx='2'/><path d='M7 11V7a5 5 0 0 1 10 0v4'/>
  </svg>
)
const IconChevron = () => (
  <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M15 18l-6-6 6-6'/>
  </svg>
)
const IconShield = () => (
  <svg width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='#fff' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'/>
    <path d='M9 12l2 2 4-4'/>
  </svg>
)

const CheckoutSession = () => {
  const { sessionId }           = useParams()
  const navigate                = useNavigate()
  const { token, setCartItems } = useContext(StoreContext)

  const [orderData,      setOrderData]      = useState(null)
  const [notFound,       setNotFound]       = useState(false)
  const [loading,        setLoading]        = useState(false)
  const [showAll,        setShowAll]        = useState(false)
  const [toast,          setToast]          = useState(null)
  const [card,           setCard]           = useState({ email: '', number: '', expiry: '', cvc: '', name: '', country: 'United States' })
  const [errors,         setErrors]         = useState({})
  const [show3ds,        setShow3ds]        = useState(false)
  const [dsClosing,      setDsClosing]      = useState(false)
  const [dsLoading,      setDsLoading]      = useState(false)
  const [pendingOrderId, setPendingOrderId] = useState(null)


  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_PREFIX + sessionId)
      if (!raw) { setNotFound(true); return }
      setOrderData(JSON.parse(raw))
    } catch {
      setNotFound(true)
    }
  }, [sessionId])

  if (notFound) return (
    <div className='stripe-not-found'>
      <p>Session expired or not found.</p>
      <button onClick={() => navigate('/order')}>Back to checkout</button>
    </div>
  )

  if (!orderData) return (
    <div className='stripe-loading'>
      <span className='stripe-spinner' style={{ borderTopColor: '#5469d4', width: 24, height: 24 }} />
    </div>
  )

  const { address, items, amount } = orderData
  const subtotal     = amount - 2
  const deliveryFee  = 2
  const visibleItems = showAll ? items : items.slice(0, 2)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  const resolveImage = (image) => {
    if (!image || typeof image !== 'string') return ''
    if (image.startsWith('http')) return image
    const base = import.meta.env.VITE_API_URL || 'http://localhost:4000'
    return `${base}/images/${image.replace(/^\/images\//, '')}`
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    let fmt = value
    if (name === 'number') fmt = fmtCard(value)
    if (name === 'expiry') fmt = fmtExpiry(value)
    if (name === 'cvc')    fmt = value.replace(/\D/g, '').slice(0, 4)
    setCard(prev => ({ ...prev, [name]: fmt }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const rules = [
      { field: 'email',  test: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), msg: 'Enter a valid email' },
      { field: 'number', test: v => v.replace(/\s/g, '').length === 16,    msg: 'Enter a valid 16-digit card number' },
      { field: 'expiry', test: v => /^\d{2} \/ \d{2}$/.test(v),           msg: 'Enter expiry as MM / YY' },
      { field: 'cvc',    test: v => v.length >= 3,                         msg: 'Enter a valid CVC' },
      { field: 'name',   test: v => v.trim().length > 1,                   msg: 'Enter the cardholder name' },
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

  // Step 1: validate + call /api/order/place (payment:false) -> store orderId -> open 3DS modal
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
        setPendingOrderId(data.orderId)
        setTimeout(() => { setLoading(false); setShow3ds(true) }, 700)
      } else {
        setLoading(false)
        showToast(data.message || 'Failed to create order', 'error')
      }
    } catch {
      setLoading(false)
      showToast('Server error. Is the backend running?', 'error')
    }
  }

  // Animate modal out then unmount
  const closeModal = (cb) => {
    setDsClosing(true)
    setTimeout(() => { setDsClosing(false); setShow3ds(false); cb?.() }, 280)
  }

  // Step 2a: COMPLETE clicked -> call /api/order/confirm -> sets payment:true + paidAt in DB
  const handle3dsComplete = async () => {
    setDsLoading(true)
    try {
      const { data } = await axios.post(
        '/api/order/confirm',
        { orderId: pendingOrderId },
        { headers: { token } }
      )
      if (data.success) {
        sessionStorage.removeItem(SESSION_PREFIX + sessionId)
        setCartItems({})
        closeModal(() => {
          showToast('Payment successful! Redirecting...')
          setTimeout(() => navigate('/myorders'), 1800)
        })
      } else {
        closeModal(() => showToast(data.message || 'Payment confirmation failed', 'error'))
      }
    } catch {
      closeModal(() => showToast('Server error. Is the backend running?', 'error'))
    } finally {
      setDsLoading(false)
    }
  }

  // Step 2b: FAIL clicked -> cancel order in DB -> close modal -> redirect home
  const handle3dsFail = async () => {
    setDsLoading(true)
    try {
      if (pendingOrderId) {
        await axios.post('/api/order/cancel', { orderId: pendingOrderId }, { headers: { token } })
      }
    } catch {}
    setDsLoading(false)
    setPendingOrderId(null)
    setDsClosing(true)
    setTimeout(() => {
      setDsClosing(false)
      setShow3ds(false)
      showToast('Payment Cancelled', 'error')
      setTimeout(() => navigate('/'), 1500)
    }, 280)
  }

  // CANCEL: close modal silently
  const handle3dsCancel = () => closeModal()

  const brand = (() => {
    const n = card.number.replace(/\s/g, '')
    if (n.startsWith('4'))  return 'visa'
    if (/^5[1-5]/.test(n)) return 'mc'
    if (/^3[47]/.test(n))  return 'amex'
    return 'unknown'
  })()

  return (
    <>
      {toast && (
        <div className={`stripe-toast stripe-toast-${toast.type}`}>
          <span>{toast.msg}</span>
          <button onClick={() => setToast(null)}>✕</button>
        </div>
      )}

      <div className='stripe-page'>

        {show3ds && (
        <div className={`tds-overlay${dsClosing ? ' tds-overlay-out' : ''}`}>
          <div className='tds-modal'>
            <div className='tds-header'>
              <button className='tds-cancel' onClick={handle3dsCancel} disabled={dsLoading}>CANCEL</button>
              <div className='tds-shield'><IconShield /></div>
              <h3 className='tds-title'>3D Secure 2 Test Page</h3>
              <p className='tds-subtitle'>Stripe Test Authentication</p>
            </div>
            <div className='tds-body'>
              <div className='tds-bank-row'>
                <span className='tds-bank-logo'>🏦</span>
                <div>
                  <p className='tds-bank-name'>Test Issuer Bank</p>
                  <p className='tds-bank-sub'>Authentication Required</p>
                </div>
              </div>
              <div className='tds-info-box'>
                <p className='tds-info-label'>Amount</p>
                <p className='tds-info-value'>${amount.toFixed(2)}</p>
              </div>
              <p className='tds-message'>
                This is a test authentication page. In production, your bank would verify your identity here.
                Choose an outcome to simulate the authentication result.
              </p>
              <div className='tds-actions'>
                <button className='tds-btn tds-btn-fail' onClick={handle3dsFail} disabled={dsLoading}>
                  {dsLoading ? <span className='tds-spinner' style={{borderTopColor:'#df1b41',borderColor:'rgba(223,27,65,0.2)'}}/> : 'FAIL'}
                </button>
                <button className='tds-btn tds-btn-complete' onClick={handle3dsComplete} disabled={dsLoading}>
                  {dsLoading
                    ? <span className='stripe-spinner-wrap'><span className='tds-spinner' />Verifying...</span>
                    : 'COMPLETE'}
                </button>
              </div>
              <p className='tds-footer-note'>Secured by 3D Secure 2.0 · Test Mode</p>
            </div>
          </div>
        </div>
        )}

        <div className='stripe-layout'>

        <div className='stripe-left'>
          <div className='stripe-top-row'>
            <button className='stripe-back' onClick={() => navigate('/order')}>
              <IconChevron />Order
            </button>
            <span className='stripe-test-badge'>TEST MODE</span>
          </div>
          <div className='stripe-merchant'>
            <div className='stripe-merchant-logo'>🍅</div>
            <div>
              <p className='stripe-merchant-name'>Tomato Food Delivery</p>
              <p className='stripe-amount'>${amount.toFixed(2)}</p>
            </div>
          </div>
          <p className='stripe-pay-heading'>Food delivery order</p>
          <div className='stripe-items'>
            {visibleItems.map((item, i) => (
              <div key={i} className='stripe-item-row'>
                <div className='stripe-item-img-wrap'>
                  <img src={resolveImage(item.image)} alt={item.name} />
                  <span className='stripe-item-badge'>{item.quantity}</span>
                </div>
                <div className='stripe-item-info'>
                  <span className='stripe-item-name'>{item.name}</span>
                  <span className='stripe-item-each'>${item.price.toFixed(2)} each</span>
                </div>
                <span className='stripe-item-price'>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          {items.length > 2 && (
            <button className='stripe-show-all' onClick={() => setShowAll(v => !v)}>
              {showAll ? 'Show less' : `Show all ${items.length} items`}
            </button>
          )}
          <div className='stripe-totals'>
            <div className='stripe-total-row'><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className='stripe-total-row'><span>Delivery</span><span>${deliveryFee.toFixed(2)}</span></div>
            <div className='stripe-total-row stripe-total-final'><span>Total due</span><span>${amount.toFixed(2)}</span></div>
          </div>
          <div className='stripe-footer'>
            <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' style={{opacity:0.5}}><rect x='3' y='11' width='18' height='11' rx='2'/><path d='M7 11V7a5 5 0 0 1 10 0v4'/></svg>
            <span>Powered by <b>Stripe</b></span>
            <span className='stripe-footer-sep'>·</span>
            <a href='#'>Terms</a>
            <span className='stripe-footer-sep'>·</span>
            <a href='#'>Privacy</a>
          </div>
        </div>

        <div className='stripe-right'>
          <form className='stripe-form' onSubmit={handlePay} noValidate>
            <h2 className='stripe-form-title'>Pay with card</h2>

            <div className='stripe-field'>
              <label>Email</label>
              <input name='email' type='email' placeholder='you@example.com'
                autoComplete='email' value={card.email}
                onChange={handleChange} className={errors.email ? 'err' : ''} />
              {errors.email && <span className='stripe-err'>{errors.email}</span>}
            </div>

            <div className='stripe-field'>
              <label>Card information</label>
              <div className='stripe-card-group'>
                <div className='stripe-card-number-wrap'>
                  <input name='number' type='text' inputMode='numeric'
                    placeholder='1234 5678 9012 3456' autoComplete='cc-number'
                    value={card.number} onChange={handleChange}
                    className={`stripe-card-number${errors.number ? ' err' : ''}`} />
                  <span className='stripe-card-brand'>
                    {brand === 'visa' ? <IconVisa /> : brand === 'mc' ? <IconMC /> : brand === 'amex' ? <IconAmex /> : <><IconVisa /><IconMC /><IconAmex /></>}
                  </span>
                </div>
                <div className='stripe-card-row'>
                  <input name='expiry' type='text' inputMode='numeric'
                    placeholder='MM / YY' autoComplete='cc-exp'
                    value={card.expiry} onChange={handleChange}
                    className={errors.expiry ? 'err' : ''} />
                  <input name='cvc' type='text' inputMode='numeric'
                    placeholder='CVC' autoComplete='cc-csc'
                    value={card.cvc} onChange={handleChange}
                    className={errors.cvc ? 'err' : ''} />
                </div>
              </div>
              {(errors.number || errors.expiry || errors.cvc) && (
                <span className='stripe-err'>{errors.number || errors.expiry || errors.cvc}</span>
              )}
            </div>

            <div className='stripe-field'>
              <label>Cardholder name</label>
              <input name='name' type='text' placeholder='Full name on card'
                autoComplete='cc-name' value={card.name}
                onChange={handleChange} className={errors.name ? 'err' : ''} />
              {errors.name && <span className='stripe-err'>{errors.name}</span>}
            </div>

            <div className='stripe-field'>
              <label>Country or region</label>
              <select name='country' value={card.country} onChange={handleChange}>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <button type='submit' className='stripe-pay-btn' disabled={loading || show3ds}>
              {loading
                ? <span className='stripe-spinner-wrap'><span className='stripe-spinner' />Processing...</span>
                : <><IconLock />Pay ${amount.toFixed(2)}</>}
            </button>

            <p className='stripe-secure-note'>Your payment info is encrypted and secure</p>
          </form>
        </div>

        </div>

      </div>
    </>
  )
}

export { SESSION_PREFIX }
export default CheckoutSession
