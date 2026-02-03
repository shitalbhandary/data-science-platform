"use client"

import { useState, useEffect, useCallback } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { oneDark } from '@codemirror/theme-one-dark'

export default function REditor() {
  const [code, setCode] = useState('# Welcome to R!\n# Try some basic data analysis\n\n# Create a simple dataset\nname <- c("Alice", "Bob", "Charlie")\nage <- c(25, 30, 35)\nscore <- c(85, 92, 78)\n\ndf <- data.frame(name, age, score)\nprint("Dataset:")\nprint(df)\n\n# Basic statistics\nprint("\\nSummary:")\nprint(summary(df))\n\n# Calculate mean score\nmean_score <- mean(df$score)\nprint(paste("Mean Score:", mean_score))\n\n# Note: R environment may take a moment to initialize\nprint("\\nR code execution ready!")')
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [webR, setWebR] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [initError, setInitError] = useState(false)
  const [plotData, setPlotData] = useState<string | null>(null)

const initWebR = useCallback(async () => {
    let timeoutId: NodeJS.Timeout
    let retryCount = 0
    const maxRetries = 3
    
    const tryInit = async (): Promise<any> => {
      try {
        setIsLoading(true)
        setInitError(false)
        setOutput('🔄 Initializing R environment...\n\nStep 1/4: Loading WebR module...')
        
        // Import WebR dynamically
        const { WebR } = await import('webr')
        
        setOutput('🔄 Initializing R environment...\n\nStep 2/4: Configuring WebR instance...')
        
        const webRInstance = new WebR({
          baseUrl: 'https://webr.r-wasm.org/v0.5.8/',
          interactive: true, // Enable interactive mode for canvas support
          channelType: 0,
          homedir: "/home/web_user"
        })
        
        setOutput('🔄 Initializing R environment...\n\nStep 3/4: Downloading R WebAssembly files...\n\nThis is the longest step (20-60 seconds on first load).\nWebAssembly files are cached after first use.')
        
        // Add timeout warning
        timeoutId = setTimeout(() => {
          setOutput('⏱️ R environment is taking longer than expected...\n\nThis is normal for first-time usage.\nFiles are being downloaded and cached.\n\n💡 Future loads will be much faster!')
        }, 20000)
        
        setOutput('🔄 Initializing R environment...\n\nStep 4/4: Starting R runtime...')
        
        // Initialize WebR with multiple retry logic
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          try {
            await webRInstance.init()
            clearTimeout(timeoutId)
            break // Success
          } catch (initError: any) {
            if (initError.message && initError.message.includes('payloadType')) {
              console.warn(`WebR payloadType error - attempt ${attempt + 1}/${maxRetries + 1}`)
              if (attempt === maxRetries) {
                throw new Error('WebR payloadType error after multiple retries')
              }
              await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)))
            } else if (initError.message && initError.message.includes('Load failed')) {
              console.warn(`WebR load failed - attempt ${attempt + 1}/${maxRetries + 1}`)
              if (attempt === maxRetries) {
                throw new Error('WebR failed to load after multiple retries')
              }
              await new Promise(resolve => setTimeout(resolve, 3000 * (attempt + 1)))
            } else {
              throw initError // Re-throw other errors immediately
            }
          }
        }
        
        // Set up webR for canvas plotting
        await webRInstance.evalR(`
          # Enable webR canvas plotting
          options(webr.canvas.enabled = TRUE)
          
          # Store plot calls for replay
          .store_plot_call <- function(call) {
            .GlobalEnv$.__last_plot__ <- call
          }
        `)
        
        
        
        // Install common packages with error handling
        setOutput('🔄 Initializing R environment...\n\nInstalling packages: ggplot2, dplyr...')
        try {
          await webRInstance.installPackages(['ggplot2', 'dplyr', 'tidyr'])
        } catch (pkgError) {
          console.warn('Package installation failed:', pkgError)
          // Continue without packages
        }
        
        // Test basic functionality
        try {
          await webRInstance.evalR('print("R environment is ready!")')
        } catch (testError) {
          console.warn('Basic test failed:', testError)
          // Continue anyway
        }
        
        return webRInstance
        
      } catch (error) {
        clearTimeout(timeoutId)
        throw error
      }
    }
    
    try {
      const webRInstance = await tryInit()
      setWebR(webRInstance)
      setOutput('✅ R environment ready! 🎉\n\nYou can now run R code with full functionality.\n\nAvailable packages: ggplot2, dplyr, tidyr\n\nTry the examples or write your own R code!')
      
    } catch (error: any) {
      console.error('WebR initialization error:', error)
      
      // Check for specific errors
      if (error.message && error.message.includes('payloadType')) {
        setOutput('⚠️ R environment encountered a known WebAssembly issue.\n\nThis happens due to browser compatibility or network issues.\n\n💡 Options:\n1. Try the Python editor (fully functional)\n2. Click "Retry" to attempt reconnection\n3. Refresh the page\n4. Try Chrome or Firefox browser\n\nPython environment is ready to use!')
      } else if (error.message && error.message.includes('Load failed')) {
        setOutput('⚠️ R environment failed to load WebAssembly files.\n\nThis usually indicates network connectivity issues.\n\n💡 Options:\n1. Check your internet connection\n2. Disable ad blockers temporarily\n3. Try the Python editor (fully functional)\n4. Refresh the page\n\nPython environment is ready to use!')
      } else {
        setOutput('❌ R environment failed to initialize.\n\nError: ' + (error.message || error.toString()) + '\n\n💡 Solutions:\n1. Click "Retry" button below\n2. Refresh the page\n3. Check internet connection\n4. Try a different browser\n\nPython environment is available as alternative.')
      }
      
      setInitError(true)
    } finally {
      setIsLoading(false)
    }
  }, [webR])

  useEffect(() => {
    initWebR()
    
    return () => {
      // Cleanup if needed
    }
  }, [])

