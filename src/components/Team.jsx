import { Navigate } from 'react-router-dom'
import { useAuth, useData } from '../store'
import { Mail, Shield, Crown } from 'lucide-react'

export default function Team() {
  const { currentUser } = useAuth()
  const { data } = useData()

  if (currentUser.role !== 'admin') {
    return <Navigate to="dashboard" />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Team</h1>
        <p className="text-slate-500 mt-1">{data.users.length} members</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.users.map(user => {
          const userTasks = data.tasks.filter(t => t.assignedTo === user.id)
          const userProjects = data.projects.filter(p => p.members.includes(user.id))
          const doneTasks = userTasks.filter(t => t.status === 'done').length
          const isAdmin = user.role === 'admin'

          return (
            <div key={user.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg text-white ${isAdmin ? 'bg-linear-to-br from-amber-400 to-orange-500' : 'bg-linear-to-br from-indigo-400 to-purple-500'}`}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900 truncate">{user.name}</h3>
                    {isAdmin && <Crown className="w-4 h-4 text-amber-500" />}
                  </div>
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${isAdmin ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                    {isAdmin ? <Shield className="w-3 h-3" /> : null}
                    {isAdmin ? 'Admin' : 'Member'}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <div className="text-center">
                    <p className="text-lg font-bold text-indigo-500">{userTasks.length}</p>
                    <p className="text-xs text-slate-400">Tasks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-500">{doneTasks}</p>
                    <p className="text-xs text-slate-400">Done</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-purple-500">{userProjects.length}</p>
                    <p className="text-xs text-slate-400">Projects</p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
