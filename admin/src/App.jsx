import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Navbar  from './components/Navbar/Navbar'
import Sidebar from './components/Slidebar/Slidebar'
import Add     from './pages/Add/Add'
import List    from './pages/List/List'
import Orders  from './pages/Orders/Orders'
import Signup  from './pages/Signup/Signup'
import Login   from './pages/Login/Login'
import './App.css'

const AUTH_ROUTES = ['/signup', '/login']

function Layout() {
  const { pathname } = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isAuth = AUTH_ROUTES.includes(pathname)

  if (isAuth) {
    return (
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login"  element={<Login />} />
      </Routes>
    )
  }

  return (
    <div className="admin-layout">
      <Navbar onMenuToggle={() => setSidebarOpen(v => !v)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="admin-content">
        <Routes>
          <Route path="/"       element={<Add />} />
          <Route path="/add"    element={<Add />} />
          <Route path="/list"   element={<List />} />
          <Route path="/orders" element={<Orders />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <Router>
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        theme="light"
      />
      <Layout />
    </Router>
  )
}

export default App
