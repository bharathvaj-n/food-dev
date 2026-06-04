import { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from '../../assets/assets'
import API_URL from '../../config/api'
import './Orders.css'

const STATUSES = ['Food Processing', 'Out for Delivery', 'Delivered']

function OrderCard({ order, onStatusChange }) {
  const a = order.address || {}
  const fullName    = [a.firstName, a.lastName].filter(Boolean).join(' ')
  const cityLine    = [a.city, a.state, a.country, a.zip].filter(Boolean).join(', ')

  return (
    <div className='ocard'>

      {/* 1 — parcel icon */}
      <div className='ocard-col ocard-col-icon'>
        <img src={assets.parcel_icon} alt='parcel' className='ocard-parcel' />
      </div>

      {/* 2 — items + address stacked */}
      <div className='ocard-col ocard-col-main'>

        {/* items */}
        <p className='ocard-items-text'>
          {order.items.map((item, i) => (
            <span key={i}>
              {item.name} x {item.quantity}{i < order.items.length - 1 ? ', ' : ''}
            </span>
          ))}
        </p>

        {/* address block */}
        <div className='ocard-address-block'>
          {fullName  && <p className='ocard-addr-name'>{fullName}</p>}
          {a.street  && <p className='ocard-addr-line'>{a.street},</p>}
          {cityLine  && <p className='ocard-addr-line'>{cityLine}</p>}
          {a.phone   && <p className='ocard-addr-line'>{a.phone}</p>}
        </div>

      </div>

      {/* 3 — count + amount */}
      <div className='ocard-col ocard-col-meta'>
        <p className='ocard-items-count'>Items : {order.items.length}</p>
        <p className='ocard-amount'>${Number(order.amount).toFixed(2)}</p>
      </div>

      {/* 4 — status dropdown */}
      <div className='ocard-col ocard-col-status'>
        <select
          className='ocard-select'
          value={order.status}
          onChange={(e) => onStatusChange(e, order._id)}
        >
          {STATUSES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

    </div>
  )
}

function Orders() {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      console.log("API URL:", API_URL)
      const response = await axios.get(`${API_URL}/api/order/list`)
      console.log("Response:", response.data)
      if (response.data.success) {
        setOrders(response.data.data)
      } else {
        toast.error('Failed to load orders')
      }
    } catch (error) {
      console.error("API Error:", error)
      toast.error('Server error. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  const handleStatus = async (e, orderId) => {
    const newStatus = e.target.value
    setOrders(prev =>
      prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o)
    )
    try {
      console.log("API URL:", API_URL)
      const response = await axios.post(`${API_URL}/api/order/status`, {
        orderId, status: newStatus,
      })
      console.log("Response:", response.data)
      if (response.data.success) {
        toast.success('Status updated')
      } else {
        toast.error('Update failed')
        fetchOrders()
      }
    } catch (error) {
      console.error("API Error:", error)
      toast.error('Failed to update status')
      fetchOrders()
    }
  }

  useEffect(() => { fetchOrders() }, [])

  return (
    <div className='orders-page'>

      <h2 className='orders-title'>Order Page</h2>

      {loading ? (
        <div className='orders-loading'>
          {[...Array(3)].map((_, i) => (
            <div key={i} className='ocard-skeleton' />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className='orders-empty'>
          <span>📦</span>
          <p>No orders found.</p>
        </div>
      ) : (
        <div className='orders-list'>
          {orders.map(order => (
            <OrderCard
              key={order._id}
              order={order}
              onStatusChange={handleStatus}
            />
          ))}
        </div>
      )}

    </div>
  )
}

export default Orders
