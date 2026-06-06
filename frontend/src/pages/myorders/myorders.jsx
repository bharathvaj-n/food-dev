import React, { useContext, useEffect, useState } from 'react'
import './myorders.css'
import { StoreContext } from '../../context/storeContext'
import axios from 'axios'
import { assets } from '../../assets/assets'

function TrackModal({ order, onClose }) {
  const [status,  setStatus]  = useState(order.status || 'Pending')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const { data } = await axios.post(
          '/api/order/userorders',
          {},
          { headers: { token: localStorage.getItem('token') } }
        )
        if (data.success) {
          const latest = data.data.find(o => o._id === order._id)
          if (latest) setStatus(latest.status || 'Pending')
        }
      } catch {
        // keep existing status
      } finally {
        setLoading(false)
      }
    }
    fetchLatest()
  }, [order._id])

  const statusColor =
    status === 'Delivered'        ? '#22c55e' :
    status === 'Out for Delivery' ? '#f97316' :
    status === 'Food Processing'  ? '#3b82f6' : '#6b7280'

  return (
    <div className='track-overlay' onClick={onClose}>
      <div className='track-modal' onClick={e => e.stopPropagation()}>
        <button className='track-close' onClick={onClose}>✕</button>
        <p className='track-order-id'>Order #{String(order._id).slice(-8).toUpperCase()}</p>
        {loading
          ? <p className='track-current-status' style={{ color: '#9ca3af' }}>Loading...</p>
          : <p className='track-current-status' style={{ color: statusColor }}>{status}</p>
        }
      </div>
    </div>
  )
}

const MyOrders = () => {
  const { token } = useContext(StoreContext)
  const [orders,       setOrders]       = useState([])
  const [loading,      setLoading]      = useState(true)
  const [trackedOrder, setTrackedOrder] = useState(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axios.post('/api/order/userorders', {}, { headers: { token } })
        if (data.success) setOrders(data.data)
      } catch {
        // backend offline
      } finally {
        setLoading(false)
      }
    }
    if (token) {
      fetchOrders()
      const interval = setInterval(fetchOrders, 10000) // re-fetch every 10 seconds
      return () => clearInterval(interval)
    } else {
      setLoading(false)
    }
  }, [token])

  return (
    <div className='my-orders'>
      <div className='app-inner'>
      <h2>My Orders</h2>

      {loading ? (
        <p className='orders-msg'>Loading your orders...</p>
      ) : !token ? (
        <p className='orders-msg'>Please sign in to view your orders.</p>
      ) : orders.length === 0 ? (
        <p className='orders-msg'>You have no orders yet.</p>
      ) : (
        <div className='orders-list'>
          {orders.map((order, i) => (
            <div key={i} className='order-card'>
              <img src={assets.parcel_icon} alt='order' className='order-icon' />
              <div className='order-info'>
                <p className='order-items'>
                  {order.items.map((item, j) =>
                    `${item.name} × ${item.quantity}${j < order.items.length - 1 ? ', ' : ''}`
                  )}
                </p>
                <p className='order-total'>
                  ${Number(order.amount).toFixed(2)} &bull; {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                </p>
              </div>
              <span className={`order-status ${
                order.status === 'Delivered'        ? 'status-delivered'  :
                order.status === 'Out for Delivery' ? 'status-out'        :
                order.status === 'Food Processing'  ? 'status-processing' : ''
              }`}>
                &#x25cf; {order.status || 'Pending'}
              </span>
              <span className={`payment-badge ${order.payment ? 'payment-paid' : 'payment-pending'}`}>
                {order.payment ? '✓ Paid' : '⏳ Unpaid'}
              </span>
              <button className='track-btn' onClick={() => setTrackedOrder(order)}>
                Track Order
              </button>
            </div>
          ))}
        </div>
      )}

      </div>

      {/* Track modal */}
      {trackedOrder && (
        <TrackModal order={trackedOrder} onClose={() => setTrackedOrder(null)} />
      )}
    </div>
  )
}

export default MyOrders
