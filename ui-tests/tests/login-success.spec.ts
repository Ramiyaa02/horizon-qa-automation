import { test, expect } from '@playwright/test';
import { LanguageSelectionPage } from '../src/pages/language-selection.page';
import { SignInPage } from '../src/pages/sign-in.page';

test.describe('Successful login', () => {
  const baseURL = process.env.UI_BASE_URL ?? 'https://horizon-plus.dfp8hwwhcxnpq.amplifyapp.com';

  test.skip(
    !process.env.LOGIN_EMAIL || !process.env.LOGIN_PASSWORD,
    'LOGIN_EMAIL and LOGIN_PASSWORD must be set in .env for this test'
  );

  test('logs in with valid credentials and shows authenticated state', async ({ page }) => {
    const languageSelectionPage = new LanguageSelectionPage(page);
    const signInPage = new SignInPage(page);

    await languageSelectionPage.open(baseURL);
    await languageSelectionPage.clickLogIn();
    await expect(page).toHaveURL(new RegExp(`${baseURL}/signin$`));

    await signInPage.login(process.env.LOGIN_EMAIL!, process.env.LOGIN_PASSWORD!);

    await page.waitForURL((url) => !url.toString().includes('/signin'), { timeout: 15000 });

    await page.goto(`${baseURL}/languages`);
    await expect(page.getByText('Log Out')).toBeVisible();
  });
});
