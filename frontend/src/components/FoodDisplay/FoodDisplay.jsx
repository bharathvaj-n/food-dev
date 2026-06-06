import React, { useContext } from 'react'
import './FoodDisplay.css'
import { StoreContext } from '../../context/storeContext'
import FoodItem from '../Fooditem/Fooditem'

const API_URL = import.meta.env.VITE_API_URL || ''

const resolveImage = (image) => {
  if (!image) return ''
  if (typeof image !== 'string') return '' // Vite module object from local assets fallback
  if (image.startsWith('http') || image.startsWith('data:')) return image
  const clean = image.replace(/^\/images\//, '')
  return API_URL ? `${API_URL}/images/${clean}` : `/images/${clean}`
}

const SkeletonCard = () => (
  <div className='skeleton-card'>
    <div className='skeleton-img' />
    <div className='skeleton-body'>
      <div className='skeleton-line wide' />
      <div className='skeleton-line medium' />
      <div className='skeleton-line narrow' />
    </div>
  </div>
)

const FoodDisplay = ({ category }) => {
  const { food_list, foodLoading } = useContext(StoreContext)

  const filtered = category === 'All'
    ? food_list
    : food_list.filter(item => item.category === category)

  return (
    <div className='food-display' id='fooddisplay'>

      <div className='food-display-header'>
        <div className='food-display-title-block'>
          <h2>
            {category === 'All'
              ? <>
                  <span className='title-black'>Top dishes&nbsp;</span>
                  <span className='title-orange'>near you</span>
                </>
              : category
            }
          </h2>
          {category === 'All' && (
            <p className='food-display-subtitle'>Handpicked favourites delivered fresh to your door</p>
          )}
        </div>
        {!foodLoading && (
          <span className='food-count'>{filtered.length} items</span>
        )}
      </div>

      {foodLoading ? (
        <div className='food-display-list'>
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className='food-empty'>
          <p>No dishes found in this category.</p>
        </div>
      ) : (
        <div className='food-display-list'>
          {filtered.map((item) => (
            <FoodItem
              key={item._id}
              id={item._id}
              name={item.name}
              description={item.description}
              price={item.price}
              image={resolveImage(item.image)}
            />
          ))}
        </div>
      )}

    </div>
  )
}

export default FoodDisplay
