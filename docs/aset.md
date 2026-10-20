# Asal aset visual

Semua ilustrasi dibuat memakai alat imagegen bawaan pada 20 Oktober 2026. Tidak menggunakan CLI fallback. Ilustrasi tidak menunjukkan sekolah nyata dan tidak menjadi bukti kondisi sekolah.

## Prompt yang digunakan

**Kelas** (`assets/kelas-400.avif`, `assets/kelas-640.avif`, `assets/kelas-800.avif`, `assets/kelas-1100.avif`, serta fallback WebP):

> Use case: photorealistic-natural. Asset: hero photograph for a modern minimal Indonesian school-visit guide for parents. Natural editorial photograph of a quiet Indonesian elementary classroom, no people. Honey colored wooden low chairs and simple desks, muted sage green wall with unmarked chalkboard, large open windows, lush tropical foliage outside, warm morning sunlight gently crossing terrazzo floor, a few children's books on a low shelf. Lived in, modest, clean, believable Indonesian school, not luxurious international school, no national flags, no legible writing, no logos, no watermark. Wide landscape 3:2 composition, eye level, restrained warm neutrals and forest green, premium architectural editorial photography with natural texture. No collage. Save output as local file.

**Koridor** (`assets/koridor-700.webp`):

> Use case: photorealistic-natural. Supporting editorial photograph for Indonesian parents' school-visit guide. Empty shaded veranda corridor of a modest clean Indonesian school, sage green walls, simple wooden classroom doors, tropical courtyard plants beyond concrete railing, bright humid daylight, no children or adults. Calm inviting architectural photograph, landscape 3:2, realistic lived-in textures, no logos, no legible signage, no text, no watermark.

**Catatan** (`assets/catatan-700.webp`):

> Use case: photorealistic-natural. Supporting editorial photograph for an Indonesian school-visit guide. Close-up still life on an ordinary wooden parent-teacher meeting table: a plain open notebook with blank pages, black pen, child-sized unbranded water bottle and two simple colored pencils. Natural soft window light, pale sage background, minimal but human, realistic paper and wood texture, wide landscape 3:2, no people, no logos, no text, no watermark.

PNG asli disimpan lokal pada `assets/original/` dan diabaikan Git. Build menggunakan aset terkompresi yang dilacak Git, sehingga clone baru tetap dapat dibangun tanpa PNG asli. Jika PNG tersedia, build mengompresnya ulang.

## Pustaka

- DM Sans: `@fontsource-variable/dm-sans`, SIL Open Font License.
- Ikon: `@phosphor-icons/core`, MIT.
- Gambar Open Graph dibuat dari teks proyek, bukan foto sekolah.

Lisensi font dan ikon disertakan dalam `dist/assets/`. Foto sumber dalam `sumber/` berasal dari pemilik proyek dan tidak dilisensikan ulang sebagai foto stok.
