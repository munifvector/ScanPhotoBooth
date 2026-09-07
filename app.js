const MAX = 5;
const app = document.querySelector('#app');
const isAdmin = location.pathname.endsWith('/admin.html');
const cfgReady = window.SUPABASE_URL && window.SUPABASE_ANON_KEY;
const db = cfgReady ? supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY) : null;

let stream = null;
let scanStream = null;
let shots = [];
let event = null;
let facing = 'environment';


/* =========================================================
   GALLERY CSS
   ========================================================= */
(function injectGalleryStyles(){
  const style = document.createElement('style');
  style.id = 'professional-gallery-styles';
  style.textContent = '\n/* Professional masonry gallery injected by app.js */\n.home-gallery {\n  width: 100%;\n  margin-top: 28px;\n}\n\n.gallery-count {\n  margin: 0 0 18px;\n  text-align: left;\n  font-size: 14px;\n  font-weight: 800;\n  letter-spacing: .08em;\n  text-transform: uppercase;\n}\n\n.gallery-count span {\n  font-size: 18px;\n}\n\n.home-gallery-grid,\n.gallery {\n  column-count: 3;\n  column-gap: 14px;\n  width: 100%;\n}\n\n.gallery-item {\n  display: block;\n  break-inside: avoid;\n  -webkit-column-break-inside: avoid;\n  margin: 0 0 14px;\n}\n\n.gallery-photo-button {\n  position: relative;\n  display: block;\n  width: 100%;\n  padding: 0;\n  border: 0;\n  background: transparent;\n  cursor: zoom-in;\n  overflow: hidden;\n  border-radius: 14px;\n}\n\n.gallery-photo-button img {\n  display: block;\n  width: 100%;\n  height: auto;\n  border-radius: 14px;\n  object-fit: contain;\n  background: #0a1422;\n  border: 1px solid rgba(255,255,255,.08);\n  box-shadow: 0 10px 30px rgba(0,0,0,.22);\n  transition: transform .28s ease, filter .28s ease, box-shadow .28s ease;\n}\n\n.gallery-photo-overlay {\n  position: absolute;\n  inset: 0;\n  display: flex;\n  align-items: flex-end;\n  justify-content: center;\n  padding: 18px;\n  opacity: 0;\n  background: linear-gradient(to top, rgba(0,0,0,.55), transparent 55%);\n  transition: opacity .25s ease;\n}\n\n.gallery-photo-overlay span {\n  padding: 7px 12px;\n  border-radius: 999px;\n  background: rgba(0,0,0,.55);\n  color: white;\n  font-size: 11px;\n  font-weight: 800;\n  letter-spacing: .08em;\n}\n\n.gallery-photo-button:hover img {\n  transform: scale(1.025);\n  filter: brightness(1.04);\n  box-shadow: 0 18px 45px rgba(0,0,0,.35);\n}\n\n.gallery-photo-button:hover .gallery-photo-overlay {\n  opacity: 1;\n}\n\n.gallery-empty,\n.gallery-loading {\n  width: 100%;\n  padding: 50px 20px;\n  box-sizing: border-box;\n  text-align: center;\n  border: 1px dashed rgba(255,255,255,.14);\n  border-radius: 16px;\n}\n\n.gallery-lightbox {\n  position: fixed;\n  inset: 0;\n  z-index: 999999;\n  display: none;\n  align-items: center;\n  justify-content: center;\n  padding: 24px;\n  box-sizing: border-box;\n  background: rgba(2,7,14,.94);\n  backdrop-filter: blur(12px);\n}\n\n.gallery-lightbox.active {\n  display: flex;\n}\n\n.gallery-lightbox img {\n  display: block;\n  max-width: 92vw;\n  max-height: 88vh;\n  width: auto;\n  height: auto;\n  object-fit: contain;\n  border-radius: 12px;\n  box-shadow: 0 30px 100px rgba(0,0,0,.7);\n}\n\n.gallery-lightbox-close,\n.gallery-lightbox-prev,\n.gallery-lightbox-next {\n  position: absolute;\n  z-index: 2;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 48px;\n  height: 48px;\n  padding: 0;\n  border: 1px solid rgba(255,255,255,.2);\n  border-radius: 50%;\n  background: rgba(255,255,255,.08);\n  color: white;\n  cursor: pointer;\n  font-size: 28px;\n  line-height: 1;\n}\n\n.gallery-lightbox-close {\n  top: 20px;\n  right: 20px;\n}\n\n.gallery-lightbox-prev {\n  top: 50%;\n  left: 20px;\n  transform: translateY(-50%);\n}\n\n.gallery-lightbox-next {\n  top: 50%;\n  right: 20px;\n  transform: translateY(-50%);\n}\n\n.gallery-lightbox-close:hover,\n.gallery-lightbox-prev:hover,\n.gallery-lightbox-next:hover {\n  background: rgba(216,255,0,.16);\n}\n\n.gallery-lightbox-counter {\n  position: absolute;\n  left: 50%;\n  bottom: 20px;\n  transform: translateX(-50%);\n  padding: 8px 14px;\n  border-radius: 999px;\n  background: rgba(0,0,0,.55);\n  color: white;\n  font-size: 13px;\n  font-weight: 800;\n}\n\n@media (max-width: 900px) {\n  .home-gallery-grid,\n  .gallery {\n    column-count: 2;\n  }\n}\n\n@media (max-width: 560px) {\n  .home-gallery-grid,\n  .gallery {\n    column-count: 2;\n    column-gap: 8px;\n  }\n\n  .gallery-item {\n    margin-bottom: 8px;\n  }\n\n  .gallery-photo-button,\n  .gallery-photo-button img {\n    border-radius: 10px;\n  }\n\n  .gallery-lightbox {\n    padding: 10px;\n  }\n\n  .gallery-lightbox img {\n    max-width: 96vw;\n    max-height: 82vh;\n  }\n\n  .gallery-lightbox-close {\n    top: 10px;\n    right: 10px;\n  }\n\n  .gallery-lightbox-prev {\n    left: 8px;\n  }\n\n  .gallery-lightbox-next {\n    right: 8px;\n  }\n}\n';\n  document.head.appendChild(style);\n})();\n
