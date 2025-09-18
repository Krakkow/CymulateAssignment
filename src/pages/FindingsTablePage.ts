import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import { FindingRow } from "../types/findingRow";

export class FindingsTablePage extends BasePage {
  // Root table (supports both semantic <table> and ARIA table)
  private readonly table: Locator;
  private readonly thead: Locator;
  private readonly headerCells: Locator;
  private readonly tbody: Locator;
  private readonly rows: Locator;

  // Filters controls
  private readonly filtersButton: Locator;
  private readonly moduleFilterItem: Locator;
  private readonly moduleSearch: Locator;
  private readonly moduleBasCheckbox: Locator;
  private readonly applyFiltersButton: Locator;

  // Export (top-right)
  private readonly exportButton: Locator;
  private readonly confirmExportButton: Locator;

  constructor(page: Page) {
    super(page, "FindingsTablePage");

    // Table root: prefer data-testid seen in the app, fallback to role/table tag
    this.table = this.page.getByTestId("Table");

    // Basic parts
    this.thead = this.table.locator('thead, [role="rowgroup"]').first();
    this.headerCells = this.thead.locator('th, [role="columnheader"]');
    this.tbody = this.table.locator('tbody, [role="rowgroup"]').last();
    this.rows = this.tbody.locator('tr, [role="row"]');

    // Filters UI
    this.filtersButton = this.page.getByTestId("Filters");
    this.moduleFilterItem = this.page.locator('[data-testid="FilterItem"]', { hasText: "Module" }).first();
    this.moduleSearch = this.page.getByTestId("InputSearch");
    this.moduleBasCheckbox = this.moduleBasCheckbox = this.page.locator('[data-testid="ListItem"]', { hasText: "BAS" }).locator('[data-testid="Checkbox"]');
    this.applyFiltersButton = this.page.getByTestId("ApplyFilters");

    // Export UI (main + possible confirm)
    this.exportButton = this.page.getByTestId("export-button");
    this.confirmExportButton = this.page.getByTestId("ExportIcon");
  }

  /** Assert table exists & is visible */
  async assertVisible(): Promise<void> {
    this.log.step("Assert Findings table is visible");
    await expect(this.table).toBeVisible({ timeout: 30_000 });
  }

  /** Apply Module → BAS filter (per assignment screenshots) */
  async applyBasModuleFilter(): Promise<void> {
    this.log.step("Open Filters");
    await this.filtersButton.click();

    this.log.info('Open "Module" filter group');
    await this.moduleFilterItem.click();

    this.log.info('Search "BAS" and check it (if search is present)');
    if (await this.moduleSearch.isVisible()) {
      await this.moduleSearch.fill("BAS");
    }
    // checkbox may be a div[role=checkbox]; click() is safest
    if (await this.moduleBasCheckbox.isVisible()) {
      await this.moduleBasCheckbox.click();
    } else {
      this.log.warn("BAS checkbox not visible; attempting to locate by text fallback");
      await this.page.getByText(/^BAS$/i).click();
    }

    this.log.step("Apply filters");
    await this.applyFiltersButton.click();

    await this.waitNetworkIdle();
    await this.assertVisible();
  }

  /** Select the first row's checkbox (div[role="checkbox"] in first cell) */
  async selectFirstRow(): Promise<void> {
    this.log.step("Select first row checkbox");
    const firstRow = this.rows.first();
    const rowCheckbox = firstRow.getByRole("checkbox", { name: /select/i });
    await expect(rowCheckbox).toBeVisible();
    await rowCheckbox.click(); // check() not reliable on div[role=checkbox]
  }

  /** Click Export (and confirm if a second 'Export' appears). */
  async triggerExport(): Promise<void> {
    this.log.step("Click Export");
    await this.exportButton.click();

    // If a side panel or dialog appears with another Export button:
    if (await this.confirmExportButton.isVisible()) {
      this.log.step("Confirm Export");
      await this.confirmExportButton.click();
    }
  }

  // ---------------------------
  // Header-aware cell reading
  // ---------------------------

  /** Build map: header text (normalized) -> column index */
  private async buildHeaderIndexMap(): Promise<Map<string, number>> {
    const count = await this.headerCells.count();
    const map = new Map<string, number>();

    for (let i = 0; i < count; i++) {
      const raw = (await this.headerCells.nth(i).innerText()).trim();
      const key = this.normalizeHeader(raw);
      if (key) map.set(key, i);
    }
    if (map.size === 0) {
      this.log.warn("No table headers detected; column-based reads may fail.");
    } else {
      this.log.info(`Header map: ${[...map.entries()].map(([k, v]) => `${k}->${v}`).join(", ")}`);
    }
    return map;
  }

  /** Normalize header text to a stable key */
  private normalizeHeader(h: string): string {
    // Examples: "Finding Name", "Timestamp", "Status"
    return h.toLowerCase().replace(/\s+/g, " ").trim();
  }

  private async firstRowCellByHeader(headerText: string): Promise<Locator> {
    const map = await this.buildHeaderIndexMap();
    const key = this.normalizeHeader(headerText);
    if (!map.has(key)) {
      throw new Error(`Header "${headerText}" not found. Known: ${[...map.keys()].join(", ")}`);
    }
    const idx = map.get(key)!;
    const firstRow = this.rows.first();
    return firstRow.locator('td, [role="cell"]').nth(idx);
  }

  /** Read first row values as displayed in the UI */
  async readFirstRow(): Promise<FindingRow> {
    this.log.step("Read first row values (name, timestamp, status)");
    const nameCell = await this.firstRowCellByHeader("Finding Name");
    const tsCell = await this.firstRowCellByHeader("Timestamp");
    const statusCell = await this.firstRowCellByHeader("Status");

    const name = (await nameCell.innerText()).trim();
    const timestamp = (await tsCell.innerText()).trim();
    const status = (await statusCell.innerText()).trim();

    this.log.info(`UI Row → name="${name}", timestamp="${timestamp}", status="${status}"`);
    return { name, timestamp, status };
  }
}
