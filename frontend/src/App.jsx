// frontend\src\App.jsx
import React from 'react'
import {Route, createBrowserRouter, createRoutesFromElements, RouterProvider, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Home from './pages/Home'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Profile from './pages/Profile'
import Info from './pages/Info'
import WorkspaceBooking from './pages/WorkspaceBooking'
import WorkspaceEditing from './pages/WorkspaceEditing'
import Map from './pages/Map'
import MapEditing from './pages/MapEditing'
import DiscountsEditing from './pages/DiscountsEditing'
import InventoryEditing from './pages/InventoryEditing'
import ManagerEditing from './pages/ManagerEditing'
import ClientEditing from './pages/ClientEditing'
import BookingEditing from './pages/BookingEditing'
import AdminPanel from './pages/AdminPanel'
import { useState, useEffect } from 'react'
import RootLayout from './layout/RootLayout'

// Компонент для защищенных маршрутов
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#EAB7A1] via-white to-[#A1E1DE] dark:from-gray-900 dark:via-gray-800 dark:to-[#645391] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#645391]"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return children
}

// Компонент для маршрутов, доступных только неавторизованным
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#EAB7A1] via-white to-[#A1E1DE] dark:from-gray-900 dark:via-gray-800 dark:to-[#645391] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#645391]"></div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return children
}

const App = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path='/' element={<RootLayout theme={theme} setTheme={setTheme} />}>
        {/* Публичные маршруты */}
        <Route index element={<Home theme={theme} />} />
        <Route path="info" element={<Info theme={theme} setTheme={setTheme} />} />
        
        {/* Маршруты только для неавторизованных */}
        <Route path="signin" element={
          <PublicOnlyRoute>
            <SignIn theme={theme} setTheme={setTheme} />
          </PublicOnlyRoute>
        } />
        <Route path="signup" element={
          <PublicOnlyRoute>
            <SignUp theme={theme} setTheme={setTheme} />
          </PublicOnlyRoute>
        } />

        {/* Защищенные маршруты для всех авторизованных */}
        <Route path="profile" element={
          <ProtectedRoute>
            <Profile theme={theme} setTheme={setTheme} />
          </ProtectedRoute>
        } />

        {/* Маршруты только для клиентов (CLIENT) */}
        <Route path="map" element={
          <ProtectedRoute requiredRole="CLIENT">
            <Map theme={theme} setTheme={setTheme} />
          </ProtectedRoute>
        } />
        <Route path="booking" element={
          <ProtectedRoute requiredRole="CLIENT">
            <WorkspaceBooking theme={theme} setTheme={setTheme} />
          </ProtectedRoute>
        } />

        {/* Маршруты только для менеджеров (MANAGER) */}
        <Route path="editing" element={
          <ProtectedRoute requiredRole="MANAGER">
            <WorkspaceEditing theme={theme} setTheme={setTheme} />
          </ProtectedRoute>
        } />
        <Route path="map-editing" element={
          <ProtectedRoute requiredRole="MANAGER">
            <MapEditing theme={theme} setTheme={setTheme} />
          </ProtectedRoute>
        } />
        <Route path="inventory-editing" element={
          <ProtectedRoute requiredRole="MANAGER">
            <InventoryEditing theme={theme} setTheme={setTheme} />
          </ProtectedRoute>
        } />
        <Route path="discounts-editing" element={
          <ProtectedRoute requiredRole="MANAGER">
            <DiscountsEditing theme={theme} setTheme={setTheme} />
          </ProtectedRoute>
        } />
        <Route path="booking-editing" element={
          <ProtectedRoute requiredRole="MANAGER">
            <BookingEditing theme={theme} setTheme={setTheme} />
          </ProtectedRoute>
        } />

        {/* Маршруты только для администраторов (ADMIN) */}
        <Route path="manager-editing" element={
          <ProtectedRoute requiredRole="ADMIN">
            <ManagerEditing theme={theme} setTheme={setTheme} />
          </ProtectedRoute>
        } />
        <Route path="client-editing" element={
          <ProtectedRoute requiredRole="ADMIN">
            <ClientEditing theme={theme} setTheme={setTheme} />
          </ProtectedRoute>
        } />
        <Route path="admin" element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminPanel theme={theme} setTheme={setTheme} />
          </ProtectedRoute>
        } />

        {/* Fallback для несуществующих маршрутов */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    )
  )

  return (  
    <RouterProvider router={router}/>
  )
}

export default App