import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth, useData } from '../store'
import { LayoutDashboard, FolderKanban, CheckSquare, Users, LogOut, Shield, Menu, X } from 'lucide-react'

export default function Layout({ children }) {
  const { currentUser, logout } = useAuth()
  const { data } = useData()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!currentUser) {
    navigate('login')
    return null
  }

  const isAdmin = currentUser.role === 'admin'

  const navItems = [
    { path: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: 'projects', label: 'Projects', icon: FolderKanban },
    { path: 'tasks', label: 'Tasks', icon: CheckSquare },
    ...(isAdmin ? [{ path: 'team', label: 'Team', icon: Users }] : []),
  ]

  const overdueCount = data.tasks.filter(t => t.status === 'overdue').length

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg">TaskFlow</h1>
              <span className="text-xs text-slate-400">Team Manager</span>
            </div>
          </div>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* user info */}
        <div className="px-6 pb-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-400 to-purple-500 flex items-center justify-center font-bold text-sm">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{currentUser.name}</p>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${isAdmin ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                {isAdmin ? 'Admin' : 'Member'}
              </span>
            </div>
          </div>
        </div>

        {/* nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link key={item.path} to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                onClick={() => setSidebarOpen(false)}>
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* quick stats */}
        <div className="px-6 py-4 border-t border-slate-700">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-800 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-indigo-400">{data.tasks.length}</p>
              <p className="text-xs text-slate-400">Tasks</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-red-400">{overdueCount}</p>
              <p className="text-xs text-slate-400">Overdue</p>
            </div>
          </div>
        </div>

        {/* logout */}
        <div className="p-4 border-t border-slate-700">
          <button onClick={() => { logout(); navigate('login') }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-slate-800 w-full transition-colors">
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* main */}
      <main className="flex-1 overflow-auto">
        <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-slate-100">
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
          <h2 className="font-semibold text-slate-800">TaskFlow</h2>
        </header>
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
