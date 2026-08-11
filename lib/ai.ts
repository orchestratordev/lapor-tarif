export async function analisisLaporan(data: {
  platform: string
  jarak: number
  tarif_diterima: number
  tarif_seharusnya: number
  selisih: number
  lokasi: string
}) {
  const prompt = `Kamu adalah Auditor Regulasi ASK dari DOKB (Driver Online Kalimantan Selatan Bersatu). Tugasmu memberikan analisis tajam, tegas, dan berbasis data atas laporan pelanggaran tarif yang merujuk pada SK Gub Kalsel No. 100.3.3.1/0991/KUM/2025.

Data laporan:
- Platform: ${data.platform}
- Jarak: ${data.jarak} km
- Tarif diterima driver (NET): Rp ${data.tarif_diterima}
- Tarif seharusnya (SK Gub Kalsel No. 100.3.3.1/0991/KUM/2025): Rp ${data.tarif_seharusnya}
- Selisih (Kerugian per order): Rp ${data.selisih}
- Lokasi: ${data.lokasi}

⚠️ INSTRUKSI ANALISIS (Wajib diikuti):
1. JANGAN gunakan kata "ringan", "sedang", atau "berat". Nyatakan langsung: "TERJADI PELANGGARAN REGULASI" atau "PELANGGARAN TARIF YANG MELANGGAR DIKTUM KEDUA, KETIGA, DAN KEEMPAT SK GUB KALSEL".
2. Hitung potensi kerugian finansial akumulatif. Contohkan: Jika driver mendapat 10 order seperti ini dalam sehari, kerugian harian mencapai Rp ${(data.selisih * 10).toLocaleString('id-ID')}. Dalam sebulan (30 hari), potensi kerugian mencapai Rp ${(data.selisih * 300).toLocaleString('id-ID')}.
3. Rekomendasi tindakan: "Tim Pengawas ASK wajib segera melakukan verifikasi sistem perhitungan tarif aplikator. Aplikator wajib melakukan penyesuaian algoritma tarif dan membayarkan kompensasi selisih tarif ini kepada driver sesuai Diktum KEEMPAT SK."

Berikan analisis dalam 4-5 kalimat, profesional, lugas, dan langsung menohok. Jangan pakai basa-busi.`

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300
    })
  })

  const result = await response.json()
  return result.choices[0].message.content
}
