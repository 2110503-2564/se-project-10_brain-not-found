
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
=======
import { test, expect } from '@playwright/test';
test.beforeEach(async ({ page }) => {

  await page.goto('http://localhost:3000/');


  await page.waitForLoadState('networkidle');

  
});

// 1) User can create a review and rating
test('Customer submits a valid review to a shop', async ({ page }) => {
  // Given the customer is logged in
  await page.getByRole('link', { name: 'Sign-In' }).click();
  await expect(page.getByRole('button', { name: 'Sign in with Credentials' })).toBeVisible();
  
  // Customer enters email and password
  await page.fill('input[name="email"]', 'TeeCustomer3@gmail.com');
  await page.fill('input[name="password"]', '12345678');

  await page.getByRole('button', { name: 'Sign in with Credentials' }).click();
  // Expect to see Sign-Out button after login

  await page.getByRole('link', { name: 'Massage' }).click();
  // Go to the shop page (assuming we navigate to a specific shop page)
  await page.goto('http:localhost:3000/shops/67df82e11869b1292796dce8'); // เปลี่ยน URL เป็นของร้านที่ต้องการทดสอบ

  await page.waitForLoadState('networkidle'); // รอให้ network 
  await page.waitForSelector('text=Write a Review', { state: 'visible' });

  await expect(page.getByText('You have already submitted a review.')).not.toBeVisible();

  await expect(page.getByText('Write a Review')).toBeVisible();

  const starLabelLocator = page.locator('input[type="radio"][value="4"] + label');
  await expect(starLabelLocator).toBeVisible();
  await starLabelLocator.click();

  const titleInput = page.getByLabel('Title');
  const commentInput = page.getByLabel('Comment');

  await expect(titleInput).toBeVisible();
  await expect(commentInput).toBeVisible();

 
  await titleInput.fill('Title of massage');
  await commentInput.fill('So good na');

  // Submit the review and handle the alert
  let alertMessage = null;
  page.on('dialog', async (dialog) => {
    console.log(`Dialog message: ${dialog.message()}`); // เพิ่ม log ดูข้อความ dialog
    // ทำให้ยืดหยุ่นมากขึ้น เผื่อข้อความไม่ตรงเป๊ะ
    if (dialog.message().toLowerCase().includes('review submitted successfully')) {
      alertMessage = dialog.message();
      await dialog.accept();
    } else {
      // อาจจะ log ข้อความที่ไม่คาดคิดไว้ด้วย
      console.warn(`Unexpected dialog message: ${dialog.message()}`);
      await dialog.dismiss(); // หรือ accept ตามความเหมาะสม
    }
  });

  // *** คลิกปุ่ม Submit *** (ต้องมีปุ่ม Submit จริงๆ)
  await page.getByRole('button', { name: 'Submit Review' }).click(); // หรือชื่อปุ่มอื่นๆ ที่ถูกต้อง

  // Check the alert message
  // *** เพิ่มการรอให้ dialog ทำงานเสร็จ ***
  await page.waitForTimeout(1000); // รอสักครู่เพื่อให้ event handler ทำงาน (อาจปรับเวลา)
  expect(alertMessage).toContain('Review submitted successfully!'); // ใช้ toContain เผื่อมีข้อความอื่นปน

  await expect(page.getByText('You have already submitted a review.')).toBeVisible(); ;
});


