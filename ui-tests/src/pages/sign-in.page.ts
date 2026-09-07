import { type Page, type Locator, expect } from '@playwright/test';

export class SignInPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginNowButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByPlaceholder('Enter your Email');
    this.passwordInput = page.getByPlaceholder('Enter your password');
    this.loginNowButton = page.getByRole('button', { name: 'Login Now' });
  }

  async expectLoginFormVisible() {
    await expect(this.page.getByText('Login to your account')).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginNowButton).toBeVisible();
  }

  getErrorMessage() {
    return this.page.getByText('The email address or password are incorrect.');
  }
}
