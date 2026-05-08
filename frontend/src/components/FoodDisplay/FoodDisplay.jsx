import React, { useContext } from 'react'
import './FoodDisplay.css'
import { StoreContext } from '../../context/storeContext'
import FoodItem from '../Fooditem/Fooditem'

const FoodDisplay = ({ category }) => {
  const { food_list } = useContext(StoreContext)

  const filtered_food_list = category === 'All'
    ? food_list
    : food_list.filter(item => item.category === category)

  return (
    <div className='food-display' id='fooddisplay'>
      <h2>Top dishes near you</h2>
      <div className="food-display-list">
        {filtered_food_list.map((item, index) => (
          <FoodItem
            key={item._id}
            id={item._id}
            name={item.name}
            description={item.description}
            price={item.price}
            image={item.image}
          />
        ))}
      </div>
    </div>
  )
}

export default FoodDisplay
