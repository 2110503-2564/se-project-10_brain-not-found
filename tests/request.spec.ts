import { test, expect } from '@playwright/test';

test.describe('request info page', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.setTimeout(testInfo.timeout + 30000)
    await page.goto('http://localhost:3000/');
    await page.getByRole('link', { name: 'Sign-In' }).click();
  })

  test('Request info page exists', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Email' }).fill('shopOwner1@gmail.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('123456789');
    await page.getByRole('button', { name: 'Sign in with Credentials' }).click();
    await page.goto('http://localhost:3000/request');
    await page.waitForLoadState('networkidle');
    let heading = page.getByRole('heading', { name: 'Your Requests' });
    await expect(heading).toBeVisible();
  });

  test('Unauthorized user have no access', async ({ page }) => {
    await page.goto('http://localhost:3000/request');
    await page.waitForLoadState('networkidle');
    let heading = page.getByRole('heading', { name: 'Your Requests' });
    await expect(heading).not.toBeVisible();
  });

  test('Shop owner only sees their request', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Email' }).fill('shopOwner1@gmail.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('123456789');
    await page.getByRole('button', { name: 'Sign in with Credentials' }).click();
    await page.goto('http://localhost:3000/request');
    await page.waitForLoadState('networkidle');
    

    let list = page.getByRole('listitem');
    // await expect(list, 'shop owner sees their requests only').toContainText(['ShopOwner1']);
    await expect(list, 'shop owner does not see others\' requests (1)').not.toContainText(['ShopOwner2']);
    
    await page.getByLabel('Filter by Status:').selectOption('pending');
    list = page.getByRole('listitem');
    await expect(list, 'pending filter does not show approved request').not.toContainText(['Approved'])
    await expect(list, 'pending filter does not show rejected request').not.toContainText(['Rejected'])

    await page.getByLabel('Filter by Status:').selectOption('approved');
    list = page.getByRole('listitem');
    await expect(list, 'approved filter does not show pending request').not.toContainText(['Pending'])
    await expect(list, 'approved filter does not show rejected request').not.toContainText(['Rejected'])

    await page.getByLabel('Filter by Status:').selectOption('rejected');
    list = page.getByRole('listitem');
    await expect(list, 'rejected filter does not show pending request').not.toContainText(['Pending'])
    await expect(list, 'rejected filter does not show approved request').not.toContainText(['Approved'])
  });

  test('Admin sees all request', async ({ page }) => {
    test.setTimeout(60000);
    await page.getByRole('textbox', { name: 'Email' }).fill('adminTest@gmail.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password');
    await page.getByRole('button', { name: 'Sign in with Credentials' }).click();
    await page.goto('http://localhost:3000/request');
    await page.waitForLoadState('networkidle');

    let list = await page.getByRole('listitem');
    //await expect(list).toContainText(['ShopOwner1']);
    //await expect(list).toContainText(['ShopOwner2']);
    //await expect(list).toContainText(['ShopOwner3']);

    await page.getByLabel('Filter by Status:').selectOption('pending');
    list = page.getByRole('listitem');
    await expect(list, 'pending filter does not show approved request').not.toContainText(['Approved'])
    await expect(list, 'pending filter does not show rejected request').not.toContainText(['Rejected'])

    await page.getByLabel('Filter by Status:').selectOption('approved');
    list = page.getByRole('listitem');
    await expect(list, 'approved filter does not show pending request').not.toContainText(['Pending'])
    await expect(list, 'approved filter does not show rejected request').not.toContainText(['Rejected'])

    await page.getByLabel('Filter by Status:').selectOption('rejected');
    list = page.getByRole('listitem');
    await expect(list, 'rejected filter does not show pending request').not.toContainText(['Pending'])
    await expect(list, 'rejected filter does not show approved request').not.toContainText(['Approved'])
  });
  
})

test.describe('new request form', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.setTimeout(testInfo.timeout + 30000)
    await page.goto('http://localhost:3000/');
    await page.getByRole('link', { name: 'Sign-In' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill('shopOwner1@gmail.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('123456789');
    await page.getByRole('button', { name: 'Sign in with Credentials' }).click();
  })

  test('Create shop form exist', async ({ page }) => {
    await page.getByRole('link', { name: 'Create Shop' }).click();
    let heading = await page.getByRole('heading', { name: 'Create Shop Request Form' })
    await expect(heading).toBeVisible();
  });

  test('Invalid submission displays an error message', async ({ page }) => {
    await page.getByRole('link', { name: 'Create Shop' }).click();
    await page.getByRole('button', { name: 'Submit Shop Request' }).click();
    await expect(page.getByText('Error:')).toBeVisible();
  });

})