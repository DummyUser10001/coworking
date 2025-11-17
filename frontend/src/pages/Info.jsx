// frontend/src/pages/Info.jsx
import React from 'react'

const Info = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-[#EAB7A1] via-white to-[#A1E1DE] dark:from-gray-900 dark:via-gray-800 dark:to-[#645391] transition-colors duration-300 py-12">
      <div className="container mx-auto px-6">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
            О коворкингах CoworkingSpace
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Современные рабочие пространства для профессионалов, фрилансеров и предпринимателей Уфы
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Основной контент */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 mb-8 transition-all duration-300">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Что такое коворкинг?
              </h2>
              
              <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed">
                Коворкинг — это современный формат организации рабочего пространства, 
                где профессионалы из разных сфер могут работать вместе в комфортной 
                и вдохновляющей атмосфере. Это не просто офис, а сообщество единомышленников, 
                где рождаются новые идеи и проекты.
              </p>

              <div className="grid md:grid-cols-2 gap-8 my-8">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-[#645391] dark:text-[#A1E1DE] mb-4">
                    Преимущества коворкинга
                  </h3>
                  <ul className="text-gray-700 dark:text-gray-300 space-y-3">
                    <li className="flex items-start">
                      <span className="text-[#645391] dark:text-[#A1E1DE] mr-3">•</span>
                      Гибкость и доступность 24/7
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#645391] dark:text-[#A1E1DE] mr-3">•</span>
                      Профессиональная инфраструктура
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#645391] dark:text-[#A1E1DE] mr-3">•</span>
                      Сетевые возможности и нетворкинг
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#645391] dark:text-[#A1E1DE] mr-3">•</span>
                      Экономия на аренде офиса
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-[#645391] dark:text-[#A1E1DE] mb-4">
                    Кому подходит?
                  </h3>
                  <ul className="text-gray-700 dark:text-gray-300 space-y-3">
                    <li className="flex items-start">
                      <span className="text-[#645391] dark:text-[#A1E1DE] mr-3">•</span>
                      Фрилансерам и удаленным работникам
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#645391] dark:text-[#A1E1DE] mr-3">•</span>
                      Стартапам и малым командам
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#645391] dark:text-[#A1E1DE] mr-3">•</span>
                      Предпринимателям и бизнесменам
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#645391] dark:text-[#A1E1DE] mr-3">•</span>
                      Студентам и профессионалам
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* О сети CoworkingSpace */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 mb-8 transition-all duration-300">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Сеть коворкингов CoworkingSpace в Уфе
              </h2>
              
              <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed">
                CoworkingSpace — это ведущая сеть коворкинг-пространств в Уфе, 
                предлагающая современные и комфортные рабочие зоны в разных районах города. 
                Мы создаем идеальные условия для продуктивной работы и профессионального роста.
              </p>

              <div className="bg-linear-to-r from-[#645391] to-[#A1E1DE] dark:from-[#52447a] dark:to-[#7fb8b5] rounded-xl p-6 text-white my-8">
                <h3 className="text-xl font-semibold mb-4">Наша миссия</h3>
                <p className="text-lg opacity-90">
                  Создавать вдохновляющие рабочие пространства, где каждый может 
                  реализовать свой потенциал и найти единомышленников для совместных проектов.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 my-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#645391] dark:bg-[#A1E1DE] rounded-full flex items-center justify-center text-white dark:text-gray-900 text-2xl font-bold mx-auto mb-4">
                    5+
                  </div>
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Локаций в Уфе</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    В разных районах города для вашего удобства
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-[#645391] dark:bg-[#A1E1DE] rounded-full flex items-center justify-center text-white dark:text-gray-900 text-2xl font-bold mx-auto mb-4">
                    24/7
                  </div>
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Доступность</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Работайте в любое время, соответствующее вашему графику
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-[#645391] dark:bg-[#A1E1DE] rounded-full flex items-center justify-center text-white dark:text-gray-900 text-2xl font-bold mx-auto mb-4">
                    500+
                  </div>
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Рабочих мест</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    От уединенных кабинок до переговорных комнат
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Услуги и возможности */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 transition-all duration-300">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Что мы предлагаем
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-white">Рабочие столы</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Комфортные рабочие места с ergonomic мебелью
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-blue-600 dark:text-blue-400 font-bold">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-white">Переговорные комнаты</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Для встреч, презентаций и мозговых штурмов
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-purple-600 dark:text-purple-400 font-bold">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-white">Высокоскоростной интернет</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Стабильное подключение для комфортной работы
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-orange-600 dark:text-orange-400 font-bold">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-white">Кофе-зоны</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Свежий кофе, чай и снеки для перерывов
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-red-600 dark:text-red-400 font-bold">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-white">Принтеры и сканеры</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Вся необходимая офисная техника
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-white">Зоны отдыха</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Комфортные пространства для релаксации
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-xl border-l-4 border-[#645391] dark:border-[#A1E1DE]">
                <p className="text-gray-700 dark:text-gray-300 italic">
                  "CoworkingSpace — это больше чем просто рабочее место. 
                  Это сообщество профессионалов, где идеи превращаются в проекты, 
                  а коллеги становятся партнерами."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Info