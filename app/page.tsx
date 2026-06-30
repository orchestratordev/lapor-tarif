'use client'

import { useState, useEffect } from 'react'
import { 
  Car, 
  MapPin, 
  Clock, 
  Phone, 
  Images, 
  Warning,
  CheckCircle,
  PaperPlaneTilt,
  ArrowRight,
  ShieldCheck
} from '@phosphor-icons/react'

const PLATFORM = ['Grab', 'Gojek', 'Maxim', 'InDrive']
const KOTA = [
  'Banjarmasin',
  'Banjarbaru', 
  'Martapura',
  'Pelaihari',
  'Kandangan',
  'Barabai',
  'Tanjung',
  'Kotabaru',
  'Batulicin',
  'Lainnya'
]

const FLAGFALL = 16000
const TBB = 4000
const FLAGFALL_KM = 3

function hitungTarifSeharusnya(jarak: number): number {
  if (jarak <= FLAGFALL_KM) return FLAGFALL
  return Math.round(FLAGFALL + ((jarak - FLAGFALL_KM) * TBB))
}
// Splash Screen
function SplashScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setFadeOut(true)
          setTimeout(onDone, 600)
          return 100
        }
        return prev + 2
      })
    }, 40)
    return () => clearInterval(interval)
  }, [onDone])

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-600 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
      style={{
        background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 50%, #f97316 100%)'
      }}
    >
      {/* Logo Circle */}
      <div className="relative mb-6"
        style={{
          animation: 'scaleIn 0.6s ease-out forwards'
        }}
      >
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center"
          style={{
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)'
          }}
        >
          <ShieldCheck size={48} color="white" weight="fill" />
        </div>
      </div>

      {/* Title */}
      <div style={{ animation: 'slideUp 0.6s ease-out 0.2s both' }}>
        <h1 className="text-4xl font-extrabold text-white tracking-tight text-center"
          style={{ fontFamily: 'var(--font-plus-jakarta)' }}
        >
          LAPOR TARIF
        </h1>
        <p className="text-red-100 text-center text-sm mt-1 font-medium">
          DOKB — Kalimantan Selatan
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mt-12 w-48">
        <div className="h-1 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <style>{`
        @keyframes scaleIn {
          from { transform: scale(0.5); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default function Home() {
  const [showSplash, setShowSplash] = useState(true)
  const [form, setForm] = useState({
    platform: '',
    jarak: '',
    tarif_diterima: '',
    lokasi: '',
    waktu_kejadian: '',
    no_hp_driver: ''
  })
  const [screenshots, setScreenshots] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [sukses, setSukses] = useState(false)
  const [error, setError] = useState('')

  const tarifSeharusnya = form.jarak
    ? hitungTarifSeharusnya(Number(form.jarak))
    : 0

  const selisih = tarifSeharusnya - Number(form.tarif_diterima)

  const handleScreenshot = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setScreenshots(prev => [...prev, ...files].slice(0, 5))
    }
  }

  const hapusScreenshot = (index: number) => {
    setScreenshots(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!form.platform || !form.jarak || !form.tarif_diterima || !form.lokasi || !form.waktu_kejadian) {
      setError('Semua field wajib diisi!')
      return
    }
    if (screenshots.length === 0) {
      setError('Screenshot bukti wajib dilampirkan!')
      return
    }

    setLoading(true)
    setError('')

    try {
      const screenshotUrls: string[] = []
      for (const file of screenshots) {
        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        const result = await res.json()
        if (result.url) screenshotUrls.push(result.url)
      }

      const res = await fetch('/api/laporan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: form.platform,
          jenis_layanan: 'Mobil',
          jarak: Number(form.jarak),
          tarif_diterima: Number(form.tarif_diterima),
          tarif_seharusnya: tarifSeharusnya,
          lokasi: form.lokasi,
          waktu_kejadian: new Date(form.waktu_kejadian).toISOString(),
          no_hp_driver: form.no_hp_driver,
          screenshots: screenshotUrls
        })
      })

      const result = await res.json()
      if (result.success) {
        setSukses(true)
      } else {
        setError(result.message)
      }
    } catch {
      setError('Gagal mengirim laporan, coba lagi!')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSukses(false)
    setScreenshots([])
    setForm({
      platform: '',
      jarak: '',
      tarif_diterima: '',
      lokasi: '',
      waktu_kejadian: '',
      no_hp_driver: ''
    })
  }

  if (showSplash) {
    return <SplashScreen onDone={() => setShowSplash(false)} />
  }

  if (sukses) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4"
        style={{ background: 'linear-gradient(135deg, #fef2f2 0%, #fff7ed 100%)' }}
      >
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center"
          style={{
            boxShadow: '0 20px 60px rgba(0,0,0,0.1), 0 4px 16px rgba(0,0,0,0.06)'
          }}
        >
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
          >
            <CheckCircle size={40} color="white" weight="fill" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-800 mb-2"
            style={{ fontFamily: 'var(--font-plus-jakarta)' }}
          >
            Laporan Terkirim!
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            Terima kasih! Tim pengawas ASK DOKB sedang memproses laporan kamu.
          </p>
          <button onClick={resetForm}
            className="w-full text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #dc2626, #f97316)',
              boxShadow: '0 4px 15px rgba(220,38,38,0.4), 0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <ArrowRight size={18} weight="bold" />
            Lapor Lagi
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#f8f8fa' }}>

      {/* Header */}
      <div className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 60%, #f97316 100%)',
          paddingBottom: '32px'
        }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full"
          style={{ background: 'rgba(255,255,255,0.08)' }} />
        <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full"
          style={{ background: 'rgba(255,255,255,0.06)' }} />

        <div className="relative p-6 pt-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <ShieldCheck size={28} color="white" weight="fill" />
            <h1 className="text-2xl font-extrabold text-white tracking-tight"
              style={{ fontFamily: 'var(--font-plus-jakarta)' }}
            >
              LAPOR TARIF
            </h1>
          </div>
          <p className="text-red-100 text-xs font-medium">
            Pengawasan ASK — DOKB Kalimantan Selatan
          </p>
        </div>
      </div>

      {/* Info SK Card */}
      <div className="mx-4 -mt-4 relative z-10">
        <div className="bg-white rounded-2xl p-4"
          style={{
            boxShadow: '0 8px 24px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)'
          }}
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
            >
              <ShieldCheck size={16} color="white" weight="fill" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-700">
                SK Gubernur Kalsel No. 100.3.3.1/0991/KUM/2025
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Flagfall: <span className="font-semibold text-gray-700">Rp 16.000</span> (0–3 km) • TBB: <span className="font-semibold text-gray-700">Rp 4.000/km</span>
              </p>
              <p className="text-xs text-blue-600 font-semibold mt-0.5">
                Tarif yang dilaporkan adalah NET to Driver
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="p-4 space-y-4 mt-2">

        {/* Platform */}
        <div className="bg-white rounded-2xl p-4"
          style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
        >
          <p className="text-sm font-bold text-gray-700 mb-3">
            Pilih Platform *
          </p>
          <div className="grid grid-cols-2 gap-3">
            {PLATFORM.map(p => (
              <button
                key={p}
                onClick={() => setForm({ ...form, platform: p })}
                className="py-3 px-4 rounded-xl text-sm font-bold transition-all duration-200"
                style={form.platform === p ? {
                  background: 'linear-gradient(135deg, #dc2626, #f97316)',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(220,38,38,0.4), 0 2px 4px rgba(0,0,0,0.1)',
                  transform: 'translateY(-1px)'
                } : {
                  background: '#f8f8fa',
                  color: '#374151',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)'
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Jenis Layanan */}
        <div className="bg-white rounded-2xl p-4"
          style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
        >
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
        <div className="bg-white rounded-2xl p-4"
          style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
        >
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-3">
            <ArrowRight size={16} weight="bold" color="#dc2626" />
            Jarak Tempuh *
          </label>
          <div className="relative">
            <input
              type="number"
              placeholder="0"
              value={form.jarak}
              onChange={e => setForm({ ...form, jarak: e.target.value })}
              className="w-full rounded-xl py-3 pl-4 pr-12 text-sm font-semibold focus:outline-none"
              style={{
                background: '#f8f8fa',
                border: '2px solid transparent',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}
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
        <div className="bg-white rounded-2xl p-4"
          style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
        >
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-3">
            <Warning size={16} weight="fill" color="#f97316" />
            Tarif NET yang Diterima *
          </label>
          <div className="relative">
            <span className="absolute left-4 top-3 text-sm font-bold text-gray-400">Rp</span>
            <input
              type="number"
              placeholder="0"
              value={form.tarif_diterima}
              onChange={e => setForm({ ...form, tarif_diterima: e.target.value })}
              className="w-full rounded-xl py-3 pl-10 pr-4 text-sm font-semibold focus:outline-none"
              style={{
                background: '#f8f8fa',
                border: '2px solid transparent',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}
            />
          </div>

          {form.jarak && form.tarif_diterima && (
            <div className={`mt-3 p-3 rounded-xl flex items-center gap-2`}
              style={{
                background: selisih > 0
                  ? 'linear-gradient(135deg, #fef2f2, #fff7ed)'
                  : 'linear-gradient(135deg, #f0fdf4, #dcfce7)'
              }}
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

        {/* Lokasi */}
        <div className="bg-white rounded-2xl p-4"
          style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
        >
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-3">
            <MapPin size={16} weight="fill" color="#dc2626" />
            Lokasi Kejadian *
          </label>
          <select
            value={form.lokasi}
            onChange={e => setForm({ ...form, lokasi: e.target.value })}
            className="w-full rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none appearance-none"
            style={{
              background: '#f8f8fa',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}
          >
            <option value="">Pilih Kota/Kabupaten</option>
            {KOTA.map(k => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>

        {/* Waktu */}
        <div className="bg-white rounded-2xl p-4"
          style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
        >
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-3">
            <Clock size={16} weight="fill" color="#dc2626" />
            Waktu Kejadian *
          </label>
          <input
            type="datetime-local"
            value={form.waktu_kejadian}
            onChange={e => setForm({ ...form, waktu_kejadian: e.target.value })}
            className="w-full rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none"
            style={{
              background: '#f8f8fa',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}
          />
        </div>

        {/* Screenshot */}
        <div className="bg-white rounded-2xl p-4"
          style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
        >
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-1">
            <Images size={16} weight="fill" color="#dc2626" />
            Screenshot Bukti * <span className="text-gray-400 font-normal text-xs">(maks. 5 foto)</span>
          </label>
          <p className="text-xs text-gray-400 mb-3">
            Upload riwayat perjalanan dari aplikasi — boleh lebih dari 1 foto
          </p>

          <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 cursor-pointer transition-all"
            style={{ borderColor: '#fca5a5', background: '#fff5f5' }}
          >
            <Images size={32} color="#dc2626" weight="duotone" />
            <p className="text-sm font-semibold text-red-500 mt-2">Tap untuk upload foto</p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP</p>
            <input type="file" accept="image/*" multiple onChange={handleScreenshot} className="hidden" />
          </label>

          {screenshots.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {screenshots.map((file, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Screenshot ${index + 1}`}
                    className="w-full h-24 object-cover rounded-xl"
                  />
                  <button
                    onClick={() => hapusScreenshot(index)}
                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: 'linear-gradient(135deg, #dc2626, #f97316)' }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* No HP */}
        <div className="bg-white rounded-2xl p-4"
          style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
        >
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-3">
            <Phone size={16} weight="fill" color="#dc2626" />
            No. HP Driver <span className="text-gray-400 font-normal text-xs ml-1">(opsional)</span>
          </label>
          <input
            type="tel"
            placeholder="08xxxxxxxxxx"
            value={form.no_hp_driver}
            onChange={e => setForm({ ...form, no_hp_driver: e.target.value })}
            className="w-full rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none"
            style={{
              background: '#f8f8fa',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background: 'linear-gradient(135deg, #fef2f2, #fff7ed)' }}
          >
            <Warning size={20} color="#dc2626" weight="fill" />
            <p className="text-red-600 text-sm font-semibold">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-4 rounded-2xl font-extrabold text-base text-white flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50"
          style={{
            background: loading
              ? '#9ca3af'
              : 'linear-gradient(135deg, #b91c1c 0%, #dc2626 50%, #f97316 100%)',
            boxShadow: loading
              ? 'none'
              : '0 6px 20px rgba(220,38,38,0.5), 0 2px 8px rgba(0,0,0,0.15)',
            transform: loading ? 'none' : 'translateY(-1px)'
          }}
        >
          {loading
            ? '⏳ Mengirim Laporan...'
            : <>
                <PaperPlaneTilt size={20} weight="fill" />
                KIRIM LAPORAN
              </>
          }
        </button>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 pb-6 mt-2">
          DOKB — Perkumpulan Driver Online Kalimantan Selatan Bersatu
        </p>

      </div>
    </div>
  )
}
