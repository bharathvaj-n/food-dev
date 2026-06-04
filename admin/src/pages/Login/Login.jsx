import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from '../../assets/assets'
import API_URL from '../../config/api'
import './Login.css'

const EMPTY = { email: '', password: '' }

function Login() {
  const [form, setForm]         = useState(EMPTY)
  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading]   = useState(false)
  const navigate                = useNavigate()

  // Pre-fill email if remembered
  useEffect(() => {
    const saved = localStorage.getItem('rememberedEmail')
    if (saved) { setForm((p) => ({ ...p, email: saved })); setRemember(true) }
  }, [])

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const validate = () => {
    if (!form.email.includes('@'))  { toast.error('Enter a valid email address'); return false }
    if (form.password.length < 6)   { toast.error('Password must be 6+ characters'); return false }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    try {
      setLoading(true)
      console.log("API URL:", API_URL)
      const response = await axios.post(`${API_URL}/api/user/login`, {
        email:    form.email,
        password: form.password,
      })
      console.log("Response:", response.data)

      if (response.data.success) {
        localStorage.setItem('token', response.data.token)
        remember
          ? localStorage.setItem('rememberedEmail', form.email)
          : localStorage.removeItem('rememberedEmail')
        toast.success('Login successful!')
        setTimeout(() => navigate('/'), 1200)
      } else {
        toast.error(response.data.message || 'Invalid credentials')
      }
    } catch (error) {
      console.error("API Error:", error)
      toast.error(error.response?.data?.message || 'Server error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">

      {/* ── Left branding panel ── */}
      <div className="login-brand">
        <div className="login-brand-inner">
          <div className="login-brand-logo">
            <img src={assets.logo} alt="Tomato" />
            <span>Tomato.</span>
          </div>
          <h1>Welcome<br />Back!</h1>
          <p>Sign in to your admin account to manage your food delivery platform.</p>
          <ul className="login-features">
            <li><span className="feat-dot" />Manage food menu items</li>
            <li><span className="feat-dot" />Track live orders</li>
            <li><span className="feat-dot" />Monitor deliveries</li>
          </ul>
        </div>
        <div className="login-brand-circles">
          <div className="circle c1" />
          <div className="circle c2" />
          <div className="circle c3" />
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="login-form-panel">
        <div className="login-card">

          <div className="login-card-header">
            <h2>Sign In</h2>
            <p>Enter your credentials to access the dashboard</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>

            {/* Email */}
            <div className="sf-group">
              <label htmlFor="li-email">Email Address</label>
              <input
                id="li-email"
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
              <div className="sf-label-row">
                <label htmlFor="li-password">Password</label>
                <button
                  type="button"
                  className="forgot-link"
                  onClick={() => toast.info('Password reset coming soon')}
                >
                  Forgot password?
                </button>
              </div>
              <div className="sf-input-wrap">
                <input
                  id="li-password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  autoComplete="current-password"
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

            {/* Remember me */}
            <label className="remember-row">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>Remember me</span>
            </label>

            {/* Submit */}
            <button type="submit" className="sf-submit" disabled={loading}>
              {loading ? <span className="sf-spinner" /> : 'Sign In'}
            </button>

          </form>

          <p className="login-signup-link">
            Don't have an account?{' '}
            <Link to="/signup">Create one</Link>
          </p>

        </div>
      </div>

    </div>
  )
}

export default Login
