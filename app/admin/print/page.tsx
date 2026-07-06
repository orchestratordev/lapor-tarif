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

  const fmtRp = (n: number) => 'Rp ' + (n||0).toLocaleString('id-ID')
  const fmtDate = (s: string) => new Date(s).toLocaleDateString('id-ID')

  const totalSelisih = laporan.reduce((s, l) => s + (l.selisih || 0), 0)

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: 24, color: '#111' }}>
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

      {/* Stats */}
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

      {/* Table */}
      <h3 style={{ fontSize: 12, fontWeight: 700, borderBottom: '1px solid #e5e7eb', paddingBottom: 6, marginBottom: 10 }}>
        Detail Laporan ({laporan.length} total)
      </h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
        <thead>
          <tr style={{ background: '#b91c1c', color: '#fff' }}>
            {['No','Tanggal','Pelapor','Platform','Jarak','Diterima','Seharusnya','Selisih','Lokasi','Status'].map(h => (
              <th key={h} style={{ padding: '6px', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {laporan.map((r, i) => (
            <tr key={r.id} style={{ background: i%2===0 ? '#fff' : '#f9f9fb', borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: '5px 6px' }}>{i+1}</td>
              <td style={{ padding: '5px 6px', whiteSpace: 'nowrap' }}>{fmtDate(r.created_at)}</td>
              <td style={{ padding: '5px 6px', textTransform: 'capitalize' }}>{r.jenis_pelapor||'driver'}</td>
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

      <div style={{ marginTop: 20, borderTop: '1px solid #e5e7eb', paddingTop: 10, fontSize: 10, color: '#9ca3af', display: 'flex', justifyContent: 'space-between' }}>
        <span>Tim Pengawas ASK Provinsi Kalimantan Selatan</span>
        <span>DOKB — lapor.dokb.or.id</span>
      </div>

      <style>{`@media print { @page { margin: 15mm; size: A4; } }`}</style>
    </div>
  )
            }
