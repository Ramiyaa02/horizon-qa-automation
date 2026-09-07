import { test, expect } from '@playwright/test';
import { LanguageSelectionPage } from '../src/pages/language-selection.page';
import { SignInPage } from '../src/pages/sign-in.page';

test.describe('Login validation', () => {
  const baseURL = process.env.UI_BASE_URL ?? 'https://horizon-plus.dfp8hwwhcxnpq.amplifyapp.com';

  test('empty email and password keeps Login Now disabled', async ({ page }) => {
    const languageSelectionPage = new LanguageSelectionPage(page);
    const signInPage = new SignInPage(page);

    await languageSelectionPage.open(baseURL);
    await languageSelectionPage.clickLogIn();
    await expect(page).toHaveURL(new RegExp(`${baseURL}/signin$`));

    await signInPage.expectLoginFormVisible();
    await expect(signInPage.loginNowButton).toBeDisabled();
    await expect(page).toHaveURL(new RegExp(`${baseURL}/signin$`));
  });

  test('empty email with password keeps Login Now disabled', async ({ page }) => {
    const languageSelectionPage = new LanguageSelectionPage(page);
    const signInPage = new SignInPage(page);

    await languageSelectionPage.open(baseURL);
    await languageSelectionPage.clickLogIn();
    await expect(page).toHaveURL(new RegExp(`${baseURL}/signin$`));

    await signInPage.passwordInput.fill('InvalidPassword123!');
    await expect(signInPage.loginNowButton).toBeDisabled();
    await expect(page).toHaveURL(new RegExp(`${baseURL}/signin$`));
  });

  test('email with empty password keeps Login Now disabled', async ({ page }) => {
    const languageSelectionPage = new LanguageSelectionPage(page);
    const signInPage = new SignInPage(page);

    await languageSelectionPage.open(baseURL);
    await languageSelectionPage.clickLogIn();
    await expect(page).toHaveURL(new RegExp(`${baseURL}/signin$`));

    await signInPage.emailInput.fill('qa.invalid@example.com');
    await expect(signInPage.loginNowButton).toBeDisabled();
    await expect(page).toHaveURL(new RegExp(`${baseURL}/signin$`));
  });

  test('invalid credentials show error message and stay on /signin', async ({ page }) => {
    const languageSelectionPage = new LanguageSelectionPage(page);
    const signInPage = new SignInPage(page);

    await languageSelectionPage.open(baseURL);
    await languageSelectionPage.clickLogIn();
    await expect(page).toHaveURL(new RegExp(`${baseURL}/signin$`));

    await signInPage.emailInput.fill('qa.invalid@example.com');
    await signInPage.passwordInput.fill('InvalidPassword123!');
    await expect(signInPage.loginNowButton).toBeEnabled();

    await signInPage.loginNowButton.click();
    await expect(signInPage.getErrorMessage()).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`${baseURL}/signin$`));
  });
});
