import { type Page, type Locator } from '@playwright/test';

export class LanguageSelectionPage {
  readonly page: Page;
  readonly logInButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.logInButton = page.getByText('Log In');
  }

  async open(baseURL: string) {
    await this.page.goto(`${baseURL}/languages`);
  }

  async clickLogIn() {
    await this.logInButton.click();
  }
}
