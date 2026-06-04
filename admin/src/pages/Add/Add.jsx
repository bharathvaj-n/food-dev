import { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from '../../assets/assets'
import API_URL from '../../config/api'
import './Add.css'

const CATEGORIES = [
  'Salad', 'Rolls', 'Deserts', 'Sandwich',
  'Cake', 'Pure Veg', 'Pasta', 'Noodles',
]

const EMPTY = { name: '', description: '', category: CATEGORIES[0], price: '' }

function Add() {
  const [image,   setImage]   = useState(null)
  const [form,    setForm]    = useState(EMPTY)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!image) { toast.error('Please upload a product image'); return }

    const formData = new FormData()
    formData.append('image',       image)
    formData.append('name',        form.name)
    formData.append('description', form.description)
    formData.append('category',    form.category)
    formData.append('price',       form.price)

    try {
      setLoading(true)
      console.log("API URL:", API_URL)
      const response = await axios.post(`${API_URL}/api/food/add`, formData)
      console.log("Response:", response.data)
      if (response.data.success) {
        toast.success('Food Added')
        setForm(EMPTY)
        setImage(null)
      } else {
        toast.error(response.data.message || 'Failed to add item')
      }
    } catch (error) {
      console.error("API Error:", error)
      toast.error('Server error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='add-page'>

      {/* Page heading */}
      <div className='add-header'>
        <h2>Add Items</h2>
        <p>Fill in the details to add a new food item to the menu</p>
      </div>

      {/* Compact form card */}
      <form className='add-card' onSubmit={handleSubmit}>

        {/* Upload */}
        <div className='add-field'>
          <label className='add-label'>Product Image</label>
          <label htmlFor='img-upload' className='add-upload'>
            {image ? (
              <img src={URL.createObjectURL(image)} alt='preview' className='add-upload-preview' />
            ) : (
              <>
                <img src={assets.upload_area} alt='' className='add-upload-icon' />
                <span>CLICK TO UPLOAD IMAGE</span>
              </>
            )}
          </label>
          <input
            id='img-upload'
            type='file'
            accept='image/*'
            hidden
            onChange={e => setImage(e.target.files[0] || null)}
          />
        </div>

        {/* Name */}
        <div className='add-field'>
          <label className='add-label'>Product Name</label>
          <input
            name='name'
            type='text'
            placeholder='Enter product name'
            autoComplete='off'
            value={form.name}
            onChange={handleChange}
            className='add-input'
            required
          />
        </div>

        {/* Description */}
        <div className='add-field'>
          <label className='add-label'>Product Description</label>
          <textarea
            name='description'
            placeholder='Write a short description...'
            rows={3}
            value={form.description}
            onChange={handleChange}
            className='add-input add-textarea'
            required
          />
        </div>

        {/* Category */}
        <div className='add-field'>
          <label className='add-label'>Category</label>
          <select
            name='category'
            value={form.category}
            onChange={handleChange}
            className='add-input add-select'
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Price */}
        <div className='add-field'>
          <label className='add-label'>Price ($)</label>
          <input
            name='price'
            type='number'
            placeholder='0.00'
            min='0'
            step='0.01'
            value={form.price}
            onChange={handleChange}
            className='add-input'
            required
          />
        </div>

        {/* Submit */}
        <button type='submit' className='add-btn' disabled={loading}>
          {loading ? 'Adding...' : 'ADD'}
        </button>

      </form>
    </div>
  )
}

export default Add
