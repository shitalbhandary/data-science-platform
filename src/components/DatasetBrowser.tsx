import React from 'react'

interface Dataset {
  id: string
  name: string
  description: string
  language: 'python' | 'r' | 'both'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  fileSize: string
  url: string
  tags: string[]
}

const datasets: Dataset[] = [
  {
    id: 'iris',
    name: 'Iris Dataset',
    description: 'Classic dataset for classification with 3 species of iris flowers',
    language: 'both',
    difficulty: 'beginner',
    fileSize: '2.9 KB',
    url: '/datasets/iris.csv',
    tags: ['classification', 'flowers', 'beginner']
  },
  {
    id: 'titanic',
    name: 'Titanic Dataset',
    description: 'Passenger data from the Titanic for survival analysis and data cleaning',
    language: 'both',
    difficulty: 'beginner',
    fileSize: '61.2 KB',
    url: '/datasets/titanic.csv',
    tags: ['data-cleaning', 'survival', 'classification']
  },
  {
    id: 'sales',
    name: 'Sales Data',
    description: 'Monthly sales data for analysis and visualization',
    language: 'both',
    difficulty: 'beginner',
    fileSize: '4.5 KB',
    url: '/datasets/sales.csv',
    tags: ['sales', 'time-series', 'visualization']
  },
  {
    id: 'students',
    name: 'Student Performance',
    description: 'Academic performance data with demographics and test scores',
    language: 'both',
    difficulty: 'beginner',
    fileSize: '15.8 KB',
    url: '/datasets/students.csv',
    tags: ['education', 'regression', 'analysis']
  }
]

export default function DatasetBrowser() {
  const [selectedDataset, setSelectedDataset] = React.useState<Dataset | null>(null)
  const [filterDifficulty, setFilterDifficulty] = React.useState<string>('all')
  const [filterLanguage, setFilterLanguage] = React.useState<string>('all')

  const filteredDatasets = datasets.filter(dataset => {
    const difficultyMatch = filterDifficulty === 'all' || dataset.difficulty === filterDifficulty
    const languageMatch = filterLanguage === 'all' || dataset.language === filterLanguage
    return difficultyMatch && languageMatch
  })

  const loadDataset = (dataset: Dataset) => {
    setSelectedDataset(dataset)
    // Here you would load the actual dataset into the editor
    console.log(`Loading dataset: ${dataset.name}`)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800'
      case 'advanced':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6 bg-gray-50">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Dataset Browser</h2>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Difficulty
            </label>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Language
            </label>
            <select
              value={filterLanguage}
              onChange={(e) => setFilterLanguage(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Languages</option>
              <option value="python">Python</option>
              <option value="r">R</option>
              <option value="both">Python & R</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dataset Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDatasets.map((dataset) => (
          <div
            key={dataset.id}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => loadDataset(dataset)}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-800">{dataset.name}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(dataset.difficulty)}`}>
                {dataset.difficulty}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">{dataset.description}</p>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{dataset.fileSize}</span>
              <span className="flex items-center">
                {dataset.language === 'python' && '🐍'}
                {dataset.language === 'r' && '📊'}
                {dataset.language === 'both' && '🐍📊'}
                {dataset.language === 'python' && ' Python'}
                {dataset.language === 'r' && ' R'}
                {dataset.language === 'both' && ' Python & R'}
              </span>
            </div>
            
            <div className="mt-3 flex flex-wrap gap-1">
              {dataset.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredDatasets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No datasets found matching your filters.</p>
        </div>
      )}

      {selectedDataset && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800">
            Dataset <strong>{selectedDataset.name}</strong> loaded and ready to use in the editor!
          </p>
        </div>
      )}
    </div>
  )
}