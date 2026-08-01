'use client'

import { useState } from 'react'
import {
  Car,
  Users,
  MapPin,
  Clock,
  Phone,
  Images,
  Warning,
  CheckCircle,
  PaperPlaneTilt,
  ArrowLeft,
  ShieldCheck,
  Buildings,
  ArrowRight
} from '@phosphor-icons/react'

// ─── Constants ────────────────────────────────────────────────────────────────
const PLATFORM = ['Grab', 'Gojek', 'Maxim', 'InDrive']
const KOTA = [
  'Banjarmasin', 'Banjarbaru', 'Martapura', 'Pelaihari',
  'Kandangan', 'Barabai', 'Tanjung', 'Kotabaru', 'Batulicin', 'Lainnya'
]
const FLAGFALL = 16000
const TBB = 4000
const FLAGFALL_KM = 3

function hitungTarifSeharusnya(jarak: number): number {
  if (jarak <= FLAGFALL_KM) return FLAGFALL
  return Math.round(FLAGFALL + ((jarak - FLAGFALL_KM) * TBB))
}

// ─── Splash Screen ────────────────────────────────────────────────────────────
function SplashScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)

  useState(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setFadeOut(true)
          setTimeout(onDone, 500)
          return 100
        }
        return prev + 2
      })
    }, 40)
    return () => clearInterval(interval)
  })

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
      style={{ background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 50%, #f97316 100%)' }}
    >
      <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6"
        style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
      >
        <ShieldCheck size={48} color="white" weight="fill" />
      </div>
      <div className="text-center px-6">
        <h1 className="text-2xl font-extrabold text-white tracking-tight" style={{ fontFamily: 'var(--font-plus-jakarta)' }}>
          LAPOR TARIF ASK
        </h1>
        <p className="text-red-100 text-xs mt-1 font-medium">Kalimantan Selatan</p>
      </div>
      <div className="mt-10 w-44">
        <div className="h-1 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all duration-100" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  )
}

// ─── Landing Page ─────────────────────────────────────────────────────────────
function LandingPage({ onSelect }: { onSelect: (type: 'driver' | 'masyarakat') => void }) {
  return (
    <div className="min-h-screen" style={{ background: '#f8f8fa' }}>
      {/* Header */}
      <div className="relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 60%, #f97316 100%)',
        paddingBottom: 40
      }}>
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <div className="relative p-6 pt-10 text-center max-w-md mx-auto">
          {/* Logo placeholder row */}
          <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
            {['Dishub', 'Polda', 'Komdigi', 'YLKI', 'DOKB'].map(name => (
              <div key={name} className="w-10 h-10 rounded-xl flex flex-col items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}
              >
                <Buildings size={14} color="white" weight="fill" />
                <span style={{ fontSize: 6, color: 'rgba(255,255,255,0.8)', marginTop: 1, fontWeight: 700 }}>{name}</span>
              </div>
            ))}
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight" style={{ fontFamily: 'var(--font-plus-jakarta)' }}>
            LAPOR TARIF ASK
          </h1>
          <h2 className="text-sm font-bold text-white mt-0.5">KALIMANTAN SELATAN</h2>
          <p className="text-red-100 text-xs mt-2 leading-relaxed">
            Sistem Pelaporan dan Monitoring Angkutan Sewa Khusus Berbasis Data
          </p>
        </div>
      </div>

      {/* Pilihan Pelapor */}
      <div className="max-w-md mx-auto p-4 -mt-5 relative z-10">
        {/* Info card */}
        <div className="bg-white rounded-2xl p-4 mb-4" style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
            >
              <ShieldCheck size={16} color="white" weight="fill" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-700">SK Gubernur Kalsel No. 100.3.3.1/0991/KUM/2025</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                Flagfall <span className="font-semibold text-gray-700">Rp 16.000</span> (0–3 km) + <span className="font-semibold text-gray-700">Rp 4.000/km</span> • NET to Driver
              </p>
            </div>
          </div>
        </div>

        {/* Pilihan */}
        <div className="text-center mb-4">
          <p className="text-sm font-bold text-gray-700">Silakan pilih jenis pelapor</p>
          <p className="text-xs text-gray-400 mt-1">Pilih kategori yang sesuai untuk mengisi formulir laporan</p>
        </div>

        <div className="space-y-3">
          {/* Driver */}
          <button onClick={() => onSelect('driver')}
            className="w-full bg-white rounded-2xl p-5 text-left transition-all active:scale-[0.98]"
            style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)', border: '2px solid transparent' }}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #dc2626, #f97316)' }}
              >
                <Car size={28} color="white" weight="fill" />
              </div>
              <div className="flex-1">
                <p className="font-extrabold text-gray-800 text-base">Driver Online</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                  Saya adalah pengemudi online yang menerima tarif tidak sesuai SK Gubernur
                </p>
              </div>
              <ArrowRight size={18} color="#dc2626" weight="bold" />
            </div>
          </button>

          {/* Masyarakat */}
          <button onClick={() => onSelect('masyarakat')}
            className="w-full bg-white rounded-2xl p-5 text-left transition-all active:scale-[0.98]"
            style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)', border: '2px solid transparent' }}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}
              >
                <Users size={28} color="white" weight="fill" />
              </div>
              <div className="flex-1">
                <p className="font-extrabold text-gray-800 text-base">Masyarakat / Penumpang</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                  Saya adalah penumpang yang menemukan tarif tidak wajar atau tidak sesuai
                </p>
              </div>
              <ArrowRight size={18} color="#2563eb" weight="bold" />
            </div>
          </button>
        </div>

        {/* Admin / Tim Pengawas */}
