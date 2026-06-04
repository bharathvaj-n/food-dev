import { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import API_URL from '../../config/api'
import './List.css'

function List() {
  const [items, setItems]   = useState([])
  const [loading, setLoading] = useState(true)

  const fetchList = async () => {
    try {
      console.log("API URL:", API_URL)
      const response = await axios.get(`${API_URL}/api/food/list`)
      console.log("Response:", response.data)
      if (response.data.success) {
        setItems(response.data.data)
      } else {
        toast.error('Failed to load items')
      }
    } catch (error) {
      console.error("API Error:", error)
      toast.error('Server error. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (id) => {
    try {
      console.log("API URL:", API_URL)
      const response = await axios.post(`${API_URL}/api/food/remove`, { id })
      console.log("Response:", response.data)
      if (response.data.success) {
        toast.success('Item removed')
        setItems((prev) => prev.filter((item) => item._id !== id))
      } else {
        toast.error(response.data.message || 'Remove failed')
      }
    } catch (error) {
      console.error("API Error:", error)
      toast.error('Server error.')
    }
  }

  useEffect(() => { fetchList() }, [])

  return (
    <div className="list-page">
      <div className="list-header">
        <h2>List Items</h2>
        <p>All food items currently in the menu</p>
      </div>

      {loading ? (
        <div className="list-empty">Loading...</div>
      ) : items.length === 0 ? (
        <div className="list-empty">No items found. Add some food items first.</div>
      ) : (
        <div className="list-table-wrap">
          <table className="list-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id}>
                  <td>
                    <img
                      src={`${import.meta.env.VITE_API_URL}/images/${item.image}`}
                      alt={item.name}
                      className="list-img"
                    />
                  </td>
                  <td className="list-name">{item.name}</td>
                  <td><span className="list-badge">{item.category}</span></td>
                  <td className="list-price">${item.price}</td>
                  <td>
                    <button
                      className="list-remove"
                      onClick={() => handleRemove(item._id)}
                      title="Remove item"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default List
