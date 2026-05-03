import { useAuth, useData } from '../store'
import { FolderKanban, CheckSquare, AlertTriangle, TrendingUp, Clock } from 'lucide-react'

export default function Dashboard() {
  const { currentUser } = useAuth()
  const { data } = useData()

  // admin sees all tasks, member only sees their own
  const myTasks = currentUser.role === 'admin'
    ? data.tasks
    : data.tasks.filter(t => t.assignedTo === currentUser.id)

  const stats = {
    total: myTasks.length,
    todo: myTasks.filter(t => t.status === 'todo').length,
    inProgress: myTasks.filter(t => t.status === 'in-progress').length,
    done: myTasks.filter(t => t.status === 'done').length,
    overdue: myTasks.filter(t => t.status === 'overdue').length,
  }

  const rate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0
  const overdueList = myTasks.filter(t => t.status === 'overdue')
  const recent = [...myTasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)

  function getUserName(id) {
    return data.users.find(u => u.id === id)?.name || 'Unknown'
  }

  function getProjectName(id) {
    return data.projects.find(p => p.id === id)?.name || 'Unknown'
  }

  const statusStyle = {
    todo: 'bg-slate-100 text-slate-700',
    'in-progress': 'bg-blue-100 text-blue-700',
    done: 'bg-green-100 text-green-700',
    overdue: 'bg-red-100 text-red-700',
  }

  const priorityStyle = {
    low: 'text-green-500',
    medium: 'text-amber-500',
    high: 'text-red-500',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome back, {currentUser.name}</p>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Tasks" value={stats.total} icon={FolderKanban} color="indigo" />
        <StatCard label="In Progress" value={stats.inProgress} icon={Clock} color="blue" />
        <StatCard label="Completed" value={stats.done} icon={CheckSquare} color="green" />
        <StatCard label="Overdue" value={stats.overdue} icon={AlertTriangle} color="red" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* completion rate */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4">Task Completion</h3>
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#6366f1" strokeWidth="10"
                  strokeDasharray={`${rate * 2.51} 251`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-slate-900">{rate}%</span>
              </div>
            </div>
            <div className="space-y-2 flex-1">
              <Row label="Todo" value={stats.todo} />
              <Row label="In Progress" value={stats.inProgress} />
              <Row label="Done" value={stats.done} />
            </div>
          </div>
        </div>

        {/* overdue */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4">Overdue Tasks</h3>
          {overdueList.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <TrendingUp className="w-10 h-10 mx-auto mb-2" />
              <p>All caught up!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {overdueList.slice(0, 4).map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                  <div>
                    <p className="font-medium text-slate-900 text-sm">{t.title}</p>
                    <p className="text-xs text-slate-500">{getProjectName(t.projectId)}</p>
                  </div>
                  <span className="text-xs text-red-600 font-medium">{new Date(t.dueDate).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* recent tasks table */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-4">Recent Tasks</h3>
        {recent.length === 0 ? (
          <p className="text-center py-8 text-slate-400">No tasks yet. Create a project to start!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b">
                  <th className="pb-3 font-medium">Task</th>
                  <th className="pb-3 font-medium hidden md:table-cell">Project</th>
                  <th className="pb-3 font-medium hidden md:table-cell">Assigned</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium hidden sm:table-cell">Priority</th>
                  <th className="pb-3 font-medium hidden lg:table-cell">Due</th>
                </tr>
              </thead>
              <tbody>
                {recent.map(t => (
                  <tr key={t.id} className="border-b last:border-0">
                    <td className="py-3 font-medium text-slate-900">{t.title}</td>
                    <td className="py-3 text-slate-500 hidden md:table-cell">{getProjectName(t.projectId)}</td>
                    <td className="py-3 text-slate-500 hidden md:table-cell">{getUserName(t.assignedTo)}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyle[t.status]}`}>{t.status}</span>
                    </td>
                    <td className="py-3 hidden sm:table-cell">
                      <span className={`text-xs font-medium capitalize ${priorityStyle[t.priority]}`}>{t.priority}</span>
                    </td>
                    <td className="py-3 text-slate-500 hidden lg:table-cell">{new Date(t.dueDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-500`} />
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  )
}