test('Participant read comment and rating', async ({ page }) => {
 //////// guest ////////////////////////////////////
  await page.getByRole('link', { name: 'Massage' }).click();
  await page.goto('http://localhost:3000/shops/680e1b70a409a81e8bad7cad');/////////////// Not found
  await expect(page.getByRole('heading', { name: 'Reviews'})).toBeVisible();
  await expect(page.getByText('No reviews found')).toBeVisible();

  await page.getByRole('link', { name: 'Massage' }).click();
  await page.goto('http://localhost:3000/shops/67c442eb099d8d3ee5b5d8b5');///////////////// found
  await expect(page.getByRole('heading', { name: 'Reviews'})).toBeVisible();
  await expect(page.getByLabel('Title')).toBeVisible();
  await expect(page.getByLabel('Comment')).toBeVisible();


  ///////// customer ////////////////////////////////////

  // Given the customer is logged in
  await page.getByRole('link', { name: 'Sign-In' }).click();
    await expect(page.getByRole('button', { name: 'Sign in with Credentials'})).toBeVisible();
  await page.fill('input[name="email"]', 'TeeCustomer3@gmail.com');
  await page.fill('input[name="password"]', '12345678');


 await expect(page.getByRole('button', { name: 'Sign-Out' })).toBeVisible();

 await page.getByRole('link', { name: 'Massage' }).click();
 await page.goto('http://localhost:3000/shops/67c442eb099d8d3ee5b5d8b5')
 await expect(page.getByRole('heading', { name: 'Reviews'})).toBeVisible();
 await expect(page.getByLabel('Title')).toBeVisible();
 await expect(page.getByLabel('Comment')).toBeVisible();
 
///// logout
 await page.getByRole('button', { name: 'Sign-Out' }).click();
 await expect(page.getByRole('heading', { name: 'Signout'})).toBeVisible();
 await page.getByRole('button', { name: 'Sign out' }).click();
 await expect(page.getByRole('button', { name: 'Sign-In' })).toBeVisible();


 ////////// admin ////////////////////////
 // Given the admin is logged in
 await page.getByRole('button', { name: 'Sign-In' }).click();
 await expect(page.getByRole('button', { name: 'Sign in with Credentials'})).toBeVisible();
 await page.fill('input[name="email"]', 'adminTee@gmail.com');
 await page.fill('input[name="password"]', '12345678');
 await page.click('button[type="submit"]');

await expect(page.getByRole('button', { name: 'Sign-Out' })).toBeVisible();
await page.getByRole('link', { name: 'Massage' }).click();
await page.goto('http://localhost:3000/shops/67c442eb099d8d3ee5b5d8b5')
await expect(page.getByRole('heading', { name: 'Reviews'})).toBeVisible();
await expect(page.getByLabel('Title')).toBeVisible();
await expect(page.getByLabel('Comment')).toBeVisible();

///// logout
await page.getByRole('button', { name: 'Sign-Out' }).click();
await expect(page.getByRole('heading', { name: 'Signout'})).toBeVisible();
await page.getByRole('button', { name: 'Sign out' }).click();
await expect(page.getByRole('button', { name: 'Sign-In' })).toBeVisible();

//////////////////////////////////


});

test('Customer edit comment and rating', async ({ page }) => {
  await page.getByRole('link', { name: 'Sign-In' }).click();
    await expect(page.getByRole('button', { name: 'Sign in with Credentials'})).toBeVisible();
  await page.fill('input[name="email"]', 'TeeCustomer3@gmail.com');
  await page.fill('input[name="password"]', '12345678');


 await expect(page.getByRole('button', { name: 'Sign-Out' })).toBeVisible();

 await page.getByRole('link', { name: 'Massage' }).click();
 await page.goto('http://localhost:3000/shops/67df82e11869b1292796dce8');///////////////// found
 await expect(page.getByRole('heading', { name: 'Reviews'})).toBeVisible();
 await expect(page.getByLabel('Title')).toBeVisible();
 await expect(page.getByLabel('Comment')).toBeVisible();
 await expect(page.getByText('You have already submitted a review.')).toBeVisible();
 await page.getByRole('menuitem', { name: 'Edit' }).click();
 await expect(page.getByText('Edit Review')).toBeVisible();

// กดดาว 4 ดาว
await page.getByRole('radio', { name: '4 Stars' }).click();

// เช็กว่าเลือกดาว 4 จริง ๆ
await expect(
  page.getByRole('radio', { name: '4 Stars' })
).toHaveAttribute('aria-checked', 'true');

 await page.fill('label[name="Title"]', 'Title of massage');

 await page.fill('label[name="Comment"]', 'So good na');

 await page.getByRole('button', { name: 'SAVE' }).click();

 await expect(page.getByLabel('Title')).toHaveValue('Title of massage');
 await expect(page.getByLabel('Comment')).toHaveValue('So good na');

 ///// logout
await page.getByRole('button', { name: 'Sign-Out' }).click();
await expect(page.getByRole('heading', { name: 'Signout'})).toBeVisible();
await page.getByRole('button', { name: 'Sign out' }).click();
await expect(page.getByRole('button', { name: 'Sign-In' })).toBeVisible();

});

