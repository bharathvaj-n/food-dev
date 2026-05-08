import { createContext, useState } from 'react'
import { food_list as foodListData } from '../assets/assets.js'

const StoreContext = createContext(null)

function StoreContextProvider({ children }) {
  const [food_list] = useState(foodListData)
  // Greek salad (_id:"1", price:12) pre-seeded qty 2 → subtotal $24
  const [cartItems, setCartItems] = useState({ '1': 2 })

  const addToCart = (itemId) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }))
  }

  const removeFromCart = (itemId) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: Math.max((prev[itemId] || 0) - 1, 0),
    }))
  }

  const removeAllFromCart = (itemId) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: 0,
    }))
  }

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
    cartItems,
    addToCart,
    removeFromCart,
    removeAllFromCart,
    getTotalCartAmount,
  }

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  )
}

export { StoreContext }
export default StoreContextProvider
