'use client'

import { useState } from 'react'

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
  return FLAGFALL + ((jarak - FLAGFALL_KM) * TBB)
}

export default function Home() {
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
      // Upload screenshots ke Supabase Storage
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

  if (sukses) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">
            Laporan Terkirim!
          </h2>
          <p className="text-gray-600 mb-6">
            Terima kasih! Laporan kamu sudah diterima dan tim pengawas ASK DOKB sedang memproses.
          </p>
          <button
            onClick={resetForm}
            className="bg-green-500 text-white px-6 py-3 rounded-xl font-semibold w-full"
          >
            Lapor Lagi
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-red-600 text-white p-4 text-center">
        <h1 className="text-xl font-bold">🚨 LAPOR TARIF</h1>
        <p className="text-sm text-red-100">DOKB — Kalimantan Selatan</p>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4 mt-4">

        {/* Info SK Gub */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
          <p className="text-xs text-blue-700 font-semibold">
            📋 SK Gubernur Kalsel No. 100.3.3.1/0991/KUM/2025
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Flagfall: Rp 16.000 (0-3 km) • TBB: Rp 4.000/km
          </p>
          <p className="text-xs text-blue-600">
            Tarif yang dilaporkan adalah <strong>NET to Driver</strong>
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow p-4 space-y-4">

          {/* Platform */}
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Platform *
            </label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {PLATFORM.map(p => (
                <button
                  key={p}
                  onClick={() => setForm({ ...form, platform: p })}
                  className={`py-2 px-3 rounded-xl border text-sm font-medium transition-all ${
                    form.platform === p
                      ? 'bg-red-500 text-white border-red-500'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Jenis Layanan */}
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500 font-semibold">Jenis Layanan</p>
            <p className="text-sm font-bold text-gray-700 mt-1">🚗 Mobil (R4)</p>
          </div>

          {/* Jarak */}
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Jarak Tempuh *
            </label>
            <div className="relative mt-2">
              <input
                type="number"
                placeholder="0"
                value={form.jarak}
                onChange={e => setForm({ ...form, jarak: e.target.value })}
                className="w-full border border-gray-200 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-red-400"
              />
              <span className="absolute right-3 top-3 text-gray-400 text-sm">km</span>
            </div>
            {/* Auto hitung tarif seharusnya */}
            {form.jarak && Number(form.jarak) > 0 && (
              <div className="mt-2 p-2 rounded-lg bg-blue-50 text-xs text-blue-700">
                💡 Tarif seharusnya (NET):
                <strong> Rp {tarifSeharusnya.toLocaleString('id-ID')}</strong>
              </div>
            )}
          </div>

          {/* Tarif Diterima */}
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Tarif NET yang Diterima *
            </label>
            <div className="relative mt-2">
              <span className="absolute left-3 top-3 text-gray-400 text-sm">Rp</span>
              <input
                type="number"
                placeholder="0"
                value={form.tarif_diterima}
                onChange={e => setForm({ ...form, tarif_diterima: e.target.value })}
                className="w-full border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-red-400"
              />
            </div>
            {form.jarak && form.tarif_diterima && (
              <div className={`mt-2 p-2 rounded-lg text-xs ${
                selisih > 0
                  ? 'bg-red-50 text-red-600'
                  : 'bg-green-50 text-green-600'
              }`}>
                {selisih > 0
                  ? `⚠️ Kurang Rp ${selisih.toLocaleString('id-ID')} dari tarif SK Gub`
                  : `✅ Tarif sesuai atau lebih dari SK Gubernur`
                }
              </div>
            )}
          </div>

          {/* Lokasi */}
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Lokasi Kejadian *
            </label>
            <select
              value={form.lokasi}
              onChange={e => setForm({ ...form, lokasi: e.target.value })}
              className="w-full border border-gray-200 rounded-xl py-3 px-4 text-sm mt-2 focus:outline-none focus:border-red-400"
            >
              <option value="">Pilih Kota/Kabupaten</option>
              {KOTA.map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>

          {/* Waktu */}
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Waktu Kejadian *
            </label>
            <input
              type="datetime-local"
              value={form.waktu_kejadian}
              onChange={e => setForm({ ...form, waktu_kejadian: e.target.value })}
              className="w-full border border-gray-200 rounded-xl py-3 px-4 text-sm mt-2 focus:outline-none focus:border-red-400"
            />
          </div>

          {/* Screenshot */}
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Screenshot Bukti * <span className="text-gray-400 font-normal">(maks. 5 foto)</span>
            </label>
            <p className="text-xs text-gray-400 mt-1">
              Upload riwayat perjalanan dari aplikasi (boleh lebih dari 1 screenshot)
            </p>
            <label className="mt-2 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-4 cursor-pointer hover:border-red-300 transition-all">
              <div className="text-center">
                <p className="text-2xl">📸</p>
                <p className="text-xs text-gray-500 mt-1">Tap untuk upload foto</p>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleScreenshot}
                className="hidden"
              />
            </label>
            {/* Preview screenshots */}
            {screenshots.length > 0 && (
              <div className="mt-2 grid grid-cols-3 gap-2">
                {screenshots.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Screenshot ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => hapusScreenshot(index)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* No HP (opsional) */}
          <div>
            <label className="text-sm font-semibold text-gray-700">
              No. HP Driver <span className="text-gray-400 font-normal">(opsional)</span>
            </label>
            <input
              type="tel"
              placeholder="08xxxxxxxxxx"
              value={form.no_hp_driver}
              onChange={e => setForm({ ...form, no_hp_driver: e.target.value })}
              className="w-full border border-gray-200 rounded-xl py-3 px-4 text-sm mt-2 focus:outline-none focus:border-red-400"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-red-600 text-sm">⚠️ {error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-red-600 text-white py-4 rounded-xl font-bold text-base disabled:opacity-50 active:scale-95 transition-all"
          >
            {loading ? '⏳ Mengirim Laporan...' : '🚨 KIRIM LAPORAN'}
          </button>

        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 pb-4">
          DOKB — Perkumpulan Driver Online Kalimantan Selatan Bersatu
        </p>

      </div>
    </div>
  )
}