/* =========================================================
   HELPERS
   ========================================================= */

const $ = s => document.querySelector(s);

const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({
  '&':'&amp;',
  '<':'&lt;',
  '>':'&gt;',
  '"':'&quot;',
  "'":'&#39;'
}[m]));

const makeCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();

function stop(s) {
  if (s) s.getTracks().forEach(t => t.stop());
}

function needDb() {
  if (!db) {
    alert('Supabase belum dikonfigurasi. Periksa config.js.');
    return false;
  }
  return true;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function backHome() {
  stop(stream);
  stop(scanStream);
  location.href = './';
}

/* =========================================================
   GALLERY LIGHTBOX
   ========================================================= */

let galleryImages = [];
let galleryIndex = 0;

function ensureGalleryLightbox() {
  let lightbox = document.querySelector('#galleryLightbox');

  if (lightbox) return lightbox;

  lightbox = document.createElement('div');
  lightbox.id = 'galleryLightbox';
  lightbox.className = 'gallery-lightbox';

  lightbox.innerHTML = `
    <button class="gallery-lightbox-close" type="button" aria-label="Tutup">×</button>
    <button class="gallery-lightbox-prev" type="button" aria-label="Foto sebelumnya">‹</button>
    <img id="galleryLightboxImage" src="" alt="Preview foto">
    <button class="gallery-lightbox-next" type="button" aria-label="Foto berikutnya">›</button>
    <div id="galleryLightboxCounter" class="gallery-lightbox-counter"></div>
  `;

  lightbox.querySelector('.gallery-lightbox-close').onclick = closeGalleryLightbox;
  lightbox.querySelector('.gallery-lightbox-prev').onclick = galleryPrev;
  lightbox.querySelector('.gallery-lightbox-next').onclick = galleryNext;

  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeGalleryLightbox();
  });

  document.body.appendChild(lightbox);
  return lightbox;
}

function prepareGallery(images) {
  galleryImages = Array.isArray(images) ? images.filter(Boolean) : [];
}

