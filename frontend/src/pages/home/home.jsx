import React, { useState } from 'react'
import './home.css'
import Header from '../../components/Header/Header'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay'
import AppDownload from '../../components/AppDownload/AppDownload'

const Home = () => {
  const [category, setCategory] = useState("All")

  return (
    <div className="home">
      <div className="app-inner">
        <Header />
        <ExploreMenu category={category} setCategory={setCategory} />
        <FoodDisplay category={category} />
      </div>
      <AppDownload />
    </div>
  )
}

export default Home
