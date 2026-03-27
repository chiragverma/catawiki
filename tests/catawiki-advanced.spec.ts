import { test, expect } from '../fixtures/catawiki.fixture';

// ── 1. Network interception ───────────────────────────────────────────────────
test('network - search request contains correct query parameter', async ({ catawiki }) => {
  const searchTerm = 'train';
  const [req] = await Promise.all([
    catawiki.page.waitForRequest(r => new RegExp(`[?&]q=${encodeURIComponent(searchTerm)}`, 'i').test(r.url())),
    catawiki.search(searchTerm),
  ]);

  expect(req.url()).toMatch(new RegExp(`[?&]q=${encodeURIComponent(searchTerm)}`, 'i'));
  expect(req.method()).toBe('GET');
  await catawiki.waitForSearchResults(searchTerm);

  // Results are relevant — at least one card title contains the search term
  const firstTitle = await catawiki.getLotCardTitle(0);
  expect(firstTitle.length).toBeGreaterThan(0);
  expect(firstTitle.toLowerCase()).toContain(searchTerm.toLowerCase());
});

// ── 2. Lot page structure ─────────────────────────────────────────────────────
test('lot page structure - description, shipping and seller sections are present', async ({ catawiki }) => {
  await catawiki.search('train');
  await catawiki.waitForSearchResults('train');

  const firstTitle = await catawiki.getLotCardTitle(0);
  await catawiki.clickLotByIndex(0);
  await catawiki.waitForLotPage();

  // Lot title on the page matches the card title we clicked
  const lotPageTitle = (await catawiki.lotTitle.textContent())!.trim();
  expect(lotPageTitle.length).toBeGreaterThan(0);
  expect(lotPageTitle).toBe(firstTitle);

  await expect(catawiki.lotDescriptionHeading).toBeVisible();
  await expect(catawiki.page.getByText(/shipping/i).first()).toBeVisible();
  await expect(catawiki.page.getByText(/selected by/i).first()).toBeVisible();
});

// ── 3. Category navigation ────────────────────────────────────────────────────
test('category navigation - browsing via category link shows auction content', async ({ catawiki }) => {
  const categoryLink = catawiki.page.locator('a[href*="/en/c/"]').first();
  await expect(categoryLink).toBeVisible();

  // Capture the category name before clicking to validate it after navigation
  const categoryHref = await categoryLink.getAttribute('href');
  await categoryLink.click();

  await expect(catawiki.page).toHaveURL(/\/en\/c\//);
  expect(catawiki.page.url()).toContain(categoryHref!.split('?')[0]);

  // Category pages show either lot cards (/l/) or subcategory tiles (/en/c/)
  const content = catawiki.page.locator('main a[href*="/l/"], main a[href*="/en/c/"]');
  await expect(content.first()).toBeVisible();

  // Multiple items are present — not just a single placeholder
  const count = await content.count();
  expect(count).toBeGreaterThan(1);
});

// ── 4. Auction timer ─────────────────────────────────────────────────────────
test('auction timer - countdown is visible and shows a valid time format', async ({ catawiki }) => {
  await catawiki.search('train');
  await catawiki.waitForSearchResults('train');
  await catawiki.clickLotByIndex(0);
  await catawiki.waitForLotPage();

  await expect(catawiki.auctionTimer).toBeVisible();

  const timerText = await catawiki.auctionTimer.textContent();
  expect(timerText).toMatch(/\d+\s*(d|h|m|s)/i);

  // Timer is actively counting down — poll until the text changes (no explicit sleep)
  await expect(catawiki.auctionTimer).not.toHaveText(timerText!, { timeout: 5_000 });
  const updatedTimerText = await catawiki.auctionTimer.textContent();
  expect(updatedTimerText).toMatch(/\d+\s*(d|h|m|s)/i);
});
