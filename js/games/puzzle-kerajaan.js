import { el } from '../ui.js';
import { playClick, playSuccess } from '../audio.js';

const CONFIG = { 1: { cols: 2, rows: 2 }, 2: { cols: 3, rows: 2 }, 3: { cols: 3, rows: 3 } };
const SCENE_SIZE = 300;

function makeCloud(top, left, width) {
  const cloud = el('div', {});
  Object.assign(cloud.style, {
    position: 'absolute',
    top: top + 'px',
    left: left + 'px',
    width: width + 'px',
    height: Math.round(width * 0.5) + 'px',
    background: 'white',
    borderRadius: '999px',
    opacity: '0.9',
  });
  return cloud;
}

function makeTower(left, width) {
  const wrap = el('div', {});
  Object.assign(wrap.style, { position: 'absolute', bottom: '60px', left: left + 'px', width: width + 'px', height: '120px' });
  const body = el('div', {});
  Object.assign(body.style, {
    position: 'absolute',
    bottom: '0',
    width: '100%',
    height: '90px',
    background: '#9B5DE5',
    border: '3px solid #7C3AED',
    boxSizing: 'border-box',
  });
  const roof = el('div', {});
  Object.assign(roof.style, {
    position: 'absolute',
    bottom: '90px',
    left: '-4px',
    width: '0',
    height: '0',
    borderLeft: (width / 2 + 4) + 'px solid transparent',
    borderRight: (width / 2 + 4) + 'px solid transparent',
    borderBottom: '34px solid #F15BB5',
  });
  wrap.append(body, roof);
  return wrap;
}

function buildSceneNode() {
  const scene = el('div', {});
  Object.assign(scene.style, {
    position: 'absolute',
    top: '0',
    left: '0',
    width: SCENE_SIZE + 'px',
    height: SCENE_SIZE + 'px',
    background: 'linear-gradient(to bottom, #8ED8F8 0%, #BEE9F8 55%, #7FCB8C 55%, #6ABF7B 100%)',
    overflow: 'hidden',
  });

  const sun = el('div', {});
  Object.assign(sun.style, {
    position: 'absolute',
    top: '18px',
    right: '24px',
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, #FFF3B0, #FFD23F)',
  });

  const keep = el('div', {});
  Object.assign(keep.style, {
    position: 'absolute',
    bottom: '60px',
    left: '60px',
    width: '150px',
    height: '90px',
    background: '#D8C4E8',
    borderRadius: '6px 6px 0 0',
    border: '3px solid #9B5DE5',
    boxSizing: 'border-box',
  });

  const dragon = el('div', { text: '🐉' });
  Object.assign(dragon.style, { position: 'absolute', top: '40px', left: '20px', fontSize: '40px' });

  const flag = el('div', { text: '🚩' });
  Object.assign(flag.style, { position: 'absolute', top: '38px', left: '95px', fontSize: '22px' });

  scene.append(sun, makeCloud(20, 40, 60), makeCloud(120, 200, 44), keep, makeTower(70, 26), makeTower(150, 26), dragon, flag);
  return scene;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isSolved(order) {
  return order.every((v, i) => v === i);
}

function mount(container, { level, onComplete }) {
  let alive = true;
  const { cols, rows } = CONFIG[level] || CONFIG[1];
  const total = cols * rows;
  const pieceW = SCENE_SIZE / cols;
  const pieceH = SCENE_SIZE / rows;

  let order;
  do {
    order = shuffle([...Array(total).keys()]);
  } while (isSolved(order));

  let selectedSlot = null;
  let swapCount = 0;

  container.appendChild(
    el('p', { className: 'game-instructions', text: 'Sentuh dua potongan untuk menukarnya sampai gambar lengkap!' })
  );
  const puzzleWrap = el('div', { className: 'puzzle-wrap' });
  puzzleWrap.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  puzzleWrap.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
  container.appendChild(puzzleWrap);

  function pieceNode(correctIndex) {
    const r = Math.floor(correctIndex / cols);
    const c = correctIndex % cols;
    const holder = el('button', { className: 'btn puzzle-piece' });
    const inner = buildSceneNode();
    inner.style.transform = `translate(${-c * pieceW}px, ${-r * pieceH}px)`;
    holder.appendChild(inner);
    return holder;
  }

  function render() {
    puzzleWrap.innerHTML = '';
    order.forEach((correctIndex, slotIndex) => {
      const piece = pieceNode(correctIndex);
      if (slotIndex === selectedSlot) piece.style.outline = '4px solid #FFD23F';
      piece.addEventListener('click', () => handleTap(slotIndex));
      puzzleWrap.appendChild(piece);
    });
  }

  function handleTap(slotIndex) {
    if (!alive) return;
    playClick();
    if (selectedSlot === null) {
      selectedSlot = slotIndex;
      render();
      return;
    }
    if (selectedSlot === slotIndex) {
      selectedSlot = null;
      render();
      return;
    }
    [order[selectedSlot], order[slotIndex]] = [order[slotIndex], order[selectedSlot]];
    swapCount++;
    selectedSlot = null;
    render();
    if (isSolved(order)) {
      playSuccess();
      setTimeout(() => {
        if (alive) finishRound();
      }, 400);
    }
  }

  function finishRound() {
    let stars = 3;
    if (swapCount > total * 2) stars = 1;
    else if (swapCount > total) stars = 2;
    onComplete({ stars });
  }

  render();

  return () => {
    alive = false;
  };
}

export default {
  id: 'puzzle-kerajaan',
  title: 'Puzzle Kerajaan',
  emoji: '🧩',
  colorTheme: 'sky',
  maxLevel: 3,
  mount,
};
