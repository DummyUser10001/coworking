// frontend/src/components/Navbar.jsx
import React from 'react'
import ThemeToggleButton from './ThemeToggleButton'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = ({ theme, setTheme }) => {
  const navigate = useNavigate()
  const { user, loading, isAuthenticated, logout } = useAuth()

  // Функция для выхода
  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  // Обработчик для "Выбрать коворкинг" - ведет на signin для неавторизованных
  const handleSelectCoworking = () => {
    if (!isAuthenticated) {
      navigate('/signin', { replace: true })
    } else {
      navigate('/map')
    }
  }

  // Рендерим навигацию в зависимости от статуса авторизации и роли
  const renderNavigation = () => {
    // Для неавторизованных пользователей
    if (!isAuthenticated && !loading) {
      return (
        <>
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `transition-colors font-medium cursor-pointer ${
                isActive 
                  ? 'text-[#645391] dark:text-[#A1E1DE]' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-[#645391] dark:hover:text-[#A1E1DE]'
              }`
            }
          >
            Главная
          </NavLink>
          <NavLink 
            to="/info" 
            className={({ isActive }) => 
              `transition-colors font-medium cursor-pointer ${
                isActive 
                  ? 'text-[#645391] dark:text-[#A1E1DE]' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-[#645391] dark:hover:text-[#A1E1DE]'
              }`
            }
          >
            О нас
          </NavLink>
          <button
            onClick={handleSelectCoworking}
            className="transition-colors font-medium cursor-pointer text-gray-700 dark:text-gray-300 hover:text-[#645391] dark:hover:text-[#A1E1DE]"
          >
            Выбрать коворкинг
          </button>
        </>
      )
    }

    // Для авторизованных пользователей
    if (isAuthenticated && !loading) {
      switch (user?.role) {
        case 'CLIENT':
          return (
            <>
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  `transition-colors font-medium cursor-pointer ${
                    isActive 
                      ? 'text-[#645391] dark:text-[#A1E1DE]' 
                      : 'text-gray-700 dark:text-gray-300 hover:text-[#645391] dark:hover:text-[#A1E1DE]'
                  }`
                }
              >
                Главная
              </NavLink>
              <NavLink 
                to="/info" 
                className={({ isActive }) => 
                  `transition-colors font-medium cursor-pointer ${
                    isActive 
                      ? 'text-[#645391] dark:text-[#A1E1DE]' 
                      : 'text-gray-700 dark:text-gray-300 hover:text-[#645391] dark:hover:text-[#A1E1DE]'
                  }`
                }
              >
                О нас
              </NavLink>
              <NavLink 
                to="/map" 
                className={({ isActive }) => 
                  `transition-colors font-medium cursor-pointer ${
                    isActive 
                      ? 'text-[#645391] dark:text-[#A1E1DE]' 
                      : 'text-gray-700 dark:text-gray-300 hover:text-[#645391] dark:hover:text-[#A1E1DE]'
                  }`
                }
              >
                Выбрать коворкинг
              </NavLink>
            </>
          )
        
        case 'MANAGER':
          return (
            <>
              <NavLink 
                to="/map-editing" 
                className={({ isActive }) => 
                  `transition-colors font-medium cursor-pointer ${
                    isActive 
                      ? 'text-[#645391] dark:text-[#A1E1DE]' 
                      : 'text-gray-700 dark:text-gray-300 hover:text-[#645391] dark:hover:text-[#A1E1DE]'
                  }`
                }
              >
                Коворкинг-центры
              </NavLink>
              <NavLink 
                to="/inventory-editing" 
                className={({ isActive }) => 
                  `transition-colors font-medium cursor-pointer ${
                    isActive 
                      ? 'text-[#645391] dark:text-[#A1E1DE]' 
                      : 'text-gray-700 dark:text-gray-300 hover:text-[#645391] dark:hover:text-[#A1E1DE]'
                  }`
                }
              >
                Инвентарь
              </NavLink>
              <NavLink 
                to="/discounts-editing" 
                className={({ isActive }) => 
                  `transition-colors font-medium cursor-pointer ${
                    isActive 
                      ? 'text-[#645391] dark:text-[#A1E1DE]' 
                      : 'text-gray-700 dark:text-gray-300 hover:text-[#645391] dark:hover:text-[#A1E1DE]'
                  }`
                }
              >
                Скидки
              </NavLink>
              <NavLink 
                to="/booking-editing" 
                className={({ isActive }) => 
                  `transition-colors font-medium cursor-pointer ${
                    isActive 
                      ? 'text-[#645391] dark:text-[#A1E1DE]' 
                      : 'text-gray-700 dark:text-gray-300 hover:text-[#645391] dark:hover:text-[#A1E1DE]'
                  }`
                }
              >
                Бронирования
              </NavLink>
            </>
          )
        
        case 'ADMIN':
          return (
            <>
              <NavLink 
                to="/admin" 
                className={({ isActive }) => 
                  `transition-colors font-medium cursor-pointer ${
                    isActive 
                      ? 'text-[#645391] dark:text-[#A1E1DE]' 
                      : 'text-gray-700 dark:text-gray-300 hover:text-[#645391] dark:hover:text-[#A1E1DE]'
                  }`
                }
              >
                Статистика
              </NavLink>
              <NavLink 
                to="/client-editing" 
                className={({ isActive }) => 
                  `transition-colors font-medium cursor-pointer ${
                    isActive 
                      ? 'text-[#645391] dark:text-[#A1E1DE]' 
                      : 'text-gray-700 dark:text-gray-300 hover:text-[#645391] dark:hover:text-[#A1E1DE]'
                  }`
                }
              >
                Клиенты
              </NavLink>
              <NavLink 
                to="/manager-editing" 
                className={({ isActive }) => 
                  `transition-colors font-medium cursor-pointer ${
                    isActive 
                      ? 'text-[#645391] dark:text-[#A1E1DE]' 
                      : 'text-gray-700 dark:text-gray-300 hover:text-[#645391] dark:hover:text-[#A1E1DE]'
                  }`
                }
              >
                Менеджеры
              </NavLink>
            </>
          )
        
        default:
          return null
      }
    }

    return null
  }

  return (
    <nav className='flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 shadow-sm transition-colors duration-300'>
      {/* Логотип */}
      <div className='flex items-center space-x-2 cursor-pointer' onClick={() => navigate('/')}>
        <div className='w-10 h-10 bg-[#645391] dark:bg-[#A1E1DE] rounded-full flex items-center justify-center text-white dark:text-gray-900 font-bold transition-colors'>
          CS
        </div>
        <span className='text-2xl font-bold text-[#645391] dark:text-[#A1E1DE] transition-colors'>
          CoworkingSpace
        </span>
      </div>

      {/* Навигация */}
      <div className='hidden md:flex items-center space-x-8'>
        {renderNavigation()}
      </div>

      {/* Кнопки */}
      <div className='flex items-center space-x-4'>
        <ThemeToggleButton theme={theme} setTheme={setTheme}/>
        
        {isAuthenticated && !loading ? (
          // Для авторизованных пользователей
          <div className='flex items-center space-x-4'>
            <button 
              className='px-6 py-2 bg-[#645391] hover:bg-[#52447a] text-white rounded-lg transition-colors font-medium cursor-pointer'
              onClick={() => navigate('/profile')}
            >
              Личный кабинет
            </button>
            <button 
              className='px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium cursor-pointer'
              onClick={handleLogout}
            >
              Выйти
            </button>
          </div>
        ) : (
          // Для неавторизованных пользователей
          <div className='flex items-center space-x-4'>
            <button 
              className='px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-[#645391] dark:hover:text-[#A1E1DE] transition-colors font-medium cursor-pointer'
              onClick={() => navigate('/signin', { replace: true })}
            >
              Войти
            </button>
            <button 
              className='px-6 py-2 bg-[#645391] hover:bg-[#52447a] text-white rounded-lg transition-colors font-medium cursor-pointer'
              onClick={() => navigate('/signup', { replace: true })}
            >
              Регистрация
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar