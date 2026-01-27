"use client"

import React from 'react'
import CodeEditor from './CodeEditor'
import REditor from './REditor'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      className="h-full"
      {...other}
    >
      {value === index && <div className="h-full">{children}</div>}
    </div>
  )
}

export default function CodeEditorContainer() {
  const [activeTab, setActiveTab] = React.useState(0)

  const handleTabChange = (tabIndex: number) => {
    setActiveTab(tabIndex)
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-lg">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => handleTabChange(0)}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 0
              ? 'text-blue-600 border-blue-600 bg-blue-50'
              : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Python
        </button>
        <button
          onClick={() => handleTabChange(1)}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 1
              ? 'text-blue-600 border-blue-600 bg-blue-50'
              : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          R
        </button>
      </div>

      {/* Tab Panels */}
      <div className="flex-1">
        <TabPanel value={activeTab} index={0}>
          <CodeEditor />
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <REditor />
        </TabPanel>
      </div>
    </div>
  )
}