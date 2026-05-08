import React, { useState } from 'react'
import './LoginPopup.css'
import { assets } from '../../assets/assets'

const LoginPopup = ({ setShowLogin }) => {
  const [currState, setCurrState] = useState('Sign Up')
  const [data, setData] = useState({ name: '', email: '', password: '' })

  const onChangeHandler = (e) => {
    setData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const onSubmit = (e) => {
    e.preventDefault()
    // hook up to backend here
  }

  return (
    <div className='login-popup' onClick={() => setShowLogin(false)}>
      <form
        className='login-popup-container'
        onSubmit={onSubmit}
        onClick={e => e.stopPropagation()}
      >
        <div className='login-popup-title'>
          <h2>{currState}</h2>
          <img
            src={assets.cross_icon}
            alt='close'
            onClick={() => setShowLogin(false)}
          />
        </div>

        <div className='login-popup-inputs'>
          {currState === 'Sign Up' && (
            <input
              name='name'
              type='text'
              placeholder='Your name'
              value={data.name}
              onChange={onChangeHandler}
              required
            />
          )}
          <input
            name='email'
            type='email'
            placeholder='Your email'
            value={data.email}
            onChange={onChangeHandler}
            required
          />
          <input
            name='password'
            type='password'
            placeholder='Password'
            value={data.password}
            onChange={onChangeHandler}
            required
          />
        </div>

        <button type='submit'>
          {currState === 'Sign Up' ? 'Create account' : 'Login'}
        </button>

        <div className='login-popup-condition'>
          <input type='checkbox' required />
          <p>By continuing, I agree to the terms of use &amp; privacy policy.</p>
        </div>

        {currState === 'Sign Up'
          ? <p className='login-popup-toggle'>
              Already have an account?{' '}
              <span onClick={() => setCurrState('Login')}>Login here</span>
            </p>
          : <p className='login-popup-toggle'>
              Create a new account?{' '}
              <span onClick={() => setCurrState('Sign Up')}>Click here</span>
            </p>
        }
      </form>
    </div>
  )
}

export default LoginPopup
