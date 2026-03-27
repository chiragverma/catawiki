import { test as base } from '@playwright/test';
import { CatawikiPage } from '../pages/CatawikiPage';

type Fixtures = {
  catawiki: CatawikiPage;
};

export const test = base.extend<Fixtures>({
  catawiki: async ({ page }, use) => {
    const catawiki = new CatawikiPage(page);
    await catawiki.goto();
    await catawiki.acceptCookies();
    await use(catawiki);
  },
});

export { expect } from '@playwright/test';
