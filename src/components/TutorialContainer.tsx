import React from 'react'

interface Tutorial {
  id: string
  title: string
  description: string
  language: 'python' | 'r'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  content: {
    steps: {
      title: string
      content: string
      code?: string
      explanation?: string
    }[]
  }
}

const tutorials: Tutorial[] = [
  {
    id: 'python-basics',
    title: 'Python Basics for Data Science',
    description: 'Learn Python fundamentals with a focus on data science applications',
    language: 'python',
    difficulty: 'beginner',
    content: {
      steps: [
        {
          title: 'Variables and Data Types',
          content: 'Python uses variables to store data. Common data types include strings, numbers, and lists.',
          code: '# Creating variables\nname = "Alice"\nage = 25\ngrades = [85, 92, 78]\n\n# Printing variables\nprint(f"Name: {name}")\nprint(f"Age: {age}")\nprint(f"Grades: {grades}")',
          explanation: 'The f-string syntax (f"...") allows you to embed variables directly in strings.'
        },
        {
          title: 'Lists and Loops',
          content: 'Lists are used to store multiple items. Loops help you process each item.',
          code: '# Working with lists\ngrades = [85, 92, 78, 95, 88]\n\n# Calculate average using a loop\ntotal = 0\nfor grade in grades:\n    total += grade\n    \naverage = total / len(grades)\nprint(f"Average grade: {average:.2f}")',
          explanation: 'The for loop iterates through each grade, adding it to the total. len() gets the list length.'
        },
        {
          title: 'Dictionaries',
          content: 'Dictionaries store key-value pairs, perfect for structured data.',
          code: '# Creating a dictionary\nstudent = {\n    "name": "Bob",\n    "age": 20,\n    "major": "Computer Science",\n    "grades": [85, 92, 78]\n}\n\n# Accessing dictionary values\nprint(f"Student Name: {student[\'name\']}")\nprint(f"Major: {student[\'major\']}")\nprint(f"Average Grade: {sum(student[\'grades\'])/len(student[\'grades\']):.2f}")',
          explanation: 'Dictionary values are accessed using square brackets with the key name.'
        }
      ]
    }
  },
  {
    id: 'pandas-intro',
    title: 'Introduction to Pandas',
    description: 'Learn how to use pandas for data manipulation and analysis',
    language: 'python',
    difficulty: 'beginner',
    content: {
      steps: [
        {
          title: 'Creating DataFrames',
          content: 'DataFrames are the primary data structure in pandas, like spreadsheets.',
          code: 'import pandas as pd\nimport numpy as np\n\n# Create a DataFrame from a dictionary\ndata = {\n    "name": ["Alice", "Bob", "Charlie", "Diana"],\n    "age": [25, 30, 35, 28],\n    "city": ["New York", "London", "Paris", "Tokyo"]\n}\n\ndf = pd.DataFrame(data)\nprint("DataFrame:")\nprint(df)',
          explanation: 'DataFrames organize data in rows and columns, similar to a spreadsheet.'
        },
        {
          title: 'Basic Operations',
          content: 'Learn common DataFrame operations for data exploration.',
          code: '# Get basic information\nprint("\\nDataFrame Info:")\nprint(df.info())\n\n# Get summary statistics\nprint("\\nSummary Statistics:")\nprint(df.describe())\n\n# Select columns\nprint("\\nNames only:")\nprint(df[\'name\'])',
          explanation: 'info() shows data types and null values, while describe() provides statistical summaries.'
        }
      ]
    }
  }
]

export default function TutorialContainer() {
  const [selectedTutorial, setSelectedTutorial] = React.useState<Tutorial | null>(null)
  const [currentStep, setCurrentStep] = React.useState(0)

  const startTutorial = (tutorial: Tutorial) => {
    setSelectedTutorial(tutorial)
    setCurrentStep(0)
  }

  const nextStep = () => {
    if (selectedTutorial && currentStep < selectedTutorial.content.steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
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

  if (selectedTutorial) {
    const step = selectedTutorial.content.steps[currentStep]
    
    return (
      <div className="p-6">
        <div className="mb-6">
          <button
            onClick={() => setSelectedTutorial(null)}
            className="text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Back to tutorials
          </button>
          
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">{selectedTutorial.title}</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(selectedTutorial.difficulty)}`}>
              {selectedTutorial.difficulty}
            </span>
          </div>
          
          {/* Progress indicator */}
          <div className="flex items-center space-x-2 mb-6">
            {selectedTutorial.content.steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full ${
                  index <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Current step */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            Step {currentStep + 1}: {step.title}
          </h3>
          
          <p className="text-gray-700 mb-4">{step.content}</p>
          
          {step.code && (
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm mb-4">
              <pre className="whitespace-pre-wrap">{step.code}</pre>
            </div>
          )}
          
          {step.explanation && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
              <p className="text-blue-800">
                <strong>💡 Tip:</strong> {step.explanation}
              </p>
            </div>
          )}
          
          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {currentStep < selectedTutorial.content.steps.length - 1 ? (
              <button
                onClick={nextStep}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next Step
              </button>
            ) : (
              <button
                onClick={() => setSelectedTutorial(null)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Complete Tutorial
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Interactive Tutorials</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tutorials.map((tutorial) => (
          <div
            key={tutorial.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">
                {tutorial.language === 'python' ? '🐍' : '📊'}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(tutorial.difficulty)}`}>
                {tutorial.difficulty}
              </span>
            </div>
            
            <h3 className="font-semibold text-gray-800 mb-2">{tutorial.title}</h3>
            <p className="text-gray-600 text-sm mb-4">{tutorial.description}</p>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {tutorial.content.steps.length} steps
              </span>
              <button
                onClick={() => startTutorial(tutorial)}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                Start Tutorial →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}