# Niwa ni wa Niwa Niwatori ga Ita · fan blog

Live: https://dans-vsa.github.io/niwatori-fanblog/

Semi fan blog untuk one-shot pertama Tatsuki Fujimoto, **庭には二羽ニワトリがいた** (*A Couple Clucking Chickens Were Still Kickin' in the Schoolyard*).
Konsepnya: situs ini adalah buku piket kandang (飼育日誌) milik Yohei, murid alien yang merawat dua "ayam".

- Vanilla HTML/CSS/JS, tanpa build. Spesifikasi desain: `DESIGN.md` (basis clay: kanvas krem, kartu warna jenuh, merah jengger sebagai aksen).
- Dua bahasa: Indonesia ditulis langsung di `index.html`, Inggris di `js/i18n-en.js` (kunci = atribut `data-i18n`). Teks yang dibuat lewat JS ada di objek `T` di `js/main.js`.
- **Filter spoiler = topeng ayam.** Beri elemen `data-sp="1"` (spoiler ringan) atau `data-sp="2"` (twist/ending), lalu bungkus isi yang dibocorkan dengan `class="spoil"`. Topeng dan tombol "lepas topeng" dipasang otomatis. Level disimpan di `localStorage` (`niwa-spoiler`); kunjungan pertama memunculkan dialog pilihan level.
- Interaksi: mata ayam mengikuti kursor, tongue twister judul yang bisa diklik dan "diucapkan cepat", langit jurnal berubah siang → senja → malam, mini-game "Inspeksi kandang", PV YouTube yang baru dimuat saat diklik.
- Setelah mengubah CSS/JS, naikkan query `?v=N` di `index.html`.

Jalankan lokal: `python -m http.server 5530`

Jaringan blog: [Fujimoto Archive](https://dans-vsa.github.io/fujimoto-archive/) · [Tatsuki Fujimoto Before Chainsaw Man](https://dans-vsa.github.io/before-chainsaw-man-fanblog/)

Gambar: art resmi anime 「藤本タツキ 17-26」製作委員会 (situs resmi & animatetimes) dan cover © Tatsuki Fujimoto / Shueisha, dipakai untuk keperluan ulasan. Aturan teks: tanpa em/en dash.
