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
                        Комфортные рабочие места
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-white">Переговорные комнаты и конференц-залы</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Для встреч, презентаций и мозговых штурмов
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
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
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-white">Кофе-зоны</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Свежий кофе, чай и снеки для перерывов
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-white">Проекторы, мониторы и т.д.</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Вся необходимая техника
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
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
            </div>
          </div>

          {/* Поддержка */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 mb-8 mt-8 transition-all duration-300">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Поддержка
              </h2>
              
              <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed">
                При возникновении проблем или наличии дополнительных вопросов пишите на почту: support@coworking-system.ru.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Info