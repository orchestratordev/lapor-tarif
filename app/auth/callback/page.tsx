'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleReset = async () => {
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setMessage('Gagal reset password!')
    } else {
      setMessage('Password berhasil diubah!')
      setTimeout(() => router.push('/admin'), 2000)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full">
        <h1 className="text-xl font-bold text-gray-800 mb-6 text-center">
          🔐 Reset Password
        </h1>
        <input
          type="password"
          placeholder="Password baru"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full border border-gray-200 rounded-xl py-3 px-4 text-sm mb-4 focus:outline-none focus:border-red-400"
        />
        {message && (
          <p className="text-sm text-center mb-4 text-green-600">{message}</p>
        )}
        <button
          onClick={handleReset}
          disabled={loading}
          className="w-full bg-red-600 text-white py-3 rounded-xl font-bold text-sm disabled:opacity-50"
        >
          {loading ? '⏳ Menyimpan...' : 'Simpan Password Baru'}
        </button>
      </div>
    </div>
  )
}
