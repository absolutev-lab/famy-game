import { el, shakeAndReset } from '../ui.js';
import { playClick, playSuccess, playTryAgain } from '../audio.js';
import { MEMORY_EMOJIS } from '../../data/content.js';

const PAIRS_BY_LEVEL = { 1: 3, 2: 6, 3: 8 };
const COLS_BY_LEVEL = { 1: 3, 2: 4, 3: 4 };
const GEM_GRADIENT = 'linear-gradient(160deg, var(--color-magic), var(--color-magic-dark))';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function mount(container, { level, onComplete }) {
  let alive = true;
  const pairCount = PAIRS_BY_LEVEL[level] || 3;
  const cols = COLS_BY_LEVEL[level] || 3;
  const emojis = shuffle(MEMORY_EMOJIS).slice(0, pairCount);
  const cards = shuffle([...emojis, ...emojis]).map((emoji, idx) => ({ id: idx, emoji, matched: false }));

  container.appendChild(el('p', { className: 'game-instructions', text: 'Cari dua kartu yang sama!' }));
  const grid = el('div', { className: 'memory-grid' });
  grid.style.gridTemplateColumns = `repeat(${cols}, minmax(56px, 90px))`;
  container.appendChild(grid);

  let flipped = [];
  let lock = false;
  let mismatches = 0;
  let matchedCount = 0;

  function resetCard(btn) {
    btn.textContent = '❔';
    btn.style.background = GEM_GRADIENT;
  }

  cards.forEach((card) => {
    const btn = el('button', { className: 'btn memory-card', text: '❔' });
    btn.style.background = GEM_GRADIENT;
    btn.addEventListener('click', () => handleFlip(card, btn));
    grid.appendChild(btn);
  });

  function handleFlip(card, btn) {
    if (!alive || lock || card.matched || flipped.find((f) => f.card === card)) return;
    playClick();
    btn.textContent = card.emoji;
    btn.style.background = 'white';
    flipped.push({ card, btn });
    if (flipped.length === 2) {
      lock = true;
      const [a, b] = flipped;
      if (a.card.emoji === b.card.emoji) {
        a.card.matched = true;
        b.card.matched = true;
        matchedCount += 2;
        a.btn.classList.add('pop-in');
        b.btn.classList.add('pop-in');
        playSuccess();
        flipped = [];
        lock = false;
        if (matchedCount === cards.length) finishRound();
      } else {
        mismatches++;
        setTimeout(() => {
          if (!alive) return;
          playTryAgain();
          shakeAndReset(a.btn);
          shakeAndReset(b.btn);
          setTimeout(() => {
            if (!alive) return;
            resetCard(a.btn);
            resetCard(b.btn);
            flipped = [];
            lock = false;
          }, 500);
        }, 500);
      }
    }
  }

  function finishRound() {
    const par = pairCount;
    let stars = 3;
    if (mismatches > par * 1.5) stars = 1;
    else if (mismatches > par) stars = 2;
    onComplete({ stars });
  }

  return () => {
    alive = false;
  };
}

export default {
  id: 'memory-match',
  title: 'Cocokkan Kartu Ajaib',
  emoji: '🧠',
  colorTheme: 'purple',
  maxLevel: 3,
  mount,
};
