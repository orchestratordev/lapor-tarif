import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export async function analisisLaporan(data: {
  platform: string
  jarak: number
  tarif_diterima: number
  tarif_seharusnya: number
  selisih: number
  lokasi: string
  catatan?: string
}) {
  const formatRp = (value: number) =>
    `Rp ${Math.round(value).toLocaleString('id-ID')}`

  const selisih = Number(data.selisih) || 0
  const tarifDiterima = Number(data.tarif_diterima) || 0
  const tarifSeharusnya = Number(data.tarif_seharusnya) || 0
  const jarak = Number(data.jarak) || 0
  const catatan = data.catatan || ''

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

  const systemInstruction = `
Kamu adalah AI Auditor Regulasi dan Intelligence
Pengawasan ASK DOKB.

Prioritas utama:
1. Akurasi data.
2. Kehati-hatian hukum.
3. Deteksi indikasi.
4. Rekomendasi tindakan.
5. Bahasa profesional dan tegas.
6. Analisis ORIGINAL per laporan — hindari kalimat baku
   yang bisa dipakai ulang identik di laporan lain.

Jangan membuat fakta atau dasar hukum yang tidak tersedia.
Jangan mengubah indikasi menjadi vonis hukum.
`

  const prompt = `
Kamu adalah:

AI AUDITOR & INTELLIGENCE PENGAWASAN ASK
milik DOKB (Driver Online Kalimantan Selatan Bersatu).

TUGAS UTAMA:
Analisis setiap laporan tarif sebagai DATA PENGAWASAN.
Jangan berhenti pada perhitungan selisih.
Setiap laporan itu unik — tulis analisis ORIGINAL untuk
laporan ini secara spesifik, JANGAN gunakan kalimat baku
yang bisa dipakai ulang persis sama di laporan lain.

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
berdasarkan parameter regulasi, gunakan status:
"TERINDIKASI KETIDAKSESUAIAN TARIF -- WAJIB DIVERIFIKASI."

2. JANGAN langsung menyatakan bahwa aplikator telah
terbukti melakukan pelanggaran hukum hanya berdasarkan
satu laporan.

3. Jangan menggunakan kata:
- ringan
- sedang
- berat

4. Tegaskan (dengan kalimatmu sendiri, bukan hafalan)
bahwa laporan merupakan DATA LAPANGAN yang harus masuk
dalam mekanisme pengawasan dan tidak boleh berhenti
sebagai arsip.

5. Tim Pengawas ASK perlu memeriksa hal-hal berikut —
gunakan sebagai DASAR PERTIMBANGAN, lalu susun sendiri
urutan prioritas paling relevan untuk KASUS INI
(pertimbangkan platform, besaran persentase selisih,
dan isi keterangan driver kalau ada):

- bukti transaksi/order;
- jarak perjalanan;
- tarif perjalanan;
- tarif yang diterima driver;
- formula perhitungan tarif;
- komponen potongan;
- promo/diskon apabila relevan;
- pola transaksi serupa;
- klarifikasi kepada aplikator apabila diperlukan.

Jangan sekadar menyalin daftar di atas — tulis ulang
sebagai rekomendasi tindakan yang mengalir dan terasa
disusun khusus untuk laporan ini.

6. Jika dari data terlihat pola yang berpotensi berulang
(misal persentase selisih besar, atau keterangan driver
menyebut kejadian yang sering terjadi), jelaskan dengan
kalimatmu sendiri bahwa pola berulang bisa jadi indikator
masalah sistemik yang perlu dianalisis agregat.

7. Jangan menyatakan aplikator wajib membayar kompensasi
apabila dasar kewajiban kompensasi belum dapat dipastikan
dari data yang tersedia.

8. Gunakan bahasa:
TEGAS.
PROFESIONAL.
BERBASIS DATA.
TIDAK EMOSIONAL.
Variasikan pilihan kata & struktur kalimat antar laporan —
jangan sampai dua laporan berbeda punya bunyi paragraf
yang nyaris identik.

9. Jangan menggunakan pembukaan seperti:
"Terima kasih atas laporannya."

10. Jangan melemahkan urgensi laporan.

11. Jika dari data terlihat bahwa perhitungan tarif
menggunakan metode rata-rata per kilometer (blended rate)
--di mana Flagfall tidak dihitung secara eksplisit,
melainkan digabungkan ke dalam tarif per km--
maka nyatakan hal ini sebagai indikasi metode perhitungan
yang tidak sesuai dan rekomendasikan verifikasi formula
bertahap (Flagfall + TBB) sesuai SK.

12. PENTING: Jika SELISIH bernilai 0 (nol) atau TARIF
DITERIMA sama dengan TARIF SEHARUSNYA, maka:
- JANGAN menampilkan bagian TEMUAN.
- JANGAN menampilkan bagian INDIKASI REGULASI.
- JANGAN menampilkan bagian ACTION REQUIRED.
- Cukup tampilkan STATUS PENGAWASAN DATA NORMAL, dan
  satu kalimat penutup dengan kalimatmu sendiri yang
  intinya: tarif telah sesuai ketentuan SK Gub Kalsel,
  tidak ada indikasi pelanggaran.

13. PENTING (ANALISIS KETERANGAN):
- Jika kolom KETERANGAN DRIVER diisi, analisis keluhan
  atau informasi tambahan tersebut secara mendalam dan
  spesifik — sebut ulang inti keterangannya dengan
  kalimatmu sendiri, jangan cuma menempel generik.
- Hubungkan keterangan dengan data tarif.
- Jangan mengabaikan keterangan. Anggap sebagai
  "konteks lapangan" yang penting.

14. PENTING (SELISIH NEGATIF):
- Jika SELISIH bernilai NEGATIF (tarif diterima > tarif
  seharusnya), maka ini BUKAN pelanggaran.
- JANGAN menampilkan STATUS "INDIKASI KETIDAKSESUAIAN".
- Cukup tampilkan STATUS: "DATA NORMAL - KEPATUHAN".
- JANGAN menuduh aplikator melakukan pelanggaran.

15. PENTING (LAYANAN PREMIUM):
- Layanan premium seperti "GoCar Comfort", "GrabCar XL",
  atau kategori sejenis adalah variasi layanan yang SAH.
- Jika driver menerima tarif LEBIH TINGGI dari SK, maka
  ini adalah hal yang POSITIF dan bukan masalah.

16. PENTING (FORMAT OUTPUT):
- JANGAN menggunakan tanda bintang (*), underscore (_),
  atau simbol Markdown apapun.
- Tampilkan SEMUA teks sebagai teks polos.
- Gunakan huruf kapital atau struktur baris untuk penekanan.

17. PENTING (LARANGAN MENGARANG):
- JANGAN menyebut "Pasal", "Diktum", atau nomor peraturan
  apa pun kecuali yang benar-benar tertulis dalam data
  laporan (yang sudah berisi rujukan SK Gub Kalsel No.
  100.3.3.1/0991/KUM/2025).
- SK Gubernur Kalsel menggunakan istilah "Diktum", bukan
  "Pasal". Jika tidak yakin, cukup tulis "ketentuan SK
  Gubernur" tanpa menyebut nomor.
- HALUSINASI HUKUM adalah kesalahan fatal. Berfokuslah
  pada analisis selisih tarif dan laporan driver.

18. PENTING (ANTI-TEMPLATE):
- Setiap kalimat yang kamu tulis di bagian TEMUAN,
  INDIKASI REGULASI, ACTION REQUIRED, CATATAN PENGAWASAN,
  dan PESAN INTI HARUS kamu susun sendiri berdasarkan data
  laporan ini — bukan kalimat hafalan yang bisa dipakai
  ulang tanpa perubahan di laporan lain.
- Sebagai uji sederhana: jika kalimat yang kamu tulis
  akan terbaca 100% sama persis walau platform, lokasi,
  jarak, atau keterangan drivernya diganti, berarti
  kalimat itu terlalu generik — tulis ulang supaya
  benar-benar mengacu ke detail laporan ini.

==================================================
FORMAT OUTPUT WAJIB
==================================================

🚨 STATUS PENGAWASAN

${status}

${
  isPelanggaran
    ? `
📊 TEMUAN

Jelaskan dengan kalimatmu sendiri (2-4 kalimat):
- tarif diterima, tarif parameter, selisih, dan
  persentase selisih untuk KASUS INI;
- kaitkan dengan platform (${data.platform}) dan
  lokasi (${data.lokasi}) secara eksplisit.

⚠️ INDIKASI REGULASI

Jelaskan dengan kalimatmu sendiri mengapa laporan ini
perlu diverifikasi, berdasarkan parameter tarif yang
digunakan. Jika ada indikasi metode blended rate,
sebutkan secara eksplisit. Tegaskan bahwa ini baru
indikasi, bukan penetapan pelanggaran — tapi susun
kalimatnya sendiri, jangan menyalin frasa baku.

🎯 ACTION REQUIRED — TIM PENGAWAS ASK

Susun tindakan konkret dan berurutan untuk KASUS INI,
berdasarkan daftar dasar pertimbangan di Aturan Analisis
poin 5. Prioritaskan yang paling relevan dengan data
laporan ini (misal: kalau ada keterangan driver spesifik,
sebut itu di urutan atas).

📝 CATATAN DRIVER

${
  catatan
    ? `"${catatan}"`
    : "(Tidak ada keterangan tambahan dari driver)"
}

Analisis: [Kaitkan keterangan ini secara spesifik dengan
data tarif laporan, dengan kalimatmu sendiri]

📈 DAMPAK EKONOMI

Tampilkan:

Selisih/order:
${formatRp(Math.max(0, selisih))}

Simulasi 10 order/hari:
${formatRp(kerugian10Order)}

Simulasi 300 order/bulan:
${formatRp(kerugian300Order)}

📌 CATATAN PENGAWASAN

Dengan kalimatmu sendiri, tekankan bahwa laporan ini
adalah data lapangan yang harus masuk mekanisme
pengawasan dan tidak boleh berhenti sebagai arsip.
Kaitkan dengan karakteristik laporan ini secara spesifik.

🔥 PESAN INTI

Tulis SATU kalimat penutup ORIGINAL (bukan hafalan) yang
menegaskan semangat: laporan adalah indikator, laporan
berulang adalah pola, pola terverifikasi adalah dasar
tindakan. Boleh disesuaikan gaya bahasanya asal semangat
itu tersampaikan. Jangan provokatif, jangan menuduh tanpa
verifikasi.
`
    : `
✅ KESIMPULAN

Tulis 1-2 kalimat dengan kalimatmu sendiri: tarif telah
sesuai ketentuan SK Gub Kalsel, tidak ada indikasi
pelanggaran untuk laporan dari platform ${data.platform}
di ${data.lokasi} ini.
${
  catatan
    ? `
📝 CATATAN DRIVER (ANALISIS):

Meskipun tarif sesuai, tetap analisis keterangan driver
ini secara spesifik jika ada keluhan lain di luar soal
tarif. Jika keterangannya tidak menunjukkan keluhan,
cukup tulis dengan kalimatmu sendiri bahwa tidak ada
keluhan tambahan dari driver.
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
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.5,
        maxOutputTokens: 700,
      },
    })

    const content = response.text

    if (!content) {
      throw new Error('AI tidak menghasilkan analisis.')
    }

    return content

  } catch (error) {
    console.error('analisisLaporan error:', error)

    // Fallback jika API error — ini SENGAJA fixed text, karena dipakai
    // hanya saat AI gagal total, bukan hasil analisis normal
    if (isPelanggaran) {
      return `
STATUS PENGAWASAN

${status}

TEMUAN

Terdapat perbedaan antara tarif yang diterima driver
dengan tarif berdasarkan parameter yang digunakan.
(Catatan sistem: analisis AI gagal dimuat, ini adalah
ringkasan otomatis fallback.)

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

Tarif telah sesuai dengan ketentuan SK Gub Kalsel.
Tidak ada indikasi pelanggaran.
(Catatan sistem: analisis AI gagal dimuat, ini adalah
ringkasan otomatis fallback.)
`
    }
  }
}
