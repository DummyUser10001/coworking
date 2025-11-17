// frontend\src\components\Hero.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import assets from '../assets/assets'

const Hero = () => {
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    
    const images = [
        assets.coworking1,
        assets.coworking2,
        assets.coworking3
    ]

    // Плавная смена картинок
    useEffect(() => {
        const interval = setInterval(() => {
            nextImage()
        }, 5000)

        return () => clearInterval(interval)
    }, [currentImageIndex])

    const nextImage = () => {
        setCurrentImageIndex((prevIndex) => 
            prevIndex === images.length - 1 ? 0 : prevIndex + 1
        )
    }

    const prevImage = () => {
        setCurrentImageIndex((prevIndex) => 
            prevIndex === 0 ? images.length - 1 : prevIndex - 1
        )
    }

    // Обработчик для кнопки "Найти место"
    const handleFindPlace = () => {
        if (!isAuthenticated) {
            navigate('/signin', { replace: true })
        } else {
            navigate('/map', { replace: true })
        }
    }

    return (
        <section className='min-h-screen bg-linear-to-br from-[#EAB7A1] via-white to-[#A1E1DE] dark:from-gray-900 dark:via-gray-800 dark:to-[#645391] flex items-center relative overflow-hidden'>
            {/* Фон с меняющимися картинками */}
            <div className="absolute inset-0">
                {images.map((image, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out transform ${
                            index === currentImageIndex 
                                ? 'opacity-20 scale-105' 
                                : 'opacity-0 scale-100'
                        }`}
                        style={{ backgroundImage: `url(${image})` }}
                    />
                ))}
            </div>

            {/* Градиентный оверлей */}
            <div className="absolute inset-0 bg-linear-to-r from-white/70 via-white/50 to-transparent dark:from-gray-900/80 dark:via-gray-900/60"></div>

            {/* Стрелка влево */}
            <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 group"
            >
                <svg className="w-6 h-6 text-gray-800 dark:text-white transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            {/* Стрелка вправо */}
            <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 group"
            >
                <svg className="w-6 h-6 text-gray-800 dark:text-white transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>

            <div className='container mx-auto px-6 py-20 relative z-10'>
                <div className='max-w-2xl'>
                    <h1 className='text-5xl md:text-6xl font-bold text-gray-800 dark:text-white mb-6'>
                        Найдите идеальное рабочее пространство
                    </h1>
                    <p className='text-xl text-gray-600 dark:text-gray-300 mb-8'>
                        Современные коворкинг-пространства для продуктивной работы.
                    </p>
                    <div className='flex flex-col sm:flex-row gap-4'>
                        <button 
                            className='px-8 py-4 bg-[#645391] hover:bg-[#52447a] text-white rounded-xl text-lg font-semibold transition-all transform hover:scale-105 shadow-lg'
                            onClick={handleFindPlace}
                        >
                            Найти место
                        </button>
                        <button className='px-8 py-4 border-2 border-[#645391] text-[#645391] dark:border-[#A1E1DE] dark:text-[#A1E1DE] rounded-xl text-lg font-semibold transition-all transform hover:scale-105'
                        onClick={() => navigate('/info')}>
                            Узнать больше
                        </button>
                    </div>
                </div>
            </div>

            {/* Индикаторы */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-10">
                {images.map((_, index) => (
                    <button
                        key={index}
                        className={`w-3 h-3 rounded-full transition-all duration-500 ease-out ${
                            index === currentImageIndex 
                                ? 'bg-[#645391] scale-125 shadow-lg' 
                                : 'bg-gray-400 hover:bg-gray-600 scale-100'
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                    />
                ))}
            </div>
        </section>
    )
}

export default Hero