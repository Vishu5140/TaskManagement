import { useState, useEffect } from 'react'
import { useAuth, useData } from '../store'
import { Plus, Pencil, Trash2, CheckCircle2, Circle, Timer, AlertTriangle, X } from 'lucide-react'

export default function Tasks() {
  const { currentUser } = useAuth()
  const { data, addTask, updateTask, deleteTask } = useData()
  const isAdmin = currentUser.role === 'admin'

  // show all for admin, own tasks for member
  const tasks = isAdmin ? data.tasks : data.tasks.filter(t => t.assignedTo === currentUser.id)

  // filters
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterProject, setFilterProject] = useState('all')

  // modal state
  const [show, setShow] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({
    title: '', desc: '', projectId: '', assignedTo: '',
    status: 'todo', priority: 'medium', dueDate: '',
  })

  // auto-mark overdue on mount
  useEffect(() => {
    tasks.forEach(t => {
      if (t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done') {
        updateTask(t.id, { status: 'overdue' })
      }
    })
  })

  // filtered list
  const filtered = tasks.filter(t => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false
    if (filterProject !== 'all' && t.projectId !== filterProject) return false
    return true
  })

  const userProjects = isAdmin ? data.projects : data.projects.filter(p => p.members.includes(currentUser.id))

  function getUserName(id) {
    return data.users.find(u => u.id === id)?.name || 'Unknown'
  }

  function getProjectName(id) {
    return data.projects.find(p => p.id === id)?.name || 'Unknown'
  }

  // status icons and colors
  const iconMap = {
    todo: <Circle className="w-4 h-4" />,
    'in-progress': <Timer className="w-4 h-4" />,
    done: <CheckCircle2 className="w-4 h-4" />,
    overdue: <AlertTriangle className="w-4 h-4" />,
  }

  const statusStyle = {
    todo: 'bg-slate-100 text-slate-600',
    'in-progress': 'bg-blue-100 text-blue-600',
    done: 'bg-green-100 text-green-600',
    overdue: 'bg-red-100 text-red-600',
  }

  const priorityStyle = {
    low: 'bg-green-100 text-green-600',
    medium: 'bg-amber-100 text-amber-600',
    high: 'bg-red-100 text-red-600',
  }

  function openNew() {
    setEditId(null)
    setForm({
      title: '', desc: '', projectId: data.projects[0]?.id || '',
      assignedTo: data.users[0]?.id || '',
      status: 'todo', priority: 'medium', dueDate: '',
    })
    setShow(true)
  }

  function openEdit(t) {
    setEditId(t.id)
    setForm({
      title: t.title, desc: t.description, projectId: t.projectId,
      assignedTo: t.assignedTo, status: t.status,
      priority: t.priority, dueDate: t.dueDate,
    })
    setShow(true)
  }

  function save() {
    if (!form.title.trim() || !form.projectId || !form.assignedTo || !form.dueDate) return
    const payload = {
      title: form.title,
      description: form.desc,
      projectId: form.projectId,
      assignedTo: form.assignedTo,
      status: form.status,
      priority: form.priority,
      dueDate: form.dueDate,
    }
    if (editId) updateTask(editId, payload)
    else addTask(payload)
    setShow(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
          <p className="text-slate-500 mt-1">{filtered.length} task{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors">
          <Plus className="w-5 h-5" /> New Task
        </button>
      </div>

      {/* filters */}
      <div className="flex flex-wrap gap-3">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="all">All Status</option>
          <option value="todo">Todo</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
          <option value="overdue">Overdue</option>
        </select>
        <select value={filterProject} onChange={e => setFilterProject(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="all">All Projects</option>
          {userProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {/* task list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
          <CheckCircle2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-700">No tasks found</h3>
          <p className="text-slate-500 mt-1">Create a task or adjust filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(t => (
            <div key={t.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${statusStyle[t.status]}`}>
                    {iconMap[t.status]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900">{t.title}</h3>
                    {t.description && <p className="text-sm text-slate-500 mt-1">{t.description}</p>}
                    <div className="flex flex-wrap items-center gap-3 mt-3 text-xs">
                      <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600">{getProjectName(t.projectId)}</span>
                      <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-600">{getUserName(t.assignedTo)}</span>
                      <span className={`px-2 py-1 rounded-full font-medium ${priorityStyle[t.priority]}`}>{t.priority}</span>
                      <span className="text-slate-400">{new Date(t.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isAdmin && (
                    <>
                      <button onClick={() => openEdit(t)} className="p-2 hover:bg-slate-100 rounded-lg">
                        <Pencil className="w-4 h-4 text-slate-400" />
                      </button>
                      <button onClick={() => { if (confirm('Delete?')) deleteTask(t.id) }} className="p-2 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </>
                  )}
                  {/* quick status change */}
                  <select value={t.status} onChange={e => updateTask(t.id, { status: e.target.value })}
                    className="px-2 py-1 text-xs border border-slate-300 rounded-lg focus:outline-none">
                    <option value="todo">Todo</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* modal */}
      {show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShow(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">{editId ? 'Edit Task' : 'New Task'}</h3>
              <button onClick={() => setShow(false)} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="Task title" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none" placeholder="Description..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
               
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Due Date *</label>
                  <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Assigned To *</label>
                  <select value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                    <option value="">Select</option>
                    {data.users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShow(false)} className="flex-1 py-2 border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-50">Cancel</button>
              <button onClick={save} className="flex-1 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium">{editId ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
