// frontend\src\components\ThemeToggleButton.jsx
import React from 'react'
import { MdLightMode, MdDarkMode } from 'react-icons/md'

const ThemeToggleButton = ({ theme, setTheme }) => {

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  return (
    <div>
      <button 
        onClick={toggleTheme}
        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-[#EAB7A1] dark:hover:bg-[#645391] transition-colors duration-300"
        aria-label="Переключить тему"
      >
        {theme === 'dark' ? (
          // Солнце для светлой темы - серое/черное
          <MdLightMode 
            className="w-6 h-6 text-gray-800 dark:text-gray-200 transition-transform duration-300 hover:scale-110" 
          />
        ) : (
          // Луна для темной темы - серое/черное
          <MdDarkMode 
            className="w-6 h-6 text-gray-800 dark:text-gray-200 transition-transform duration-300 hover:scale-110" 
          />
        )}
      </button>
    </div>
  )
}

export default ThemeToggleButton