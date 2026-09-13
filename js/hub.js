import { el, muteButton } from './ui.js';
import { getGameProgress, starBadgeText, loadState } from './state.js';
import { goTo } from './router.js';

export function renderHub(container, games) {
  const state = loadState();

  const header = el('div', { className: 'hub-header' });
  header.appendChild(el('h1', { className: 'hub-title', text: '✨ Dunia Fantasi ✨' }));
  header.appendChild(el('p', { className: 'hub-subtitle', text: 'Pilih petualangan sihirmu!' }));
  container.appendChild(header);

  const topBar = el('div', { className: 'top-bar' });
  topBar.appendChild(el('div', { className: 'star-bar', text: `⭐ Total Bintang: ${state.totalStars}` }));
  topBar.appendChild(muteButton());
  container.appendChild(topBar);

  const grid = el('div', { className: 'hub-grid' });
  games.forEach((game) => {
    const progress = getGameProgress(game.id);
    const stars = starBadgeText(game.id, game.maxLevel);
    const maxStars = game.maxLevel * 3;

    const card = el('div', { className: 'game-card pop-in' });
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.appendChild(el('div', { className: 'emoji', text: game.emoji }));
    card.appendChild(el('div', { className: 'title', text: game.title }));
    card.appendChild(el('div', { className: 'level-badge', text: `Level ${progress.unlockedLevel} / ${game.maxLevel}` }));
    card.appendChild(el('div', { className: 'stars', text: `⭐ ${stars}/${maxStars}` }));

    const activate = () => goTo(`#game:${game.id}`);
    card.addEventListener('click', activate);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activate();
      }
    });
    grid.appendChild(card);
  });
  container.appendChild(grid);
}
