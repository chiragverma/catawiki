# Catawiki E2E Test Suite

Playwright-based end-to-end tests for [Catawiki](https://www.catawiki.com), covering search, lot details, filtering, pagination, and negative scenarios.

---

## Project Structure

```
├── tests/
│   ├── catawiki-train.spec.ts    # Core test cases (10 tests)
│   └── catawiki-advanced.spec.ts # Advanced & diverse test cases (4 tests)
├── pages/
│   └── CatawikiPage.ts           # Page Object Model
├── fixtures/
│   └── catawiki.fixture.ts       # Shared test setup (navigate + accept cookies)
├── browserstack.yml              # BrowserStack configuration
├── playwright.config.ts          # Playwright configuration
└── .env                          # Your credentials (never committed)
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd <repository-folder>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Install Playwright browsers

```bash
npx playwright install chrome
```

---

## Running Tests Locally

Runs all tests in Chrome on your machine:

```bash
npm test
```

To view the HTML report after the run:

```bash
npx playwright show-report
```

---

## Running Tests on BrowserStack

BrowserStack runs your tests across **Chrome, Firefox, and Safari** in parallel and shows results in the BrowserStack dashboard.

### 1. Set up credentials

Create a `.env` file in the project root:

```
BROWSERSTACK_USERNAME=your_username_here
BROWSERSTACK_ACCESS_KEY=your_access_key_here
```

> Get your credentials from [browserstack.com/accounts/settings](https://www.browserstack.com/accounts/settings)

### 2. Export the environment variables

```bash
source .env && export BROWSERSTACK_USERNAME BROWSERSTACK_ACCESS_KEY
```

### 3. Run on BrowserStack

```bash
npm run test:browserstack
```

Results appear in your [BrowserStack Automate dashboard](https://automate.browserstack.com).

> The `.env` file is gitignored — your credentials are never committed.

---

## Test Cases

### `catawiki-train.spec.ts` — Core scenarios

| # | Test | Description |
|---|------|-------------|
| 1 | Search and print lot details | Searches for "train", clicks the second lot, prints title, favorites, and current bid to console |
| 2 | Search works for "train" | Verifies search returns visible lot cards |
| 3 | Search works for "watch" | Verifies search returns visible lot cards |
| 4 | Search works for "car" | Verifies search returns visible lot cards |
| 5 | Lot detail assertions | Asserts title is non-empty, bid is numeric, favorites is a number |
| 6 | Reserve price filter | Applies the No Reserve Price filter and verifies the URL and results update |
| 7 | Pagination | Clicks Next page and verifies navigation to page 2 with results |
| 8 | Lot URL integrity | Clicks a lot and verifies the URL format and page title match the card title |
| 9 | Re-search | Searches for a second term and verifies URL and results update correctly |
| 10 | Negative case | Searches with a nonsense keyword and verifies the "no exact results" message |

### `catawiki-advanced.spec.ts` — Advanced & diverse scenarios

| # | Test | Description |
|---|------|-------------|
| 11 | Network interception | Intercepts the outgoing search request and verifies it contains the correct query parameter and uses GET |
| 12 | Lot page structure | Opens a lot page and asserts description, shipping, and seller sections are all present |
| 13 | Category navigation | Navigates via a category link and verifies the category page loads auction content |
| 14 | Auction timer | Opens a lot page and verifies the countdown timer is visible and shows a valid time format |

---

## Configuration

| Setting | Value |
|---------|-------|
| Base URL | https://www.catawiki.com |
| Browser (local) | Chrome (real browser, not bundled Chromium) |
| Browsers (BrowserStack) | Chrome, Firefox, Safari |
| Screenshots | On failure only |
