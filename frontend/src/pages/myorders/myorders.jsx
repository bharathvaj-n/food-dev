import React, { useContext, useEffect, useState } from 'react'
import './myorders.css'
import { StoreContext } from '../../context/storeContext'
import axios from 'axios'
import { assets } from '../../assets/assets'

const MyOrders = () => {
  const { token } = useContext(StoreContext)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axios.post('/api/order/userorders', {}, {
          headers: { token }
        })
        if (data.success) setOrders(data.data)
      } catch {
        // backend offline — show empty state
      } finally {
        setLoading(false)
      }
    }
    if (token) fetchOrders()
    else setLoading(false)
  }, [token])

  return (
    <div className='my-orders'>
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
                <p className='order-total'>${order.amount}.00 &bull; {order.items.length} items</p>
              </div>
              <span className={`order-status ${
                order.status === 'Delivered'       ? 'status-delivered' :
                order.status === 'Out for Delivery' ? 'status-out' :
                order.status === 'Processing'       ? 'status-processing' : ''
              }`}>
                &#x25cf; {order.status}
              </span>
              <button className='track-btn'>Track Order</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyOrders
