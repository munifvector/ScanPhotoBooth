-- Jalankan SEKALI di Supabase > SQL Editor.
-- Policy ini membuat foto yang sudah tersimpan dapat dibaca halaman depan.
-- Publishable/anon key tetap aman digunakan di browser; jangan pernah memasukkan service_role key.

alter table public.photos enable row level security;

drop policy if exists "public read photos" on public.photos;
create policy "public read photos"
on public.photos
for select
to anon, authenticated
using (true);

-- Pastikan bucket event-photos dibuat PUBLIC di Storage.
-- Jika bucket sudah public, tidak perlu menjalankan SQL tambahan di bawah.
-- Upload tetap mengikuti policy Storage yang sudah ada pada project.
