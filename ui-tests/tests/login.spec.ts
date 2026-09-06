import { test, expect } from '@playwright/test';
import { LanguageSelectionPage } from '../src/pages/language-selection.page';
import { SignInPage } from '../src/pages/sign-in.page';

test.describe('Login navigation', () => {
  test('navigates from /languages to /signin via Log In', async ({ page }) => {
    const baseURL = process.env.UI_BASE_URL ?? 'https://horizon-plus.dfp8hwwhcxnpq.amplifyapp.com';
    const languageSelectionPage = new LanguageSelectionPage(page);
    const signInPage = new SignInPage(page);

    await languageSelectionPage.open(baseURL);
    await expect(languageSelectionPage.logInButton).toBeVisible();

    await languageSelectionPage.clickLogIn();
    await expect(page).toHaveURL(new RegExp(`${baseURL}/signin$`));

    await signInPage.expectLoginFormVisible();
  });
});
