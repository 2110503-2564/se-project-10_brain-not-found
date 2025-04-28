import { test, expect } from '@playwright/test';

test.describe('request info page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole('link', { name: 'Sign-In' }).click();
  })

  test('Request info page exists', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Email' }).fill('shopOwner1@gmail.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('123456789');
    await page.getByRole('button', { name: 'Sign in with Credentials' }).click();
    await page.getByRole('link', { name: 'Request' }).click();
    await page.waitForSelector('h1:text("Your Requests")');
    await expect(page.getByRole('heading', { name: 'Your Requests' })).toBeVisible();
  });

  test('Shop owner only sees their request', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Email' }).fill('shopOwner1@gmail.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('123456789');
    await page.getByRole('button', { name: 'Sign in with Credentials' }).click();
    await page.getByRole('link', { name: 'Request' }).click();

    const list = await page.getByRole('listitem');
    await expect(list).toContainText(['ShopOwner1']);
    await expect(list).not.toContainText(['ShopOwner2']);
    await expect(list).not.toContainText(['ShopOwner3']);
  });

  test('Admin sees all request', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Email' }).fill('adminTest@gmail.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password');
    await page.getByRole('button', { name: 'Sign in with Credentials' }).click();
    await page.getByRole('link', { name: 'Request' }).click();

    const list = await page.getByRole('listitem');
    await expect(list).toContainText(['ShopOwner1']);
    await expect(list).toContainText(['ShopOwner2']);
    await expect(list).toContainText(['ShopOwner3']);
  });
  
})

test.describe('new request form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole('link', { name: 'Sign-In' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill('shopOwner1@gmail.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('123456789');
    await page.getByRole('button', { name: 'Sign in with Credentials' }).click();
  })

  test('Create shop form exist', async ({ page }) => {
    await page.getByRole('link', { name: 'Create Shop' }).click();
    await expect(page.getByRole('heading', { name: 'Create Shop Request Form' })).toBeVisible();
  });

  test('Invalid submission displays an error message', async ({ page }) => {
    await page.getByRole('link', { name: 'Create Shop' }).click();
    await page.getByRole('button', { name: 'Submit Shop Request' }).click();
    await expect(page.getByText('Error:')).toBeVisible();
  });

})


