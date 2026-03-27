import { type Page, type Locator, expect } from '@playwright/test';

export class CatawikiPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ── Locators ────────────────────────────────────────────────────────────────

  get searchInput(): Locator {
    return this.page
      .getByRole('combobox', { name: /search/i })
      .or(this.page.locator('input[type="search"]'))
      .first();
  }

  get lotCards(): Locator {
    return this.page.locator('main a[href*="/l/"]').filter({
      has: this.page.locator('img'),
    });
  }

  get lotTitle(): Locator {
    return this.page.getByRole('heading', { level: 1 });
  }

  get favoritesCounter(): Locator {
    return this.page.locator('[class*="FavoriteChip_fav-wrapper"]').first();
  }

  get noResultsMessage(): Locator {
    return this.page.getByText(/no exact results/i);
  }

  get reservePriceFilterButton(): Locator {
    return this.page
      .locator('[data-testid="sticky-filters-button"]')
      .filter({ hasText: 'Reserve price' });
  }

  get noReservePriceOption(): Locator {
    return this.page.locator('label').filter({ hasText: /no reserve price/i });
  }

  get nextPageLink(): Locator {
    return this.page
      .locator('nav.c-pagination__container a')
      .filter({ hasText: /^next$/i });
  }

  get currentBid(): Locator {
    return this.page
      .locator('[data-testid="lot-bid-status-section"]')
      .locator('[class*="bid-amount"]')
      .first();
  }

  get auctionTimer(): Locator {
    return this.page.getByText(/closes in/i).first();
  }

  get lotDescriptionHeading(): Locator {
    return this.page.getByRole('heading', { name: /description/i });
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  async goto() {
    await this.page.goto('/en/');
  }

  async acceptCookies() {
    const cookieBtn = this.page.locator('button.gtm-cookie-bar-decline');
    try {
      await cookieBtn.waitFor({ state: 'visible', timeout: 8_000 });
      await cookieBtn.click();
    } catch {
      // No cookie banner — continue
    }
  }

  async search(query: string) {
    await expect(this.searchInput).toBeVisible();
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
  }

  async waitForSearchResults(query: string) {
    await expect(this.lotCards.first()).toBeVisible();
    await expect(this.page).toHaveURL(new RegExp(`q=${query}`, 'i'));
  }

  async getLotCardTitle(index: number): Promise<string> {
    const titleEl = this.lotCards.nth(index).locator('p.c-lot-card__title');
    return ((await titleEl.textContent()) ?? '').trim();
  }

  async applyNoReservePriceFilter() {
    await this.reservePriceFilterButton.click();
    // Catawiki re-shows a cookie settings modal on first filter interaction — dismiss it
    try {
      const saveSettings = this.page
        .locator('.c-modal.js-modal')
        .getByRole('button', { name: /save cookie settings/i });
      await saveSettings.waitFor({ state: 'visible', timeout: 4_000 });
      await saveSettings.click();
    } catch {
      // Modal did not appear — continue
    }
    await this.noReservePriceOption.waitFor({ state: 'visible' });
    await this.noReservePriceOption.click();
  }

  async clickNextPage() {
    await this.nextPageLink.click();
  }

  async clickLotByIndex(index: number) {
    const count = await this.lotCards.count();
    if (count <= index) throw new Error(`Expected at least ${index + 1} lot card(s), found ${count}`);
    await this.lotCards.nth(index).click();
  }

  async waitForLotPage() {
    await expect(this.lotTitle).toBeVisible();
    await expect(this.page).toHaveURL(/\/l\//);
  }

  async getLotDetails(): Promise<{ title: string; favorites: string; bid: string }> {
    const title = (await this.lotTitle.textContent())!.trim();

    await expect(this.favoritesCounter).toBeVisible();
    const favorites = (await this.favoritesCounter.textContent())!.trim();

    await expect(this.currentBid).toBeVisible();
    const bid = (await this.currentBid.textContent())!.trim();

    return { title, favorites, bid };
  }
}
