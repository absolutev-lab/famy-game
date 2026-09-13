# Dunia Fantasi — Game Edukasi untuk Anak 5-10 Tahun

Hub game edukasi bertema dunia fantasi (kerajaan, peri, naga kecil) untuk anak usia 5-10 tahun. Berisi 5 mini-game yang melatih memori, berhitung, membaca huruf/kata, logika bentuk & warna, dan kemampuan spasial — lengkap dengan bintang, animasi, dan efek suara yang ramah anak.

## Mini-game

1. 🧠 **Cocokkan Kartu Ajaib** — melatih memori (memory match).
2. 🔢 **Berhitung Sihir** — melatih berhitung (menghitung, tambah, kurang).
3. 🔤 **Tebak Huruf & Kata** — melatih pengenalan huruf dan kata.
4. 💎 **Cocokkan Bentuk & Warna** — melatih logika visual.
5. 🧩 **Puzzle Kerajaan** — melatih kemampuan spasial.

Setiap game punya 3 level dengan kesulitan meningkat, tidak ada "gagal" yang membuat anak berkecil hati, dan progres/bintang tersimpan otomatis di perangkat (localStorage).

## Teknologi

Dibangun dengan HTML, CSS, dan JavaScript murni (tanpa framework, tanpa build step) — semua grafis memakai emoji & CSS, semua suara disintesis lewat Web Audio API. Tidak ada dependensi eksternal selain font dari Google Fonts (opsional, ada fallback jika offline).

## Menjalankan secara lokal

```bash
python3 -m http.server 8000
# atau
npx serve .
```

Lalu buka `http://localhost:8000` di browser.

## Deploy ke Netlify

Tidak perlu build step. Dua cara:

1. **Drag & drop**: seret folder proyek ini ke [app.netlify.com/drop](https://app.netlify.com/drop).
2. **Git integration**: hubungkan repo ini ke Netlify. `netlify.toml` sudah mengatur `publish = "."` dan `command = ""` sehingga tidak perlu konfigurasi tambahan.
