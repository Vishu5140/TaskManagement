import { createContext, useContext, useState, useEffect } from 'react'

const KEY = 'taskflow_data'

function loadData() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : { users: [], projects: [], tasks: [] }
  } catch {
    return { users: [], projects: [], tasks: [] }
  }
}

function saveData(d) {
  localStorage.setItem(KEY, JSON.stringify(d))
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

const AuthCtx = createContext(null)
export function useAuth() {
  return useContext(AuthCtx)
}

const DataCtx = createContext(null)
export function useData() {
  return useContext(DataCtx)
}

export function AppProviders({ children }) {
  const [data, setData] = useState(loadData)
  const [currentUser, setCurrentUser] = useState(() => {
    const s = sessionStorage.getItem('taskflow_user')
    return s ? JSON.parse(s) : null
  })

  useEffect(() => { saveData(data) }, [data])

  function login(email, password) {
    const user = data.users.find(u => u.email === email && u.password === password)
    if (user) {
      setCurrentUser(user)
      sessionStorage.setItem('taskflow_user', JSON.stringify(user))
      return true
    }
    return false
  }

  function signup(name, email, password, role) {
    if (data.users.find(u => u.email === email)) return false
    const newUser = { id: genId(), name, email, password, role }
    setData(prev => ({ ...prev, users: [...prev.users, newUser] }))
    setCurrentUser(newUser)
    sessionStorage.setItem('taskflow_user', JSON.stringify(newUser))
    return true
  }

  function logout() {
    setCurrentUser(null)
    sessionStorage.removeItem('taskflow_user')
  }

  function addProject(name, desc, members) {
    if (!currentUser) return
    const p = {
      id: genId(), name, description: desc,
      createdBy: currentUser.id,
      members: [currentUser.id, ...members],
      createdAt: new Date().toISOString(),
    }
    setData(prev => ({ ...prev, projects: [...prev.projects, p] }))
  }

  function updateProject(id, updates) {
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === id ? { ...p, ...updates } : p)
    }))
  }

  function deleteProject(id) {
    setData(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== id),
      tasks: prev.tasks.filter(t => t.projectId !== id),
    }))
  }

  function addTask(task) {
    const t = { ...task, id: genId(), createdAt: new Date().toISOString() }
    setData(prev => ({ ...prev, tasks: [...prev.tasks, t] }))
  }

  function updateTask(id, updates) {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
    }))
  }

  function deleteTask(id) {
    setData(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== id) }))
  }

  function getAllUsers() {
    return data.users
  }

  return (
    <AuthCtx.Provider value={{ currentUser, login, signup, logout }}>
      <DataCtx.Provider value={{ data, addProject, updateProject, deleteProject, addTask, updateTask, deleteTask, getAllUsers }}>
        {children}
      </DataCtx.Provider>
    </AuthCtx.Provider>
  )
}
