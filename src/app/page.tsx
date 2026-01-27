'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import CodeEditorContainer from '@/components/CodeEditorContainer'
import DatasetBrowser from '@/components/DatasetBrowser'
import TutorialContainer from '@/components/TutorialContainer'

export default function Home() {
  const [activeSection, setActiveSection] = useState('editor')

  // Sync with URL hash
  useEffect(() => {
    const hash = window.location.hash.slice(1) // Remove #
    if (hash && ['editor', 'datasets', 'tutorials'].includes(hash)) {
      setActiveSection(hash)
    }
  }, [])

  // Update URL hash when section changes
  const handleSectionChange = (section: string) => {
    setActiveSection(section)
    window.location.hash = section
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Learn Data Science interactively
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Write and execute Python & R code directly in your browser. 
            Work with real datasets and get instant feedback as you learn.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1">
            <button
              onClick={() => handleSectionChange('editor')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeSection === 'editor'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Code Editor
            </button>
            <button
              onClick={() => handleSectionChange('datasets')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeSection === 'datasets'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Datasets
            </button>
            <button
              onClick={() => handleSectionChange('tutorials')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeSection === 'tutorials'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Tutorials
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden" style={{ minHeight: '600px' }}>
          {activeSection === 'editor' && (
            <div className="h-[600px]">
              <CodeEditorContainer />
            </div>
          )}
          
          {activeSection === 'datasets' && (
            <DatasetBrowser />
          )}
          
          {activeSection === 'tutorials' && (
            <TutorialContainer />
          )}
        </div>

        {/* Features Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-12">
            Why choose our platform?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">No Setup Required</h3>
              <p className="text-gray-600">
                Everything runs in your browser. No installation or configuration needed.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Instant Feedback</h3>
              <p className="text-gray-600">
                Get immediate results and helpful error messages as you code.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌟</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Real Datasets</h3>
              <p className="text-gray-600">
                Work with curated datasets perfect for learning data science concepts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}