MEMORY IMAGE — WEDDING GUESTBOOK

Perubahan utama:
- Branding SatuAlbum -> Memory Image.
- Tema wedding: ivory, rose, gold, serif editorial + sans modern.
- Semua konten utama dibuat center/terpusat.
- Teks tamu: "Scan QR Acara".
- Teks kamera: "Upload foto bahagia mu".
- Dashboard admin DIHILANGKAN dari halaman utama.
- Dashboard admin dipisah ke /admin.html.
- QR admin selalu mengarah ke halaman tamu ./?event=KODE.
- Preview foto tampil sebelum upload dan memakai blob yang sama dengan file upload.
- Tetap menggunakan Supabase URL + publishable key yang ada di config.js.
- Maksimal 5 foto per sesi.
- Halaman depan menampilkan SEMUA foto yang tersimpan di tabel photos, dari semua tamu/acara yang dapat dibaca publik.
- Galeri halaman depan otomatis refresh setiap 10 detik agar foto tamu baru ikut muncul tanpa reload manual.
- Jika galeri depan kosong karena RLS, jalankan SUPABASE_PUBLIC_GALLERY.sql di Supabase SQL Editor.

DEPLOY NETLIFY
1. Upload isi folder ini ke site Netlify yang sama.
2. Pastikan config.js ikut ter-upload.
3. Halaman tamu: https://DOMAIN.netlify.app/
4. Dashboard admin: https://DOMAIN.netlify.app/admin.html
5. QR acara yang dibuat dari admin akan membuka halaman tamu, bukan admin.

CATATAN KEAMANAN
Memindahkan dashboard ke /admin.html membuatnya tidak tampil di halaman publik, tetapi URL tersembunyi bukan autentikasi. Untuk keamanan produksi, dashboard sebaiknya memakai Supabase Auth/RLS yang membatasi akses admin.
