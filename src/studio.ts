import { site } from './content';
import type { LiveScene, ObjectId } from './render/live-scene';

/* The Studio component: the poster paints first, and once the hero has painted and is in
   view the live scene is fetched and faded in over it. Whatever goes wrong on the way, the
   visitor keeps the poster and never sees an error.

     poster → loading → live
                 ↘ failed          (no WebGL, a load error, or the context lost later)
     poster → held → loading       (constrained connections; entered by a later ticket)
*/

export type StudioState = 'poster' | 'held' | 'loading' | 'live' | 'failed';

export type Stats = ReturnType<LiveScene['stats']>;

/** Read-only diagnostics for tests. Nothing here changes the studio. */
export interface Diagnostics {
  state(): StudioState;
  target(): ObjectId | null;
  stats(): Stats;
}

declare global {
  interface Window {
    __gunny: Diagnostics;
  }
}

export interface StudioElements {
  /** The full-viewport hero; loading begins once it is in view. */
  hero: HTMLElement;
  /** The square slot holding the poster; the canvas is placed inside it. */
  stage: HTMLElement;
  /** The caption line's state word: still render, loading progress, or live. */
  caption: HTMLElement;
}

export interface StudioHandle {
  state(): StudioState;
  /** The live scene once it is up, for the hotspots to focus and project with. */
  scene(): LiveScene | null;
}

const NO_STATS: Stats = { drawCalls: 0, triangles: 0 };

/** True when the browser can give us the WebGL 2 context Three needs. */
const hasWebGL = () => {
  try {
    const context = document.createElement('canvas').getContext('webgl2');
    context?.getExtension('WEBGL_lose_context')?.loseContext();
    return context !== null;
  } catch {
    return false;
  }
};

/** Runs `callback` after the page has loaded and painted at least one frame. */
const afterFirstPaint = (callback: () => void) => {
  const paint = () => requestAnimationFrame(() => requestAnimationFrame(callback));
  if (document.readyState === 'complete') paint();
  else addEventListener('load', paint, { once: true });
};

/** Resolves the first time `element` intersects the viewport. */
const whenInView = (element: Element, callback: () => void) => {
  const observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    observer.disconnect();
    callback();
  });
  observer.observe(element);
};

export function mountStudio({ hero, stage, caption }: StudioElements): StudioHandle {
  let state: StudioState = 'poster';
  let scene: LiveScene | null = null;

  const diagnostics: Diagnostics = Object.freeze({
    state: () => state,
    target: () => scene?.current() ?? null,
    stats: () => (state === 'live' && scene ? scene.stats() : NO_STATS),
  });
  Object.defineProperty(window, '__gunny', { value: diagnostics, writable: false, configurable: false });

  const setCaption = (text: string) => {
    caption.textContent = text;
  };

  /** Back to exactly what the poster state looks like, whatever we were doing. */
  const fail = () => {
    state = 'failed';
    stage.classList.remove('live');
    scene?.dispose();
    scene = null;
    setCaption(site.studio.still);
  };

  const begin = async () => {
    if (state !== 'poster') return;
    state = 'loading';
    if (!hasWebGL()) return fail();

    try {
      const { LiveScene } = await import('./render/live-scene');
      scene = new LiveScene(stage);
      const canvas = scene.renderer.domElement;
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', site.studio.alt);
      scene.onContextLoss = fail;

      setCaption(site.studio.loading);
      await scene.load(percent => {
        if (state === 'loading') setCaption(`${site.studio.loading} ${Math.round(percent)}%`);
      });
    } catch {
      return fail();
    }
    if (state !== 'loading') return;

    state = 'live';
    stage.classList.add('live');
    setCaption(site.studio.live);
  };

  setCaption(site.studio.still);
  afterFirstPaint(() => whenInView(hero, () => void begin()));

  return { state: () => state, scene: () => scene };
}
