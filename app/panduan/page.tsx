'use client'

import Link from 'next/link'
import { ArrowLeft, Car, Users, Images, ShieldCheck, Question, CheckCircle } from '@phosphor-icons/react'

export default function PanduanPage() {
  return (
    <div className="min-h-screen" style={{ background: '#f8f8fa' }}>
      {/* Header */}
      <div className="relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 60%, #f97316 100%)',
        paddingBottom: 32
      }}>
        <div className="relative p-6 pt-8 max-w-md mx-auto">
          <Link href="/" className="flex items-center gap-2 text-white/80 mb-4 text-sm font-semibold">
            <ArrowLeft size={16} weight="bold" /> Kembali ke Beranda
          </Link>
          <h1 className="text-xl font-extrabold text-white" style={{ fontFamily: 'var(--font-plus-jakarta)' }}>
            Panduan & Bantuan
          </h1>
          <p className="text-red-100 text-sm mt-1">Cara melapor tarif ASK di Kalimantan Selatan</p>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6 relative z-10 -mt-4">

        {/* 1. Cara Pakai */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-extrabold text-gray-800 text-base mb-4 flex items-center gap-2">
            <CheckCircle size={20} color="#dc2626" weight="fill" />
            Cara Melapor (4 Langkah)
          </h2>
          <div className="space-y-4 text-sm text-gray-600">
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 font-bold flex items-center justify-center text-xs flex-shrink-0">1</span>
              <p><strong>Pilih jenis pelapor:</strong> Di halaman utama, klik tombol <strong>"Driver Online"</strong> atau <strong>"Masyarakat / Penumpang"</strong>.</p>
            </div>
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 font-bold flex items-center justify-center text-xs flex-shrink-0">2</span>
              <p><strong>Isi formulir:</strong> Masukkan data dengan jujur (Platform, Jarak, Tarif, Lokasi, dan Waktu Kejadian).</p>
            </div>
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 font-bold flex items-center justify-center text-xs flex-shrink-0">3</span>
              <p><strong>Lampirkan Bukti:</strong> Upload 1-5 foto screenshot dari aplikasi order. <span className="text-red-600 font-semibold">Ini WAJIB!</span></p>
            </div>
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 font-bold flex items-center justify-center text-xs flex-shrink-0">4</span>
              <p><strong>Kirim:</strong> Klik tombol besar <strong>"KIRIM LAPORAN"</strong>. Tim Pengawas ASK akan segera menerima laporan Anda.</p>
            </div>
          </div>
        </div>

        {/* 2. FAQ Driver & Masyarakat */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-extrabold text-gray-800 text-base mb-4 flex items-center gap-2">
            <Question size={20} color="#dc2626" weight="fill" />
            Tanya Jawab (FAQ)
          </h2>
          
          <div className="space-y-4">
            <div>
              <p className="font-bold text-gray-800 text-sm flex items-center gap-2"><Car size={16} color="#dc2626" weight="fill" /> Driver Online</p>
              <div className="mt-2 space-y-3 text-sm text-gray-600 pl-6">
                <div><span className="font-bold text-gray-700">Q: Apakah saya harus screenshot?</span><br/>A: Wajib! Screenshot adalah bukti utama agar laporan bisa ditindaklanjuti oleh Tim Pengawas.</div>
                <div><span className="font-bold text-gray-700">Q: Berapa maksimal foto?</span><br/>A: Maksimal 5 foto. Pilih yang paling jelas menunjukkan jarak, waktu, dan tarif.</div>
                <div><span className="font-bold text-gray-700">Q: Apakah laporan saya aman?</span><br/>A: Ya. Data hanya untuk Tim Pengawas ASK dan DOKB, tidak dipublikasikan ke umum.</div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100">
              <p className="font-bold text-gray-800 text-sm flex items-center gap-2"><Users size={16} color="#2563eb" weight="fill" /> Masyarakat / Penumpang</p>
              <div className="mt-2 space-y-3 text-sm text-gray-600 pl-6">
                <div><span className="font-bold text-gray-700">Q: Saya tidak tahu jarak tempuh, bisa lapor?</span><br/>A: Bisa. Cukup isi tarif yang Anda bayar. Kolom jarak boleh dikosongkan.</div>
                <div><span className="font-bold text-gray-700">Q: Apakah nama saya akan muncul?</span><br/>A: Nama bersifat opsional. Anda bisa lapor secara anonim tanpa nama.</div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Contoh Screenshot */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-extrabold text-gray-800 text-base mb-4 flex items-center gap-2">
            <Images size={20} color="#dc2626" weight="fill" />
            Contoh Screenshot yang Benar
          </h2>
          <p className="text-sm text-gray-500 mb-4">Pastikan screenshot Anda memperlihatkan <strong>Jarak Tempuh (km)</strong>, <strong>Total Tarif</strong>, dan <strong>Waktu Order</strong> dengan jelas.</p>
          
          {/* Tempat Gambar */}
          <div className="rounded-xl overflow-hidden border-2 border-green-500 relative">
            <div className="aspect-[9/16] bg-gray-200 flex items-center justify-center text-gray-400 text-sm p-4 text-center">
              [ 📸 Tempat SS Contoh Aplikasi, Pak Jani ]
            </div>
            <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">✓ Benar</div>
          </div>
          <p className="text-xs text-green-600 font-semibold mt-2 text-center">Contoh: Screenshot harus memperlihatkan total tarif dan jarak.</p>
        </div>

        {/* Tombol Kembali */}
        <Link href="/"
          className="block w-full py-4 rounded-2xl font-extrabold text-base text-white text-center"
          style={{ background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 50%, #f97316 100%)', boxShadow: '0 6px 20px rgba(220,38,38,0.5)' }}
        >
          Kembali ke Beranda
        </Link>

        <p className="text-center text-[10px] text-gray-300 pb-4">
          DOKB — Perkumpulan Driver Online Kalimantan Selatan Bersatu
        </p>
      </div>
    </div>
  )
}