<button onClick={() => window.location.href = '/admin'}
  className="w-full bg-white rounded-2xl p-5 text-left transition-all active:scale-[0.98] border-2 border-dashed border-gray-300"
  style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}
>
  <div className="flex items-center gap-4">
    <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 bg-gray-700">
      <ShieldCheck size={28} color="white" weight="fill" />
    </div>
    <div className="flex-1">
      <p className="font-extrabold text-gray-800 text-base">Tim Pengawas ASK</p>
      <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
        Login khusus untuk Dishub, Polda, Komdigi, YLKI, dan DOKB
      </p>
    </div>
    <ArrowRight size={18} color="#4b5563" weight="bold" />
  </div>
</button>

        {/* Menu lainnya (coming soon) */}
        <div className="mt-6">
          <p className="text-xs font-bold text-gray-400 text-center mb-3">Menu Pengawasan (Segera Hadir)</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: '🚨', label: 'Lapor Tarif', active: true },
              { icon: '⭐', label: 'Lapor Pelayanan', active: false },
              { icon: '🛡️', label: 'Lapor Keselamatan', active: false },
              { icon: '🚗', label: 'Lapor Kendaraan', active: false },
              { icon: '👤', label: 'Lapor Pengemudi', active: false },
              { icon: '📊', label: 'Statistik', active: false },
            ].map((m, i) => (
              <div key={i} className="bg-white rounded-xl p-2.5 text-center"
                style={{
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  opacity: m.active ? 1 : 0.5
                }}
              >
                <div className="text-xl mb-1">{m.icon}</div>
                <p className="text-[10px] font-bold text-gray-600 leading-tight">{m.label}</p>
                {!m.active && <p className="text-[9px] text-gray-400 mt-0.5">Segera</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center space-y-1">
          <p className="text-xs font-bold text-gray-500">Dikelola oleh:</p>
          <p className="text-xs text-gray-600 font-semibold">Tim Pengawas ASK Provinsi Kalimantan Selatan</p>
          <p className="text-xs text-gray-400">Didukung Sistem Pelaporan oleh:</p>
          <p className="text-xs text-gray-600 font-semibold">DOKB — Perkumpulan Driver Online Kalimantan Selatan Bersatu</p>
        </div>
      </div>
    </div>
  )
}

// ─── Driver Form ──────────────────────────────────────────────────────────────
function DriverForm({ onBack }: { onBack: () => void }) {
  const [form, setForm] = useState({
    nama: '',
    no_hp_driver: '',
    lokasi: '',
    platform: '',
    jarak: '',
    tarif_diterima: '',
    waktu_kejadian: '',
    catatan: ''
  })
  const [screenshots, setScreenshots] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [sukses, setSukses] = useState(false)
  const [error, setError] = useState('')

  const tarifSeharusnya = form.jarak ? hitungTarifSeharusnya(Number(form.jarak)) : 0
  const selisih = tarifSeharusnya - Number(form.tarif_diterima)

  const handleScreenshot = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setScreenshots(prev => [...prev, ...Array.from(e.target.files!)].slice(0, 5))
    }
  }

  const hapusScreenshot = (i: number) => setScreenshots(prev => prev.filter((_, idx) => idx !== i))

  const handleSubmit = async () => {
    if (!form.platform || !form.jarak || !form.tarif_diterima || !form.lokasi || !form.waktu_kejadian) {
      setError('Platform, jarak, tarif diterima, lokasi, dan waktu kejadian wajib diisi!')
      return
    }
    if (screenshots.length === 0) {
      setError('Screenshot bukti order wajib dilampirkan!')
      return
    }

    setLoading(true)
    setError('')

    try {
      const screenshotUrls: string[] = []
      for (const file of screenshots) {
        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        const result = await res.json()
        if (result.url) screenshotUrls.push(result.url)
      }

      const res = await fetch('/api/laporan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jenis_pelapor: 'driver',
          nama: form.nama || null,
          no_hp_driver: form.no_hp_driver || null,
          platform: form.platform,
          jenis_layanan: 'Mobil',
          jarak: Number(form.jarak),
          tarif_diterima: Math.round(Number(form.tarif_diterima)),
          tarif_seharusnya: tarifSeharusnya,
          lokasi: form.lokasi,
          waktu_kejadian: new Date(form.waktu_kejadian).toISOString(),
          catatan: form.catatan || null,
          screenshots: screenshotUrls
        })
      })

      const result = await res.json()
      if (result.success) setSukses(true)
      else setError(result.message)
    } catch {
      setError('Gagal mengirim laporan, coba lagi!')
    } finally {
      setLoading(false)
    }
  }

  if (sukses) return <SuksesPage onBack={onBack} pelapor="driver" />

  return (
    <div className="min-h-screen" style={{ background: '#f8f8fa' }}>
      {/* Header */}
      <div className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 60%, #f97316 100%)', paddingBottom: 32 }}
      >
        <div className="relative p-6 pt-8 max-w-md mx-auto">
          <button onClick={onBack} className="flex items-center gap-2 text-white/80 mb-4 text-sm font-semibold">
            <ArrowLeft size={16} weight="bold" /> Kembali
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            >
              <Car size={20} color="white" weight="fill" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-white" style={{ fontFamily: 'var(--font-plus-jakarta)' }}>
                Laporan Driver Online
              </h1>
              <p className="text-red-100 text-xs">Tarif NET yang diterima tidak sesuai SK</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 -mt-4 relative z-10 space-y-4">

        {/* Info SK */}
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <p className="text-xs font-bold text-gray-700">📋 SK Gubernur Kalsel No. 100.3.3.1/0991/KUM/2025</p>
          <p className="text-xs text-blue-600 font-semibold mt-1">
            Flagfall Rp 16.000 (0–3 km) + Rp 4.000/km • <strong>Tarif NET to Driver</strong>
          </p>
        </div>

        {/* Nama (opsional) */}
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <label className="text-sm font-bold text-gray-700 mb-3 block">
            Nama <span className="text-gray-400 font-normal text-xs">(opsional)</span>
          </label>
          <input type="text" placeholder="Nama Anda"
            value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })}
            className="w-full rounded-xl py-3 px-4 text-sm font-medium focus:outline-none"
            style={{ background: '#f8f8fa', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          />
        </div>

        {/* No HP */}
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <label className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <Phone size={16} weight="fill" color="#dc2626" />
            Nomor HP <span className="text-gray-400 font-normal text-xs">(opsional)</span>
          </label>
          <input type="tel" placeholder="08xxxxxxxxxx"
            value={form.no_hp_driver} onChange={e => setForm({ ...form, no_hp_driver: e.target.value })}
            className="w-full rounded-xl py-3 px-4 text-sm font-medium focus:outline-none"
            style={{ background: '#f8f8fa', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          />
        </div>

        {/* Lokasi */}
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <label className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <MapPin size={16} weight="fill" color="#dc2626" />
            Kabupaten/Kota *
          </label>
          <select value={form.lokasi} onChange={e => setForm({ ...form, lokasi: e.target.value })}
            className="w-full rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none appearance-none"
            style={{ background: '#f8f8fa', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          >
            <option value="">Pilih Kota/Kabupaten</option>
            {KOTA.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>

        {/* Platform */}
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <label className="text-sm font-bold text-gray-700 mb-3 block">Aplikator *</label>
          <div className="grid grid-cols-2 gap-3">
            {PLATFORM.map(p => (
              <button key={p} onClick={() => setForm({ ...form, platform: p })}
                className="py-3 px-4 rounded-xl text-sm font-bold transition-all duration-200"
                style={form.platform === p ? {
                  background: 'linear-gradient(135deg, #dc2626, #f97316)',
                  color: 'white', boxShadow: '0 4px 12px rgba(220,38,38,0.4)'
                } : { background: '#f8f8fa', color: '#374151' }}
              >{p}</button>
            ))}
          </div>
        </div>

        {/* Jenis Layanan */}
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #f97316, #dc2626)' }}
            >
              <Car size={20} color="white" weight="fill" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Jenis Layanan</p>
              <p className="text-sm font-bold text-gray-800">Mobil (R4)</p>
            </div>
          </div>
        </div>

        {/* Jarak */}
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <label className="text-sm font-bold text-gray-700 mb-3 block">Jarak Tempuh *</label>
          <div className="relative">
            <input type="number" placeholder="0" value={form.jarak}
              onChange={e => setForm({ ...form, jarak: e.target.value })}
              className="w-full rounded-xl py-3 pl-4 pr-12 text-sm font-semibold focus:outline-none"
              style={{ background: '#f8f8fa', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            />
            <span className="absolute right-4 top-3 text-sm font-bold text-gray-400">km</span>
          </div>
          {form.jarak && Number(form.jarak) > 0 && (
            <div className="mt-3 p-3 rounded-xl flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg, #eff6ff, #eef2ff)' }}
            >
              <CheckCircle size={16} color="#3b82f6" weight="fill" />
              <p className="text-xs text-blue-700 font-semibold">
                Tarif seharusnya (NET): Rp {tarifSeharusnya.toLocaleString('id-ID')}
              </p>
            </div>
          )}
        </div>

        {/* Tarif Diterima */}
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <label className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <Warning size={16} weight="fill" color="#f97316" />
            Tarif NET yang Diterima *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-sm font-bold text-gray-400">Rp</span>
            <input type="number" placeholder="0" value={form.tarif_diterima}
              onChange={e => setForm({ ...form, tarif_diterima: e.target.value })}
              className="w-full rounded-xl py-3 pl-10 pr-4 text-sm font-semibold focus:outline-none"
              style={{ background: '#f8f8fa', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            />
          </div>
          {form.jarak && form.tarif_diterima && (
            <div className="mt-3 p-3 rounded-xl flex items-center gap-2"
              style={{ background: selisih > 0 ? 'linear-gradient(135deg, #fef2f2, #fff7ed)' : 'linear-gradient(135deg, #f0fdf4, #dcfce7)' }}
            >
              {selisih > 0
                ? <Warning size={16} color="#dc2626" weight="fill" />
                : <CheckCircle size={16} color="#22c55e" weight="fill" />
              }
              <p className={`text-xs font-bold ${selisih > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {selisih > 0
                  ? `Kurang Rp ${selisih.toLocaleString('id-ID')} dari tarif SK Gubernur`
                  : 'Tarif sesuai SK Gubernur ✓'
                }
              </p>
            </div>
          )}
        </div>

        {/* Waktu */}
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <label className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <Clock size={16} weight="fill" color="#dc2626" />
            Waktu Kejadian *
          </label>
          <input type="datetime-local" value={form.waktu_kejadian}
            onChange={e => setForm({ ...form, waktu_kejadian: e.target.value })}
            className="w-full rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none"
            style={{ background: '#f8f8fa', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          />
        </div>

        {/* Screenshot */}
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <label className="text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
            <Images size={16} weight="fill" color="#dc2626" />
            Screenshot Order * <span className="text-gray-400 font-normal text-xs">(maks. 5 foto)</span>
          </label>
          <p className="text-xs text-gray-400 mb-3">Upload riwayat perjalanan dari aplikasi</p>
          <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-5 cursor-pointer"
            style={{ borderColor: '#fca5a5', background: '#fff5f5' }}
          >
            <Images size={28} color="#dc2626" weight="duotone" />
            <p className="text-sm font-semibold text-red-500 mt-2">Tap untuk upload foto</p>
            <input type="file" accept="image/*" multiple onChange={handleScreenshot} className="hidden" />
          </label>
          {screenshots.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {screenshots.map((file, i) => (
                <div key={i} className="relative">
                  <img src={URL.createObjectURL(file)} alt="" className="w-full h-20 object-cover rounded-xl" />
                  <button onClick={() => hapusScreenshot(i)}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: 'linear-gradient(135deg, #dc2626, #f97316)' }}
                  >×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Keterangan */}
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <label className="text-sm font-bold text-gray-700 mb-3 block">
            Keterangan <span className="text-gray-400 font-normal text-xs">(opsional)</span>
          </label>
          <textarea placeholder="Ceritakan kejadiannya: jarak jemput, idle time, perilaku konsumen, dll..."
            value={form.catatan} onChange={e => setForm({ ...form, catatan: e.target.value })}
            rows={3}
            className="w-full rounded-xl p-3 text-sm font-medium focus:outline-none"
            style={{ background: '#f8f8fa', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          />
        </div>

        {error && (
          <div className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background: 'linear-gradient(135deg, #fef2f2, #fff7ed)' }}
          >
            <Warning size={20} color="#dc2626" weight="fill" />
            <p className="text-red-600 text-sm font-semibold">{error}</p>
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading}
          className="w-full py-4 rounded-2xl font-extrabold text-base text-white flex items-center justify-center gap-2 disabled:opacity-50"
          style={{
            background: loading ? '#9ca3af' : 'linear-gradient(135deg, #b91c1c 0%, #dc2626 50%, #f97316 100%)',
            boxShadow: loading ? 'none' : '0 6px 20px rgba(220,38,38,0.5)'
          }}
        >
          {loading ? '⏳ Mengirim...' : <><PaperPlaneTilt size={20} weight="fill" /> KIRIM LAPORAN</>}
        </button>

        <p className="text-center text-[10px] text-gray-300 pb-4">
          DOKB — Perkumpulan Driver Online Kalimantan Selatan Bersatu
        </p>
      </div>
    </div>
  )
}

// ─── Masyarakat Form ──────────────────────────────────────────────────────────
function MasyarakatForm({ onBack }: { onBack: () => void }) {
  const [form, setForm] = useState({
    nama: '',
    no_hp_driver: '',
    lokasi: '',
    platform: '',
    jarak: '',
    tarif_dibayar: '',
    waktu_kejadian: '',
    catatan: ''
  })
  const [screenshots, setScreenshots] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [sukses, setSukses] = useState(false)
  const [error, setError] = useState('')

  const tarifSeharusnya = form.jarak ? hitungTarifSeharusnya(Number(form.jarak)) : 0

  const handleScreenshot = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setScreenshots(prev => [...prev, ...Array.from(e.target.files!)].slice(0, 5))
    }
  }

  const hapusScreenshot = (i: number) => setScreenshots(prev => prev.filter((_, idx) => idx !== i))

  const handleSubmit = async () => {
    if (!form.nama || !form.platform || !form.lokasi || !form.waktu_kejadian || !form.tarif_dibayar) {
      setError('Nama, platform, lokasi, tarif dibayar, dan waktu kejadian wajib diisi!')
      return
    }
    if (screenshots.length === 0) {
      setError('Screenshot struk/perjalanan wajib dilampirkan!')
      return
    }

    setLoading(true)
    setError('')

    try {
      const screenshotUrls: string[] = []
      for (const file of screenshots) {
        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        const result = await res.json()
        if (result.url) screenshotUrls.push(result.url)
      }

      const res = await fetch('/api/laporan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jenis_pelapor: 'masyarakat',
          nama: form.nama,
          no_hp_driver: form.no_hp_driver || null,
          platform: form.platform,
          jenis_layanan: 'Mobil',
          jarak: form.jarak ? Number(form.jarak) : null,
          tarif_diterima: Math.round(Number(form.tarif_dibayar)),
          tarif_seharusnya: tarifSeharusnya || null,
          tarif_dibayar: Math.round(Number(form.tarif_dibayar)),
          lokasi: form.lokasi,
          waktu_kejadian: new Date(form.waktu_kejadian).toISOString(),
          catatan: form.catatan || null,
          screenshots: screenshotUrls
        })
      })

      const result = await res.json()
      if (result.success) setSukses(true)
      else setError(result.message)
    } catch {
      setError('Gagal mengirim laporan, coba lagi!')
    } finally {
      setLoading(false)
    }
  }

  if (sukses) return <SuksesPage onBack={onBack} pelapor="masyarakat" />

  return (
    <div className="min-h-screen" style={{ background: '#f8f8fa' }}>
      {/* Header */}
      <div className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 60%, #7c3aed 100%)', paddingBottom: 32 }}
      >
        <div className="relative p-6 pt-8 max-w-md mx-auto">
          <button onClick={onBack} className="flex items-center gap-2 text-white/80 mb-4 text-sm font-semibold">
            <ArrowLeft size={16} weight="bold" /> Kembali
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            >
              <Users size={20} color="white" weight="fill" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-white" style={{ fontFamily: 'var(--font-plus-jakarta)' }}>
                Laporan Masyarakat
              </h1>
              <p className="text-blue-100 text-xs">Tarif tidak wajar atau tidak sesuai ketentuan</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 -mt-4 relative z-10 space-y-4">

        {/* Info */}
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <p className="text-xs font-bold text-gray-700">ℹ️ Mengapa masyarakat bisa melapor?</p>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            Platform ini mengawasi implementasi tarif ASK secara menyeluruh. Laporan penumpang sangat berharga sebagai data pembanding yang netral.
          </p>
        </div>

        {/* Nama */}
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <label className="text-sm font-bold text-gray-700 mb-3 block">Nama *</label>
          <input type="text" placeholder="Nama lengkap Anda"
            value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })}
            className="w-full rounded-xl py-3 px-4 text-sm font-medium focus:outline-none"
            style={{ background: '#f8f8fa', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          />
        </div>

        {/* No HP */}
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <label className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <Phone size={16} weight="fill" color="#2563eb" />
            Nomor HP <span className="text-gray-400 font-normal text-xs">(opsional)</span>
          </label>
          <input type="tel" placeholder="08xxxxxxxxxx"
            value={form.no_hp_driver} onChange={e => setForm({ ...form, no_hp_driver: e.target.value })}
            className="w-full rounded-xl py-3 px-4 text-sm font-medium focus:outline-none"
            style={{ background: '#f8f8fa', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          />
        </div>

        {/* Lokasi */}
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <label className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <MapPin size={16} weight="fill" color="#2563eb" />
            Kabupaten/Kota *
          </label>
          <select value={form.lokasi} onChange={e => setForm({ ...form, lokasi: e.target.value })}
            className="w-full rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none appearance-none"
            style={{ background: '#f8f8fa', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          >
            <option value="">Pilih Kota/Kabupaten</option>
            {KOTA.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>

        {/* Platform */}
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <label className="text-sm font-bold text-gray-700 mb-3 block">Aplikator *</label>
          <div className="grid grid-cols-2 gap-3">
            {PLATFORM.map(p => (
              <button key={p} onClick={() => setForm({ ...form, platform: p })}
                className="py-3 px-4 rounded-xl text-sm font-bold transition-all"
                style={form.platform === p ? {
                  background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)',
                  color: 'white', boxShadow: '0 4px 12px rgba(37,99,235,0.4)'
                } : { background: '#f8f8fa', color: '#374151' }}
              >{p}</button>
            ))}
          </div>
        </div>

        {/* Tarif Dibayar */}
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <label className="text-sm font-bold text-gray-700 mb-3 block">Tarif yang Dibayar *</label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-sm font-bold text-gray-400">Rp</span>
            <input type="number" placeholder="0" value={form.tarif_dibayar}
              onChange={e => setForm({ ...form, tarif_dibayar: e.target.value })}
              className="w-full rounded-xl py-3 pl-10 pr-4 text-sm font-semibold focus:outline-none"
              style={{ background: '#f8f8fa', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            />
          </div>
        </div>

        {/* Jarak (opsional) */}
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <label className="text-sm font-bold text-gray-700 mb-3 block">
            Jarak Perjalanan <span className="text-gray-400 font-normal text-xs">(perkiraan atau sesuai aplikasi)</span>
          </label>
          <div className="relative">
            <input type="number" placeholder="0" value={form.jarak}
              onChange={e => setForm({ ...form, jarak: e.target.value })}
              className="w-full rounded-xl py-3 pl-4 pr-12 text-sm font-semibold focus:outline-none"
              style={{ background: '#f8f8fa', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            />
            <span className="absolute right-4 top-3 text-sm font-bold text-gray-400">km</span>
          </div>
          {form.jarak && Number(form.jarak) > 0 && (
            <div className="mt-3 p-3 rounded-xl flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg, #eff6ff, #eef2ff)' }}
            >
              <CheckCircle size={16} color="#3b82f6" weight="fill" />
              <p className="text-xs text-blue-700 font-semibold">
                Tarif SK untuk {form.jarak} km: Rp {tarifSeharusnya.toLocaleString('id-ID')}
              </p>
            </div>
          )}
        </div>

        {/* Waktu */}
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <label className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <Clock size={16} weight="fill" color="#2563eb" />
            Waktu Kejadian *
          </label>
          <input type="datetime-local" value={form.waktu_kejadian}
            onChange={e => setForm({ ...form, waktu_kejadian: e.target.value })}
            className="w-full rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none"
            style={{ background: '#f8f8fa', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          />
        </div>

        {/* Screenshot */}
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <label className="text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
            <Images size={16} weight="fill" color="#2563eb" />
            Screenshot Struk/Perjalanan * <span className="text-gray-400 font-normal text-xs">(maks. 5)</span>
          </label>
          <p className="text-xs text-gray-400 mb-3">Upload bukti dari aplikasi</p>
          <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-5 cursor-pointer"
            style={{ borderColor: '#93c5fd', background: '#eff6ff' }}
          >
            <Images size={28} color="#2563eb" weight="duotone" />
            <p className="text-sm font-semibold text-blue-500 mt-2">Tap untuk upload foto</p>
            <input type="file" accept="image/*" multiple onChange={handleScreenshot} className="hidden" />
          </label>
          {screenshots.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {screenshots.map((file, i) => (
                <div key={i} className="relative">
                  <img src={URL.createObjectURL(file)} alt="" className="w-full h-20 object-cover rounded-xl" />
                  <button onClick={() => hapusScreenshot(i)}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)' }}
                  >×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Keterangan */}
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <label className="text-sm font-bold text-gray-700 mb-3 block">
            Keterangan <span className="text-gray-400 font-normal text-xs">(opsional)</span>
          </label>
          <textarea placeholder="Ceritakan situasinya: tarif terlalu murah/mahal, promo membingungkan, dugaan manipulasi, dll..."
            value={form.catatan} onChange={e => setForm({ ...form, catatan: e.target.value })}
            rows={3}
            className="w-full rounded-xl p-3 text-sm font-medium focus:outline-none"
            style={{ background: '#f8f8fa', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          />
        </div>

        {error && (
          <div className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background: 'linear-gradient(135deg, #fef2f2, #fff7ed)' }}
          >
            <Warning size={20} color="#dc2626" weight="fill" />
            <p className="text-red-600 text-sm font-semibold">{error}</p>
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading}
          className="w-full py-4 rounded-2xl font-extrabold text-base text-white flex items-center justify-center gap-2 disabled:opacity-50"
          style={{
            background: loading ? '#9ca3af' : 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #7c3aed 100%)',
            boxShadow: loading ? 'none' : '0 6px 20px rgba(37,99,235,0.5)'
          }}
        >
          {loading ? '⏳ Mengirim...' : <><PaperPlaneTilt size={20} weight="fill" /> KIRIM LAPORAN</>}
        </button>

        <p className="text-center text-[10px] text-gray-300 pb-4">
          DOKB — Perkumpulan Driver Online Kalimantan Selatan Bersatu
        </p>
      </div>
    </div>
  )
}

// ─── Sukses Page ──────────────────────────────────────────────────────────────
function SuksesPage({ onBack, pelapor }: { onBack: () => void; pelapor: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)' }}
    >
      <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center"
        style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}
      >
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
        >
          <CheckCircle size={40} color="white" weight="fill" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Laporan Terkirim!</h2>
        <p className="text-gray-500 text-sm mb-2 leading-relaxed">
          Terima kasih! Laporan Anda telah diterima oleh <strong>Tim Pengawas ASK Provinsi Kalimantan Selatan</strong>.
        </p>
        <p className="text-gray-400 text-xs mb-8">
          {pelapor === 'driver'
            ? 'Data laporan Anda akan menjadi bukti nyata penegakan tarif SK Gubernur.'
            : 'Laporan Anda sangat berharga sebagai data pengawasan yang netral dan independen.'}
        </p>
        <button onClick={onBack}
          className="w-full text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}
        >
          <ArrowLeft size={18} weight="bold" />
          Kembali ke Beranda
        </button>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const [showSplash, setShowSplash] = useState(true)
  const [view, setView] = useState<'landing' | 'driver' | 'masyarakat'>('landing')

  if (showSplash) return <SplashScreen onDone={() => setShowSplash(false)} />
  if (view === 'driver') return <DriverForm onBack={() => setView('landing')} />
  if (view === 'masyarakat') return <MasyarakatForm onBack={() => setView('landing')} />
  return <LandingPage onSelect={setView} />
}
