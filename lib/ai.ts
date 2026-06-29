import OpenAI from 'openai'

const client = new OpenAI({
  baseURL: 'https://integrate.api.nvidia.com/v1',
  apiKey: process.env.NVIDIA_API_KEY!
})

export async function analisisLaporan(data: {
  platform: string
  jenis_layanan: string
  tarif_diterima: number
  tarif_seharusnya: number
  selisih: number
  lokasi: string
}) {
  const prompt = `
Kamu adalah analis pelanggaran tarif ojek online Kalimantan Selatan.

Data laporan:
- Platform: ${data.platform}
- Jenis: ${data.jenis_layanan}
- Tarif diterima driver: Rp ${data.tarif_diterima}
- Tarif seharusnya (SK Gub): Rp ${data.tarif_seharusnya}
- Selisih: Rp ${data.selisih}
- Lokasi: ${data.lokasi}

Berikan analisis singkat (3-4 kalimat) mencakup:
1. Tingkat pelanggaran (ringan/sedang/berat)
2. Dampak ke driver
3. Rekomendasi tindakan
`

  const response = await client.chat.completions.create({
    model: 'deepseek-ai/deepseek-r1',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 300
  })

  return response.choices[0].message.content
}
