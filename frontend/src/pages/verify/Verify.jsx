import React, { useContext, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { StoreContext } from '../../context/storeContext'

const Verify = () => {
  const [params]  = useSearchParams()
  const navigate  = useNavigate()
  const { token, setCartItems } = useContext(StoreContext)

  useEffect(() => {
    const verify = async () => {
      const success = params.get('success')
      const orderId = params.get('orderId')

      try {
        const { data } = await axios.post('/api/order/verify', { success, orderId }, { headers: { token } })
        if (data.success) {
          setCartItems({})
          navigate('/myorders')
        } else {
          navigate('/order')
        }
      } catch {
        navigate('/order')
      }
    }
    verify()
  }, [])

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 40, height: 40, border: '3px solid #f0f0f0', borderTopColor: 'tomato', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <p style={{ color: '#888', fontSize: 15 }}>Verifying your payment...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default Verify
