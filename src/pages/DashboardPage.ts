import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class DashboardPage extends BasePage {
  // Top Navigation Locators (relevant to this assignment)
  private readonly findingsTab: Locator;

  // Table Elements
  private readonly findingsTableTitle: Locator;
  private readonly table: Locator;

  constructor(page: Page) {
    super(page, "DashboardPage");
    this.findingsTab = this.page.getByTestId("link-button-Findings");
    this.findingsTableTitle = this.page.getByTestId("main-page-title");
    this.table = this.page.getByRole("table");
  }

  /** Navigate to Findings tab */
  async gotoFindingsTab(): Promise<void> {
    this.log.step("Navigating to Findings tab");
    await this.findingsTab.click();
    await this.assertTableVisible();
  }

  /** asserting Findings table is loaded and visiable */
  async assertTableVisible(): Promise<void> {
    this.log.step("Asserting Findings table is visible");
    await expect(this.findingsTableTitle).toBeVisible({ timeout: 30_000 });
    await expect(this.table).toBeVisible({ timeout: 30_000 });
  }
}
