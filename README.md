# Cymulate QA Automation (Playwright + TypeScript)

## Overview

This project automates an end-to-end flow in Cymulate:

1. Login with credentials from `.env`.
2. Navigate from **Dashboard** to **Findings**.
3. Apply filter **Module = BAS**.
4. Read the **first row** values (Finding Name, Timestamp, Status) from the UI.
5. Select the row and **Export**.
6. Download the CSV and **verify** the first row matches the UI.

## Design

- **Page Object Model (POM):** Clear separation of concerns.
  - `LoginPage` – resilient login with role/placeholder/type fallbacks and optional cookie banner handling.
  - `DashboardPage` – post-login navigation to Findings.
  - `FindingsTablePage` – owns table readiness, filter flow, select first row, export, and first-row reads.
  - `BasePage` – shared helpers (`goto`, `waitVisible`, `waitNetworkIdle`, `click`, `fill`, `text`) and a scoped logger.
- **Resilient selectors:** Prefer `data-testid` and ARIA roles; scope with `hasText` where needed.
- **Header-aware access:** Build a header→index map at runtime to avoid brittle column indices.
- **Deterministic downloads:** `prepareDownloadsDir()` cleans `downloads/`; `saveNextDownload(page)` waits + saves the file explicitly.
- **CSV parsing & normalization:** `utils/report.ts` parses the exported CSV, normalizes headers and cell text, and returns a typed `FindingRow` for comparison.
- **Type safety & readability:** Strict TypeScript, small utilities, and human-readable logging (`STEP/INFO/WARN/ERROR`).

## Prerequisites

- Node.js 18+ (recommended)
- Playwright browsers installed

```bash
npm install
npx playwright install --with-deps
```

## Configuration

Create a `.env` file at the project root (a `.env.example` is provided):

```ini
BASE_URL=https://app.cymulate.com
CY_EMAIL=your_email@example.com     # or CY_MAIL
CY_PASSWORD=your_password_here      # or CY_PASS
```

The code accepts **either** `CY_EMAIL/CY_PASSWORD` **or** `CY_MAIL/CY_PASS`.

## How to Run

Headless (records video and trace):

```bash
npm test
```

Headed (interactive debug):

```bash
npm run test:headed
```

Open the HTML report:

```bash
npm run report
```

## Outputs

- **HTML report:** `playwright-report/`
- **Videos/Traces/Screenshots:** `test-results/` (linked from the HTML report)
- **Exported CSV:** `downloads/` (cleaned per test run)

## Troubleshooting (quick)

- Missing browsers: `npx playwright install`
- Env not loaded: ensure `.env` sits next to `package.json` and variables are set as above
- Download not saved: ensure `saveNextDownload(page)` is awaited **after** triggering Export
