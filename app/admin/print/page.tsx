'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function PrintPage() {
  const [laporan, setLaporan] = useState<any[]>([])

  useEffect(() => {
    supabase.from('laporan').select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) {
          setLaporan(data)
          setTimeout(() => window.print(), 800)
        }
      })
  }, [])

  const fmtRp = (n: number) => 'Rp ' + (n || 0).toLocaleString('id-ID')
  const fmtDate = (s: string) => new Date(s).toLocaleDateString('id-ID')

  const totalSelisih = laporan.reduce((s, l) => s + (l.selisih || 0), 0)

  // ============================================
  // DATA UNTUK GRAFIK
  // ============================================
  
  // Grafik 1: Pelanggaran per Platform (Bar Chart)
  const platformData = laporan.reduce((acc: Record<string, number>, l) => {
    const platform = l.platform || 'Lainnya'
    acc[platform] = (acc[platform] || 0) + 1
    return acc
  }, {})

  const platformEntries = Object.entries(platformData).sort((a, b) => b[1] - a[1])
  const maxPlatformCount = Math.max(...platformEntries.map(e => e[1]), 1)

  // Grafik 2: Status Laporan (Pie Chart sederhana)
  const statusData = laporan.reduce((acc: Record<string, number>, l) => {
    const status = l.status || 'pending'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {})

  const statusEntries = Object.entries(statusData)
  const statusColors: Record<string, string> = {
    selesai: '#16a34a',
    diproses: '#ea580c',
    pending: '#6b7280',
    ditolak: '#dc2626',
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: 24, color: '#111', maxWidth: 800, margin: '0 auto' }}>
      
      {/* HEADER */}
      <div style={{ borderBottom: '3px solid #dc2626', paddingBottom: 14, marginBottom: 18 }}>
        <h1 style={{ fontSize: 18, fontWeight: 800, color: '#b91c1c', margin: 0 }}>
          REKAP LAPORAN TARIF ASK KALIMANTAN SELATAN
        </h1>
        <p style={{ fontSize: 12, color: '#374151', margin: '4px 0 0' }}>
          Sistem Pelaporan dan Monitoring Angkutan Sewa Khusus Berbasis Data
        </p>
        <p style={{ fontSize: 11, color: '#6b7280', margin: '6px 0 0' }}>
          SK Gubernur Kalsel No. 100.3.3.1/0991/KUM/2025 • Flagfall Rp 16.000 (0–3 km) + Rp 4.000/km
        </p>
        <p style={{ fontSize: 11, color: '#6b7280', margin: '4px 0 0' }}>
          Dicetak: {new Date().toLocaleString('id-ID')} • lapor.dokb.or.id
        </p>
      </div>

      {/* STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Total Laporan', value: laporan.length },
          { label: 'Total Selisih', value: fmtRp(totalSelisih) },
          { label: 'Laporan Driver', value: laporan.filter(l => l.jenis_pelapor !== 'masyarakat').length },
          { label: 'Laporan Masyarakat', value: laporan.filter(l => l.jenis_pelapor === 'masyarakat').length },
        ].map((s, i) => (
          <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 12px', background: '#f9f9fb' }}>
            <p style={{ fontSize: 10, color: '#6b7280', margin: 0 }}>{s.label}</p>
            <p style={{ fontSize: 16, fontWeight: 800, color: '#dc2626', margin: '4px 0 0' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ============================================ */}
{/* GRAFIK 1: BAR CHART VERTIKAL — Pelanggaran per Platform */}
{/* ============================================ */}
<div style={{ marginBottom: 24, pageBreakInside: 'avoid' }}>
  <h3 style={{ fontSize: 13, fontWeight: 700, borderBottom: '1px solid #e5e7eb', paddingBottom: 6, marginBottom: 16 }}>
    📊 Jumlah Pelanggaran per Aplikator
  </h3>
  
  {platformEntries.length > 0 ? (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 180, paddingBottom: 24, borderBottom: '1px solid #e5e7eb' }}>
      {platformEntries.map(([platform, count]) => {
        const heightPercent = (count / maxPlatformCount) * 100
        return (
          <div key={platform} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            {/* Bar */}
            <div style={{
              width: '100%',
              maxWidth: 60,
              height: `${Math.max(heightPercent, 4)}%`,
              background: 'linear-gradient(180deg, #ef4444 0%, #dc2626 100%)',
              borderRadius: '4px 4px 0 0',
              minHeight: 4,
            }} />
            {/* Label */}
            <span style={{ fontSize: 9, fontWeight: 700, color: '#374151', textAlign: 'center', whiteSpace: 'nowrap' }}>
              {platform}
            </span>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#b91c1c' }}>
              {count}
            </span>
          </div>
        )
      })}
    </div>
  ) : (
    <p style={{ fontSize: 10, color: '#9ca3af', textAlign: 'center', padding: 16 }}>Belum ada data pelanggaran</p>
  )}
</div>

