MEMORY IMAGE — PROFESSIONAL RUN EVENT

Tema website sudah diubah dari wedding menjadi tema event lari profesional:
- Dark navy race-day interface.
- Accent lime + orange.
- Tipografi Barlow Condensed + Inter.
- Gaya visual seperti event organizer / race-day photo platform.
- Copywriting peserta, scanner, kamera, album, dan admin disesuaikan untuk run event.
- Fitur Supabase, kamera, QR scanner, upload, album publik, dan dashboard admin tetap dipertahankan.
- Maksimal 5 foto per sesi.

DEPLOY NETLIFY
1. Upload isi folder ini ke site Netlify.
2. Pastikan config.js ikut ter-upload.
3. Halaman peserta: https://DOMAIN.netlify.app/
4. Dashboard event: https://DOMAIN.netlify.app/admin.html
5. QR event dari admin tetap mengarah ke halaman peserta.

CATATAN
Dashboard admin masih menggunakan URL /admin.html dan belum merupakan autentikasi. Untuk produksi, gunakan Supabase Auth/RLS.
