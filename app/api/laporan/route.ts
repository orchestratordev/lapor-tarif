import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { kirimWA } from '@/lib/fonnte'
import { analisisLaporan } from '@/lib/ai'

const TIM_PENGAWAS = [
  '6281351238108', // Pak Jani
  '6289691800108', // Tim Pengawas 1
]
// ─── Helper untuk mengubah UTC ke WITA ──────────────────────────────────────
const formatWaktuWITA = (isoString: string) => {
  if (!isoString) return '-';
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Makassar',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date); + ' WITA';
};
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // 1. Analisis AI (tidak blocking)
let analisis = 'Analisis AI tidak tersedia'
try {
  analisis = await analisisLaporan({
  platform: body.platform,
  jarak: body.jarak,
  tarif_diterima: body.tarif_diterima,
  tarif_seharusnya: body.tarif_seharusnya,
  selisih: body.tarif_seharusnya - body.tarif_diterima,
  lokasi: body.lokasi,
  catatan: body.catatan || '' // <--- TAMBAHKAN BARIS INI
})
} catch (aiError) {
  console.error('AI Error:', aiError)
}

   // 2. Simpan ke Supabase (tanpa selisih — auto generated)
    const { data, error } = await supabase
      .from('laporan')
      .insert({
        platform: body.platform,
        jenis_layanan: 'Mobil',
        jarak: body.jarak,
        tarif_diterima: Math.round(body.tarif_diterima),
        tarif_seharusnya: Math.round(body.tarif_seharusnya),
        lokasi: body.lokasi,
        waktu_kejadian: body.waktu_kejadian,
        no_hp_driver: body.no_hp_driver || null,
        screenshots: body.screenshots || [],
        analisis_ai: analisis,
        status: 'baru'
      })
      .select()
      .single() 

    if (error) throw error

    // 3. Kirim notifikasi WA
    const selisih = body.tarif_seharusnya - body.tarif_diterima
    const pesan = `🚨 *LAPORAN TARIF BARU*

📱 Platform: ${body.platform}
🚗 Jenis: Mobil (R4)
📏 Jarak: ${body.jarak} km
💰 Tarif diterima (NET): Rp ${body.tarif_diterima.toLocaleString('id-ID')}
✅ Tarif seharusnya: Rp ${body.tarif_seharusnya.toLocaleString('id-ID')}
❌ Selisih: Rp ${selisih.toLocaleString('id-ID')}
📍 Lokasi: ${body.lokasi}
🕐 Waktu: ${formatWaktuWITA(body.waktu_kejadian)}

🤖 *Analisis AI:*
${analisis}

🔗 Dashboard: https://lapor-tarif.vercel.app/admin`

    for (const nomor of TIM_PENGAWAS) {
      await kirimWA(nomor, pesan)
    }

    return NextResponse.json({
      success: true,
      message: 'Laporan berhasil dikirim!',
      data
    })

  } catch (error) {
    console.error(error)
    return NextResponse.json({
      success: false,
      message: 'Gagal mengirim laporan, coba lagi!'
    }, { status: 500 })
  }
}