{/* ============================================ */}
{/* GRAFIK 2: PIE CHART — Persentase per Platform */}
{/* ============================================ */}
<div style={{ marginBottom: 24, pageBreakInside: 'avoid' }}>
  <h3 style={{ fontSize: 13, fontWeight: 700, borderBottom: '1px solid #e5e7eb', paddingBottom: 6, marginBottom: 16 }}>
    🥧 Persentase Pelanggaran per Aplikator
  </h3>
  
  {platformEntries.length > 0 ? (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
      {/* SVG Pie Chart */}
      <svg width="140" height="140" viewBox="0 0 32 32">
        <PieSlices entries={platformEntries} />
      </svg>
      
      {/* Legend + Persentase */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {platformEntries.map(([platform, count], i) => {
          const percent = ((count / laporan.length) * 100).toFixed(1)
          const pieColors = ['#dc2626', '#ea580c', '#f59e0b', '#16a34a', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280']
          const color = pieColors[i % pieColors.length]
          
          return (
            <div key={platform} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 12, height: 12, borderRadius: 3,
                background: color,
                display: 'inline-block',
                flexShrink: 0,
              }} />
              <span style={{ fontSize: 10, fontWeight: 600, minWidth: 60 }}>
                {platform}
              </span>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#374151' }}>
                {count}
              </span>
              <span style={{ fontSize: 10, color: '#6b7280' }}>
                ({percent}%)
              </span>
            </div>
          )
        })}
      </div>
    </div>
  ) : (
    <p style={{ fontSize: 10, color: '#9ca3af', textAlign: 'center', padding: 16 }}>Belum ada data</p>
  )}
</div>

      {/* TABLE */}
      <h3 style={{ fontSize: 12, fontWeight: 700, borderBottom: '1px solid #e5e7eb', paddingBottom: 6, marginBottom: 10 }}>
        Detail Laporan ({laporan.length} total)
      </h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
        <thead>
          <tr style={{ background: '#b91c1c', color: '#fff' }}>
            {['No', 'Tanggal', 'Pelapor', 'Platform', 'Jarak', 'Diterima', 'Seharusnya', 'Selisih', 'Lokasi', 'Status'].map(h => (
              <th key={h} style={{ padding: '6px', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {laporan.map((r, i) => (
            <tr key={r.id} style={{ background: i % 2 === 0 ? '#fff' : '#f9f9fb', borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: '5px 6px' }}>{i + 1}</td>
              <td style={{ padding: '5px 6px', whiteSpace: 'nowrap' }}>{fmtDate(r.created_at)}</td>
              <td style={{ padding: '5px 6px', textTransform: 'capitalize' }}>{r.jenis_pelapor || 'driver'}</td>
              <td style={{ padding: '5px 6px', fontWeight: 600 }}>{r.platform}</td>
              <td style={{ padding: '5px 6px' }}>{r.jarak} km</td>
              <td style={{ padding: '5px 6px' }}>{fmtRp(r.tarif_diterima)}</td>
              <td style={{ padding: '5px 6px' }}>{fmtRp(r.tarif_seharusnya)}</td>
              <td style={{ padding: '5px 6px', color: '#dc2626', fontWeight: 700 }}>-{fmtRp(r.selisih)}</td>
              <td style={{ padding: '5px 6px' }}>{r.lokasi}</td>
              <td style={{ padding: '5px 6px', fontWeight: 600 }}>{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* FOOTER */}
      <div style={{ marginTop: 20, borderTop: '1px solid #e5e7eb', paddingTop: 10, fontSize: 10, color: '#9ca3af', display: 'flex', justifyContent: 'space-between' }}>
        <span>Tim Pengawas ASK Provinsi Kalimantan Selatan</span>
        <span>DOKB — lapor.dokb.or.id</span>
      </div>

      {/* PRINT STYLES */}
      <style>{`
        @media print { 
          @page { margin: 12mm; size: A4; }
          body { background: white; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  )
}

// ============================================
// PIE CHART SVG COMPONENT (NATIVE)
// ============================================
function PieSlices({ entries }: { entries: [string, number][] }) {
  const total = entries.reduce((sum, [, count]) => sum + count, 0)
  if (total === 0) return null

  const pieColors = ['#dc2626', '#ea580c', '#f59e0b', '#16a34a', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280']

  let currentAngle = 0
  const slices = entries.map(([name, count], i) => {
    const angle = (count / total) * 360
    const startAngle = currentAngle
    currentAngle += angle

    const startRad = ((startAngle - 90) * Math.PI) / 180
    const endRad = ((startAngle + angle - 90) * Math.PI) / 180

    const x1 = 16 + 14 * Math.cos(startRad)
    const y1 = 16 + 14 * Math.sin(startRad)
    const x2 = 16 + 14 * Math.cos(endRad)
    const y2 = 16 + 14 * Math.sin(endRad)

    const largeArc = angle > 180 ? 1 : 0

    const pathData = [
      `M 16 16`,
      `L ${x1} ${y1}`,
      `A 14 14 0 ${largeArc} 1 ${x2} ${y2}`,
      `Z`,
    ].join(' ')

    return (
      <path
        key={name}
        d={pathData}
        fill={pieColors[i % pieColors.length]}
        stroke="white"
        strokeWidth="0.5"
      />
    )
  })

  return <>{slices}</>
      }