function openGalleryLightbox(index) {
  if (!galleryImages.length) return;

  galleryIndex = Math.max(0, Math.min(Number(index) || 0, galleryImages.length - 1));

  const lightbox = ensureGalleryLightbox();
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';

  updateGalleryLightbox();
}

function updateGalleryLightbox() {
  const img = document.querySelector('#galleryLightboxImage');
  const counter = document.querySelector('#galleryLightboxCounter');

  if (!img || !galleryImages.length) return;

  img.src = galleryImages[galleryIndex];
  counter.textContent = `${galleryIndex + 1} / ${galleryImages.length}`;
}

function galleryNext() {
  if (!galleryImages.length) return;
  galleryIndex = (galleryIndex + 1) % galleryImages.length;
  updateGalleryLightbox();
}

function galleryPrev() {
  if (!galleryImages.length) return;
  galleryIndex = (galleryIndex - 1 + galleryImages.length) % galleryImages.length;
  updateGalleryLightbox();
}

function closeGalleryLightbox() {
  const lightbox = document.querySelector('#galleryLightbox');
  if (lightbox) lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
  const lightbox = document.querySelector('#galleryLightbox');
  if (!lightbox?.classList.contains('active')) return;

  if (e.key === 'Escape') closeGalleryLightbox();
  if (e.key === 'ArrowRight') galleryNext();
  if (e.key === 'ArrowLeft') galleryPrev();
});

/* =========================================================
   HOME
   ========================================================= */

function home() {
  app.innerHTML = `
  <div class="wrap">
    <section class="hero">
      <div class="eyebrow">OFFICIAL RUN EVENT PHOTO</div>
      <h1>Memory Image</h1>
      <div class="ornament">RUN • CAPTURE • SHARE</div>
      <p class="lead">Abadikan energi, perjuangan, dan momen finish kamu langsung dari kamera HP.</p>
    </section>

    <section class="card center guest-card">
      <div class="eyebrow">FOR EVERY RUNNER</div>
      <h2>Masuk ke Run Event</h2>
      <p class="muted">Scan QR event untuk membuka kamera dan mulai mengabadikan race day.</p>
      <button class="action primary" id="scan">SCAN QR EVENT</button>
      <button class="action secondary" id="manual">MASUKKAN KODE EVENT</button>
    </section>

    <section class="card center guest-results-card">
      <div class="eyebrow">RUN EVENT GALLERY</div>
      <h3>Semua Momen Para Runner</h3>
      <p class="muted small">Foto dari seluruh peserta akan tampil di sini dan diperbarui otomatis.</p>
      <div class="home-gallery" id="homeGallery">
        <div class="gallery-loading">Memuat seluruh foto race day...</div>
      </div>
    </section>

    <section class="card center upload-card">
      <div class="ornament">✦</div>
      <h3>CAPTURE YOUR RACE DAY</h3>
      <p class="muted small">Setiap peserta dapat mengambil maksimal 5 foto dalam satu sesi.</p>
    </section>

    <div class="footer">Made for beautiful memories · Memory Image</div>
  </div>`;

  $('#scan').onclick = scanPage;

  $('#manual').onclick = () => {
    const c = prompt('Masukkan kode acara:');
    if (c) openEvent(c.trim().toUpperCase());
  };

  loadHomeGallery();

  clearInterval(window.__homeGalleryTimer);
  window.__homeGalleryTimer = setInterval(() => {
    if (!document.querySelector('#homeGallery')) {
      clearInterval(window.__homeGalleryTimer);
      return;
    }
    loadHomeGallery();
  }, 10000);
}

/* =========================================================
   PROFESSIONAL HOME GALLERY
   ========================================================= */

