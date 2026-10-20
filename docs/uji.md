# Catatan pengujian

Tanggal: 21 Oktober 2026 (Asia/Jakarta). Alat: Lighthouse 13.5.0, Chrome terpasang, mode headless. URL yang diuji dicatat di setiap baris [ringkasan JSON](../reports/summary.json).

## Hasil produksi

| Bahasa | Perangkat | Performa | Aksesibilitas | Praktik terbaik | SEO |
| --- | --- | ---: | ---: | ---: | ---: |
| Indonesia | mobile | 100 | 100 | 100 | 100 |
| Indonesia | desktop | 100 | 100 | 100 | 100 |
| English | mobile | 100 | 100 | 100 | 100 |
| English | desktop | 100 | 100 | 100 | 100 |

| Bahasa / perangkat | LCP | TBT | CLS |
| --- | ---: | ---: | ---: |
| id / mobile | 1.32 s | 0 ms | 0.0008 |
| id / desktop | 0.40 s | 0 ms | 0.0004 |
| en / mobile | 1.44 s | 16 ms | 0.0009 |
| en / desktop | 0.46 s | 0 ms | 0.0004 |

Lighthouse memakai preset mobile bawaan. Desktop memakai viewport 1350 × 940, latensi 40 ms, throughput 10.240 Kbps, dan CPU 1×. Skor dapat berubah akibat jaringan, perangkat, server, dan versi alat. Tidak ada jaminan skor PageSpeed untuk setiap kunjungan.

## Pemeriksaan fungsi

- Seluruh 25 topik foto tetap ada, tanpa menghitung topik 21 dua kali; 11 tambahan ditandai terpisah.
- Dua bahasa memiliki semua pertanyaan, alasan, dan contoh bukti.
- Filter inti, topik, pencarian, hasil kosong, pilihan pribadi, dan status tindak lanjut diperiksa.
- Catatan terpisah untuk tiga sekolah, perbandingan, pergantian bahasa, serta pemulihan setelah reload diperiksa.
- Ekspor JSON, pembukaan kembali cadangan, penolakan berkas rusak, dan teks mirip skrip diperiksa.
- Layout 360, 390, 768, dan 1440 px, gambar, tema gelap/terang, serta cetak sesuai filter diperiksa.
- Semua 36 pertanyaan tetap bisa dibuka dengan JavaScript dinonaktifkan.
- Hash CSP diperiksa terhadap CSS dan data inline agar tidak terblokir browser.

Uji browser terakhir: enam skenario Playwright pada domain produksi. Hasil mentah, tangkapan layar, dan cadangan uji tersimpan lokal di `test-results/`, tidak dipublikasikan bersama catatan pengguna.

## PageSpeed dan GEO

Panggilan ke API publik PageSpeed Insights Google mengembalikan HTTP 429 karena kuota layanan bersama habis. Karena itu, laporan ini menyebut hasil Lighthouse langsung, bukan mengklaim hasil pengukuran dari API PageSpeed Insights.

GEO tidak memiliki satu skor resmi universal 100/100. Yang diterapkan: HTML lengkap, pertanyaan yang mudah dirujuk, penulis dan metode jelas, sumber yang dapat dilacak, canonical/hreflang, JSON-LD yang sesuai isi, serta ekspor Markdown dan JSON. `llms.txt` membantu navigasi; bukan jaminan mesin AI akan mengutip situs.

## Produksi

Cloudflare Workers Static Assets dengan Worker kecil untuk kompresi gzip HTML, HTTPS pada domain khusus. Uji kompresi memeriksa integritas isi, negosiasi encoding, CSP, dan header cache. Header `no-transform` mencegah penyisipan beacon analitik otomatis pada situs ini tanpa mengubah pengaturan domain lain. CSP membatasi sumber skrip, gaya, gambar, font, dan koneksi. Tidak ada API penerima jawaban atau basis data proyek.

## Seluruh pengukuran

Ringkasan di atas memakai median dari 3 pengukuran dingin per kombinasi. Setiap pengukuran membuka profil Chrome baru. Seluruh skor disimpan, termasuk pengukuran yang lebih rendah.

| Bahasa / perangkat | Run | Performa | Aksesibilitas | Praktik terbaik | SEO |
| --- | ---: | ---: | ---: | ---: | ---: |
| id / mobile | 1 | 100 | 100 | 100 | 100 |
| id / mobile | 2 | 100 | 100 | 100 | 100 |
| id / mobile | 3 | 100 | 100 | 100 | 100 |
| id / desktop | 1 | 100 | 100 | 100 | 100 |
| id / desktop | 2 | 100 | 100 | 100 | 100 |
| id / desktop | 3 | 99 | 100 | 100 | 100 |
| en / mobile | 1 | 100 | 100 | 100 | 100 |
| en / mobile | 2 | 99 | 100 | 100 | 100 |
| en / mobile | 3 | 100 | 100 | 100 | 100 |
| en / desktop | 1 | 100 | 100 | 100 | 100 |
| en / desktop | 2 | 100 | 100 | 100 | 100 |
| en / desktop | 3 | 100 | 100 | 100 | 100 |
