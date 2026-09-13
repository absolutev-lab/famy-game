import { renderHub } from './hub.js';
import games from './games/index.js';
import { transitionTo, muteButton, createButton, el, awardStars } from './ui.js';
import { primeAudio, playClick } from './audio.js';
import { getGameProgress, recordResult } from './state.js';

const gameById = Object.fromEntries(games.map((g) => [g.id, g]));
let app = null;
let currentCleanup = null;

export function initRouter(appContainer) {
  app = appContainer;
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

export function goTo(hash) {
  primeAudio();
  playClick();
  if (window.location.hash === hash) {
    handleRoute();
  } else {
    window.location.hash = hash;
  }
}

function cleanupCurrent() {
  if (currentCleanup) {
    try {
      currentCleanup();
    } catch (e) {
      /* ignore cleanup errors from an already-detached game screen */
    }
    currentCleanup = null;
  }
}

function handleRoute() {
  cleanupCurrent();
  const hash = window.location.hash || '#hub';
  if (hash.startsWith('#game:')) {
    const id = hash.slice('#game:'.length);
    const game = gameById[id];
    if (!game) {
      goTo('#hub');
      return;
    }
    renderGameScreen(game);
  } else {
    transitionTo(app, (container) => renderHub(container, games));
  }
}

function renderGameScreen(game) {
  transitionTo(app, (container) => {
    const progress = getGameProgress(game.id);
    const level = Math.min(progress.unlockedLevel || 1, game.maxLevel);

    const topBar = el('div', { className: 'top-bar' });
    topBar.appendChild(createButton('🏠 Menu', () => goTo('#hub'), 'btn icon'));
    topBar.appendChild(el('h2', { text: `${game.emoji} ${game.title} — Level ${level}` }));
    topBar.appendChild(muteButton());
    container.appendChild(topBar);

    const board = el('div', { className: 'game-board' });
    container.appendChild(board);

    currentCleanup = game.mount(board, {
      level,
      onComplete: ({ stars }) => {
        recordResult(game.id, level, stars);
        awardStars(container, {
          stars,
          message: pickMessage(stars),
          onContinue: () => renderGameScreen(game),
          onExit: () => goTo('#hub'),
        });
      },
      onExit: () => goTo('#hub'),
    });
  });
}

function pickMessage(stars) {
  if (stars >= 3) return 'Luar biasa! Kamu jagoan sihir!';
  if (stars === 2) return 'Bagus sekali! Terus berlatih!';
  return 'Kerja bagus! Ayo coba lagi!';
}