async function loadHomeGallery() {
  const box = $('#homeGallery');
  if (!box || !db) return;

  try {
    const { data, error } = await db
      .from('photos')
      .select('storage_path,created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const imgs = (data || [])
      .map(p => db.storage.from('event-photos').getPublicUrl(p.storage_path).data.publicUrl)
      .filter(Boolean);

    prepareGallery(imgs);

    if (!imgs.length) {
      box.innerHTML = `
        <div class="gallery-empty">
          Belum ada foto. Jadilah runner pertama yang mengabadikan race day.
        </div>`;
      return;
    }

    box.innerHTML = `
      <div class="gallery-count">
        <span>${imgs.length}</span> MOMEN DARI PARA RUNNER
      </div>

      <div class="home-gallery-grid" aria-label="Galeri foto event">
        ${imgs.map((u, i) => `
          <figure class="gallery-item">
            <button
              class="gallery-photo-button"
              type="button"
              onclick="openGalleryLightbox(${i})"
              aria-label="Buka foto ${i + 1}">
              <img
                src="${esc(u)}"
                loading="lazy"
                decoding="async"
                alt="Foto runner ${i + 1}">
              <span class="gallery-photo-overlay">
                <span>VIEW PHOTO</span>
              </span>
            </button>
          </figure>
        `).join('')}
      </div>
    `;

  } catch (e) {
    console.warn('Galeri halaman depan tidak dapat dimuat:', e);

    box.innerHTML = `
      <div class="gallery-empty">
        Foto peserta akan tampil setelah ada jepretan yang tersimpan.
      </div>`;
  }
}

/* =========================================================
   ADMIN
   ========================================================= */

async function adminPage() {
  if (!isAdmin) return;

  app.innerHTML = `
  <div class="wrap">
    <div class="topbar">
      <button class="icon-btn" id="back">←</button>
      <div class="counter">RUN ADMIN</div>
    </div>

    <section class="hero" style="padding-top:8px">
      <div class="eyebrow">EVENT CONTROL CENTER</div>
      <h1 style="font-size:48px">Memory Image</h1>
      <p class="muted">Kelola run event, QR peserta, dan seluruh galeri foto.</p>
    </section>

    <div class="card">
      <h2>Buat Run Event</h2>

      <label>Nama run event</label>
      <input id="name" placeholder="CITY RUN 10K 2026">

      <label>Tanggal event</label>
      <input id="date" type="date" value="${today()}">

      <button class="action primary" id="create">
        BUAT EVENT & GENERATE QR
      </button>
    </div>

    <div class="admin-note">
      Control center tidak ditampilkan di halaman peserta.
      Akses langsung melalui <b>admin.html</b>.
    </div>

    <div class="divider"></div>

    <h2>Run Event Saya</h2>

    <div id="events" class="event-list">
      <div class="notice">Memuat acara...</div>
    </div>
  </div>`;

  $('#back').onclick = backHome;
  $('#create').onclick = createEvent;

  await renderEvents();
}

async function createEvent() {
  if (!needDb()) return;

  const name = $('#name').value.trim();

  if (!name) return alert('Isi nama acara.');

  const payload = {
    code: makeCode(),
    name,
    event_date: $('#date').value || null
  };

  const { data, error } = await db
    .from('events')
    .insert(payload)
    .select()
    .single();

  if (error) return alert(error.message);

  showQR(data.code, data.name);
}

async function renderEvents() {
  if (!needDb()) return;

  const box = $('#events');

  const { data, error } = await db
    .from('events')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    box.innerHTML = `<div class="notice">${esc(error.message)}</div>`;
    return;
  }

  box.innerHTML = (data || []).map(e => `
    <div class="event-item">
      <div class="event-meta">
        <b>${esc(e.name)}</b>
        <span>${esc(e.event_date || 'Tanggal belum diisi')} · ${esc(e.code)}</span>
      </div>

      <div class="row">
        <button
          class="secondary action"
          onclick="showQR('${esc(e.code)}','${esc(e.name)}')">
          QR
        </button>

        <button
          class="primary action"
          onclick="adminGallery('${esc(e.id)}','${esc(e.name)}')">
          Album
        </button>
      </div>
    </div>
  `).join('') || '<div class="notice">Belum ada acara.</div>';
}

