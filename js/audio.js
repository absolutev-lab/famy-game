import { isMuted } from './state.js';

let ctx = null;

function getCtx() {
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    ctx = new AudioCtx();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function playTone(freq, startTime, duration, type = 'sine', gainPeak = 0.25) {
  const audioCtx = getCtx();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(gainPeak, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

function withGuard(fn) {
  return (...args) => {
    if (isMuted()) return;
    try {
      fn(...args);
    } catch (e) {
      /* ignore audio errors, e.g. autoplay policy before user gesture */
    }
  };
}

export const playClick = withGuard(() => {
  const audioCtx = getCtx();
  playTone(800, audioCtx.currentTime, 0.06, 'square', 0.15);
});

export const playSuccess = withGuard(() => {
  const audioCtx = getCtx();
  const now = audioCtx.currentTime;
  [523.25, 659.25, 783.99].forEach((freq, i) => playTone(freq, now + i * 0.08, 0.18, 'sine', 0.2));
});

export const playStarWin = withGuard(() => {
  const audioCtx = getCtx();
  const now = audioCtx.currentTime;
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
    playTone(freq, now + i * 0.1, 0.3, 'sine', 0.22);
    playTone(freq * 1.005, now + i * 0.1, 0.3, 'triangle', 0.1);
  });
});

export const playTryAgain = withGuard(() => {
  const audioCtx = getCtx();
  playTone(280, audioCtx.currentTime, 0.3, 'sine', 0.15);
});

export function primeAudio() {
  try {
    getCtx();
  } catch (e) {
    /* audio not available in this browser/context */
  }
}
