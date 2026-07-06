'use client'

import { useState, useEffect, useRef } from 'react'
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
  ShieldCheck,
  FilePdf,
  FileXls,
  Printer,
  ChartBar
} from '@phosphor-icons/react'

type Laporan = {
  id: string
  platform: string
  jenis_pelapor: string
  nama: string
  jarak: number
  tarif_diterima: number
  tarif_seharusnya: number
  selisih: number
  lokasi: string
  waktu_kejadian: string
  no_hp_driver: string
  analisis_ai: string
  status: string
  catatan: string
  screenshots: string[]
  created_at: string
}

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  baru:           { bg: 'linear-gradient(135deg,#fef2f2,#fee2e2)', text: '#dc2626', label: 'Baru' },
  terverifikasi:  { bg: 'linear-gradient(135deg,#eff6ff,#dbeafe)', text: '#2563eb', label: 'Terverifikasi' },
  dilaporkan:     { bg: 'linear-gradient(135deg,#fffbeb,#fef3c7)', text: '#d97706', label: 'Dilaporkan' },
  ditindaklanjuti:{ bg: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', text: '#16a34a', label: 'Ditindaklanjuti' },
}

const fmtRp = (n: number) => 'Rp ' + (n || 0).toLocaleString('id-ID')
const fmtDate = (s: string) => new Date(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
const fmtDateTime = (s: string) => new Date(s).toLocaleString('id-ID')

export default function Dashboard() {
  const [laporan,   setLaporan]   = useState<Laporan[]>([])
  const [loading,   setLoading]   = useState(true)
  const [filter,    setFilter]    = useState('semua')
  const [selected,  setSelected]  = useState<Laporan | null>(null)
  const [catatan,   setCatatan]   = useState('')
  const [exporting, setExporting] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const router = useRouter()
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => { checkAuth(); fetchLaporan() }, [])

  const checkAuth = async () => {
    const { data } = await supabase.auth.getSession()
    if (!data.session) {
      setTimeout(async () => {
        const { data: d2 } = await supabase.auth.getSession()
        if (!d2.session) router.push('/admin')
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
    await supabase.from('laporan').update({ status, tanggal_status_update: new Date().toISOString() }).eq('id', id)
    fetchLaporan()
    setSelected(null)
  }

  const simpanCatatan = async (id: string, text: string) => {
    await supabase.from('laporan').update({ catatan: text, tanggal_status_update: new Date().toISOString() }).eq('id', id)
    fetchLaporan()
  }

  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/admin') }

  const filtered = filter === 'semua' ? laporan : laporan.filter(l => l.status === filter)

  const stats = {
    total:           laporan.length,
    baru:            laporan.filter(l => l.status === 'baru').length,
    terverifikasi:   laporan.filter(l => l.status === 'terverifikasi').length,
    dilaporkan:      laporan.filter(l => l.status === 'dilaporkan').length,
    ditindaklanjuti: laporan.filter(l => l.status === 'ditindaklanjuti').length,
    totalSelisih:    laporan.reduce((s, l) => s + (l.selisih || 0), 0),
    driver:          laporan.filter(l => l.jenis_pelapor === 'driver').length,
    masyarakat:      laporan.filter(l => l.jenis_pelapor === 'masyarakat').length,
  }

  // Platform stats
  const platformMap: Record<string, number> = {}
  laporan.forEach(l => { platformMap[l.platform] = (platformMap[l.platform] || 0) + 1 })

  // Kota stats
  const kotaMap: Record<string, number> = {}
  laporan.forEach(l => { kotaMap[l.lokasi] = (kotaMap[l.lokasi] || 0) + 1 })
  const kotaSorted = Object.entries(kotaMap).sort((a, b) => b[1] - a[1])

  // 7-day chart
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i))
    const ds = d.toDateString()
    const count = laporan.filter(l => new Date(l.created_at).toDateString() === ds).length
    const days = ['Min','Sen','Sel','Rab','Kam','Jum','Sab']
    return { label: days[d.getDay()], count, isToday: i === 6 }
  })
  const maxChart = Math.max(...chartData.map(c => c.count), 1)

  // ── Export CSV ──────────────────────────────────────────────────────────────
  const exportCSV = () => {
    const rows = [
      ['Tanggal','Jenis Pelapor','Nama','Platform','Jarak (km)','Tarif Diterima','Tarif Seharusnya','Selisih','Lokasi','Status','Waktu Kejadian'],
      ...laporan.map(r => [
        fmtDate(r.created_at),
        r.jenis_pelapor || 'driver',
        r.nama || '-',
        r.platform,
        r.jarak,
        r.tarif_diterima,
        r.tarif_seharusnya,
        r.selisih,
        r.lokasi,
        STATUS_STYLE[r.status]?.label || r.status,
        fmtDateTime(r.waktu_kejadian)
      ])
    ]
    const csv  = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `rekap-laporan-askkalsel-${new Date().toISOString().slice(0,10)}.csv`
    document.body.appendChild(a); a.click(); a.remove()
    URL.revokeObjectURL(url)
    setShowExportMenu(false)
  }

  // ── Export PDF (print) ──────────────────────────────────────────────────────
  const exportPDF = () => {
    setExporting(true)
    setShowExportMenu(false)
    setTimeout(() => {
      window.print()
      setExporting(false)
    }, 400)
  }

  return (
    <>
      {/* Print Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #print-area, #print-area * { visibility: visible !important; }
          #print-area { position: fixed !important; top: 0; left: 0; width: 100%; padding: 20px; background: white !important; }
          .no-print { display: none !important; }
        }
        @page { margin: 15mm; size: A4 portrait; }
      `}</style>

      {/* ── PRINT AREA ─────────────────────────────────────────────────────── */}
      <div id="print-area" ref={printRef} style={{ display: exporting ? 'block' : 'none', background: '#fff', padding: 24 }}>
        {/* Header PDF */}
        <div style={{ borderBottom: '3px solid #dc2626', paddingBottom: 14, marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 800, color: '#b91c1c', margin: 0 }}>
                REKAP LAPORAN TARIF ASK
              </h1>
              <p style={{ fontSize: 12, color: '#374151', margin: '4px 0 0' }}>
                Sistem Pelaporan dan Monitoring Angkutan Sewa Khusus Berbasis Data
              </p>
            </div>
            <div style={{ textAlign: 'right', fontSize: 11, color: '#6b7280' }}>
              <p style={{ margin: 0, fontWeight: 700 }}>DOKB — Kalimantan Selatan</p>
              <p style={{ margin: '2px 0 0' }}>Dicetak: {new Date().toLocaleString('id-ID')}</p>
              <p style={{ margin: '2px 0 0' }}>lapor.dokb.or.id</p>
            </div>
          </div>
          <p style={{ fontSize: 11, color: '#6b7280', margin: '10px 0 0' }}>
            Berdasarkan SK Gubernur Kalsel No. 100.3.3.1/0991/KUM/2025 •
            Flagfall Rp 16.000 (0–3 km) + Rp 4.000/km • NET to Driver
          </p>
        </div>

        {/* Summary Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Total Laporan', value: stats.total, color: '#374151' },
            { label: 'Total Selisih Tarif', value: fmtRp(stats.totalSelisih), color: '#dc2626' },
            { label: 'Laporan Driver', value: stats.driver, color: '#2563eb' },
            { label: 'Laporan Masyarakat', value: stats.masyarakat, color: '#7c3aed' },
          ].map((s, i) => (
            <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 12px', background: '#f9f9fb' }}>
              <p style={{ fontSize: 10, color: '#6b7280', margin: 0, fontWeight: 600 }}>{s.label}</p>
              <p style={{ fontSize: 16, fontWeight: 800, color: s.color, margin: '4px 0 0' }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Status Breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 20 }}>
          {[
            { label: 'Baru', value: stats.baru, color: '#dc2626' },
            { label: 'Terverifikasi', value: stats.terverifikasi, color: '#2563eb' },
            { label: 'Dilaporkan', value: stats.dilaporkan, color: '#d97706' },
            { label: 'Ditindaklanjuti', value: stats.ditindaklanjuti, color: '#16a34a' },
          ].map((s, i) => (
            <div key={i} style={{ border: `1px solid ${s.color}30`, borderRadius: 8, padding: '8px 12px', background: `${s.color}08` }}>
              <p style={{ fontSize: 10, color: s.color, margin: 0, fontWeight: 700 }}>{s.label}</p>
              <p style={{ fontSize: 18, fontWeight: 800, color: s.color, margin: '2px 0 0' }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Platform Breakdown */}
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, color: '#374151', margin: '0 0 8px', borderBottom: '1px solid #e5e7eb', paddingBottom: 4 }}>
            Sebaran per Platform
          </h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {Object.entries(platformMap).map(([p, c]) => (
              <div key={p} style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '6px 12px', fontSize: 12 }}>
                <strong>{p}</strong>: {c} laporan
              </div>
            ))}
          </div>
        </div>

        {/* Kota Breakdown */}
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, color: '#374151', margin: '0 0 8px', borderBottom: '1px solid #e5e7eb', paddingBottom: 4 }}>
            Sebaran per Kota/Kabupaten
          </h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {kotaSorted.map(([kota, count]) => (
              <div key={kota} style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '6px 12px', fontSize: 12 }}>
                <strong>{kota}</strong>: {count} laporan
              </div>
            ))}
          </div>
        </div>

        {/* Table */}
        <h3 style={{ fontSize: 12, fontWeight: 700, color: '#374151', margin: '0 0 8px', borderBottom: '1px solid #e5e7eb', paddingBottom: 4 }}>
          Detail Semua Laporan ({laporan.length} total)
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
          <thead>
            <tr style={{ background: '#b91c1c', color: '#fff' }}>
              {['No','Tanggal','Pelapor','Platform','Jarak','Diterima','Seharusnya','Selisih','Lokasi','Status'].map(h => (
                <th key={h} style={{ padding: '6px 6px', textAlign: 'left', fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {laporan.map((r, i) => (
              <tr key={r.id} style={{ background: i % 2 === 0 ? '#fff' : '#f9f9fb', borderBottom: '1px solid #f0f1f4' }}>
                <td style={{ padding: '5px 6px' }}>{i + 1}</td>
                <td style={{ padding: '5px 6px', whiteSpace: 'nowrap' }}>{fmtDate(r.created_at)}</td>
                <td style={{ padding: '5px 6px', textTransform: 'capitalize' }}>{r.jenis_pelapor || 'driver'}</td>
                <td style={{ padding: '5px 6px', fontWeight: 600 }}>{r.platform}</td>
                <td style={{ padding: '5px 6px' }}>{r.jarak} km</td>
                <td style={{ padding: '5px 6px' }}>{fmtRp(r.tarif_diterima)}</td>
                <td style={{ padding: '5px 6px' }}>{fmtRp(r.tarif_seharusnya)}</td>
                <td style={{ padding: '5px 6px', color: '#dc2626', fontWeight: 700 }}>-{fmtRp(r.selisih)}</td>
                <td style={{ padding: '5px 6px' }}>{r.lokasi}</td>
                <td style={{ padding: '5px 6px' }}>
                  <span style={{ color: STATUS_STYLE[r.status]?.text || '#374151', fontWeight: 700 }}>
                    {STATUS_STYLE[r.status]?.label || r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer PDF */}
        <div style={{ marginTop: 24, borderTop: '1px solid #e5e7eb', paddingTop: 12, fontSize: 10, color: '#9ca3af', display: 'flex', justifyContent: 'space-between' }}>
          <span>Dokumen ini diterbitkan oleh Tim Pengawas ASK Provinsi Kalimantan Selatan</span>
          <span>Didukung sistem pelaporan oleh DOKB — lapor.dokb.or.id</span>
        </div>
      </div>

      {/* ── DASHBOARD UI ───────────────────────────────────────────────────── */}
      <div className="min-h-screen no-print" style={{ background: '#f8f8fa' }}>

        {/* Header */}
        <div className="relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#b91c1c 0%,#dc2626 60%,#f97316 100%)', paddingBottom: 28 }}
        >
          <div className="relative p-6 pt-8 flex justify-between items-center max-w-2xl mx-auto">
            <div className="flex items-center gap-2">
              <ShieldCheck size={26} color="white" weight="fill" />
              <div>
                <h1 className="text-lg font-extrabold text-white" style={{ fontFamily: 'var(--font-plus-jakarta)' }}>
                  Dashboard Lapor Tarif
                </h1>
                <p className="text-red-100 text-xs font-medium">Tim Pengawas ASK DOKB</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Export Menu Button */}
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white"
                  style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
                >
                  <Printer size={14} weight="bold" />
                  Cetak
                </button>
                {showExportMenu && (
                  <div className="absolute right-0 top-10 bg-white rounded-2xl overflow-hidden z-50"
                    style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.15)', width: 180 }}
                  >
                    <button onClick={exportPDF}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all"
                    >
                      <FilePdf size={18} color="#dc2626" weight="fill" />
                      Export PDF
                    </button>
                    <div style={{ height: 1, background: '#f3f4f6' }} />
                    <button onClick={exportCSV}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all"
                    >
                      <FileXls size={18} color="#16a34a" weight="fill" />
                      Export CSV
                    </button>
                  </div>
                )}
              </div>
              <button onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white"
                style={{ background: 'rgba(255,255,255,0.15)' }}
              >
                <SignOut size={14} weight="bold" />
                Keluar
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto p-4 -mt-4 relative z-10 space-y-4">

          {/* Stats Grid */}
          <div className="grid grid-cols-5 gap-1.5">
            {[
              { label: 'Total', value: stats.total, grad: 'linear-gradient(135deg,#475569,#64748b)' },
              { label: 'Baru', value: stats.baru, grad: 'linear-gradient(135deg,#dc2626,#f97316)' },
              { label: 'Verif', value: stats.terverifikasi, grad: 'linear-gradient(135deg,#2563eb,#3b82f6)' },
              { label: 'Lapor', value: stats.dilaporkan, grad: 'linear-gradient(135deg,#d97706,#f59e0b)' },
              { label: 'Selesai', value: stats.ditindaklanjuti, grad: 'linear-gradient(135deg,#16a34a,#22c55e)' },
            ].map(s => (
              <div key={s.label} className="rounded-2xl p-2 text-center text-white"
                style={{ background: s.grad, boxShadow: '0 6px 16px rgba(0,0,0,0.12)' }}
              >
                <p className="text-lg font-extrabold">{s.value}</p>
                <p className="text-[9px] font-semibold opacity-90 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Total Selisih */}
          <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500 font-medium">Total Selisih Tarif Terlapor</p>
                <p className="text-2xl font-extrabold text-red-600 mt-1">{fmtRp(stats.totalSelisih)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Driver: <span className="font-bold text-blue-600">{stats.driver}</span></p>
                <p className="text-xs text-gray-500">Masyarakat: <span className="font-bold text-purple-600">{stats.masyarakat}</span></p>
              </div>
            </div>
          </div>

          {/* Mini Chart */}
          <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
            <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <ChartBar size={16} color="#dc2626" weight="fill" />
              Laporan 7 Hari Terakhir
            </p>
            <div className="flex items-end gap-2" style={{ height: 60 }}>
              {chartData.map((c, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  {c.count > 0 && (
                    <span className="text-[9px] font-bold" style={{ color: c.isToday ? '#dc2626' : '#9ca3af' }}>{c.count}</span>
                  )}
                  <div className="w-full rounded-t-md transition-all"
                    style={{
                      height: `${Math.max((c.count / maxChart) * 40, 3)}px`,
                      background: c.isToday ? 'linear-gradient(180deg,#dc2626,#f97316)' : '#f0e6dc'
                    }}
                  />
                  <span className="text-[9px] font-bold" style={{ color: c.isToday ? '#dc2626' : '#9ca3af' }}>{c.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Filter + Refresh */}
          <div className="flex gap-2">
            <div className="flex gap-2 overflow-x-auto flex-1">
              {['semua', 'baru', 'terverifikasi', 'dilaporkan', 'ditindaklanjuti'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className="px-3 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all"
                  style={filter === f ? {
                    background: 'linear-gradient(135deg,#dc2626,#f97316)',
                    color: 'white', boxShadow: '0 4px 12px rgba(220,38,38,0.35)'
                  } : { background: 'white', color: '#6b7280', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}
                >
                  {f === 'semua' ? 'Semua' : STATUS_STYLE[f]?.label}
                </button>
              ))}
            </div>
            <button onClick={fetchLaporan}
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'white', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}
            >
              <ArrowsClockwise size={16} color="#dc2626" weight="bold" />
            </button>
          </div>

          {/* List */}
          {loading ? (
            <div className="text-center py-12 text-gray-400 text-sm">⏳ Memuat laporan...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">📭 Belum ada laporan</div>
          ) : (
            <div className="space-y-3">
              {filtered.map(l => {
                const style = STATUS_STYLE[l.status] || STATUS_STYLE.baru
                return (
                  <div key={l.id}
                    onClick={() => { setSelected(l); setCatatan(l.catatan || '') }}
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
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-gray-800 text-sm">{l.platform}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                              style={{ background: style.bg, color: style.text }}
                            >{style.label}</span>
                            {l.jenis_pelapor === 'masyarakat' && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                                style={{ background: '#ede9fe', color: '#7c3aed' }}
                              >Masyarakat</span>
                            )}
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
      </div>

      {/* Modal Detail */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end no-print" style={{ background: 'rgba(0,0,0,0.5)' }}>
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
              {/* Info */}
              <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                {[
                  { icon: Car, label: 'Platform', value: selected.platform },
                  { icon: Car, label: 'Jenis Pelapor', value: selected.jenis_pelapor === 'masyarakat' ? '👥 Masyarakat' : '🚗 Driver' },
                  selected.nama && { icon: Car, label: 'Nama', value: selected.nama },
                  { icon: MapPin, label: 'Jarak', value: `${selected.jarak} km` },
                  { icon: Warning, label: 'Tarif diterima', value: fmtRp(selected.tarif_diterima), color: '#dc2626' },
                  { icon: CheckCircle, label: 'Tarif seharusnya', value: fmtRp(selected.tarif_seharusnya), color: '#16a34a' },
                  { icon: MapPin, label: 'Lokasi', value: selected.lokasi },
                  { icon: Clock, label: 'Waktu', value: fmtDateTime(selected.waktu_kejadian) },
                  selected.no_hp_driver && { icon: Phone, label: 'No. HP', value: selected.no_hp_driver },
                ].filter(Boolean).map((item: any, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 text-xs font-medium">{item.label}</span>
                    <span className="font-bold text-gray-800" style={{ color: item.color }}>{item.value}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-500">SELISIH</span>
                  <span className="font-extrabold text-red-600">{fmtRp(selected.selisih)}</span>
                </div>
              </div>

              {/* AI Analysis */}
              {selected.analisis_ai && (
                <div className="rounded-2xl p-4" style={{ background: 'linear-gradient(135deg,#eff6ff,#eef2ff)' }}>
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
                        <img src={url} alt="" className="w-full rounded-xl object-cover" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Catatan */}
              <div>
                <p className="text-sm font-bold text-gray-700 mb-2">📝 Catatan Tindak Lanjut</p>
                <textarea value={catatan} onChange={e => setCatatan(e.target.value)}
                  placeholder="Tulis catatan progress, nomor surat, atau hasil koordinasi..."
                  rows={3}
                  className="w-full rounded-xl p-3 text-sm focus:outline-none"
                  style={{ background: '#f8f8fa', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                />
                <button onClick={() => simpanCatatan(selected.id, catatan)}
                  className="mt-2 w-full py-2.5 rounded-xl text-xs font-bold text-white"
                  style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)' }}
                >
                  💾 Simpan Catatan
                </button>
              </div>

              {/* Update Status */}
              <div>
                <p className="text-sm font-bold text-gray-700 mb-2">Update Status</p>
                <div className="grid grid-cols-2 gap-2">
                  {['baru', 'terverifikasi', 'dilaporkan', 'ditindaklanjuti'].map(s => {
                    const style = STATUS_STYLE[s]
                    const active = selected.status === s
                    return (
                      <button key={s} onClick={() => updateStatus(selected.id, s)}
                        className="py-2.5 rounded-xl text-xs font-bold transition-all"
                        style={active ? {
                          background: 'linear-gradient(135deg,#dc2626,#f97316)',
                          color: 'white', boxShadow: '0 4px 12px rgba(220,38,38,0.35)'
                        } : { background: style.bg, color: style.text }}
                      >{style.label}</button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
    </>
  )
}