test('Authorize User delete comment and rating', async ({ page }) => {
//////////// Customer //////////////////////////// (customer เห็นแค่ของตัวเอง ยังไม่ทำ) 
await page.getByRole('button', { name: 'Sign-In' }).click();
await expect(page.getByRole('button', { name: 'Sign in with Credentials'})).toBeVisible();
await page.fill('input[name="email"]', 'TeeCustomer3@gmail.com');
await page.fill('input[name="password"]', '12345678');
await page.click('button[type="submit"]');
await expect(page.getByRole('button', { name: 'Sign-Out' })).toBeVisible();

await page.getByRole('link', { name: 'Massage' }).click();
await page.goto('http://localhost:3000/shops/67df82e11869b1292796dce8');///////////////// found
await expect(page.getByRole('heading', { name: 'Reviews'})).toBeVisible();
await expect(page.getByLabel('Title')).toBeVisible();
await expect(page.getByLabel('Comment')).toBeVisible();
await expect(page.getByText('You have already submitted a review.')).toBeVisible();
await page.getByRole('menuitem', { name: 'Delete' }).click();
await expect(page.getByText('Delete this review?')).toBeVisible();
await page.getByRole('button', { name: 'DELETE' }).click();
await expect(page.getByText('You have already submitted a review.')).not.toBeVisible();

 ///// logout
 await page.getByRole('button', { name: 'Sign-Out' }).click();
 await expect(page.getByRole('heading', { name: 'Signout'})).toBeVisible();
 await page.getByRole('button', { name: 'Sign out' }).click();
 await expect(page.getByRole('button', { name: 'Sign-In' })).toBeVisible(); 
///////////////////////

//////////// Admin //////////////////////////// (admin เห็นหมด ยังไม่ทำ) 
await page.getByRole('button', { name: 'Sign-In' }).click();
await expect(page.getByRole('button', { name: 'Sign in with Credentials'})).toBeVisible();
await page.fill('input[name="email"]', 'TeeCustomer3@gmail.com');
await page.fill('input[name="password"]', '12345678');
await page.click('button[type="submit"]');
await expect(page.getByRole('button', { name: 'Sign-Out' })).toBeVisible();

await page.getByRole('link', { name: 'Massage' }).click();
await page.goto('http://localhost:3000/shops/67df82e11869b1292796dce8');///////////////// found
await expect(page.getByRole('heading', { name: 'Reviews'})).toBeVisible();
await expect(page.getByLabel('Title')).toBeVisible();
await expect(page.getByLabel('Comment')).toBeVisible();
await expect(page.getByText('You have already submitted a review.')).toBeVisible();
await page.getByRole('menuitem', { name: 'Delete' }).click();
await expect(page.getByText('Delete this review?')).toBeVisible();
await page.getByRole('button', { name: 'DELETE' }).click();
await expect(page.getByText('You have already submitted a review.')).not.toBeVisible();

 ///// logout
 await page.getByRole('button', { name: 'Sign-Out' }).click();
 await expect(page.getByRole('heading', { name: 'Signout'})).toBeVisible();
 await page.getByRole('button', { name: 'Sign out' }).click();
 await expect(page.getByRole('button', { name: 'Sign-In' })).toBeVisible(); 

 
});


/*

Test Case No.	Test Name
1	User can create a review and rating
2	Guest cannot create a review and rating
3	Guest can read reviews and ratings
4	User can read reviews and ratings
5	Admin can read reviews and ratings
6	ShopOwner can read reviews and ratings
7	User can edit their own review and rating
8	User cannot edit others' reviews and ratings
9	Guest cannot edit any review and rating
10	ShopOwner cannot edit any review and rating
11	Admin cannot edit any review and rating
12	User can delete their own review and rating
13	User cannot delete others' reviews and ratings
14	Guest cannot delete any review and rating
15	Admin can delete any review and rating
16	ShopOwner cannot delete reviews and ratings


*/




>>>>>>> 8601fbce39517e2c274bef1c29c35941e1dfda4c
