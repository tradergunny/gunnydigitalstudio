import { expect, test, type Page } from '@playwright/test';
import { site } from '../src/content';
import type { StudioState } from '../src/studio';
import { watchConsole, withoutWebGL } from './helpers';

/* The Studio: poster first, the live scene fading in over it, and the poster kept whenever
   the scene cannot load. Everything here is read through the diagnostics object on window
   and what a visitor can see; nothing drives the renderer. */

/** Headless software GL takes a while to parse the model and compile shaders, and several
    workers may be doing it at once. */
const LIVE_TIMEOUT = 90_000;

const THREE_CHUNK = /\/assets\/three-[^/]+\.js$/;

test.setTimeout(120_000);

const state = (page: Page) => page.evaluate(() => window.__gunny.state());

/** The failed state has to look exactly like the poster: no canvas, no notice, nothing broken. */
const expectPosterOnly = async (page: Page, expected: StudioState) => {
  expect(await state(page)).toBe(expected);

  const poster = page.getByRole('img', { name: site.poster.alt });
  await expect(poster).toBeVisible();
  await expect(poster).toHaveCSS('opacity', '1');

  await expect(page.locator('.stage canvas')).toHaveCount(0);
  await expect(page.locator('.stage-caption')).toContainText(site.studio.still);
  await expect(page.locator('.stage-caption')).not.toContainText(site.studio.live);
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.locator('.hero')).not.toContainText(/error|failed|unavailable/i);

  // The page around the studio keeps working.
  await expect(page.getByRole('link', { name: site.contactLabel })).toHaveAttribute(
    'href',
    `mailto:${site.email}`,
  );
  await expect(page.locator('#work ol > li').first()).toBeVisible();
};

test('on a normal connection the live scene fades in over the poster', async ({ page }) => {
  const problems = watchConsole(page);
  const captions: string[] = [];
  await page.exposeFunction('__captionChanged', (text: string) => {
    captions.push(text);
  });
  await page.addInitScript(() => {
    addEventListener('DOMContentLoaded', () => {
      const caption = document.querySelector('.stage-caption')!;
      new MutationObserver(() => {
        (window as unknown as { __captionChanged(text: string): void }).__captionChanged(
          caption.textContent ?? '',
        );
      }).observe(caption, { subtree: true, childList: true, characterData: true });
    });
  });
  await page.goto('/');

  await expect.poll(() => state(page), { timeout: LIVE_TIMEOUT }).toBe('live');

  // On the way there the caption read out the download as text.
  await expect
    .poll(() => captions.some(text => text.includes(site.studio.loading)))
    .toBe(true);
  await expect.poll(() => captions.some(text => /\d+\s?%/.test(text))).toBe(true);

  const canvas = page.locator('.stage canvas');
  await expect(canvas).toBeVisible();
  await expect(canvas).toHaveCSS('opacity', '1');

  // The scene sits exactly where the poster is, so the fade does not move the room.
  const posterBox = (await page.getByRole('img', { name: site.poster.alt }).boundingBox())!;
  const canvasBox = (await canvas.boundingBox())!;
  for (const side of ['x', 'y', 'width', 'height'] as const) {
    expect(canvasBox[side], `canvas ${side} matches the poster`).toBeCloseTo(posterBox[side], 0);
  }

  await expect(page.locator('.stage-caption')).toContainText(site.studio.live);

  const stats = await page.evaluate(() => window.__gunny.stats());
  expect(stats.drawCalls).toBeGreaterThan(0);
  expect(stats.triangles).toBeGreaterThan(0);
  expect(await page.evaluate(() => window.__gunny.target())).toBeNull();

  expect(problems).toEqual([]);
});

test('with the model request blocked the page stays on the poster and reports failed', async ({
  page,
}) => {
  const problems = watchConsole(page, /studio\.glb/);
  await page.route('**/models/studio.glb', route => route.abort());
  await page.goto('/');

  await expect.poll(() => state(page), { timeout: LIVE_TIMEOUT }).toBe('failed');
  await expectPosterOnly(page, 'failed');
  expect(problems).toEqual([]);
});

