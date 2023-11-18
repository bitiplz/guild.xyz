import { useState } from "react"

const useLocalStoragePersistState = (value, path) => {
  const [state, setState] = useState(JSON.parse(localStorage.getItem(path)) || value)

  const updateState = (update) => {
    setState((st) => {
      const newVal = typeof update === "function" ? update(st) : update
      localStorage.setItem(path, JSON.stringify(newVal))
      return newVal
    })
  }

  return [state, updateState]
}

export default useLocalStoragePersistState
