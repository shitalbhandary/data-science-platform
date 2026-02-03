declare global {
  interface Window {
    loadPyodide: (config?: any) => Promise<any>
  }
}

export {}