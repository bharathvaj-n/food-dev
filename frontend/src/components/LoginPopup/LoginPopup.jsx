import React, { useState, useContext } from 'react'
import './LoginPopup.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../context/storeContext'
import axios from 'axios'

const LoginPopup = ({ setShowLogin }) => {
  const [currState, setCurrState] = useState('Sign Up')
  const [data, setData] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { setToken } = useContext(StoreContext)

  const isSignUp = currState === 'Sign Up'

  const onChangeHandler = (e) => {
    setError('')
    setData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const switchState = (state) => {
    setCurrState(state)
    setError('')
    setSuccess('')
    setData({ name: '', email: '', password: '' })
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Client-side validation for register
    if (isSignUp && !data.name.trim()) {
      setError('Name, email and password are required')
      return
    }

    const endpoint = isSignUp ? '/api/user/register' : '/api/user/login'
    const payload  = isSignUp
      ? { name: data.name.trim(), email: data.email, password: data.password }
      : { email: data.email, password: data.password }

    try {
      setLoading(true)
      const { data: res } = await axios.post(endpoint, payload)
      if (res.success) {
        if (isSignUp) {
          setSuccess('Account created successfully! Logging you in...')
          setTimeout(() => {
            localStorage.setItem('token', res.token)
            setToken(res.token)
            setShowLogin(false)
          }, 1000)
        } else {
          localStorage.setItem('token', res.token)
          setToken(res.token)
          setShowLogin(false)
        }
      } else {
        setError(res.message || 'Something went wrong')
      }
    } catch (err) {
      const msg = err?.response?.data?.message
      setError(msg || 'Server error. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='login-popup' onClick={() => setShowLogin(false)}>
      <form
        className='login-popup-container'
        onSubmit={onSubmit}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className='login-popup-title'>
          <div className='login-popup-title-left'>
            <h2>{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
            <p className='login-popup-subtitle'>
              {isSignUp ? 'Register to start ordering food' : 'Login to your account'}
            </p>
          </div>
          <img
            src={assets.cross_icon}
            alt='close'
            onClick={() => setShowLogin(false)}
          />
        </div>

        {/* ── Tab switcher ── */}
        <div className='login-popup-tabs'>
          <button
            type='button'
            className={isSignUp ? 'tab-active' : ''}
            onClick={() => switchState('Sign Up')}
          >
            Sign Up
          </button>
          <button
            type='button'
            className={!isSignUp ? 'tab-active' : ''}
            onClick={() => switchState('Login')}
          >
            Login
          </button>
        </div>

        {/* ── Inline feedback ── */}
        {error   && <div className='login-popup-error'>⚠ {error}</div>}
        {success && <div className='login-popup-success'>✓ {success}</div>}

        {/* ── Inputs ── */}
        <div className='login-popup-inputs'>
          {isSignUp && (
            <div className='input-group'>
              <label>Full Name</label>
              <input
                name='name'
                type='text'
                placeholder='John Doe'
                value={data.name}
                onChange={onChangeHandler}
                required
                autoComplete='name'
              />
            </div>
          )}
          <div className='input-group'>
            <label>Email Address</label>
            <input
              name='email'
              type='email'
              placeholder='user@example.com'
              value={data.email}
              onChange={onChangeHandler}
              required
              autoComplete='email'
            />
          </div>
          <div className='input-group'>
            <label>Password</label>
            <input
              name='password'
              type='password'
              placeholder={isSignUp ? 'Min. 6 characters' : 'Your password'}
              value={data.password}
              onChange={onChangeHandler}
              required
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
            />
          </div>
        </div>

        {/* ── Terms (Sign Up only) ── */}
        {isSignUp && (
          <div className='login-popup-condition'>
            <input type='checkbox' id='terms' required />
            <label htmlFor='terms'>
              By continuing, I agree to the <span>terms of use</span> &amp; <span>privacy policy</span>.
            </label>
          </div>
        )}

        {/* ── Submit ── */}
        <button type='submit' className='login-popup-submit' disabled={loading}>
          {loading
            ? <span className='btn-loading'>Please wait...</span>
            : (isSignUp ? 'Create Account' : 'Login')
          }
        </button>

        {/* ── Footer toggle ── */}
        <p className='login-popup-toggle'>
          {isSignUp
            ? <>Already have an account? <span onClick={() => switchState('Login')}>Login here</span></>  
            : <>New here? <span onClick={() => switchState('Sign Up')}>Create account</span></>
          }
        </p>
      </form>
    </div>
  )
}

export default LoginPopup
