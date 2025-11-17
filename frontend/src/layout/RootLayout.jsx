// frontend\src\layout\RootLayout.jsx
import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'

const RootLayout = ({ theme, setTheme }) => {
  return (
    <div className='min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300'>
        <Navbar theme={theme} setTheme={setTheme}/>
        <Outlet />
    </div>
  )
}

export default RootLayout