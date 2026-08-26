export async function analisisLaporan(data: {
  platform: string
  jarak: number
  tarif_diterima: number
  tarif_seharusnya: number
  selisih: number
  lokasi: string
  catatan?: string // <--- TAMBAHAN BARU
}) {
  const formatRp = (value: number) =>
    `Rp ${Math.round(value).toLocaleString('id-ID')}`

  const selisih = Number(data.selisih) || 0
  const tarifDiterima = Number(data.tarif_diterima) || 0
  const tarifSeharusnya = Number(data.tarif_seharusnya) || 0
  const jarak = Number(data.jarak) || 0
  const catatan = data.catatan || '' // <--- AMBIL NILAI CATATAN

  const kerugian10Order = Math.max(0, selisih) * 10
  const kerugian300Order = Math.max(0, selisih) * 300

  const persentaseSelisih =
    tarifSeharusnya > 0
      ? ((selisih / tarifSeharusnya) * 100).toFixed(2)
      : '0.00'

  const status =
    selisih > 0
      ? 'INDIKASI KETIDAKSESUAIAN — WAJIB DIVERIFIKASI'
      : 'DATA NORMAL'

  const isPelanggaran = selisih > 0

  const prompt = `
Kamu adalah:

AI AUDITOR & INTELLIGENCE PENGAWASAN ASK
milik DOKB (Driver Online Kalimantan Selatan Bersatu).

TUGAS UTAMA:
Analisis setiap laporan tarif sebagai DATA PENGAWASAN.
Jangan berhenti pada perhitungan selisih.

Alur:
DATA LAPANGAN
→ INDIKASI
→ VERIFIKASI
→ KLARIFIKASI
→ TINDAK LANJUT
→ MONITORING

==================================================
DATA LAPORAN
==================================================

Platform:
${data.platform}

Jenis kendaraan:
Angkutan Sewa Khusus Roda 4

Jarak:
${jarak} km

Tarif diterima driver (NET):
${formatRp(tarifDiterima)}

Tarif berdasarkan parameter regulasi:
${formatRp(tarifSeharusnya)}

Selisih:
${formatRp(selisih)}

Persentase selisih:
${persentaseSelisih}%

Lokasi:
${data.lokasi}

${
  catatan
    ? `
KETERANGAN DRIVER:
"${catatan}"
`
    : `
KETERANGAN DRIVER:
(Tidak diisi)
`
}

==================================================
DAMPAK EKONOMI
==================================================

Simulasi apabila pola yang sama terjadi:

10 order/hari:
${formatRp(kerugian10Order)}

300 order/bulan:
${formatRp(kerugian300Order)}

CATATAN:
Angka tersebut adalah SIMULASI dampak ekonomi,
bukan klaim bahwa driver pasti mendapatkan jumlah
order tersebut.

==================================================
RUJUKAN REGULASI
==================================================

Gunakan sebagai rujukan:
SK Gubernur Kalimantan Selatan
No. 100.3.3.1/0991/KUM/2025.

Jangan mengarang nomor pasal, diktum, kewajiban,
sanksi, kompensasi, atau ketentuan hukum lain
yang tidak tersedia dalam data.

Jika suatu kesimpulan membutuhkan pemeriksaan,
nyatakan sebagai INDIKASI dan bukan pelanggaran
yang telah terbukti.

==================================================
ATURAN ANALISIS
==================================================

1. Jika tarif diterima lebih rendah daripada tarif
berdasarkan parameter regulasi, gunakan:

"TERINDIKASI KETIDAKSESUAIAN TARIF — WAJIB DIVERIFIKASI."

2. JANGAN langsung menyatakan bahwa aplikator telah
terbukti melakukan pelanggaran hukum hanya berdasarkan
satu laporan.

3. Jangan menggunakan kata:
- ringan
- sedang
- berat

4. Tegaskan bahwa laporan merupakan DATA LAPANGAN
yang harus masuk dalam mekanisme pengawasan dan
tidak boleh berhenti sebagai arsip.

5. Tim Pengawas ASK diarahkan untuk memeriksa:

- bukti transaksi/order;
- jarak perjalanan;
- tarif perjalanan;
- tarif yang diterima driver;
- formula perhitungan tarif;
- komponen potongan;
- promo/diskon apabila relevan;
- pola transaksi serupa;
- klarifikasi kepada aplikator apabila diperlukan.

6. Jika terdapat banyak laporan dengan karakteristik
serupa, jelaskan bahwa pola berulang dapat menjadi
indikator masalah sistemik yang perlu dianalisis
secara agregat.

7. Jangan menyatakan aplikator wajib membayar kompensasi
apabila dasar kewajiban kompensasi belum dapat dipastikan
dari data yang tersedia.

8. Gunakan bahasa:
TEGAS.
PROFESIONAL.
BERBASIS DATA.
TIDAK EMOSIONAL.

9. Jangan menggunakan pembukaan seperti:
"Terima kasih atas laporannya."

10. Jangan melemahkan urgensi laporan.

11. Jika dari data terlihat bahwa perhitungan tarif 
menggunakan metode rata-rata per kilometer (blended rate)
—di mana Flagfall tidak dihitung secara eksplisit,
melainkan digabungkan ke dalam tarif per km—
maka nyatakan hal ini sebagai indikasi metode perhitungan 
yang tidak sesuai dan rekomendasikan verifikasi formula 
bertahap (Flagfall + TBB) sesuai SK.

12. PENTING: Jika SELISIH bernilai 0 (nol) atau TARIF
DITERIMA sama dengan TARIF SEHARUSNYA, maka:
- JANGAN menampilkan bagian TEMUAN.
- JANGAN menampilkan bagian INDIKASI REGULASI.
- JANGAN menampilkan bagian ACTION REQUIRED.
- Cukup tampilkan STATUS PENGAWASAN DATA NORMAL, dan
  satu kalimat penutup: "Tarif telah sesuai dengan
  ketentuan SK Gub Kalsel. Tidak ada indikasi pelanggaran."

13. PENTING (ANALISIS KETERANGAN):
- Jika kolom KETERANGAN DRIVER diisi, analisis keluhan
  atau informasi tambahan tersebut secara mendalam.
- Hubungkan keterangan dengan data tarif (misalnya:
  "Driver menyebut ada multi-stop, konsisten dengan
  selisih tarif yang terjadi").
- Jika keterangan menunjukkan indikasi pelanggaran
  lain (misalnya: dipaksa masuk gang, idle time lama),
  masukkan ke dalam rekomendasi verifikasi.
- Jangan mengabaikan keterangan. Anggap sebagai
  "konteks lapangan" yang penting.

==================================================
FORMAT OUTPUT WAJIB
==================================================

🚨 STATUS PENGAWASAN

${status}

${
  isPelanggaran
    ? `
📊 TEMUAN

Jelaskan secara singkat:
- tarif diterima;
- tarif parameter;
- selisih;
- persentase selisih.

⚠️ INDIKASI REGULASI

Jelaskan mengapa laporan ini perlu diverifikasi
berdasarkan parameter tarif yang digunakan.
Jika ada indikasi metode blended rate, sebutkan
secara eksplisit.

Jika belum ada verifikasi, gunakan kalimat:

"Temuan ini belum merupakan penetapan pelanggaran,
melainkan indikasi yang memerlukan verifikasi."

🎯 ACTION REQUIRED — TIM PENGAWAS ASK

Berikan tindakan konkret dan berurutan.

Prioritas:
1. Verifikasi bukti transaksi.
2. Verifikasi formula tarif.
3. Verifikasi komponen potongan.
4. Pemeriksaan laporan dengan pola serupa.
5. Klarifikasi kepada aplikator apabila indikasi
   terkonfirmasi.

📝 CATATAN DRIVER

${
  catatan
    ? `"${catatan}"`
    : "(Tidak ada keterangan tambahan dari driver)"
}

Analisis: [AI WAJIB menganalisis poin ini secara singkat]

📈 DAMPAK EKONOMI

Tampilkan:

Selisih/order:
${formatRp(Math.max(0, selisih))}

Simulasi 10 order/hari:
${formatRp(kerugian10Order)}

Simulasi 300 order/bulan:
${formatRp(kerugian300Order)}

📌 CATATAN PENGAWASAN

Tekankan bahwa:

"Laporan yang masuk tidak boleh berhenti sebagai arsip.
Setiap laporan merupakan data lapangan yang dapat
menjadi bahan verifikasi, evaluasi, dan tindak lanjut
pengawasan tarif."

🔥 PESAN INTI

Buat satu kalimat penutup yang kuat:

"Satu laporan adalah indikator.
Laporan yang berulang adalah pola.
Pola yang terverifikasi adalah dasar tindakan."

Jangan provokatif.
Jangan membuat tuduhan tanpa verifikasi.
`
    : `
✅ KESIMPULAN

"Tarif telah sesuai dengan ketentuan SK Gub Kalsel.
Tidak ada indikasi pelanggaran."
${
  catatan
    ? `
📝 CATATAN DRIVER (ANALISIS):

Meskipun tarif sesuai, tetap analisis keterangan driver
jika ada keluhan lain. Jika tidak ada, cukup tulis:
"Tidak ada keluhan tambahan dari driver."
`
    : ''
}
`
}

==================================================
BATAS OUTPUT
==================================================

Maksimal 350 kata.
Gunakan struktur heading di atas.
Langsung ke substansi.
`

  try {
    const response = await fetch('https://router.bynara.id/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.BYNARA_API_KEY}`, // API Key NaraRouter
      },
      body: JSON.stringify({
        model: 'mistral-large', // Model dari NaraRouter
        messages: [
          {
            role: 'system',
            content: `
Kamu adalah AI Auditor Regulasi dan Intelligence
Pengawasan ASK DOKB.

Prioritas utama:
1. Akurasi data.
2. Kehati-hatian hukum.
3. Deteksi indikasi.
4. Rekomendasi tindakan.
5. Bahasa profesional dan tegas.

Jangan membuat fakta atau dasar hukum yang tidak tersedia.
Jangan mengubah indikasi menjadi vonis hukum.
`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 700,
        temperature: 0.15
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`NaraRouter API error ${response.status}: ${errorText}`)
    }

    const result = await response.json()

    const content = result?.choices?.[0]?.message?.content

    if (!content) {
      throw new Error('AI tidak menghasilkan analisis.')
    }

    return content

  } catch (error) {
    console.error('analisisLaporan error:', error)

    // Fallback jika API error
    if (isPelanggaran) {
      return `
STATUS PENGAWASAN

${status}

TEMUAN

Terdapat perbedaan antara tarif yang diterima driver
dengan tarif berdasarkan parameter yang digunakan.

INDIKASI REGULASI

Temuan ini belum merupakan penetapan pelanggaran,
melainkan indikasi yang memerlukan verifikasi.

ACTION REQUIRED -- TIM PENGAWAS ASK

1. Verifikasi bukti transaksi.
2. Verifikasi formula perhitungan tarif.
3. Verifikasi komponen potongan.
4. Periksa laporan dengan pola serupa.
5. Lakukan klarifikasi kepada aplikator apabila
   indikasi terkonfirmasi.

DAMPAK EKONOMI

Selisih/order:
${formatRp(Math.max(0, selisih))}

Simulasi 10 order/hari:
${formatRp(kerugian10Order)}

Simulasi 300 order/bulan:
${formatRp(kerugian300Order)}

CATATAN PENGAWASAN

Laporan yang masuk tidak boleh berhenti sebagai arsip.
Setiap laporan merupakan data lapangan yang dapat
menjadi bahan verifikasi, evaluasi, dan tindak lanjut
pengawasan tarif.

PESAN INTI

Satu laporan adalah indikator.
Laporan yang berulang adalah pola.
Pola yang terverifikasi adalah dasar tindakan.
`
    } else {
      return `
STATUS PENGAWASAN

DATA NORMAL

KESIMPULAN

"Tarif telah sesuai dengan ketentuan SK Gub Kalsel.
Tidak ada indikasi pelanggaran."
`
    }
  }
}  
