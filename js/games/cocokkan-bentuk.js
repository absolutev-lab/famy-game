import { el, shakeAndReset } from '../ui.js';
import { playClick, playSuccess, playTryAgain } from '../audio.js';
import { SHAPES, SHAPE_COLORS } from '../../data/content.js';

const SHAPE_LABELS = { circle: 'Bulat', square: 'Kotak', triangle: 'Segitiga', star: 'Bintang' };

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function shapeClipPath(shape) {
  switch (shape) {
    case 'circle':
      return 'circle(50% at 50% 50%)';
    case 'triangle':
      return 'polygon(50% 0%, 0% 100%, 100% 100%)';
    case 'star':
      return 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
    default:
      return 'none';
  }
}

function makeGemNode(shape, color) {
  const gem = el('div', {});
  gem.style.width = '46px';
  gem.style.height = '46px';
  gem.style.background = color;
  gem.style.clipPath = shapeClipPath(shape);
  gem.style.borderRadius = shape === 'circle' ? '50%' : '4px';
  gem.style.boxShadow = '0 3px 6px rgba(0,0,0,0.25)';
  return gem;
}

function buildChests(level) {
  const colors = shuffle(SHAPE_COLORS).slice(0, 3);
  const shapes = shuffle(SHAPES).slice(0, 3);
  if (level === 1) {
    return colors.map((c) => ({
      key: c.name,
      label: `Warna ${c.name}`,
      match: (g) => g.color === c.value,
      sample: { shape: 'circle', color: c.value },
    }));
  }
  if (level === 2) {
    return shapes.map((s) => ({
      key: s,
      label: `Bentuk ${SHAPE_LABELS[s]}`,
      match: (g) => g.shape === s,
      sample: { shape: s, color: '#9B5DE5' },
    }));
  }
  return shapes.map((s, i) => {
    const c = colors[i % colors.length];
    return {
      key: `${s}-${c.name}`,
      label: `${SHAPE_LABELS[s]} ${c.name}`,
      match: (g) => g.shape === s && g.color === c.value,
      sample: { shape: s, color: c.value },
    };
  });
}

function mount(container, { level, onComplete }) {
  let alive = true;
  const chests = buildChests(level);
  let gems = [];
  chests.forEach((chest, ci) => {
    for (let i = 0; i < 2; i++) {
      let shape;
      let color;
      if (level === 1) {
        shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
        color = chest.sample.color;
      } else if (level === 2) {
        shape = chest.sample.shape;
        color = SHAPE_COLORS[Math.floor(Math.random() * SHAPE_COLORS.length)].value;
      } else {
        shape = chest.sample.shape;
        color = chest.sample.color;
      }
      gems.push({ id: `${ci}-${i}`, shape, color, chestKey: chest.key, placed: false });
    }
  });
  gems = shuffle(gems);

  let mistakes = 0;
  let remaining = gems.length;
  let selectedGemId = null;

  container.appendChild(el('p', { className: 'game-instructions', text: 'Sentuh permata, lalu sentuh peti yang cocok!' }));
  const chestRow = el('div', { className: 'chest-row' });
  const trayEl = el('div', { className: 'gem-tray' });
  container.append(chestRow, trayEl);

  const gemEls = {};

  chests.forEach((chest) => {
    const chestBox = el('div', { className: 'chest' });
    const icon = el('div', { className: 'chest-icon', text: '🧰' });
    const sampleGem = makeGemNode(chest.sample.shape, chest.sample.color);
    const label = el('div', { className: 'chest-label', text: chest.label });
    chestBox.append(icon, sampleGem, label);
    chestBox.addEventListener('click', () => handleChestTap(chest, chestBox));
    chestRow.appendChild(chestBox);
  });

  gems.forEach((gem) => {
    const wrapper = el('button', { className: 'btn gem-btn' });
    wrapper.appendChild(makeGemNode(gem.shape, gem.color));
    wrapper.addEventListener('click', () => handleGemTap(gem, wrapper));
    trayEl.appendChild(wrapper);
    gemEls[gem.id] = wrapper;
  });

  function handleGemTap(gem, node) {
    if (!alive || gem.placed) return;
    playClick();
    Object.values(gemEls).forEach((n) => {
      n.style.outline = 'none';
    });
    selectedGemId = gem.id;
    node.style.outline = '3px solid #FFD23F';
  }

  function handleChestTap(chest, chestBox) {
    if (!alive || !selectedGemId) return;
    const gem = gems.find((g) => g.id === selectedGemId);
    if (!gem) return;
    if (chest.match(gem)) {
      playSuccess();
      gem.placed = true;
      gemEls[gem.id].remove();
      remaining--;
      chestBox.classList.add('pop-in');
      selectedGemId = null;
      if (remaining === 0) finishRound();
    } else {
      mistakes++;
      playTryAgain();
      shakeAndReset(chestBox);
      shakeAndReset(gemEls[gem.id]);
    }
  }

  function finishRound() {
    let stars = 3;
    if (mistakes > 4) stars = 1;
    else if (mistakes > 1) stars = 2;
    onComplete({ stars });
  }

  return () => {
    alive = false;
  };
}

export default {
  id: 'cocokkan-bentuk',
  title: 'Cocokkan Bentuk & Warna',
  emoji: '💎',
  colorTheme: 'dragon',
  maxLevel: 3,
  mount,
};