function showQR(code, name) {
  const guestUrl = new URL('./', location.href);
  guestUrl.searchParams.set('event', code);

  app.innerHTML = `
  <div class="wrap">
    <div class="topbar">
      <button class="icon-btn" onclick="adminPage()">←</button>
      <div class="counter">QR ACARA</div>
    </div>

    <div class="card center">
      <div class="eyebrow">SCAN TO CAPTURE</div>
      <h2>${esc(name)}</h2>

      <div class="qrbox" id="qr"></div>

      <h3>${esc(code)}</h3>

      <p class="muted small">
        Scan QR ini dari HP peserta.
        QR mengarah ke halaman peserta, bukan control center.
      </p>

      <button
        class="action secondary"
        onclick="navigator.clipboard?.writeText('${guestUrl.href}');alert('Link acara disalin')">
        Salin Link Acara
      </button>
    </div>
  </div>`;

  new QRCode($('#qr'), {
    text: guestUrl.href,
    width: 250,
    height: 250
  });
}

/* =========================================================
   ADMIN GALLERY
   ========================================================= */

async function adminGallery(id, name) {
  if (!needDb()) return;

  const { data, error } = await db
    .from('photos')
    .select('storage_path,created_at')
    .eq('event_id', id)
    .order('created_at', { ascending: false });

  if (error) return alert(error.message);

  const imgs = (data || [])
    .map(p => db.storage.from('event-photos').getPublicUrl(p.storage_path).data.publicUrl)
    .filter(Boolean);

  prepareGallery(imgs);

  app.innerHTML = `
  <div class="wrap">
    <div class="topbar">
      <button class="icon-btn" onclick="adminPage()">←</button>
      <div class="counter">${imgs.length} FOTO</div>
    </div>

    <div class="hero">
      <div class="eyebrow">OFFICIAL RUN EVENT ALBUM</div>
      <h2>${esc(name)}</h2>
      <p class="muted small">
        Foto dari seluruh peserta pada event yang sama.
      </p>
    </div>

    ${
      imgs.length
      ? `
        <div class="gallery">
          ${imgs.map((u, i) => `
            <figure class="gallery-item">
              <button
                class="gallery-photo-button"
                type="button"
                onclick="openGalleryLightbox(${i})"
                aria-label="Buka foto ${i + 1}">
                <img
                  src="${esc(u)}"
                  loading="lazy"
                  decoding="async"
                  alt="Memory Image ${i + 1}">
                <span class="gallery-photo-overlay">
                  <span>VIEW PHOTO</span>
                </span>
              </button>
            </figure>
          `).join('')}
        </div>
      `
      : '<div class="gallery-empty">Belum ada foto.</div>'
    }
  </div>`;
}

/* =========================================================
   EVENT
   ========================================================= */

async function findEvent(code) {
  if (!needDb()) return null;

  const { data, error } = await db
    .from('events')
    .select('*')
    .eq('code', code)
    .maybeSingle();

  if (error) throw error;

  return data;
}

async function openEvent(code) {
  try {
    const e = await findEvent(code);

    if (!e) return alert('Kode acara tidak ditemukan.');

    event = e;
    shots = [];

    cameraPage();
  } catch (e) {
    alert(e.message || 'Gagal membuka acara.');
  }
}

/* =========================================================
   CAMERA
   ========================================================= */

function cameraPage() {
  app.innerHTML = `
  <div class="wrap">

    <div class="topbar">
      <button class="icon-btn" onclick="backHome()">←</button>
      <div class="counter">
        <span id="left">${MAX}</span> / ${MAX}
      </div>
    </div>

    <section class="hero" style="padding:8px 8px 18px">
      <div class="eyebrow">${esc(event.name)} • RUN EVENT</div>
      <h2>CAPTURE YOUR RACE DAY</h2>
      <p class="muted small">
        Finish line, race bib, podium, cheers — abadikan semuanya.
      </p>
    </section>

    <div class="camera">
      <video id="video" autoplay playsinline muted></video>
      <div class="shade"></div>

      <div class="counter">
        <span id="num">${MAX}</span> foto tersisa
      </div>
    </div>

    <button class="shutter" id="shoot" aria-label="Ambil foto"></button>

    <div class="row">
      <button class="action secondary" id="flip">GANTI KAMERA</button>
      <button class="action secondary" id="done">SELESAI</button>
    </div>

    <div class="notice">
      Foto akan tampil sebagai preview lalu otomatis masuk ke galeri event.
      Maksimal ${MAX} jepretan dalam satu sesi.
    </div>

    <div class="thumbs" id="thumbs"></div>

  </div>`;

  startCamera();

  $('#shoot').onclick = take;

  $('#flip').onclick = async () => {
    facing = facing === 'environment' ? 'user' : 'environment';
    await startCamera();
  };

  $('#done').onclick = finish;
}

