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
      {/* GRAFIK 1: BAR CHART PER PLATFORM */}
      {/* ============================================ */}
      <div style={{ marginBottom: 24, pageBreakInside: 'avoid' }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, borderBottom: '1px solid #e5e7eb', paddingBottom: 6, marginBottom: 12 }}>
          📊 Pelanggaran per Platform
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {platformEntries.map(([platform, count]) => {
            const widthPercent = (count / maxPlatformCount) * 100
            return (
              <div key={platform} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 80, fontSize: 10, fontWeight: 600, textAlign: 'right' }}>
                  {platform}
                </span>
                <div style={{ flex: 1, background: '#f3f4f6', borderRadius: 4, height: 20, overflow: 'hidden' }}>
                  <div style={{
                    width: `${widthPercent}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #dc2626, #ef4444)',
                    borderRadius: 4,
                    transition: 'width 0.3s',
                  }} />
                </div>
                <span style={{ width: 30, fontSize: 10, fontWeight: 700, color: '#b91c1c' }}>
                  {count}
                </span>
              </div>
            )
          })}
        </div>
        {platformEntries.length === 0 && (
          <p style={{ fontSize: 10, color: '#9ca3af', textAlign: 'center', padding: 16 }}>Belum ada data</p>
        )}
      </div>

      {/* ============================================ */}
      {/* GRAFIK 2: PIE CHART STATUS (SVG NATIVE) */}
      {/* ============================================ */}
      <div style={{ marginBottom: 24, pageBreakInside: 'avoid' }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, borderBottom: '1px solid #e5e7eb', paddingBottom: 6, marginBottom: 12 }}>
          🥧 Status Laporan
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* SVG Pie Chart */}
          <svg width="100" height="100" viewBox="0 0 32 32">
            <PieSlices entries={statusEntries} colors={statusColors} />
          </svg>
          {/* Legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {statusEntries.map(([status, count]) => (
              <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  width: 10, height: 10, borderRadius: 2,
                  background: statusColors[status] || '#6b7280',
                  display: 'inline-block',
                }} />
                <span style={{ fontSize: 10, textTransform: 'capitalize' }}>
                  {status}
                </span>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#374151' }}>
                  ({count})
                </span>
              </div>
            ))}
          </div>
        </div>
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
function PieSlices({ entries, colors }: { entries: [string, number][]; colors: Record<string, string> }) {
  const total = entries.reduce((sum, [, count]) => sum + count, 0)
  if (total === 0) return null

  let currentAngle = 0
  const slices = entries.map(([status, count]) => {
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
        key={status}
        d={pathData}
        fill={colors[status] || '#6b7280'}
        stroke="white"
        strokeWidth="0.5"
      />
    )
  })

  return <>{slices}</>
              }
