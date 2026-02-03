'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { python } from '@codemirror/lang-python'
import { oneDark } from '@codemirror/theme-one-dark'

export default function CodeEditor() {
  const [code, setCode] = useState('# Welcome to Python Data Science!\n# Click "Run Code" to execute\n\nprint("Hello, Data Science!")\n\n# Try some basic operations\nimport numpy as np\nimport pandas as pd\n\n# Create a simple dataset\ndata = {\n    "name": ["Alice", "Bob", "Charlie"],\n    "age": [25, 30, 35],\n    "score": [85, 92, 78]\n}\n\ndf = pd.DataFrame(data)\nprint("Dataset:")\nprint(df)\n\n# Basic statistics\nprint("\\nBasic Statistics:")\nprint(df.describe())')
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [pyodide, setPyodide] = useState<any>(null)
  const pyodideRef = useRef<any>(null)
  const [loadedDatasets, setLoadedDatasets] = useState<string[]>([])
  const [isPythonLoading, setIsPythonLoading] = useState(false)
  const [pythonInitError, setPythonInitError] = useState(false)

  const initPyodide = useCallback(async () => {
    let timeoutId: NodeJS.Timeout | undefined
    
    try {
      setIsPythonLoading(true)
      setPythonInitError(false)
      setOutput('🐍 Initializing Python environment...\n\nStep 1/3: Loading Pyodide script...')
      
      const pyodideScript = document.createElement('script')
      pyodideScript.src = 'https://cdn.jsdelivr.net/pyodide/v0.29.2/full/pyodide.js'
      
      pyodideScript.onload = async () => {
        try {
          setOutput('🐍 Initializing Python environment...\n\nStep 2/3: Starting Pyodide instance...')
          
          // @ts-ignore
          const pyodideInstance = await window.loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.29.2/full/"
          })
          
          setOutput('🐍 Initializing Python environment...\n\nStep 3/3: Installing packages (numpy, pandas, matplotlib)...')
          
          await pyodideInstance.loadPackage(['numpy', 'pandas', 'matplotlib'])
          
          if (timeoutId) clearTimeout(timeoutId)
          setPyodide(pyodideInstance)
          pyodideRef.current = pyodideInstance
          setOutput('✅ Python environment ready! 🚀\n\nYou can now run Python code above!\n\nTry the examples or write your own code.')
          
        } catch (initError) {
          if (timeoutId) clearTimeout(timeoutId)
          setPythonInitError(true)
          console.error('Pyodide instance error:', initError)
          setOutput('❌ Python environment failed to initialize.\n\nThis might be due to:\n- Network connectivity issues\n- CDN server problems\n- Browser compatibility\n\n💡 Solutions:\n1. Click "Retry" button below\n2. Refresh the page\n3. Check your internet connection\n4. Try a different browser\n\nError details: ' + (initError instanceof Error ? initError.message : String(initError)))
        }
      }
      
      pyodideScript.onerror = (error: string | Event) => {
        if (timeoutId) clearTimeout(timeoutId)
        setPythonInitError(true)
        console.error('Pyodide script loading error:', error)
        setOutput('❌ Failed to load Pyodide script.\n\nThe Python environment could not be loaded.\n\nThis might be due to:\n- Network connectivity issues\n- CDN server problems\n- Ad blockers or firewall\n\n💡 Solutions:\n1. Click "Retry" button below\n2. Refresh the page\n3. Check your internet connection')
      }
      
      // Add timeout for script loading
      timeoutId = setTimeout(() => {
        if (!pyodideRef.current) {
          setOutput('⏱️ Python environment is taking longer than expected...\n\nThis usually happens on:\n- Slow internet connections\n- First-time visits (caching files)\n\n💡 Options:\n1. Wait a bit more (it often finishes)\n2. Click "Retry" button below\n3. Refresh the page\n4. Check your internet connection')
        }
      }, 20000) // 20 second timeout
      
      document.head.appendChild(pyodideScript)
      
    } catch (error) {
      if (timeoutId) clearTimeout(timeoutId)
      setPythonInitError(true)
      console.error('Pyodide initialization error:', error)
      setOutput('❌ Error loading Python environment.\n\nPlease refresh the page and try again.\n\nTechnical details: ' + (error instanceof Error ? error.message : String(error)))
    } finally {
      setIsPythonLoading(false)
    }
  }, [])

  useEffect(() => {
    initPyodide()
  }, [])

  const loadDataset = useCallback(async (datasetName: string) => {
    if (!pyodideRef.current) return
    
    let csvData = ''
    try {
      const response = await fetch(`/datasets/${datasetName}.csv`)
      csvData = await response.text()
      
      // Build Python code string properly
      const pythonCode = `import pandas as pd
from io import StringIO

# Load CSV data
csv_data = """${csvData}"""
df = pd.read_csv(StringIO(csv_data))

# Store in global namespace for user to access
globals()['${datasetName}_data'] = df
# Store CSV data for persistence
globals()['${datasetName}_csv'] = """${csvData}"""
print("Dataset '${datasetName}' loaded successfully!")
print("Shape:", df.shape)
print("Columns:", list(df.columns))
print("\\nFirst 5 rows:")
print(df.head())
      `

      // Redirect Python stdout to capture output
      pyodideRef.current.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
      `)

      // Execute Python code
      pyodideRef.current.runPython(pythonCode)

      // Capture output
      const output = pyodideRef.current.runPython(`
output = sys.stdout.getvalue()
sys.stdout = sys.__stdout__
output
      `)

      setOutput(output || 'Code executed successfully (no output)')
      
      // Add to loaded datasets
      setLoadedDatasets(prev => [...prev, datasetName])
    } catch (error: any) {
      console.error('Dataset loading error:', error)
      setOutput(`Error loading dataset: ${error.message}`)
    }
  }, [])

  const clearEnvironment = useCallback(() => {
    if (pyodideRef.current) {
      setOutput('Python environment cleared! 🔄\n\nYou can now start fresh with your code.')
      pyodideRef.current.runPython(`
import sys
import pandas as pd
import numpy as np
# Clear all user-defined variables except datasets
current_globals = [name for name in globals() if not name.startswith('_') and not name.endswith('_data')]
for var_name in current_globals:
    del globals()[var_name]
print("Environment cleared. Ready for fresh start!")
      `)
    }
  }, [])

  const runCode = useCallback(async () => {
    if (!pyodideRef.current) {
      setOutput('Python environment is still loading... Please wait.')
      return
    }

    setIsRunning(true)
    setOutput('Running code...')

    try {
      // Redirect Python stdout to capture output
      pyodideRef.current.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
      `)

      try {
        // Restore any loaded datasets from stored CSV data
        pyodideRef.current.runPython(`
import pandas as pd
from io import StringIO
# Restore datasets from stored CSV data
for name in list(globals().keys()):
  if name.endswith('_csv'):
    dataset_name = name[:-4]  # Remove '_csv' suffix
    csv_data = globals()[name]
    df = pd.read_csv(StringIO(csv_data))
    globals()[f'{dataset_name}_data'] = df
        `)

        // Check if user is trying to access dataset data that doesn't exist
        if (code.includes('_data') && !pyodideRef.current.runPython(`[name for name in globals() if name.endswith('_data')]`).length) {
          setOutput('Error: Dataset not found. Please load a dataset first using the buttons above (Load Iris, Load Sales, or Load Students).')
        } else {
          // Run user code
          pyodideRef.current.runPython(code)

          // Capture output
          const output = pyodideRef.current.runPython(`
output = sys.stdout.getvalue()
sys.stdout = sys.__stdout__
output
          `)

          setOutput(output || 'Code executed successfully (no output)')
        }
      } catch (error: any) {
        console.error('Code execution error:', error)
        if (error.message && error.message.includes('_data')) {
          setOutput(`Error: Dataset not found. Please load a dataset first using the buttons above.\n\nOriginal error: ${error.message}`)
        } else {
          setOutput(`Error: ${error.message || error.toString()}`)
        }
      }
    } catch (error: any) {
      setOutput(`Error: ${error.message}`)
      console.error('Code execution error:', error)
    } finally {
      setIsRunning(false)
    }
  }, [code])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <h3 className="text-lg font-semibold text-gray-800">Python Editor</h3>
        
        <div className="flex gap-2">
          {/* Dataset Loading Buttons */}
          <div className="flex gap-2 mr-4">
            <button
              onClick={() => loadDataset('iris')}
              disabled={!pyodideRef.current}
              className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Load Iris
            </button>
            <button
              onClick={() => loadDataset('sales')}
              disabled={!pyodideRef.current}
              className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Load Sales
            </button>
            <button
              onClick={() => loadDataset('students')}
              disabled={!pyodideRef.current}
              className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Load Students
            </button>
          </div>
        <button
          onClick={clearEnvironment}
          disabled={!pyodideRef.current || isPythonLoading}
          className="px-3 py-2 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors mr-2"
        >
          Clear
        </button>
        <button
          onClick={runCode}
          disabled={isRunning || !pyodideRef.current || isPythonLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isRunning ? 'Running...' : 'Run Code'}
        </button>
        </div>
      </div>
      
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
        {/* Code Editor */}
        <div className="flex flex-col">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Code</h4>
          <div className="flex-1 border border-gray-300 rounded-lg overflow-hidden">
            <CodeMirror
              value={code}
              height="100%"
              theme={oneDark}
              extensions={[python()]}
              onChange={(value) => setCode(value)}
              className="h-full"
            />
          </div>
        </div>
        
        {/* Output */}
        <div className="flex flex-col">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Output</h4>
          <div className="flex-1 bg-gray-900 text-green-400 p-4 font-mono text-sm rounded-lg overflow-auto">
            <pre className="whitespace-pre-wrap">{output}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}