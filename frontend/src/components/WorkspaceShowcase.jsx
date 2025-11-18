// frontend\src\components\WorkspaceShowcase.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'

const WorkspaceShowcase = ({ theme }) => {
  const navigate = useNavigate() // Добавляем хук useNavigate
  
  const spaces = [
    {
      type: 'Открытое пространство',
      price: 'от 500₽/день',
      features: ['Столы с компьютером и без', 'Бесплатный кофе', 'Шкафчики для вещей'],
      color: 'from-[#EAB7A1] to-[#f8d3c5]'
    },
    {
      type: 'Переговорная',
      price: 'от 250₽/час',
      features: ['Изолированное помещение', 'Маркерная доска', 'Большой стол'],
      color: 'from-[#A1E1DE] to-[#c0f0ed]'
    },
    {
      type: 'Конференц-зал  ',
      price: 'от 600₽/час',
      features: ['Просторное помещение', 'Проектор', 'Микрофон и колонки'],
      color: 'from-[#645391] to-[#7d69a9] text-white'
    }
  ]

  return (
    <section className='py-20 bg-linear-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800'>
      <div className='container mx-auto px-6'>
        <div className='text-center mb-16'>
          <h2 className='text-4xl font-bold text-gray-800 dark:text-white mb-4'>
            Типы пространств
          </h2>
          <p className='text-xl text-gray-600 dark:text-gray-300'>
            Выберите подходящий формат для ваших задач
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {spaces.map((space, index) => (
            <div 
              key={index}
              className={`bg-linear-to-br ${space.color} rounded-2xl p-8 shadow-xl transform hover:scale-105 transition-all duration-300`}
            >
              <h3 className={`text-2xl font-bold mb-4 ${space.color.includes('text-white') ? 'text-white' : 'text-gray-800'}`}>
                {space.type}
              </h3>
              <div className={`text-3xl font-bold mb-6 ${space.color.includes('text-white') ? 'text-white' : 'text-gray-800'}`}>
                {space.price}
              </div>
              <ul className={`space-y-3 ${space.color.includes('text-white') ? 'text-white' : 'text-gray-700'}`}>
                {space.features.map((feature, idx) => (
                  <li key={idx} className='flex items-center'>
                    <span className='mr-3'>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button 
                className={`mt-6 w-full py-3 rounded-xl font-semibold transition-all ${
                  space.color.includes('text-white') 
                    ? 'bg-white text-[#645391] hover:bg-gray-100' 
                    : 'bg-[#645391] text-white hover:bg-[#52447a]'
                }`}
                onClick={() => navigate('/map')} 
              >
                Забронировать
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default WorkspaceShowcase