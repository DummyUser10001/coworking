// frontend\src\pages\Home.jsx
import React from 'react'
import Hero from '../components/Hero'
import Features from '../components/Features'
import WorkspaceShowcase from '../components/WorkspaceShowcase'

const Home = ({ theme }) => {
  return (
    <>
      <Hero />
      <Features theme={theme}/>
      <WorkspaceShowcase theme={theme}/>
      
      {/* Footer */}
      <footer className='bg-gray-800 dark:bg-gray-900 text-white py-12 transition-colors duration-300'>
        <div className='container mx-auto px-6 text-center'>
          <p>&copy; 2025 CoworkingSpace.</p>
        </div>
      </footer>
    </>
  )
}

export default Home