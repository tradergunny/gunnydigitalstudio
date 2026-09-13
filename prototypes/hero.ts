// Feasibility prototype: the real GLB in the Gallery hero slot.
// Measures load time, model bytes, draw calls, triangles and steady-state FPS.
import { Studio } from '../src/render/studio';
import { defaults } from '../src/state';
import { byId } from '../src/content';
import type { ObjectId } from '../src/state';

const stage = document.getElementById('stage')!;
const st = document.getElementById('st')!;
const fpsEl = document.getElementById('fps')!;
const hotspots = [...document.querySelectorAll<HTMLAnchorElement>('.hp')];
const metrics: Record<string, unknown> = { start: performance.now() };

const params = new URLSearchParams(location.search);
if (params.get('render') === '1') {
  st.textContent = 'render only (forced)';
} else {
  boot();
}

async function boot() {
  const t0 = performance.now();
  let studio: Studio;
  try {
    studio = new Studio(stage);
  } catch (e) {
    st.textContent = 'render only · WebGL unavailable';
    metrics.error = String(e);
    return;
  }
  studio.update(defaults);
  studio.onFrame = () => {
    for (const hp of hotspots) {
      const id = hp.dataset.id as ObjectId;
      const p = studio.project(byId[id].position);
      hp.style.transform = `translate(${p.x}px,${p.y}px) translate(-50%,-50%)`;
      hp.style.visibility = p.visible ? 'visible' : 'hidden';
    }
  };
  hotspots.forEach(hp => hp.addEventListener('click', e => { e.preventDefault(); studio.focus(hp.dataset.id as ObjectId); }));
  document.addEventListener('keydown', e => { if (e.key.toLowerCase() === 'r') studio.reset(); });
  try {
    await studio.load(pct => { st.textContent = `render · loading model ${Math.round(pct)}%`; });
  } catch (e) {
    st.textContent = 'render only · model failed to load';
    metrics.error = String(e);
    return;
  }
  const t1 = performance.now();
  metrics.loadMs = Math.round(t1 - t0);
  stage.classList.add('ready');
  st.textContent = `live 3D · loaded in ${(metrics.loadMs as number) / 1000}s`;

  // Steady-state FPS over rolling 2s windows.
  let frames = 0, last = performance.now();
  const samples: number[] = [];
  const tick = () => {
    frames++;
    const now = performance.now();
    if (now - last >= 2000) {
      const fps = Math.round(frames * 1000 / (now - last));
      samples.push(fps); frames = 0; last = now;
      fpsEl.textContent = `${fps} fps`;
      metrics.fpsSamples = samples;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  const res = performance.getEntriesByType('resource').find(r => r.name.includes('studio.glb')) as PerformanceResourceTiming | undefined;
  if (res) { metrics.glbBytes = res.transferSize || res.encodedBodySize; metrics.glbMs = Math.round(res.duration); }
  Object.defineProperty(window, '__hero', { value: { metrics, stats: () => studio.stats(), studio }, configurable: true });
}
