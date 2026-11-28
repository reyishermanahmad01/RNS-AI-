# RNS AI — paket proyek terpadu

Paket ini menggantikan paket backend awal dan menyatukan antarmuka web, backend AI, konfigurasi Capacitor Android, serta workflow build APK.

## Kondisi dan batasan yang harus jelas
- Chat dan modul AI memerlukan server Node.js yang di-host dan API key penyedia model.
- API key hanya disimpan sebagai environment variable di server. Jangan menaruhnya di GitHub publik atau APK.
- Riwayat chat dan proyek disimpan lokal pada browser/perangkat, belum tersinkron antarperangkat.
- Lampiran chat: gambar (dikirim sebagai image input ke model yang mendukung vision) dan file teks TXT/MD/CSV/JSON.
- PDF dan dokumen Office belum didukung pada paket ini.
- Sketch Studio menerapkan filter gambar lokal; tidak mengukur objek dari foto dan tidak menghasilkan pola potong terkalibrasi.
- AI App Builder dan Project Builder menghasilkan spesifikasi/rencana melalui AI; bukan compiler otomatis yang menghasilkan aplikasi APK jadi.
- Engineering Studio memberi bantuan penjelasan; rangkaian nyata tetap perlu pemeriksaan keselamatan dan pengujian.
- Build workflow perlu diperiksa pada GitHub Actions dan APK perlu diuji di perangkat Android sebelum disebut rilis final.

## Struktur
- `public/index.html` — aplikasi RNS AI terpadu.
- `server.js` — backend API chat dan task.
- `package.json` — dependensi Node dan Capacitor.
- `capacitor.config.json` — identitas Android.
- `.github/workflows/build-apk.yml` — build APK debug otomatis.
- `.env.example` — contoh environment server.

## Menjalankan backend
1. Siapkan hosting/server Node.js 20+.
2. Atur environment variables di panel hosting:
   - `AI_API_KEY` = API key dari penyedia AI
   - `AI_BASE_URL` = base URL API kompatibel OpenAI (default `https://api.openai.com/v1`)
   - `AI_MODEL` = nama model yang tersedia pada penyedia tersebut
   - `ALLOWED_ORIGIN` = domain aplikasi yang diizinkan; untuk produksi isi domain web app
3. Deploy folder proyek dan jalankan `npm install` lalu `npm start`.
4. Tes `https://ALAMAT-SERVER/api/health`. `modelConfigured` harus `true`.
5. Sebelum dipakai, set `window.RNS_API_BASE_URL` ke URL backend pada `public/index.html` (tepat sebelum script aplikasi atau di konfigurasi deploy). Jangan menaruh API key di front-end.

## Build Android
1. Pastikan repository memiliki workflow di `.github/workflows/build-apk.yml`.
2. Jalankan GitHub Actions → Build RNS AI APK → Run workflow.
3. Unduh artifact `RNS-AI-APK`, ekstrak, lalu instal APK debug.
4. Uji fitur pada perangkat. Workflow build sukses hanya membuktikan APK berhasil dikemas, bukan bahwa AI sudah terhubung.

## Menghubungkan alamat backend
Di `public/index.html`, cari:
`const API=(window.RNS_API_BASE_URL||"").replace(/\/$/,"");`
Ganti menjadi:
`const API="https://ALAMAT-SERVER-KAMU";`
Gunakan URL HTTPS server yang benar-benar sudah aktif.
