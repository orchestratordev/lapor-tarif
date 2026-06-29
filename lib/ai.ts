export async function analisisLaporan(data: {
  platform: string
  jarak: number
  tarif_diterima: number
  tarif_seharusnya: number
  selisih: number
  lokasi: string
}) {
  const prompt = `Kamu adalah analis pelanggaran tarif ojek online Kalimantan Selatan.

Data laporan:
- Platform: ${data.platform}
- Jarak: ${data.jarak} km
- Tarif diterima driver (NET): Rp ${data.tarif_diterima}
- Tarif seharusnya (SK Gub No.0991/2025): Rp ${data.tarif_seharusnya}
- Selisih: Rp ${data.selisih}
- Lokasi: ${data.lokasi}

Berikan analisis singkat (3-4 kalimat):
1. Tingkat pelanggaran (ringan/sedang/berat)
2. Dampak ke driver
3. Rekomendasi tindakan`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }]
    })
  })

  const result = await response.json()
  return result.content[0].text
}
