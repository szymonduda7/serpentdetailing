// nav scroll bg
const header = document.getElementById('header');
addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 30));

// mobile menu
const burger = document.getElementById('burger'), navLinks = document.getElementById('navLinks');
burger.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

// reveal on scroll
const io = new IntersectionObserver((es) => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: .12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// highlight today + open/closed status
(function () {
  const now = new Date(), day = now.getDay(), mins = now.getHours() * 60 + now.getMinutes();
  const hours = { 1: [960, 1200], 2: [960, 1200], 3: [960, 1200], 4: [960, 1200], 5: [960, 1200], 6: [600, 1320], 0: [480, 1200] };
  const row = document.querySelector('.hrow[data-day="' + day + '"]');
  if (row) row.classList.add('today');
  const [o, c] = hours[day]; const open = mins >= o && mins < c;
  const badge = document.getElementById('openNow');
  if (open) {
    badge.innerHTML = '<span class="dot"></span>Otwarte teraz';
  } else {
    badge.innerHTML = '<span class="dot" style="background:#ff5c5c;box-shadow:0 0 10px #ff5c5c"></span>Zamknięte — zostaw wiadomość';
    badge.style.color = '#ff8a8a';
  }
})();

/* ====================================================================
   GALLERY + VIDEOS
   --------------------------------------------------------------------
   Wystarczy wrzucić pliki do folderów wg nazewnictwa — nic w kodzie
   nie trzeba zmieniać (chyba że zmieni się liczba zdjęć/filmów):

   Zdjęcia:  media/photos/01.webp ... 30.webp
   Filmy:    media/videos/01.mp4  ... 05.mp4
   Plakaty:  media/videos/01.webp ... 05.webp  (klatka/okładka filmu, opcjonalnie)
   ==================================================================== */
const PHOTO_COUNT = 12;
const photoSrc = i => 'media/photos/' + String(i + 1).padStart(2, '0') + '.webp';

const VIDEOS = [1, 2, 3, 4, 5, 6].map(n => ({
  src: 'media/videos/' + String(n).padStart(2, '0') + '.mp4',
  poster: 'media/videos/' + String(n).padStart(2, '0') + '.webp'
}));

(function () {
  const track = document.getElementById('stageTrack');
  const thumbs = document.getElementById('thumbs');
  const counter = document.getElementById('stageCounter');
  if (!track) return;

  let cur = 0;

  function placeholder(idx, thumb) {
    const d = document.createElement('div');
    d.className = 'ph';
    d.innerHTML = '<span class="ph-n">' + String(idx + 1).padStart(2, '0') + '</span>' +
      (thumb ? '' : '<small>Zdjęcie wkrótce</small>');
    return d;
  }
  function imgEl(idx, thumb) {
    const img = document.createElement('img');
    img.src = photoSrc(idx);
    img.alt = 'Realizacja Serpent Detailing ' + (idx + 1);
    img.loading = 'lazy';
    img.onerror = () => img.replaceWith(placeholder(idx, thumb));
    return img;
  }

  // build slides + thumbnails
  for (let i = 0; i < PHOTO_COUNT; i++) {
    const slide = document.createElement('div');
    slide.className = 'slide' + (i === 0 ? ' active' : '');
    slide.appendChild(imgEl(i, false));
    slide.addEventListener('click', () => openLightbox(i));
    track.appendChild(slide);

    const t = document.createElement('button');
    t.className = 'thumb' + (i === 0 ? ' active' : '');
    t.setAttribute('aria-label', 'Zdjęcie ' + (i + 1));
    t.appendChild(imgEl(i, true));
    t.addEventListener('click', () => goTo(i));
    thumbs.appendChild(t);
  }

  function goTo(i) {
    cur = (i + PHOTO_COUNT) % PHOTO_COUNT;
    [...track.children].forEach((s, k) => s.classList.toggle('active', k === cur));
    [...thumbs.children].forEach((t, k) => t.classList.toggle('active', k === cur));
    counter.textContent = (cur + 1) + ' / ' + PHOTO_COUNT;
    thumbs.children[cur].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }
  document.getElementById('stagePrev').onclick = () => goTo(cur - 1);
  document.getElementById('stageNext').onclick = () => goTo(cur + 1);

  /* ----- lightbox ----- */
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  const lbCounter = document.getElementById('lbCounter');

  function updateLb() {
    lbImg.style.display = '';
    lbImg.src = photoSrc(cur);
    lbImg.onerror = () => { lbImg.style.display = 'none'; };
    lbCounter.textContent = (cur + 1) + ' / ' + PHOTO_COUNT;
  }
  function openLightbox(i) {
    goTo(i);
    updateLb();
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeLb() {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  document.getElementById('lbClose').onclick = closeLb;
  document.getElementById('lbNext').onclick = e => { e.stopPropagation(); goTo(cur + 1); updateLb(); };
  document.getElementById('lbPrev').onclick = e => { e.stopPropagation(); goTo(cur - 1); updateLb(); };
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
  addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowRight') { goTo(cur + 1); updateLb(); }
    if (e.key === 'ArrowLeft') { goTo(cur - 1); updateLb(); }
  });
})();

/* ----- videos: same stage + thumbnails carousel as photos ----- */
(function () {
  const track = document.getElementById('vidTrack');
  const thumbs = document.getElementById('vidThumbs');
  const counter = document.getElementById('vidCounter');
  if (!track) return;

  const N = VIDEOS.length;
  let cur = 0;

  function vidPlaceholder(idx, thumb) {
    const d = document.createElement('div');
    d.className = 'ph ph-video';
    d.innerHTML = (thumb ? '' : '<div class="play">▶</div>') +
      '<span class="ph-n">' + String(idx + 1).padStart(2, '0') + '</span>' +
      (thumb ? '' : '<small>Film wkrótce</small>');
    return d;
  }
  function posterImg(idx, thumb) {
    const img = document.createElement('img');
    img.src = VIDEOS[idx].poster;
    img.alt = 'Film ' + (idx + 1) + ' — Serpent Detailing';
    img.loading = 'lazy';
    img.onerror = () => img.replaceWith(vidPlaceholder(idx, thumb));
    return img;
  }

  for (let i = 0; i < N; i++) {
    const slide = document.createElement('div');
    slide.className = 'slide slide-v' + (i === 0 ? ' active' : '');
    const vid = document.createElement('video');
    vid.src = VIDEOS[i].src;
    if (VIDEOS[i].poster) vid.poster = VIDEOS[i].poster;
    vid.controls = true;
    vid.preload = 'metadata';
    vid.playsInline = true;
    vid.addEventListener('error', () => {
      slide.innerHTML = '';
      slide.appendChild(vidPlaceholder(i, false));
    });
    slide.appendChild(vid);
    track.appendChild(slide);

    const t = document.createElement('button');
    t.className = 'thumb thumb-v' + (i === 0 ? ' active' : '');
    t.setAttribute('aria-label', 'Film ' + (i + 1));
    t.appendChild(posterImg(i, true));
    t.addEventListener('click', () => goTo(i));
    thumbs.appendChild(t);
  }

  function goTo(i) {
    cur = (i + N) % N;
    [...track.children].forEach((s, k) => {
      s.classList.toggle('active', k === cur);
      const v = s.querySelector('video');
      if (v && k !== cur) v.pause();            // pause every other video
    });
    [...thumbs.children].forEach((t, k) => t.classList.toggle('active', k === cur));
    counter.textContent = (cur + 1) + ' / ' + N;
    thumbs.children[cur].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }
  document.getElementById('vidPrev').onclick = () => goTo(cur - 1);
  document.getElementById('vidNext').onclick = () => goTo(cur + 1);
})();
