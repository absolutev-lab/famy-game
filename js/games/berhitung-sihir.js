import { el, shakeAndReset } from '../ui.js';
import { playClick, playSuccess, playTryAgain } from '../audio.js';
import { COUNT_OBJECTS } from '../../data/content.js';

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeChoices(correct, min, max) {
  const set = new Set([correct]);
  let guard = 0;
  while (set.size < 3 && guard < 50) {
    guard++;
    const candidate = randInt(min, max);
    if (candidate >= 0) set.add(candidate);
  }
  return shuffle([...set]);
}

function generateQuestion(level) {
  const obj = COUNT_OBJECTS[randInt(0, COUNT_OBJECTS.length - 1)];
  if (level === 1) {
    const n = randInt(1, 5);
    return { prompt: 'Ada berapa banyak?', visual: obj.repeat(n), answer: n, choices: makeChoices(n, 1, 5) };
  }
  if (level === 2) {
    const a = randInt(1, 6);
    const b = randInt(1, 4);
    const sum = a + b;
    return { prompt: `${obj.repeat(a)} + ${obj.repeat(b)} = ?`, answer: sum, choices: makeChoices(sum, 2, 10) };
  }
  const isAdd = Math.random() < 0.5;
  const a = randInt(1, 9);
  const b = isAdd ? randInt(1, 10 - a) : randInt(1, a);
  const answer = isAdd ? a + b : a - b;
  return { prompt: `${a} ${isAdd ? '+' : '-'} ${b} = ?`, answer, choices: makeChoices(answer, 0, 10) };
}

function mount(container, { level, onComplete }) {
  let alive = true;
  const TOTAL = 5;
  let index = 0;
  let correctCount = 0;
  let missesThisQuestion = 0;

  const progressEl = el('p', { className: 'game-instructions' });
  const promptEl = el('h2', {});
  const visualEl = el('div', { className: 'count-visual' });
  const choicesEl = el('div', { className: 'choices-row' });

  container.append(progressEl, promptEl, visualEl, choicesEl);

  function renderQuestion() {
    missesThisQuestion = 0;
    const q = generateQuestion(level);
    promptEl.textContent = q.prompt;
    visualEl.textContent = q.visual || '';
    progressEl.textContent = `Soal ${index + 1} dari ${TOTAL}`;
    choicesEl.innerHTML = '';
    q.choices.forEach((choice) => {
      const btn = el('button', { className: 'btn', text: String(choice) });
      btn.addEventListener('click', () => handleAnswer(choice, q.answer, btn));
      choicesEl.appendChild(btn);
    });
  }

  function handleAnswer(choice, answer, btn) {
    if (!alive) return;
    playClick();
    if (choice === answer) {
      playSuccess();
      btn.classList.add('pop-in');
      correctCount++;
      setTimeout(() => {
        if (alive) nextOrFinish();
      }, 350);
    } else {
      missesThisQuestion++;
      playTryAgain();
      shakeAndReset(btn);
      if (missesThisQuestion >= 2) {
        promptEl.textContent += `  (Jawabannya: ${answer})`;
        setTimeout(() => {
          if (alive) nextOrFinish();
        }, 900);
      }
    }
  }

  function nextOrFinish() {
    index++;
    if (index >= TOTAL) {
      let stars = 3;
      if (correctCount <= 3) stars = 1;
      else if (correctCount === 4) stars = 2;
      onComplete({ stars });
    } else {
      renderQuestion();
    }
  }

  renderQuestion();

  return () => {
    alive = false;
  };
}

export default {
  id: 'berhitung-sihir',
  title: 'Berhitung Sihir',
  emoji: '🔢',
  colorTheme: 'gold',
  maxLevel: 3,
  mount,
};
