import { useState } from 'react'
import { useAuth, useData } from '../store'
import { Plus, Pencil, Trash2, FolderKanban, X, Users } from 'lucide-react'

export default function Projects() {
  const { currentUser } = useAuth()
  const { data, addProject, updateProject, deleteProject } = useData()

  const [show, setShow] = useState(false)
  const [editId, setEditId] = useState(null)
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [members, setMembers] = useState([])

  const isAdmin = currentUser.role === 'admin'
  const myProjects = isAdmin
    ? data.projects
    : data.projects.filter(p => p.members.includes(currentUser.id))

  const otherUsers = data.users.filter(u => u.id !== currentUser.id)
  const taskCount = (id) => data.tasks.filter(t => t.projectId === id).length

  function openNew() {
    setEditId(null)
    setName('')
    setDesc('')
    setMembers([])
    setShow(true)
  }

  function openEdit(p) {
    setEditId(p.id)
    setName(p.name)
    setDesc(p.description)
    setMembers(p.members.filter(m => m !== currentUser.id))
    setShow(true)
  }

  function save() {
    if (!name.trim()) return
    if (editId) {
      updateProject(editId, { name, description: desc, members: [currentUser.id, ...members] })
    } else {
      addProject(name, desc, members)
    }
    setShow(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="text-slate-500 mt-1">{myProjects.length} project{myProjects.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors">
          <Plus className="w-5 h-5" /> New Project
        </button>
      </div>

      {myProjects.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
          <FolderKanban className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-700">No projects yet</h3>
          <p className="text-slate-500 mt-1">Create your first project to get started</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myProjects.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                    <FolderKanban className="w-5 h-5 text-indigo-500" />
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(p)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <Pencil className="w-4 h-4 text-slate-400" />
                      </button>
                      <button onClick={() => { if (confirm('Delete this project?')) deleteProject(p.id) }} className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-slate-900 text-lg">{p.name}</h3>
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{p.description || 'No description'}</p>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <FolderKanban className="w-4 h-4" /> {taskCount(p.id)} tasks
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" /> {p.members.length} members
                  </span>
                </div>

                {/* member avatars */}
                <div className="mt-3 flex -space-x-2">
                  {p.members.slice(0, 4).map(mid => {
                    const u = data.users.find(x => x.id === mid)
                    return u ? (
                      <div key={mid} className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white" title={u.name}>
                        {u.name.charAt(0)}
                      </div>
                    ) : null
                  })}
                  {p.members.length > 4 && (
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold ring-2 ring-white">
                      +{p.members.length - 4}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* modal */}
      {show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShow(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">{editId ? 'Edit Project' : 'New Project'}</h3>
              <button onClick={() => setShow(false)} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Project Name *</label>
                <input value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="My Awesome Project" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none" placeholder="Project description..." />
              </div>
              {isAdmin && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Add Members</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto border border-slate-200 rounded-xl p-3">
                    {otherUsers.map(u => (
                      <label key={u.id} className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={members.includes(u.id)}
                          onChange={e => {
                            if (e.target.checked) setMembers([...members, u.id])
                            else setMembers(members.filter(m => m !== u.id))
                          }} className="w-4 h-4 text-indigo-500 rounded" />
                        <span className="text-sm text-slate-700">{u.name}</span>
                        <span className="text-xs text-slate-400 ml-auto">{u.role}</span>
                      </label>
                    ))}
                    {otherUsers.length === 0 && <p className="text-sm text-slate-400 text-center">No other users yet</p>}
                  </div>
                </div>
              )}
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