async function startCamera() {
  stop(stream);

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: facing },
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      },
      audio: false
    });

    const v = $('#video');

    if (!v) return;

    v.srcObject = stream;

    await new Promise(resolve => {
      if (v.readyState >= HTMLMediaElement.HAVE_METADATA) {
        return resolve();
      }

      v.addEventListener('loadedmetadata', resolve, { once: true });
    });

    await v.play();

    if (v.requestVideoFrameCallback) {
      await new Promise(r => v.requestVideoFrameCallback(() => r()));
    } else {
      await new Promise(r => setTimeout(r, 250));
    }

  } catch (e) {
    console.error(e);
    alert('Kamera gagal dibuka. Pastikan HTTPS dan izin kamera aktif.');
  }
}

async function take() {
  if (shots.length >= MAX) {
    return alert(`Jatah ${MAX} foto sudah habis.`);
  }

  const v = $('#video');
  const track = stream?.getVideoTracks?.()[0];

  if (
    !v ||
    !track ||
    track.readyState !== 'live' ||
    !v.videoWidth ||
    !v.videoHeight
  ) {
    try {
      await startCamera();
    } catch (_) {}
  }

  const liveTrack = stream?.getVideoTracks?.()[0];

  if (
    !v ||
    !liveTrack ||
    liveTrack.readyState !== 'live' ||
    !v.videoWidth ||
    !v.videoHeight
  ) {
    return alert('Kamera belum siap. Tunggu sebentar lalu coba lagi.');
  }

  if (!needDb()) return;

  const btn = $('#shoot');

  if (btn) btn.disabled = true;

  let previewUrl = null;
  let previewImg = null;

  try {
    const c = document.createElement('canvas');

    c.width = v.videoWidth;
    c.height = v.videoHeight;

    const ctx = c.getContext('2d', { alpha: false });

    ctx.drawImage(v, 0, 0, c.width, c.height);

    const blob = await new Promise((resolve, reject) =>
      c.toBlob(
        b => b
          ? resolve(b)
          : reject(new Error('Gagal membuat foto.')),
        'image/jpeg',
        .90
      )
    );

    if (!blob || blob.size < 1000) {
      throw new Error('Foto kosong. Coba ambil lagi.');
    }

    const idx = shots.length + 1;
    const path = `${event.id}/${Date.now()}-${idx}.jpg`;

    previewUrl = URL.createObjectURL(blob);

    previewImg = document.createElement('img');
    previewImg.src = previewUrl;
    previewImg.alt = `Foto ${idx}`;

    $('#thumbs')?.appendChild(previewImg);

    shots.push({
      path,
      previewUrl,
      blob,
      uploaded: false
    });

    $('#left').textContent = MAX - shots.length;
    $('#num').textContent = MAX - shots.length;

    if (shots.length >= MAX && btn) {
      btn.disabled = true;
    }

    const item = shots[shots.length - 1];

    item.uploadPromise = (async () => {
      const { error: upErr } = await db
        .storage
        .from('event-photos')
        .upload(path, blob, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: false
        });

      if (upErr) {
        throw new Error(`Upload foto ${idx} gagal: ${upErr.message}`);
      }

      const { error: dbErr } = await db
        .from('photos')
        .insert({
          event_id: event.id,
          storage_path: path
        });

      if (dbErr) {
        await db.storage.from('event-photos').remove([path]);
        throw new Error(`Data foto ${idx} gagal disimpan: ${dbErr.message}`);
      }

      item.uploaded = true;

    })().catch(err => {
      item.uploadError = err;
      item.uploaded = false;

      console.error(err);

      previewImg?.classList.add('upload-error');
    });

  } catch (e) {
    console.error(e);

    previewImg?.remove();

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    alert(e.message || 'Gagal mengambil foto.');

  } finally {
    setTimeout(() => {
      if (
        btn &&
        shots.length < MAX &&
        document.body.contains(btn)
      ) {
        btn.disabled = false;
      }
    }, 180);
  }
}

