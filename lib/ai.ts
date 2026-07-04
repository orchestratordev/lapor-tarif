export async function analisisLaporan(data: {
  platform: string
  jarak: number
  tarif_diterima: number
  tarif_seharusnya: number
  selisih: number
  lokasi: string
}) {
  const prompt = `Kamu adalah analis pelanggaran tarif ASK Kalimantan Selatan.

Data laporan:
- Platform: ${data.platform}
- Jarak: ${data.jarak} km
- Tarif diterima driver (NET): Rp ${data.tarif_diterima}
- Tarif seharusnya (SK Gub No.100.3.3.1/0991/2025): Rp ${data.tarif_seharusnya}
- Selisih: Rp ${data.selisih}
- Lokasi: ${data.lokasi}

Berikan analisis singkat (3-4 kalimat):
1. Tingkat pelanggaran (ringan/sedang/berat)
2. Dampak ke driver
3. Rekomendasi tindakan`

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
