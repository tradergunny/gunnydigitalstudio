import type { Page } from '@playwright/test';

/** Collects console errors and page errors, leaving out any whose source URL matches
    `ignore`, so every test can end on a clean console. */
export const watchConsole = (page: Page, ignore?: RegExp) => {
  const problems: string[] = [];
  page.on('console', message => {
    if (message.type() !== 'error') return;
    if (ignore && ignore.test(message.location().url)) return;
    problems.push(message.text());
  });
  page.on('pageerror', error => problems.push(String(error)));
  return problems;
};


/** Makes every WebGL context request fail before the page loads, so the studio stays on the
    poster. Used where a test is about the page rather than the live scene: rendering the
    room under software GL costs seconds of CPU per worker and starves the other tests. */
export const withoutWebGL = (page: Page) =>
  page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, ...args: unknown[]) {
      if (/webgl/i.test(String(args[0]))) return null;
      return (getContext as unknown as (...rest: unknown[]) => unknown).apply(this, args);
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
