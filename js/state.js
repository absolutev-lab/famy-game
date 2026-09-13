const STORAGE_KEY = 'dunia-fantasi-save-v1';

const GAME_IDS = [
  'memory-match',
  'berhitung-sihir',
  'tebak-huruf',
  'cocokkan-bentuk',
  'puzzle-kerajaan',
];

function defaultState() {
  const games = {};
  for (const id of GAME_IDS) {
    games[id] = { unlockedLevel: 1, bestStarsByLevel: {} };
  }
  return { totalStars: 0, settings: { muted: false }, games };
}

let memoryState = null;

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function writeStorage(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    /* localStorage unavailable (private browsing, etc) - keep in-memory only */
  }
}

export function loadState() {
  if (memoryState) return memoryState;
  const stored = readStorage();
  const base = defaultState();
  if (stored) {
    memoryState = {
      ...base,
      ...stored,
      settings: { ...base.settings, ...(stored.settings || {}) },
      games: { ...base.games, ...(stored.games || {}) },
    };
  } else {
    memoryState = base;
  }
  return memoryState;
}

export function saveState(state) {
  memoryState = state;
  writeStorage(state);
}

function recalcTotalStars(state) {
  let total = 0;
  for (const id of GAME_IDS) {
    const best = state.games[id]?.bestStarsByLevel || {};
    total += Object.values(best).reduce((a, b) => a + b, 0);
  }
  state.totalStars = total;
  return total;
}

export function recordResult(gameId, level, stars) {
  const state = loadState();
  const game = state.games[gameId] || { unlockedLevel: 1, bestStarsByLevel: {} };
  const prevBest = game.bestStarsByLevel[level] || 0;
  game.bestStarsByLevel[level] = Math.max(prevBest, stars);
  if (stars >= 1 && level >= game.unlockedLevel) {
    game.unlockedLevel = Math.min(level + 1, 3);
  }
  state.games[gameId] = game;
  recalcTotalStars(state);
  saveState(state);
  return state;
}

export function getGameProgress(gameId) {
  const state = loadState();
  return state.games[gameId] || { unlockedLevel: 1, bestStarsByLevel: {} };
}

export function starBadgeText(gameId, maxLevel) {
  const progress = getGameProgress(gameId);
  let total = 0;
  for (let level = 1; level <= maxLevel; level++) {
    total += progress.bestStarsByLevel[level] || 0;
  }
  return total;
}

export function isMuted() {
  return !!loadState().settings.muted;
}

export function toggleMuted() {
  const state = loadState();
  state.settings.muted = !state.settings.muted;
  saveState(state);
  return state.settings.muted;
}
