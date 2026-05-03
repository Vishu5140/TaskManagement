import { useState } from 'react'
import { useAuth } from '../store'
import { Shield, Eye, EyeOff, UserPlus, LogIn } from 'lucide-react'

export default function Login() {
  const { login, signup } = useAuth()
  const [isSignup, setIsSignup] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('member')
  const [error, setError] = useState('')
  const [showPw, setShowPw] = useState(false)

  function submit(e) {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Fill all fields'); return }
    if (isSignup) {
      if (!name) { setError('Name is required'); return }
      if (!signup(name, email, password, role)) setError('Email already taken')
    } else {
      if (!login(email, password)) setError('Wrong email or password')
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500 mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">TaskFlow</h1>
          <p className="text-purple-300 mt-1">Team Task Manager</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-6">
            {isSignup ? 'Create Account' : 'Welcome Back'}
          </h2>

          <form onSubmit={submit} className="space-y-4">
            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-1">Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="John Doe" />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-purple-200 mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="you@example.com" />
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-200 mb-1">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-12"
                  placeholder="••••••••" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300 hover:text-white">
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">Role</label>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setRole('member')}
                    className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all ${role === 'member' ? 'border-indigo-500 bg-indigo-500/20 text-white' : 'border-white/20 text-purple-300'}`}>
                    Member
                  </button>
                  <button type="button" onClick={() => setRole('admin')}
                    className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all ${role === 'admin' ? 'border-indigo-500 bg-indigo-500/20 text-white' : 'border-white/20 text-purple-300'}`}>
                    Admin
                  </button>
                </div>
              </div>
            )}

            {error && <p className="text-red-400 text-sm bg-red-500/10 px-4 py-2 rounded-lg">{error}</p>}

            <button type="submit" className="w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold transition-colors flex items-center justify-center gap-2">
              {isSignup ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
              {isSignup ? 'Sign Up' : 'Login'}
            </button>
          </form>

          <p className="text-center mt-6 text-purple-300 text-sm">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button onClick={() => { setIsSignup(!isSignup); setError('') }} className="text-indigo-400 hover:text-indigo-300 font-medium">
              {isSignup ? 'Login' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
