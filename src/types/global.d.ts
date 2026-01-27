declare global {
  interface Window {
    loadPyodide: () => Promise<any>
  }
}

export {}