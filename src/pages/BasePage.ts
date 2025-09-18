import { Page, Locator, expect } from "@playwright/test";
import { Logger } from "../utils/logger";

/**
 * BasePage encapsulates common page actions and utilities.
 * All specific page classes should extend this class.
 */
export abstract class BasePage {
  protected readonly page: Page;
  protected readonly log: Logger;

  constructor(page: Page, scope: string) {
    this.page = page;
    this.log = new Logger(scope);
  }

  /** Navigate to a specific URL path (appended to baseURL) with wait and logging*/
  async goto(url: string, p0: { waitUntil: string }): Promise<void> {
    this.log.step(`Navigating to ${url}`);
    await this.page.goto(url, { waitUntil: "domcontentloaded" });
  }

  /** wrap page.locator for convenience and typeing */
  locate(selector: string): Locator {
    return this.page.locator(selector);
  }

  /** Wait for visibility */
  async waitForVisible(selector: string): Promise<void> {
    this.log.info(`Waiting for visibility of ${selector}`);
    await expect(this.locate(selector)).toBeVisible({ timeout: 10000 });
  }

  /** Click with logging and Visibility Check */
  async click(selector: string): Promise<void> {
    this.log.step(`Clicking ${selector}`);
    await this.waitForVisible(selector);
    await this.locate(selector).click();
  }

  /** Fill input with logging and Visibility Check */
  async fill(selector: string, value: string): Promise<void> {
    this.log.step(`Filling ${selector} with "${value}"`);
    await this.waitForVisible(selector);
    await this.locate(selector).fill(value);
  }

  /** Get text from an element */
  async getText(selector: string): Promise<string> {
    this.log.info(`Getting text from ${selector}`);
    await this.waitForVisible(selector);
    return (await this.locate(selector).innerText()).trim();
  }

  /** Assert element contains text */
  async expectTextContains(selector: string, expectedText: string): Promise<void> {
    this.log.step(`Asserting ${selector} contains text "${expectedText}"`);
    await this.waitForVisible(selector);
    await expect(this.locate(selector)).toContainText(expectedText, { timeout: 5000 });
  }

  /** Sage press key (like 'Enter' or 'Escape' etc) */
  async pressKey(selector: string, key: string): Promise<void> {
    this.log.step(`Pressing key "${key}" on ${selector}`);
    await this.waitForVisible(selector);
    await this.locate(selector).press(key);
  }

  /** Wait until there are no network connections for a short while. */
  async waitNetworkIdle(timeout: number = 10_000): Promise<void> {
    this.log.info(`Wait for network idle (timeout ${timeout} ms)`);
    await this.page.waitForLoadState("networkidle", { timeout });
  }
}
