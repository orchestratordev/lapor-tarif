import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { kirimWA } from '@/lib/fonnte'
import { analisisLaporan } from '@/lib/ai'

// Nomor HP Tim Pengawas ASK
const TIM_PENGAWAS = [
  '6281351238108', // Pak Jani
  '628xxxxxxxxx', // Tim Pengawas 1
]

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // 1. Analisis AI
    const analisis = await analisisLaporan({
      platform: body.platform,
      jenis_layanan: body.jenis_layanan,
      tarif_diterima: body.tarif_diterima,
      tarif_seharusnya: body.tarif_seharusnya,
      selisih: body.tarif_seharusnya - body.tarif_diterima,
      lokasi: body.lokasi
    })

    // 2. Simpan ke Supabase
    const { data, error } = await supabase
      .from('laporan')
      .insert({
        ...body,
        analisis_ai: analisis,
        status: 'baru'
      })
      .select()
      .single()

    if (error) throw error

    // 3. Kirim notifikasi WA ke tim
    const pesan = `
🚨 *LAPORAN TARIF BARU*

📱 Platform: ${body.platform}
🛵 Jenis: ${body.jenis_layanan}
💰 Tarif diterima: Rp ${body.tarif_diterima.toLocaleString('id-ID')}
✅ Tarif seharusnya: Rp ${body.tarif_seharusnya.toLocaleString('id-ID')}
❌ Selisih: Rp ${(body.tarif_seharusnya - body.tarif_diterima).toLocaleString('id-ID')}
📍 Lokasi: ${body.lokasi}
🕐 Waktu: ${body.waktu_kejadian}

🤖 *Analisis AI:*
${analisis}

🔗 Lihat dashboard:
https://lapor.dokb.or.id/admin
    `

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
