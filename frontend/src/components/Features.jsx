// frontend\src\components\Features.jsx
import React from 'react'

const Features = ({ theme }) => {
  const features = [
    {
      icon: '🚀',
      title: 'Быстрое бронирование',
      description: 'Забронируйте место за 2 минуты через удобный интерфейс'
    },
    {
      icon: '💻',
      title: 'Современное оборудование',
      description: 'Высокоскоростной интернет, мониторы и удобная мебель'
    },
    {
      icon: '☕',
      title: 'Кофе и закуски',
      description: 'Бесплатный кофе, чай и легкие закуски throughout the day'
    },
    {
      icon: '🤝',
      title: 'Нетворкинг',
      description: 'Знакомьтесь с единомышленниками и расширяйте связи'
    }
  ]

  return (
    <section className='py-20 bg-white dark:bg-gray-900'>
      <div className='container mx-auto px-6'>
        <div className='text-center mb-16'>
          <h2 className='text-4xl font-bold text-gray-800 dark:text-white mb-4'>
            Почему выбирают нас
          </h2>
          <p className='text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto'>
            Создаем идеальные условия для продуктивной работы и комфортного отдыха
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {features.map((feature, index) => (
            <div 
              key={index}
              className='bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700'
            >
              <div className='text-4xl mb-4'>{feature.icon}</div>
              <h3 className='text-xl font-semibold text-gray-800 dark:text-white mb-3'>
                {feature.title}
              </h3>
              <p className='text-gray-600 dark:text-gray-300 leading-relaxed'>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features