test('with WebGL disabled the page stays on the poster and never asks for three', async ({
  page,
}) => {
  const problems = watchConsole(page);
  const chunks: string[] = [];
  page.on('request', request => {
    if (THREE_CHUNK.test(request.url())) chunks.push(request.url());
  });
  await withoutWebGL(page);
  await page.goto('/');

  await expect.poll(() => state(page), { timeout: LIVE_TIMEOUT }).toBe('failed');
  await expectPosterOnly(page, 'failed');
  await page.waitForLoadState('networkidle');
  expect(chunks, 'the three chunk was never requested').toEqual([]);
  expect(problems).toEqual([]);
});

test('the three chunk is not requested until loading begins', async ({ page }) => {
  // The state the studio was in when the three chunk was asked for.
  const seenIn: StudioState[] = [];
  await page.route(THREE_CHUNK, async route => {
    seenIn.push(await state(page));
    await route.continue();
  });
  // Land with the hero scrolled out of view, so loading has no reason to begin.
  await page.addInitScript(() => {
    addEventListener('DOMContentLoaded', () =>
      scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }),
    );
  });
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  await expect(page.locator('.hero')).not.toBeInViewport();
  expect(await state(page)).toBe('poster');
  expect(seenIn, 'no three chunk while the hero is out of view').toEqual([]);

  const preloads = await page
    .locator('link[rel="modulepreload"]')
    .evaluateAll(links => links.map(link => link.getAttribute('href') ?? ''));
  expect(preloads.filter(href => /three|live-scene/.test(href))).toEqual([]);

  await page.evaluate(() => scrollTo(0, 0));
  await expect.poll(() => state(page), { timeout: LIVE_TIMEOUT }).not.toBe('poster');
  await expect.poll(() => seenIn.length).toBeGreaterThan(0);
  expect(seenIn[0]).toBe('loading');
});

test('losing the WebGL context returns the studio to the poster', async ({ page }) => {
  const problems = watchConsole(page);
  await page.goto('/');
  await expect.poll(() => state(page), { timeout: LIVE_TIMEOUT }).toBe('live');

  // Not driving the renderer: this is the browser taking the context away, as it does
  // under memory pressure or a GPU reset.
  await page.evaluate(() => {
    const canvas = document.querySelector<HTMLCanvasElement>('.stage canvas')!;
    const gl = canvas.getContext('webgl2')!;
    gl.getExtension('WEBGL_lose_context')!.loseContext();
  });

  await expect.poll(() => state(page)).toBe('failed');
  await expectPosterOnly(page, 'failed');
  expect(problems).toEqual([]);
});

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('the canvas appears without a fade', async ({ page }) => {
    await page.goto('/');
    await expect.poll(() => state(page), { timeout: LIVE_TIMEOUT }).toBe('live');

    const canvas = page.locator('.stage canvas');
    await expect(canvas).toHaveCSS('opacity', '1');
    const duration = await canvas.evaluate(
      element => parseFloat(getComputedStyle(element).transitionDuration) || 0,
    );
    expect(duration, 'the fade is instant').toBeLessThan(0.05);
  });
});

test('the diagnostics object is read-only', async ({ page }) => {
  await page.goto('/');
  const outcome = await page.evaluate(() => {
    const before = window.__gunny;
    try {
      (window as unknown as { __gunny: unknown }).__gunny = null;
    } catch {
      /* Strict mode throws on a read-only property; that is fine. */
    }
    try {
      (window.__gunny as unknown as { state: unknown }).state = () => 'live';
    } catch {
      /* Same. */
    }
    return {
      sameObject: window.__gunny === before,
      frozen: Object.isFrozen(window.__gunny),
      keys: Object.keys(window.__gunny).sort(),
    };
  });
  expect(outcome.sameObject).toBe(true);
  expect(outcome.frozen).toBe(true);
  expect(outcome.keys).toEqual(['state', 'stats', 'target']);
});