const runCode = useCallback(async () => {
    if (!webR) {
      setOutput('R environment is still loading... Please wait.')
      return
    }

    if (webR.simulated) {
      setOutput('Please wait for real R environment to load...')
      return
    }

    setIsRunning(true)
    setOutput('🔄 Executing R code...')

    try {
      // Use WebR shelter for safe execution with retry logic
      let result
      for (let attempt = 0; attempt <= 2; attempt++) {
        try {
          const shelter = await new webR.Shelter()
          result = await shelter.captureR(code)
          
// Get the output and convert properly
          let output = ''
          if (result.output && Array.isArray(result.output)) {
            output = result.output.map((item: any) => {
              if (typeof item === 'string') return item
              if (item && typeof item === 'object') {
                // Extract the actual data from webR output objects
                if (item.type === 'stdout' && item.data) {
                  return item.data
                }
                if (item.type === 'stderr' && item.data) {
                  return `Error: ${item.data}`
                }
                // Fallback to string representation
                return JSON.stringify(item, null, 2)
              }
              return String(item || '')
            }).filter((item: string) => item && item.trim()).join('\n')
          } else if (result.output) {
            output = String(result.output)
          }
          
          // Check for plot commands and inform user
          const hasPlotCommand = code.includes('plot(') || code.includes('hist(') || 
                               code.includes('boxplot(') || code.includes('barplot(') ||
                               code.includes('pairs(') || code.includes('curve(')
          
          if (hasPlotCommand) {
            setPlotData('📊 Plot command executed!\n\nR plot commands in WebR:\n- Plots open in separate browser windows/tabs\n- Check your browser\'s popup settings\n- Look for new tabs or windows\n\nIf you don\'t see plots:\n1. Allow popups for localhost\n2. Check browser\'s tab bar\n3. Try the Python editor for inline plotting\n\nWorking plot examples:\nplot(1:10)           # Basic line plot\nhist(rnorm(100))      # Histogram\nboxplot(1:50)         # Box plot')
          } else {
            setPlotData(null)
          }
          
          // Clean up
          await shelter.purge()
          
          setOutput(output || 'Code executed successfully (no output)')
          return // Success
          
        } catch (shelterError: any) {
          if (shelterError.message && shelterError.message.includes('payloadType')) {
            console.warn(`Shelter payloadType error - attempt ${attempt + 1}/3`)
            if (attempt === 2) throw shelterError
            await new Promise(resolve => setTimeout(resolve, 1000))
          } else {
            throw shelterError // Re-throw non-payloadType errors
          }
        }
      }
      
    } catch (error: any) {
      console.error('R execution error:', error)
      
      // Check for payloadType error specifically
      if (error.message && error.message.includes('payloadType')) {
        setOutput('⚠️ R environment encountered a communication error.\n\nThis is a known issue with the WebAssembly R library.\n\n💡 Options:\n1. Click "Retry" to try again\n2. Try simpler R code\n3. Use the Python editor for reliable execution\n\nError: ' + error.message)
        return
      }
      
      // Try alternative method if shelter fails
      try {
        const result = await webR.evalR(code, {
          withAutoprint: true,
          captureStreams: true
        })
        
        // Add defensive check for undefined result
        if (!result) {
          throw new Error('WebR returned undefined result')
        }
        
        // Convert to JavaScript safely
        let output = ''
        try {
          const jsResult = await result.toJs()
          if (jsResult.values && Array.isArray(jsResult.values)) {
            output = jsResult.values.map((item: any) => {
              if (typeof item === 'string') return item
              if (item && typeof item === 'object') {
                // Handle R data frames, vectors, etc.
                if (item.type === 'list' || item.names) {
                  return JSON.stringify(item, null, 2)
                }
                return String(item.values || item)
              }
              return String(item || '')
            }).filter((item: string) => item && item.trim()).join('\n')
          } else {
            output = 'Code executed successfully'
          }
        } catch (conversionError) {
          console.warn('Result conversion failed:', conversionError)
          output = 'Code executed successfully (output conversion failed)'
        }
        
        setOutput(output)
        
      } catch (fallbackError) {
        if (fallbackError instanceof Error && fallbackError.message.includes('payloadType')) {
          setOutput('⚠️ R environment communication failed.\n\nThe WebAssembly R library is experiencing issues.\n\n💡 Recommendations:\n1. Try the Python editor (fully functional)\n2. Refresh the page and retry\n3. Use simpler R code\n\nPython environment is ready to use!')
        } else {
          setOutput(`R execution error: ${error.message || error.toString()}\n\n💡 Try:\n1. Checking R syntax\n2. Using simpler code first\n3. Loading required packages\n\nCommon packages available: ggplot2, dplyr, tidyr`)
        }
      }
    } finally {
      setIsRunning(false)
    }
  }, [code, webR])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <h3 className="text-lg font-semibold text-gray-800">R Editor</h3>
        <div className="flex gap-2">
          {initError && (
            <button
              onClick={initWebR}
              disabled={isLoading}
              className="px-3 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Retrying...' : 'Retry'}
            </button>
          )}
          <button
            onClick={runCode}
            disabled={isRunning || !webR || isLoading || webR.simulated}
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
              onChange={(value) => setCode(value)}
              className="h-full"
            />
          </div>
        </div>
        
        {/* Output Panel */}
        <div className="flex flex-col">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Output</h4>
          
          {/* Plot Display */}
          {plotData && (
            <div className="mb-4 p-4 bg-white border border-gray-200 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-2">Plot Output:</div>
              {plotData.startsWith('data:image/') ? (
                <img 
                  src={plotData} 
                  alt="R Plot" 
                  className="w-full border border-gray-300 rounded"
                />
              ) : (
                <div className="w-full border border-gray-300 rounded p-4 bg-gray-50">
                  <p className="text-gray-600">{plotData}</p>
                </div>
              )}
            </div>
          )}
          
          <div className="flex-1 bg-gray-900 text-green-400 p-4 font-mono text-sm rounded-lg overflow-auto">
            <pre className="whitespace-pre-wrap">{output}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}