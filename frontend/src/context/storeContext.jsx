import { createContext, useState, useEffect } from 'react'
import axios from 'axios'
import { food_list as localFoodList } from '../assets/assets'

const StoreContext = createContext(null)

function StoreContextProvider({ children }) {
  const [food_list,   setFoodList]   = useState(localFoodList)
  const [cartItems,   setCartItems]  = useState({})
  const [token,       setToken]      = useState(localStorage.getItem('token') || '')
  const [foodLoading, setFoodLoading] = useState(true)

  const authHeader = (t) => ({ headers: { token: t } })

  // Clear stale token on any 401 response
  const handle401 = (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      setToken('')
    }
  }

  // ── On mount: load food list + cart ──────────────────────────────────────
  useEffect(() => {
    const loadData = async () => {
      // Food list — backend first, fall back to local assets
      try {
        const { data } = await axios.get('/api/food/list')
        console.log('[FoodList] success:', data.success, '| count:', data.data?.length)
        if (data.success && data.data.length > 0) setFoodList(data.data)
      } catch (err) {
        console.error('[FoodList] fetch failed:', err.message)
      } finally {
        setFoodLoading(false)
      }

      // Cart — only if a token exists
      const savedToken = localStorage.getItem('token')
      if (savedToken) {
        try {
          const { data } = await axios.get('/api/cart/get', authHeader(savedToken))
          if (data.success) setCartItems(data.cartData || {})
        } catch (err) {
          handle401(err) // silently clear expired token
        }
      }
    }
    loadData()
  }, [])

  // ── Add one item ──────────────────────────────────────────────────────────
  const addToCart = async (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }))
    if (token) {
      try {
        await axios.post('/api/cart/add', { itemId }, authHeader(token))
      } catch (err) {
        setCartItems((prev) => ({ ...prev, [itemId]: Math.max((prev[itemId] || 1) - 1, 0) }))
        handle401(err)
      }
    }
  }

  // ── Remove one item ───────────────────────────────────────────────────────
  const removeFromCart = async (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: Math.max((prev[itemId] || 0) - 1, 0) }))
    if (token) {
      try {
        await axios.post('/api/cart/remove', { itemId }, authHeader(token))
      } catch (err) {
        setCartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }))
        handle401(err)
      }
    }
  }

  // ── Remove all of one item ────────────────────────────────────────────────
  const removeAllFromCart = async (itemId) => {
    const prevCount = cartItems[itemId] || 0
    setCartItems((prev) => ({ ...prev, [itemId]: 0 }))
    if (token && prevCount > 0) {
      try {
        await Promise.all(
          Array.from({ length: prevCount }, () =>
            axios.post('/api/cart/remove', { itemId }, authHeader(token))
          )
        )
      } catch (err) {
        setCartItems((prev) => ({ ...prev, [itemId]: prevCount }))
        handle401(err)
      }
    }
  }

  // ── Cart total ────────────────────────────────────────────────────────────
  const getTotalCartAmount = () => {
    let total = 0
    for (const itemId in cartItems) {
      if (cartItems[itemId] > 0) {
        const item = food_list.find((f) => f._id === itemId)
        if (item) total += Number(item.price) * cartItems[itemId]
      }
    }
    return total
  }

  const contextValue = {
    food_list,
    foodLoading,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    removeAllFromCart,
    getTotalCartAmount,
    token,
    setToken,
  }

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  )
}

export { StoreContext }
export default StoreContextProvider
