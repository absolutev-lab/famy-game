import { playStarWin } from './audio.js';
import { isMuted, toggleMuted } from './state.js';

export function el(tag, opts = {}, children = []) {
  const node = document.createElement(tag);
  if (opts.className) node.className = opts.className;
  if (opts.text !== undefined) node.textContent = opts.text;
  if (opts.html !== undefined) node.innerHTML = opts.html;
  if (opts.attrs) {
    for (const [key, value] of Object.entries(opts.attrs)) node.setAttribute(key, value);
  }
  if (opts.onClick) node.addEventListener('click', opts.onClick);
  for (const child of children) node.appendChild(child);
  return node;
}

export function createButton(label, onClick, className = 'btn') {
  return el('button', { className, text: label, onClick });
}

export function transitionTo(container, renderFn) {
  container.classList.remove('screen-enter');
  container.innerHTML = '';
  void container.offsetWidth;
  container.classList.add('screen', 'screen-enter');
  renderFn(container);
}

export function confetti(target = document.body, count = 26) {
  const colors = ['#9B5DE5', '#F15BB5', '#FFD23F', '#4CC9F0', '#52B788'];
  for (let i = 0; i < count; i++) {
    const piece = el('div', { className: 'confetti-piece' });
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.background = colors[i % colors.length];
    piece.style.animation = `fall ${1.2 + Math.random() * 0.8}s ease-in forwards`;
    piece.style.animationDelay = (Math.random() * 0.3) + 's';
    target.appendChild(piece);
    piece.addEventListener('animationend', () => piece.remove());
  }
}

export function shakeAndReset(node) {
  node.classList.remove('shake');
  void node.offsetWidth;
  node.classList.add('shake');
}

export function awardStars(container, { stars, message, onContinue, onExit }) {
  const overlay = el('div', { className: 'modal-overlay' });
  const starsDisplay = '⭐'.repeat(stars) + '☆'.repeat(Math.max(0, 3 - stars));
  const box = el('div', { className: 'modal-box pop-in' });
  box.appendChild(el('h2', { text: message || 'Hebat sekali!' }));
  box.appendChild(el('div', { className: 'modal-stars', text: starsDisplay }));
  const actions = el('div', { className: 'modal-actions' });
  actions.appendChild(createButton('🔁 Main Lagi', () => {
    overlay.remove();
    onContinue && onContinue();
  }));
  actions.appendChild(createButton('🏠 Kembali ke Menu', () => {
    overlay.remove();
    onExit && onExit();
  }, 'btn secondary'));
  box.appendChild(actions);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  playStarWin();
  confetti();
}

export function muteButton() {
  const btn = createButton(isMuted() ? '🔇' : '🔊', () => {
    const muted = toggleMuted();
    btn.textContent = muted ? '🔇' : '🔊';
  }, 'btn icon');
  return btn;
}
