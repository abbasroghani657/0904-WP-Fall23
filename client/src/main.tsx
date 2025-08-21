import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import Login from './pages/Login'
import Register from './pages/Register'
import Selfie from './pages/Selfie'
import Admin from './pages/Admin'
import AdminSettings from './pages/AdminSettings'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/selfie', element: <Selfie /> },
  { path: '/admin', element: <Admin /> },
  { path: '/admin/settings', element: <AdminSettings /> },
  { path: '/privacy', element: <Privacy /> },
  { path: '/terms', element: <Terms /> },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
