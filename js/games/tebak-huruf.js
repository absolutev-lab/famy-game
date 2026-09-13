import { el, shakeAndReset } from '../ui.js';
import { playClick, playSuccess, playTryAgain } from '../audio.js';
import { WORDS } from '../../data/content.js';

const LETTERS_POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function randomLetters(exclude, count) {
  const pool = LETTERS_POOL.filter((l) => !exclude.includes(l));
  return shuffle(pool).slice(0, count);
}

function mount(container, { level, onComplete }) {
  let alive = true;
  const TOTAL = 5;
  let index = 0;
  let correctCount = 0;
  const roundWords = shuffle(WORDS).slice(0, TOTAL);

  const progressEl = el('p', { className: 'game-instructions' });
  const promptEl = el('h2', {});
  const emojiEl = el('div', { className: 'count-visual' });
  const wordDisplay = el('div', {});
  wordDisplay.style.fontSize = '30px';
  wordDisplay.style.letterSpacing = '6px';
  wordDisplay.style.margin = '4px 0 12px';
  const choicesEl = el('div', { className: 'choices-row' });

  container.append(progressEl, promptEl, emojiEl, wordDisplay, choicesEl);

  function finishItem(isCorrect) {
    if (isCorrect) correctCount++;
    index++;
    if (index >= TOTAL) {
      let stars = 3;
      if (correctCount <= 2) stars = 1;
      else if (correctCount <= 3) stars = 2;
      onComplete({ stars });
    } else {
      renderItem();
    }
  }

  function simpleAnswer(isCorrect, btn) {
    playClick();
    if (isCorrect) {
      playSuccess();
      btn.classList.add('pop-in');
      setTimeout(() => {
        if (alive) finishItem(true);
      }, 500);
    } else {
      playTryAgain();
      shakeAndReset(btn);
      setTimeout(() => {
        if (alive) finishItem(false);
      }, 700);
    }
  }

  function renderItem() {
    progressEl.textContent = `Kata ${index + 1} dari ${TOTAL}`;
    const item = roundWords[index];
    emojiEl.textContent = item.emoji;
    wordDisplay.textContent = '';
    choicesEl.innerHTML = '';

    if (level === 1) {
      promptEl.textContent = 'Ini gambar apa? Pilih huruf awalnya!';
      const firstLetter = item.word[0];
      const choices = shuffle([firstLetter, ...randomLetters(firstLetter, 2)]);
      choices.forEach((letter) => {
        const btn = el('button', { className: 'btn', text: letter });
        btn.addEventListener('click', () => simpleAnswer(letter === firstLetter, btn));
        choicesEl.appendChild(btn);
      });
    } else if (level === 2) {
      promptEl.textContent = 'Lengkapi kata ini!';
      const gapIndex = Math.floor(item.word.length / 2);
      const missingLetter = item.word[gapIndex];
      wordDisplay.textContent = item.word
        .split('')
        .map((ch, i) => (i === gapIndex ? '_' : ch))
        .join('');
      const choices = shuffle([missingLetter, ...randomLetters(missingLetter, 2)]);
      choices.forEach((letter) => {
        const btn = el('button', { className: 'btn', text: letter });
        btn.addEventListener('click', () => {
          const correct = letter === missingLetter;
          if (correct) wordDisplay.textContent = item.word;
          simpleAnswer(correct, btn);
        });
        choicesEl.appendChild(btn);
      });
    } else {
      promptEl.textContent = 'Eja kata ini!';
      const typed = [];
      wordDisplay.textContent = '_ '.repeat(item.word.length).trim();
      const bank = shuffle([
        ...item.word.split(''),
        ...randomLetters(item.word.split(''), Math.max(0, 6 - item.word.length)),
      ]);
      bank.forEach((letter) => {
        const btn = el('button', { className: 'btn', text: letter });
        btn.addEventListener('click', () => {
          const expected = item.word[typed.length];
          if (letter === expected) {
            playClick();
            typed.push(letter);
            btn.disabled = true;
            btn.style.opacity = '0.35';
            wordDisplay.textContent =
              typed.join(' ') + (typed.length < item.word.length ? ' ' + '_ '.repeat(item.word.length - typed.length).trim() : '');
            if (typed.length === item.word.length) {
              playSuccess();
              setTimeout(() => {
                if (alive) finishItem(true);
              }, 500);
            }
          } else {
            playTryAgain();
            shakeAndReset(btn);
          }
        });
        choicesEl.appendChild(btn);
      });
    }
  }

  renderItem();

  return () => {
    alive = false;
  };
}

export default {
  id: 'tebak-huruf',
  title: 'Tebak Huruf & Kata',
  emoji: '🔤',
  colorTheme: 'sky',
  maxLevel: 3,
  mount,
};
