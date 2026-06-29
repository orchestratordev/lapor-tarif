'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Laporan = {
  id: string
  platform: string
  jarak: number
  tarif_diterima: number
  tarif_seharusnya: number
  selisih: number
  lokasi: string
  waktu_kejadian: string
  no_hp_driver: string
  analisis_ai: string
  status: string
  screenshots: string[]
  created_at: string
}

const STATUS_COLOR: Record<string, string> = {
  baru: 'bg-red-100 text-red-600',
  proses: 'bg-yellow-100 text-yellow-600',
  selesai: 'bg-green-100 text-green-600'
}

export default function Dashboard() {
  const [laporan, setLaporan] = useState<Laporan[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('semua')
  const [selected, setSelected] = useState<Laporan | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchLaporan()
  }, [])

  const checkAuth = async () => {
    const { data } = await supabase.auth.getSession()
    if (!data.session) {
      // Tunggu sebentar, mungkin session masih loading
      setTimeout(async () => {
        const { data: data2 } = await supabase.auth.getSession()
        if (!data2.session) {
          router.push('/admin')
        }
      }, 1000)
    }
  }

  const fetchLaporan = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('laporan')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) setLaporan(data)
    setLoading(false)
  }

  const updateStatus = async (id: string, status: string) => {
    await supabase
      .from('laporan')
      .update({ status })
      .eq('id', id)
    fetchLaporan()
    setSelected(null)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin')
  }

  const filtered = filter === 'semua'
    ? laporan
    : laporan.filter(l => l.status === filter)

  const stats = {
    total: laporan.length,
    baru: laporan.filter(l => l.status === 'baru').length,
    proses: laporan.filter(l => l.status === 'proses').length,
    selesai: laporan.filter(l => l.status === 'selesai').length
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-red-600 text-white p-4">
        <div className="flex justify-between items-center max-w-2xl mx-auto">
          <div>
            <h1 className="font-bold">🚨 Dashboard Lapor Tarif</h1>
            <p className="text-xs text-red-100">Tim Pengawas ASK DOKB</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs bg-red-700 px-3 py-2 rounded-lg"
          >
            Keluar
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Total', value: stats.total, color: 'bg-gray-100 text-gray-700' },
            { label: 'Baru', value: stats.baru, color: 'bg-red-100 text-red-600' },
            { label: 'Proses', value: stats.proses, color: 'bg-yellow-100 text-yellow-600' },
            { label: 'Selesai', value: stats.selesai, color: 'bg-green-100 text-green-600' },
          ].map(s => (
            <div key={s.label} className={`${s.color} rounded-xl p-3 text-center`}>
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {['semua', 'baru', 'proses', 'selesai'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                filter === f
                  ? 'bg-red-500 text-white'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Refresh */}
        <button
          onClick={fetchLaporan}
          className="w-full bg-white border border-gray-200 text-gray-600 py-2 rounded-xl text-sm font-medium"
        >
          🔄 Refresh Laporan
        </button>

        {/* List Laporan */}
        {loading ? (
          <div className="text-center py-8 text-gray-400">
            ⏳ Memuat laporan...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            📭 Belum ada laporan
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(l => (
              <div
                key={l.id}
                onClick={() => setSelected(l)}
                className="bg-white rounded-2xl shadow p-4 cursor-pointer active:scale-95 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-800">{l.platform}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[l.status]}`}>
                        {l.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      📍 {l.lokasi} • 🚗 {l.jarak} km
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-600">
                      {l.selisih > 0
                        ? `-Rp ${l.selisih.toLocaleString('id-ID')}`
                        : '✅'
                      }
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(l.created_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Detail */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white rounded-t-2xl w-full max-h-[85vh] overflow-y-auto p-4 space-y-4">

            <div className="flex justify-between items-center">
              <h2 className="font-bold text-gray-800">Detail Laporan</h2>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 text-xl"
              >×</button>
            </div>

            {/* Info */}
            <div className="bg-gray-50 rounded-xl p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Platform</span>
                <span className="font-semibold">{selected.platform}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Jarak</span>
                <span className="font-semibold">{selected.jarak} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tarif diterima</span>
                <span className="font-semibold text-red-600">
                  Rp {selected.tarif_diterima.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tarif seharusnya</span>
                <span className="font-semibold text-green-600">
                  Rp {selected.tarif_seharusnya.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Selisih</span>
                <span className="font-bold text-red-600">
                  Rp {selected.selisih.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Lokasi</span>
                <span className="font-semibold">{selected.lokasi}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Waktu</span>
                <span className="font-semibold">
                  {new Date(selected.waktu_kejadian).toLocaleString('id-ID')}
                </span>
              </div>
              {selected.no_hp_driver && (
                <div className="flex justify-between">
                  <span className="text-gray-500">No. HP</span>
                  <span className="font-semibold">{selected.no_hp_driver}</span>
                </div>
              )}
            </div>

            {/* Analisis AI */}
            {selected.analisis_ai && (
              <div className="bg-blue-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-blue-700 mb-1">🤖 Analisis AI</p>
                <p className="text-xs text-blue-600">{selected.analisis_ai}</p>
              </div>
            )}

            {/* Screenshots */}
            {selected.screenshots && selected.screenshots.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">📸 Screenshot Bukti</p>
                <div className="grid grid-cols-2 gap-2">
                  {selected.screenshots.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                      <img
                        src={url}
                        alt={`Screenshot ${i + 1}`}
                        className="w-full rounded-xl object-cover"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Update Status */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Update Status</p>
              <div className="grid grid-cols-3 gap-2">
                {['baru', 'proses', 'selesai'].map(s => (
                  <button
                    key={s}
                    onClick={() => updateStatus(selected.id, s)}
                    className={`py-2 rounded-xl text-sm font-medium transition-all ${
                      selected.status === s
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
