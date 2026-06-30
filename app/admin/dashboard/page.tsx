'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  SignOut,
  Car,
  MapPin,
  Clock,
  Phone,
  CheckCircle,
  Warning,
  Robot,
  X,
  ArrowsClockwise,
  ShieldCheck
} from '@phosphor-icons/react'

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

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  baru: { bg: 'linear-gradient(135deg, #fef2f2, #fee2e2)', text: '#dc2626', label: 'Baru' },
  proses: { bg: 'linear-gradient(135deg, #fffbeb, #fef3c7)', text: '#d97706', label: 'Proses' },
  selesai: { bg: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', text: '#16a34a', label: 'Selesai' }
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
      setTimeout(async () => {
        const { data: data2 } = await supabase.auth.getSession()
        if (!data2.session) router.push('/admin')
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
    await supabase.from('laporan').update({ status }).eq('id', id)
    fetchLaporan()
    setSelected(null)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin')
  }

  const filtered = filter === 'semua' ? laporan : laporan.filter(l => l.status === filter)

  const stats = {
    total: laporan.length,
    baru: laporan.filter(l => l.status === 'baru').length,
    proses: laporan.filter(l => l.status === 'proses').length,
    selesai: laporan.filter(l => l.status === 'selesai').length
  }

  return (
    <div className="min-h-screen" style={{ background: '#f8f8fa' }}>

      {/* Header */}
      <div className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 60%, #f97316 100%)',
          paddingBottom: '28px'
        }}
      >
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <div className="relative p-6 pt-8 flex justify-between items-start max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <ShieldCheck size={26} color="white" weight="fill" />
            <div>
              <h1 className="text-lg font-extrabold text-white" style={{ fontFamily: 'var(--font-plus-jakarta)' }}>
                Dashboard
              </h1>
              <p className="text-red-100 text-xs font-medium">Tim Pengawas ASK DOKB</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white"
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
          >
            <SignOut size={14} weight="bold" />
            Keluar
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 -mt-4 relative z-10 space-y-4">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Total', value: stats.total, grad: 'linear-gradient(135deg,#475569,#64748b)' },
            { label: 'Baru', value: stats.baru, grad: 'linear-gradient(135deg,#dc2626,#f97316)' },
            { label: 'Proses', value: stats.proses, grad: 'linear-gradient(135deg,#d97706,#f59e0b)' },
            { label: 'Selesai', value: stats.selesai, grad: 'linear-gradient(135deg,#16a34a,#22c55e)' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-3 text-center text-white"
              style={{ background: s.grad, boxShadow: '0 6px 16px rgba(0,0,0,0.12)' }}
            >
              <p className="text-xl font-extrabold">{s.value}</p>
              <p className="text-[10px] font-semibold opacity-90 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter + Refresh */}
        <div className="flex gap-2">
          <div className="flex gap-2 overflow-x-auto flex-1">
            {['semua', 'baru', 'proses', 'selesai'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all"
                style={filter === f ? {
                  background: 'linear-gradient(135deg, #dc2626, #f97316)',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(220,38,38,0.35)'
                } : {
                  background: 'white',
                  color: '#6b7280',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <button
            onClick={fetchLaporan}
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'white', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}
          >
            <ArrowsClockwise size={16} color="#dc2626" weight="bold" />
          </button>
        </div>

        {/* List */}
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm font-medium">⏳ Memuat laporan...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm font-medium">📭 Belum ada laporan</div>
        ) : (
          <div className="space-y-3">
            {filtered.map(l => {
              const style = STATUS_STYLE[l.status] || STATUS_STYLE.baru
              return (
                <div
                  key={l.id}
                  onClick={() => setSelected(l)}
                  className="bg-white rounded-2xl p-4 cursor-pointer active:scale-[0.98] transition-all"
                  style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg,#f97316,#dc2626)' }}
                      >
                        <Car size={18} color="white" weight="fill" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-800 text-sm">{l.platform}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                            style={{ background: style.bg, color: style.text }}
                          >
                            {style.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <MapPin size={11} weight="fill" /> {l.lokasi} • {l.jarak} km
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-extrabold" style={{ color: l.selisih > 0 ? '#dc2626' : '#16a34a' }}>
                        {l.selisih > 0 ? `-Rp${(l.selisih/1000).toFixed(0)}rb` : '✓ Sesuai'}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {new Date(l.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal Detail */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-t-3xl w-full max-h-[88vh] overflow-y-auto"
            style={{ animation: 'slideUp 0.3s ease-out' }}
          >
            <div className="sticky top-0 bg-white p-4 flex justify-between items-center border-b border-gray-100 rounded-t-3xl">
              <h2 className="font-extrabold text-gray-800">Detail Laporan</h2>
              <button onClick={() => setSelected(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: '#f3f4f6' }}
              >
                <X size={16} weight="bold" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Info Grid */}
              <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                {[
                  { icon: Car, label: 'Platform', value: selected.platform },
                  { icon: MapPin, label: 'Jarak', value: `${selected.jarak} km` },
                  { icon: Warning, label: 'Tarif diterima', value: `Rp ${selected.tarif_diterima.toLocaleString('id-ID')}`, color: '#dc2626' },
                  { icon: CheckCircle, label: 'Tarif seharusnya', value: `Rp ${selected.tarif_seharusnya.toLocaleString('id-ID')}`, color: '#16a34a' },
                  { icon: MapPin, label: 'Lokasi', value: selected.lokasi },
                  { icon: Clock, label: 'Waktu', value: new Date(selected.waktu_kejadian).toLocaleString('id-ID') },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 flex items-center gap-1.5 text-xs font-medium">
                      <item.icon size={14} weight="fill" /> {item.label}
                    </span>
                    <span className="font-bold text-gray-800" style={{ color: item.color }}>{item.value}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-500">SELISIH</span>
                  <span className="font-extrabold text-red-600">Rp {selected.selisih.toLocaleString('id-ID')}</span>
                </div>
                {selected.no_hp_driver && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 flex items-center gap-1.5 text-xs font-medium">
                      <Phone size={14} weight="fill" /> No. HP
                    </span>
                    <span className="font-bold text-gray-800">{selected.no_hp_driver}</span>
                  </div>
                )}
              </div>

              {/* AI Analysis */}
              {selected.analisis_ai && (
                <div className="rounded-2xl p-4" style={{ background: 'linear-gradient(135deg, #eff6ff, #eef2ff)' }}>
                  <p className="text-xs font-extrabold text-blue-700 mb-2 flex items-center gap-1.5">
                    <Robot size={16} weight="fill" /> Analisis AI
                  </p>
                  <p className="text-xs text-blue-600 leading-relaxed">{selected.analisis_ai}</p>
                </div>
              )}

              {/* Screenshots */}
              {selected.screenshots?.length > 0 && (
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-2">📸 Screenshot Bukti</p>
                  <div className="grid grid-cols-2 gap-2">
                    {selected.screenshots.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                        <img src={url} alt={`Screenshot ${i+1}`} className="w-full rounded-xl object-cover" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Update Status */}
              <div>
                <p className="text-sm font-bold text-gray-700 mb-2">Update Status</p>
                <div className="grid grid-cols-3 gap-2">
                  {['baru', 'proses', 'selesai'].map(s => {
                    const style = STATUS_STYLE[s]
                    const active = selected.status === s
                    return (
                      <button
                        key={s}
                        onClick={() => updateStatus(selected.id, s)}
                        className="py-2.5 rounded-xl text-xs font-bold transition-all"
                        style={active ? {
                          background: 'linear-gradient(135deg, #dc2626, #f97316)',
                          color: 'white',
                          boxShadow: '0 4px 12px rgba(220,38,38,0.35)'
                        } : { background: style.bg, color: style.text }}
                      >
                        {style.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  )
            }
