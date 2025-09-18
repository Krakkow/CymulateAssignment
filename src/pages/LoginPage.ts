import { Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class LoginPage extends BasePage {
  private readonly emailInput = this.page.getByTestId("email").or(
    this.page
      .getByRole("textbox", { name: /email|username/i })
      .or(this.page.getByPlaceholder(/email|username/i))
      .or(this.page.locator('input[type="email"], input[name="email"], input[name="username"]'))
      .first()
  );
  private readonly passwordInput = this.page.getByTestId("password").or(
    this.page
      .getByLabel(/password/i)
      .or(this.page.getByPlaceholder(/password/i))
      .or(this.page.locator('input[type="password"], input[name="password"]'))
      .first()
  );
  private readonly loginButton = this.page.getByTestId("sign-in").or(
    this.page
      .getByRole("button", { name: /log\s*in|sign\s*in|submit/i })
      .or(this.page.locator('button[type="submit"]'))
      .first()
  );

  private readonly findingsTab = this.page.getByRole("link", { name: /cym/ });

  constructor(page: Page) {
    super(page, "LoginPage");
  }

  /** Navigate to login page */
  async open(): Promise<void> {
    this.log.step("Opening login page");
    await this.goto("/login", { waitUntil: "domcontentloaded" });
  }

  /** fill in credentials */
  async login(email: string, password: string): Promise<void> {
    this.log.step("Filling in login credentials");
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /** Verify login failure by checking for error message */
  async assertLoggedIn(): Promise<void> {
    this.log.step("Verifying successful login");
    await expect(this.findingsTab).toBeVisible({ timeout: 15000 });
    this.log.info("Login verified successfully");
  }
}
