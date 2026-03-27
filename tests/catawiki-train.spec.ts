import { test, expect } from '../fixtures/catawiki.fixture';

test('search for train, click second lot, verify and print details', async ({ catawiki }) => {
  await catawiki.search('train');
  await catawiki.waitForSearchResults('train');

  await catawiki.clickLotByIndex(1);
  await catawiki.waitForLotPage();

  const { title, favorites, bid } = await catawiki.getLotDetails();

  console.log('\n=== Lot Details ===');
  console.log(`Lot Name:        ${title}`);
  console.log(`Favorites Count: ${favorites}`);
  console.log(`Current Bid:     ${bid}`);
  console.log('==================\n');
});

['train', 'watch', 'car'].forEach(term => {
  test(`search works for "${term}"`, async ({ catawiki }) => {
    await catawiki.search(term);
    await catawiki.waitForSearchResults(term);

    await expect(catawiki.lotCards.first()).toBeVisible();
  });
});

// ── Lot detail assertions ────────────────────────────────────────────────────
test('lot details - title is non-empty, bid is numeric, favorites is a number', async ({ catawiki }) => {
  await catawiki.search('train');
  await catawiki.waitForSearchResults('train');

  await catawiki.clickLotByIndex(1);
  await catawiki.waitForLotPage();

  const { title, favorites, bid } = await catawiki.getLotDetails();

  expect(title.length).toBeGreaterThan(0);
  expect(bid).toMatch(/[\d,.]+/);    // e.g. "€ 120", "$1,200", "120.00"
  expect(favorites).toMatch(/\d+/);  // e.g. "42", "3 favorites"
});

// ── Filtering ────────────────────────────────────────────────────────────────
test('applying Reserve price filter updates URL and shows results', async ({ catawiki }) => {
  await catawiki.search('watch');
  await catawiki.waitForSearchResults('watch');

  await catawiki.applyNoReservePriceFilter();

  await expect(catawiki.page).toHaveURL(/reserve_price/);
  await expect(catawiki.lotCards.first()).toBeVisible();
});

// ── Pagination ───────────────────────────────────────────────────────────────
test('clicking Next page navigates to page 2 and shows lots', async ({ catawiki }) => {
  await catawiki.search('watch');
  await catawiki.waitForSearchResults('watch');

  await catawiki.clickNextPage();

  await expect(catawiki.page).toHaveURL(/page=2/);
  await expect(catawiki.lotCards.first()).toBeVisible();
});

// ── Lot URL integrity ────────────────────────────────────────────────────────
test('clicking a lot opens correct URL and shows a valid title', async ({ catawiki }) => {
  await catawiki.search('train');
  await catawiki.waitForSearchResults('train');

  const cardTitle = await catawiki.getLotCardTitle(0);

  await catawiki.clickLotByIndex(0);
  await catawiki.waitForLotPage();

  await expect(catawiki.page).toHaveURL(/\/l\/\d+/);

  const pageTitle = (await catawiki.lotTitle.textContent())!.trim();
  expect(pageTitle.length).toBeGreaterThan(0);
  expect(pageTitle.toLowerCase()).toContain(cardTitle.toLowerCase().split(' ')[0]);
});

// ── Search clears and re-searches ───────────────────────────────────────────
test('re-searching updates results and URL', async ({ catawiki }) => {
  await catawiki.search('train');
  await catawiki.waitForSearchResults('train');
  await expect(catawiki.page).toHaveURL(/q=train/i);

  await catawiki.search('watch');
  await catawiki.waitForSearchResults('watch');
  await expect(catawiki.page).toHaveURL(/q=watch/i);

  await expect(catawiki.page).not.toHaveURL(/q=train/i);
});

// ── Negative ─────────────────────────────────────────────────────────────────
test('search with invalid keyword shows no results', async ({ catawiki }) => {
  await catawiki.search('asdkjasdkjasdkj');

  // Catawiki shows related objects instead of a blank page — assert the "no exact results" message
  await expect(catawiki.noResultsMessage).toBeVisible();
});
