import { test, expect } from "@playwright/test";
import { Env } from "../src/utils/env";
import { LoginPage } from "../src/pages/LoginPage";
import { DashboardPage } from "../src/pages/DashboardPage";
import { FindingsTablePage } from "../src/pages/FindingsTablePage";
import { prepareDownloadsDir, saveNextDownload } from "../src/utils/download";
import { firstRowFromCsv, normalizeText } from "../src/utils/report";

test.describe("Cymulate – download and verify Findings report", () => {
  test.beforeEach(async () => {
    Env.assertCreds?.(); // optional guard if you added it
    await prepareDownloadsDir();
  });

  test("Filter BAS, export first row, compare to CSV", async ({ page }) => {
    // 1) Login
    const login = new LoginPage(page);
    await login.open();
    await login.login(Env.email, Env.password);
    await login.assertLoggedIn();

    // 2) Go to Findings
    const dashboard = new DashboardPage(page);
    await dashboard.gotoFindingsTab(); // your nav method

    // 3) Work with the Findings table
    const findings = new FindingsTablePage(page);
    await findings.assertVisible();
    await findings.applyBasModuleFilter();

    // Read UI values (first row)
    const ui = await findings.readFirstRow(); // { name, timestamp, status }

    // 4) Select first row and export
    await findings.selectFirstRow();
    const waitForSave = saveNextDownload(page); // start listening BEFORE clicking
    await findings.triggerExport();
    const { filePath } = await waitForSave;

    // 5) Parse CSV & compare
    const csvRow = firstRowFromCsv(filePath); // { name, timestamp, status } – normalized
    expect(normalizeText(csvRow.name)).toBe(normalizeText(ui.name));
    expect(normalizeText(csvRow.timestamp)).toBe(normalizeText(ui.timestamp));
    expect(normalizeText(csvRow.status)).toBe(normalizeText(ui.status));
  });
});
