import { initRouter } from './router.js';
import { primeAudio } from './audio.js';

const app = document.getElementById('app');
initRouter(app);

window.addEventListener('pointerdown', primeAudio, { once: true });
