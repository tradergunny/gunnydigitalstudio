import { expect, test } from '@playwright/test';
import { channels, experience, facets, hasPlaceholders, sections, site, work } from '../src/content';
import { watchConsole, withoutWebGL } from './helpers';

/* These tests are about the page around the studio, so they run without WebGL and the
   studio stays on the poster; the live scene has its own spec. */
test.beforeEach(async ({ page }) => {
  await withoutWebGL(page);
  await page.goto('/');
});

test('the hero shows the poster, the name and the contact link above the fold', async ({
  page,
}, testInfo) => {
  const poster = page.getByRole('img', { name: site.poster.alt });
  await expect(poster).toBeVisible();

  await expect(page.getByRole('heading', { level: 1 })).toHaveText(site.wordmark);

  for (const role of site.roles) {
    await expect(page.locator('.hero')).toContainText(role);
  }
  await expect(page.locator('.hero')).toContainText(site.location);
  await expect(page.locator('.hero')).toContainText(site.lede);

  const contact = page.getByRole('link', { name: site.contactLabel });
  const box = await contact.boundingBox();
  expect(box, 'the contact link has a box').not.toBeNull();
  expect(
    box!.y + box!.height,
    `the contact link sits above the fold at ${testInfo.project.name}`,
  ).toBeLessThanOrEqual(page.viewportSize()!.height);
});

test('every mail link carries the address, and Contact shows it as text', async ({ page }) => {
  const mailLinks = page.locator('a[href^="mailto:"]');
  await expect(mailLinks).toHaveCount(2);

  for (const href of await mailLinks.evaluateAll(links =>
    links.map(link => link.getAttribute('href')),
  )) {
    expect(href).toBe(`mailto:${site.email}`);
  }

  const shown = page.locator('#contact a[href^="mailto:"]');
  await expect(shown).toBeVisible();
  expect((await shown.innerText()).trim().toLowerCase()).toBe(site.email.toLowerCase());
});

test('each nav link on show scrolls to its section', async ({ page }) => {
  const visible: string[] = [];

  for (const section of sections) {
    const link = page.locator(`nav a[href="#${section.id}"]`);
    if (!(await link.isVisible())) continue;
    visible.push(section.id);

    const target = page.locator(`#${section.id}`);
    await page.evaluate(() => scrollTo(0, 0));
    await expect(target).not.toBeInViewport();

    await link.click();
    await expect(target).toBeInViewport();
    await expect(page.locator(`#${section.id} h2`)).toBeInViewport();
  }

  expect(visible.length, 'at least one nav link is on show').toBeGreaterThan(0);
});

test('the hotspots on the poster lead into the page', async ({ page }) => {
  const spots = page.locator('.stage a.hotspot');
  await expect(spots).toHaveCount(3);

  for (const href of await spots.evaluateAll(links =>
    links.map(link => link.getAttribute('href')!),
  )) {
    await expect(page.locator(href)).toHaveCount(1);
  }
});

test('every entry renders from the content module', async ({ page }) => {
  await expect(page.locator('#work ol > li')).toHaveCount(work.length);
  for (const entry of work) {
    await expect(page.locator('#work')).toContainText(entry.title);
    await expect(page.locator('#work')).toContainText(entry.summary);
    await expect(page.locator('#work')).toContainText(entry.year);
  }

  await expect(page.locator('#experience ol > li')).toHaveCount(experience.length);
  for (const entry of experience) {
    await expect(page.locator('#experience')).toContainText(entry.role);
    await expect(page.locator('#experience')).toContainText(entry.period);
  }

  await expect(page.locator('#about article')).toHaveCount(facets.length);
  for (const facet of facets) {
    await expect(page.locator(`#facet-${facet.id}`)).toContainText(facet.body);
  }

  for (const channel of channels) {
    const shown = page.locator('#contact').getByRole('link', { name: channel.label, exact: true });
    if (channel.href) await expect(shown).toHaveAttribute('href', channel.href);
    // A channel with nowhere to go is left out rather than shown as dead text.
    else await expect(page.locator('#contact')).not.toContainText(channel.label);
  }
  await expect(page.locator('#contact')).toContainText(site.thaiLine);
});

test('the footer note stands while entries are flagged placeholder', async ({ page }) => {
  const footer = page.locator('footer');
  if (hasPlaceholders) await expect(footer).toContainText(site.placeholderNote);
  else await expect(footer).not.toContainText('Sample entries');
});

test('nothing from the interactive room is left in the page', async ({ page }) => {
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');

  const leftovers = await page.evaluate(() => ({
    thai: (() => {
      const thai = /[฀-๿]/;
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const stray: string[] = [];
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const text = node.textContent ?? '';
        if (thai.test(text) && !node.parentElement?.closest('[lang="th"]')) stray.push(text.trim());
      }
      return stray;
    })(),
    stored: Object.keys(localStorage),
    media: document.querySelectorAll('audio, video, dialog').length,
    diagnostics: '__studio' in window,
  }));

  expect(leftovers.thai, 'Thai text outside a lang="th" element').toEqual([]);
  expect(leftovers.stored, 'saved room state').toEqual([]);
  expect(leftovers.media, 'audio, snapshot or dialog elements').toBe(0);
  expect(leftovers.diagnostics, 'the old room diagnostics object').toBe(false);
});

test('the hero splits on the desktop and stacks on a phone', async ({ page }) => {
  const width = page.viewportSize()!.width;
  const monogram = (await page.locator('.monogram').boundingBox())!;
  const name = (await page.getByRole('heading', { level: 1 }).boundingBox())!;
  const poster = (await page.getByRole('img', { name: site.poster.alt }).boundingBox())!;

  expect(monogram.y, 'the header sits above the name column').toBeLessThan(name.y);

  if (width < 820) {
    expect(poster.y, 'the poster follows the name column').toBeGreaterThanOrEqual(name.y + name.height);
  } else {
    expect(poster.x, 'the poster sits beside the name column').toBeGreaterThanOrEqual(name.x + name.width);
  }
});

test('the page loads without console errors', async ({ page }) => {
  const problems = watchConsole(page);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.waitForLoadState('networkidle');
  expect(problems).toEqual([]);
});
