/* ============================================
   MARCO MALIK BOT - PANEL SCRIPT
   ============================================ */

// ─── Particles ─────────────────────────────────────────────────────────────
(function initParticles() {
  const container = document.getElementById('particles');
  const count = 60;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      width: ${Math.random() * 3 + 1}px;
      height: ${Math.random() * 3 + 1}px;
      animation-duration: ${Math.random() * 15 + 8}s;
      animation-delay: ${Math.random() * 10}s;
      opacity: ${Math.random() * 0.6};
      background: ${Math.random() > 0.5 ? '#a855f7' : '#ffd700'};
    `;
    container.appendChild(p);
  }
})();

// ─── Socket.IO Live Stats ────────────────────────────────────────────────────
let socket;
try {
  socket = io();

  socket.on('bot-info', (info) => {
    document.getElementById('statBot').textContent = info.botName || 'MARCO MALIK MD BOT';
    document.getElementById('statVersion').textContent = info.version || '12.0.0';
    document.getElementById('statOwner').textContent = info.ownerName || 'Marco Malik';
    document.getElementById('footerPowered').textContent = `Powered By ${info.poweredBy || 'Marco Malik'}`;

    const channelLink = info.channelLink || '#';
    document.getElementById('btnChannel').href = channelLink;
    document.getElementById('footerChannel').href = channelLink;

    const contactLink = `https://wa.me/${info.ownerNumber || ''}`;
    document.getElementById('btnContact').href = contactLink;
    document.getElementById('footerContact').href = contactLink;
    document.getElementById('modalOwnerNum').textContent = info.ownerNumber || '';
  });

  socket.on('stats', (data) => {
    document.getElementById('statUptime').textContent = formatUptime(data.uptime);
    document.getElementById('statMem').textContent = data.memory + ' MB';
  });
} catch (e) {
  // Socket not available — fetch via REST
  fetchStatusREST();
}

// ─── REST Fallback ──────────────────────────────────────────────────────────
async function fetchStatusREST() {
  try {
    const [statusRes, infoRes] = await Promise.all([
      fetch('/api/status'),
      fetch('/api/info'),
    ]);
    const status = await statusRes.json();
    const info = await infoRes.json();

    document.getElementById('statBot').textContent = info.botName;
    document.getElementById('statVersion').textContent = info.version;
    document.getElementById('statOwner').textContent = info.ownerName;
    document.getElementById('statUptime').textContent = formatUptime(status.uptime);
    document.getElementById('statMem').textContent = status.memory?.used || '--';
    document.getElementById('footerPowered').textContent = `Powered By ${info.poweredBy}`;
    document.getElementById('btnChannel').href = info.channelLink || '#';
    document.getElementById('footerChannel').href = info.channelLink || '#';
  } catch (err) {
    console.log('Panel running in offline mode');
  }
}

// ─── Format Uptime ──────────────────────────────────────────────────────────
function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

// ─── Session Modal ───────────────────────────────────────────────────────────
function openSession() {
  document.getElementById('sessionModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeSession() {
  document.getElementById('sessionModal').classList.remove('open');
  document.body.style.overflow = '';
}

// Close modal on overlay click
document.getElementById('sessionModal').addEventListener('click', function (e) {
  if (e.target === this) closeSession();
});

// Close on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeSession();
});

// ─── Animated Button Effects ────────────────────────────────────────────────
document.querySelectorAll('.action-btn').forEach((btn) => {
  btn.addEventListener('mouseenter', function () {
    this.style.letterSpacing = '2px';
  });
  btn.addEventListener('mouseleave', function () {
    this.style.letterSpacing = '1px';
  });
  btn.addEventListener('click', function (e) {
    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(255,255,255,0.15);
      width: 0; height: 0;
      left: ${e.clientX - this.getBoundingClientRect().left}px;
      top: ${e.clientY - this.getBoundingClientRect().top}px;
      transform: translate(-50%,-50%);
      animation: ripple 0.6s linear;
      pointer-events: none;
    `;
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

// Ripple animation
const style = document.createElement('style');
style.textContent = `
  @keyframes ripple {
    to { width: 200px; height: 200px; opacity: 0; }
  }
`;
document.head.appendChild(style);

// ─── Typewriter Effect on Live Heading ──────────────────────────────────────
const heading = document.querySelector('.live-heading');
if (heading) {
  const full = heading.innerHTML;
  heading.innerHTML = '';
  let i = 0;
  const timer = setInterval(() => {
    heading.innerHTML = full.slice(0, i++);
    if (i > full.length) clearInterval(timer);
  }, 30);
}

// ─── Scroll Reveal ──────────────────────────────────────────────────────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.stat-card, .feature-card, .action-btn').forEach((el) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});

// ─── Live Clock ─────────────────────────────────────────────────────────────
setInterval(() => {
  if (!socket) {
    const el = document.getElementById('statUptime');
    if (el && el.dataset.start) {
      const s = Math.floor((Date.now() - parseInt(el.dataset.start)) / 1000);
      el.textContent = formatUptime(s);
    }
  }
}, 1000);
