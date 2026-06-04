import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from '../../assets/assets'
import API_URL from '../../config/api'
import './Signup.css'

const EMPTY = { name: '', email: '', password: '', confirm: '' }

function Signup() {
  const [form, setForm]         = useState(EMPTY)
  const [showPass, setShowPass] = useState(false)
  const [showConf, setShowConf] = useState(false)
  const [loading, setLoading]   = useState(false)
  const navigate                = useNavigate()

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const validate = () => {
    if (!form.name.trim())               { toast.error('Name is required');              return false }
    if (!form.email.includes('@'))       { toast.error('Enter a valid email');           return false }
    if (form.password.length < 6)        { toast.error('Password must be 6+ characters'); return false }
    if (form.password !== form.confirm)  { toast.error('Passwords do not match');        return false }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    try {
      setLoading(true)
      console.log("API URL:", API_URL)
      const response = await axios.post(`${API_URL}/api/user/register`, {
        name:     form.name,
        email:    form.email,
        password: form.password,
      })
      console.log("Response:", response.data)

      if (response.data.success) {
        localStorage.setItem('token', response.data.token)
        toast.success('Account created successfully!')
        setTimeout(() => navigate('/login'), 1500)
      } else {
        toast.error(response.data.message || 'Registration failed')
      }
    } catch (error) {
      console.error("API Error:", error)
      toast.error(error.response?.data?.message || 'Server error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="signup-page">

      {/* ── Left branding panel ── */}
      <div className="signup-brand">
        <div className="signup-brand-inner">
          <div className="signup-brand-logo">
            <img src={assets.logo} alt="Tomato" />
            <span>Tomato.</span>
          </div>
          <h1>Welcome to the<br />Admin Panel</h1>
          <p>Manage your food delivery platform — add items, track orders, and grow your business.</p>
          <ul className="signup-features">
            <li><span className="feat-dot" />Manage food menu items</li>
            <li><span className="feat-dot" />Track live orders</li>
            <li><span className="feat-dot" />Monitor deliveries</li>
          </ul>
        </div>
        <div className="signup-brand-circles">
          <div className="circle c1" />
          <div className="circle c2" />
          <div className="circle c3" />
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="signup-form-panel">
        <div className="signup-card">

          <div className="signup-card-header">
            <h2>Create Account</h2>
            <p>Fill in your details to get started</p>
          </div>

          <form className="signup-form" onSubmit={handleSubmit} noValidate>

            {/* Name */}
            <div className="sf-group">
              <label htmlFor="su-name">Full Name</label>
              <input
                id="su-name"
                name="name"
                type="text"
                placeholder="John Doe"
                autoComplete="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Email */}
            <div className="sf-group">
              <label htmlFor="su-email">Email Address</label>
              <input
                id="su-email"
                name="email"
                type="email"
                placeholder="admin@example.com"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Password */}
            <div className="sf-group">
              <label htmlFor="su-password">Password</label>
              <div className="sf-input-wrap">
                <input
                  id="su-password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="sf-eye"
                  onClick={() => setShowPass((v) => !v)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="sf-group">
              <label htmlFor="su-confirm">Confirm Password</label>
              <div className="sf-input-wrap">
                <input
                  id="su-confirm"
                  name="confirm"
                  type={showConf ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  value={form.confirm}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="sf-eye"
                  onClick={() => setShowConf((v) => !v)}
                  aria-label={showConf ? 'Hide password' : 'Show password'}
                >
                  {showConf ? '🙈' : '👁️'}
                </button>
              </div>
              {/* Live match indicator */}
              {form.confirm && (
                <span className={`sf-match ${form.password === form.confirm ? 'match' : 'no-match'}`}>
                  {form.password === form.confirm ? '✓ Passwords match' : '✗ Passwords do not match'}
                </span>
              )}
            </div>

            {/* Submit */}
            <button type="submit" className="sf-submit" disabled={loading}>
              {loading
                ? <span className="sf-spinner" />
                : 'Create Account'}
            </button>

          </form>

          <p className="signup-login-link">
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </p>

        </div>
      </div>

    </div>
  )
}

export default Signup