/* =========================================================
   FINISH
   ========================================================= */

async function finish() {
  stop(stream);

  const pending = shots
    .map(s => s.uploadPromise)
    .filter(Boolean);

  if (pending.length) {
    app.innerHTML = `
      <div class="wrap">
        <div class="card center" style="margin-top:15vh">
          <div class="eyebrow">SAVING RACE MOMENTS</div>
          <h1 style="font-size:46px">MENYIMPAN FOTO…</h1>
          <p class="muted">
            Tunggu sebentar, seluruh jepretan sedang disimpan
            ke galeri event.
          </p>
        </div>
      </div>`;

    await Promise.allSettled(pending);
  }

  const saved = shots.filter(s => s.uploaded).length;
  const failed = shots.filter(s => s.uploadError).length;

  app.innerHTML = `
    <div class="wrap">
      <div class="card center" style="margin-top:15vh">
        <div class="eyebrow">RACE MOMENT CAPTURED</div>

        <h1 style="font-size:52px">
          RACE DAY COMPLETE
        </h1>

        <p class="muted">
          ${saved} foto berhasil masuk ke album
          <b>${esc(event.name)}</b>
          ${
            failed
              ? `.<br><small>${failed} foto gagal di-upload,
                 silakan ambil ulang.</small>`
              : '.'
          }
        </p>

        <button class="action primary" onclick="backHome()">
          KEMBALI KE GALERI
        </button>
      </div>
    </div>`;
}

/* =========================================================
   QR SCANNER
   ========================================================= */

function scanPage() {
  stop(stream);
  stop(scanStream);

  app.innerHTML = `
  <div class="wrap">

    <div class="topbar">
      <button class="icon-btn" onclick="backHome()">←</button>
      <div class="counter">SCAN EVENT</div>
    </div>

    <div class="hero">
      <div class="eyebrow">OFFICIAL RUN EVENT PHOTO</div>
      <h2>Masuk ke Run Event</h2>
      <p class="muted">
        Arahkan kamera ke QR event untuk masuk.
      </p>
    </div>

    <div class="scanner">
      <video id="sv" autoplay playsinline muted></video>
      <canvas id="sc"></canvas>
      <div class="corners"></div>
    </div>

    <div class="notice">
      Posisikan QR di dalam kotak sampai event terbuka otomatis.
    </div>

    <button class="action secondary" onclick="backHome()">
      BATAL
    </button>

  </div>`;

  startScan();
}

async function startScan() {
  try {
    scanStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: 'environment' }
      },
      audio: false
    });

    const v = $('#sv');
    const c = $('#sc');
    const ctx = c.getContext('2d');

    v.srcObject = scanStream;

    await v.play();

    const loop = () => {
      if (!document.body.contains(v)) return;

      if (
        v.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
        v.videoWidth
      ) {
        c.width = v.videoWidth;
        c.height = v.videoHeight;

        ctx.drawImage(v, 0, 0, c.width, c.height);

        const image = ctx.getImageData(
          0,
          0,
          c.width,
          c.height
        );

        const found = window.jsQR?.(
          image.data,
          image.width,
          image.height,
          {
            inversionAttempts: 'attemptBoth'
          }
        );

        if (found) {
          try {
            const u = new URL(found.data, location.href);
            const cde = u.searchParams.get('event');

            if (cde) {
              stop(scanStream);
              openEvent(cde.toUpperCase());
              return;
            }
          } catch (_) {}
        }
      }

      requestAnimationFrame(loop);
    };

    loop();

  } catch (e) {
    console.error(e);
    alert(
      'Scanner tidak bisa dibuka. Izinkan kamera dan gunakan HTTPS.'
    );
  }
}

/* =========================================================
   START APP
   ========================================================= */

const q = new URLSearchParams(location.search).get('event');

if (isAdmin) {
  adminPage();
} else if (q) {
  openEvent(q.toUpperCase());
} else {
  home();
}
