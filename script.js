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
