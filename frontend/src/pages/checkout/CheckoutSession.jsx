import React, { useContext, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { StoreContext } from '../../context/storeContext'
import axios from 'axios'
import '../payment/payment.css'

const SESSION_PREFIX = 'tomato_session_'

const CheckoutSession = () => {
  const { sessionId }           = useParams()
  const navigate                = useNavigate()
  const { token, setCartItems } = useContext(StoreContext)

  const [orderData, setOrderData] = useState(null)
  const [notFound,  setNotFound]  = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [showAll,   setShowAll]   = useState(false)
  const [toast,     setToast]     = useState(null)

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
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100vh', gap:16, fontFamily:'sans-serif' }}>
      <p style={{ fontSize:18, color:'#697386' }}>Session expired or not found.</p>
      <button onClick={() => navigate('/order')} style={{ padding:'10px 24px', background:'#5469d4', color:'#fff', border:'none', borderRadius:6, cursor:'pointer', fontSize:14 }}>
        ← Back to checkout
      </button>
    </div>
  )

  if (!orderData) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
      <span style={{ fontSize:14, color:'#697386' }}>Loading session...</span>
    </div>
  )

  const { address, items, amount } = orderData
  const subtotal    = amount - 2
  const deliveryFee = 2

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  const resolveImage = (image) => {
    if (!image || typeof image !== 'string') return ''
    if (image.startsWith('/') || image.startsWith('http')) return image
    return `/images/${image}`
  }

  const handlePay = async (e) => {
    e.preventDefault()
    if (!token) { showToast('Please sign in to place an order', 'error'); return }

    setLoading(true)
    try {
      const { data } = await axios.post(
        '/api/order/place',
        { items, amount, address, paymentMethod: 'Stripe' },
        { headers: { token } }
      )
      if (data.success) {
        sessionStorage.removeItem(SESSION_PREFIX + sessionId)
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

  return (
    <div className='stripe-page'>

      {toast && (
        <div className={`stripe-toast stripe-toast-${toast.type}`}>
          <span>{toast.msg}</span>
          <button onClick={() => setToast(null)}>✕</button>
        </div>
      )}

      <div className='stripe-layout'>

        {/* ── LEFT: Order Summary ── */}
        <div className='stripe-left'>
          <div className='stripe-top-row'>
            <button className='stripe-back' onClick={() => navigate('/order')}>← Back</button>
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

          <div className='stripe-session-id'>
            <span>Session</span>
            <code>{sessionId}</code>
          </div>

          <div className='stripe-items'>
            {items.slice(0, showAll ? items.length : 2).map((item, i) => (
              <div key={i} className='stripe-item-row'>
                <div className='stripe-item-img-wrap'>
                  <img src={resolveImage(item.image)} alt={item.name} />
                  <span className='stripe-item-badge'>{item.quantity}</span>
                </div>
                <span className='stripe-item-name'>{item.name}</span>
                <span className='stripe-item-price'>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          {items.length > 2 && (
            <button className='stripe-show-all' onClick={() => setShowAll(v => !v)}>
              {showAll ? '▲ Show less' : `▼ Show all ${items.length} items`}
            </button>
          )}

          <div className='stripe-totals'>
            <div className='stripe-total-row'><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className='stripe-total-row'><span>Delivery</span><span>${deliveryFee.toFixed(2)}</span></div>
            <div className='stripe-total-row stripe-total-final'><span>Total due</span><span>${amount.toFixed(2)}</span></div>
          </div>

          <div className='stripe-footer'>
            <span>Powered by <b>Stripe</b></span>
            <span className='stripe-footer-sep'>·</span>
            <a href='#'>Terms</a>
            <span className='stripe-footer-sep'>·</span>
            <a href='#'>Privacy</a>
          </div>
        </div>

        {/* ── RIGHT: Pay Button ── */}
        <div className='stripe-right'>
          <form className='stripe-form' onSubmit={handlePay} noValidate>
            <h2 className='stripe-form-title'>Complete your payment</h2>
            <p style={{ color: '#697386', fontSize: 14, marginBottom: 24 }}>
              You will be redirected to Stripe's secure checkout to enter your card details.
            </p>

            <button type='submit' className='stripe-pay-btn' disabled={loading}>
              {loading
                ? <span className='stripe-spinner-wrap'><span className='stripe-spinner' />Processing...</span>
                : `Pay $${amount.toFixed(2)} with Stripe`}
            </button>

            <p className='stripe-secure-note'>🔒 Payments are encrypted and secure</p>
          </form>
        </div>

      </div>
    </div>
  )
}

export { SESSION_PREFIX }
export default CheckoutSession
