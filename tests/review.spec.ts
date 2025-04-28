import { test, expect } from '@playwright/test';

test('Customer submits a valid review to a shop', async ({ page }) => {
  // Given the customer is logged in
  await page.goto('/login');
  await page.fill('input[name="email"]', 'TeeCustomer3@gmail.com');
  await page.fill('input[name="password"]', '12345678');
  await page.click('button[type="submit"]');

  // (Optional) รอให้ login เสร็จ
  await expect(page.getByText('Welcome')).toBeVisible();

  // And the review and rating is valid
  const reviewText = 'Great service and friendly staff!';
  const ratingValue = '5'; // สมมติให้คะแนนเต็ม 5 ดาว

  // And customer has made a booking to the shop
  // (ถ้ามีหน้าเช็ค booking, อาจจะต้อง mock booking ไว้ก่อน หรือข้าม step นี้ไปใน test)

  // When the customer submits a review to the selected shop
  await page.goto('/shop/123'); // สมมติ shopId = 123
  await page.fill('textarea[name="review"]', reviewText);
  await page.selectOption('select[name="rating"]', ratingValue);
  await page.click('button[type="submit"]');

  // Then the system should save the review and display it on the shop's page
  await expect(page.getByText(reviewText)).toBeVisible();
  await expect(page.getByText('Rating: 5')).toBeVisible();
});
