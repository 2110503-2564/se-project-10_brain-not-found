
import { test, expect } from "@playwright/test";
import exp from "constants";
test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3000/");

  await page.waitForLoadState("networkidle");
});

// 1) User can create a review and rating
test("Customer submits a valid review to a shop", async ({ page }) => {
  // Given the customer is logged in
  await page.getByRole("link", { name: "Sign-In" }).click();
  await expect(
    page.getByRole("button", { name: "Sign in with Credentials" })
  ).toBeVisible();

  // Customer enters email and password
  await page.fill('input[name="email"]', "TeeCustomer3@gmail.com");
  await page.fill('input[name="password"]', "12345678");

  await page.getByRole("button", { name: "Sign in with Credentials" }).click();
  // Expect to see Sign-Out button after login

  await page.getByRole("link", { name: "Massage" }).click();
  // Go to the shop page (assuming we navigate to a specific shop page)
  await page.goto("http://localhost:3000/shops/67df82e11869b1292796dce8"); // เปลี่ยน URL เป็นของร้านที่ต้องการทดสอบ

  await page.waitForLoadState("networkidle"); // รอให้ network
  await page.waitForSelector("text=Write a Review", { state: "visible" });
  await expect(page.getByText('No reviews found')).not.toBeVisible();

  await expect(  page.getByText("You have already submitted a review.")).not.toBeVisible();

  await expect(page.getByText("Write a Review")).toBeVisible();

  const starLabelLocator = page.locator(
    'input[type="radio"][value="4"] + label'
  );
  await expect(starLabelLocator).toBeVisible();
  await starLabelLocator.click();

  const titleInput = page.getByLabel("Title");
  const commentInput = page.getByLabel("Comment");

  await expect(titleInput).toBeVisible();
  await expect(commentInput).toBeVisible();

  await titleInput.fill("Title of massage");
  await commentInput.fill("So good na");

  // Submit the review and handle the alert
  let alertMessage = null;
  page.on("dialog", async (dialog) => {
    console.log(`Dialog message: ${dialog.message()}`); // เพิ่ม log ดูข้อความ dialog
    // ทำให้ยืดหยุ่นมากขึ้น เผื่อข้อความไม่ตรงเป๊ะ
    if (
      dialog.message().toLowerCase().includes("review submitted successfully")
    ) {
      alertMessage = dialog.message();
      await dialog.accept();
    } else {
      // อาจจะ log ข้อความที่ไม่คาดคิดไว้ด้วย
      console.warn(`Unexpected dialog message: ${dialog.message()}`);
      await dialog.dismiss(); // หรือ accept ตามความเหมาะสม
    }
  });

  // *** คลิกปุ่ม Submit *** (ต้องมีปุ่ม Submit จริงๆ)
  await page.getByRole("button", { name: "Submit Review" }).click(); // หรือชื่อปุ่มอื่นๆ ที่ถูกต้อง

  // Check the alert message
  // *** เพิ่มการรอให้ dialog ทำงานเสร็จ ***
  await page.waitForTimeout(1000); // รอสักครู่เพื่อให้ event handler ทำงาน (อาจปรับเวลา)
  expect(alertMessage).toContain("Review submitted successfully!"); // ใช้ toContain เผื่อมีข้อความอื่นปน

  await expect(
    page.getByText("You have already submitted a review.")
  ).toBeVisible();
});


// 2) Guest create review
test("Guest can't create review", async ({ page }) => {


  await page.getByRole("link", { name: "Massage" }).click();
  // Go to the shop page (assuming we navigate to a specific shop page)
  await page.goto("http://localhost:3000/shops/67df82e11869b1292796dce8"); // เปลี่ยน URL เป็นของร้านที่ต้องการทดสอบ

  await page.waitForLoadState("networkidle"); // รอให้ network

  await expect(
    page.getByText("You need to be logged in to make a booking.")
  ).toBeVisible();
  await expect(page.getByText('No reviews found')).not.toBeVisible();

  await expect(page.getByText('Title of massage')).toBeVisible();
  await expect(page.getByText('So good na')).toBeVisible(); 

  await expect(page.getByText("Write a Review")).not.toBeVisible();
});


///3.)
test("Guest can read comment and rating", async ({ page }) => {
  //////// guest ////////////////////////////////////
  await page.getByRole("link", { name: "Massage" }).click();
  // Go to the shop page (assuming we navigate to a specific shop page)
  await page.goto("http://localhost:3000/shops/67df82e11869b1292796dce8"); // เปลี่ยน URL เป็นของร้านที่ต้องการทดสอบ

  await page.waitForLoadState("networkidle"); // รอให้ network
  await expect(page.getByText('No reviews found')).not.toBeVisible();

  await expect(page.getByRole('heading', { name: 'Reviews' })).toBeVisible(); 
  await expect(page.getByText('Title of massage')).toBeVisible();
  await expect(page.getByText('So good na')).toBeVisible();     
  await expect(page.getByText("Write a Review")).not.toBeVisible();

  
});
test("Customer can read comment and rating", async ({ page }) => {
  await page.getByRole("link", { name: "Sign-In" }).click();
  await expect(
    page.getByRole("button", { name: "Sign in with Credentials" })
  ).toBeVisible();

  // Customer enters email and password
  await page.fill('input[name="email"]', "TeeCustomer3@gmail.com");
  await page.fill('input[name="password"]', "12345678");

  await page.getByRole("button", { name: "Sign in with Credentials" }).click();
  // Expect to see Sign-Out button after login

  await page.getByRole("link", { name: "Massage" }).click();
  // Go to the shop page (assuming we navigate to a specific shop page)
  await page.goto("http://localhost:3000/shops/67df82e11869b1292796dce8"); // เปลี่ยน URL เป็นของร้านที่ต้องการทดสอบ

  await page.waitForLoadState("networkidle"); // รอให้ network
  await expect(page.getByRole('heading', { name: 'Reviews' })).toBeVisible(); 
  await expect(page.getByText('No reviews found')).not.toBeVisible();

  await expect(page.getByText('Title of massage')).toBeVisible();
  await expect(page.getByText('So good na')).toBeVisible();     
  await expect(page.getByText("Write a Review")).not.toBeVisible();

});
test("Admin can read comment and rating", async ({ page }) => {
  await page.getByRole("link", { name: "Sign-In" }).click();
  await expect(
    page.getByRole("button", { name: "Sign in with Credentials" })
  ).toBeVisible();

  // Customer enters email and password
  await page.fill('input[name="email"]', "adminTee@gmail.com");
  await page.fill('input[name="password"]', "12345678");

  await page.getByRole("button", { name: "Sign in with Credentials" }).click();
  // Expect to see Sign-Out button after login

  await page.getByRole("link", { name: "Massage" }).click();
  // Go to the shop page (assuming we navigate to a specific shop page)
  await page.goto("http://localhost:3000/shops/67df82e11869b1292796dce8"); // เปลี่ยน URL เป็นของร้านที่ต้องการทดสอบ

  await page.waitForLoadState("networkidle"); // รอให้ network
  await expect(page.getByRole('heading', { name: 'Reviews' })).toBeVisible(); 
  await expect(page.getByText('No reviews found')).not.toBeVisible();

  await expect(page.getByText('Title of massage')).toBeVisible();
  await expect(page.getByText('So good na')).toBeVisible();     
  await expect(page.getByText("Write a Review")).not.toBeVisible();

});

test("Customer can read comment and rating No Review", async ({ page }) => {
  await page.getByRole("link", { name: "Sign-In" }).click();
  await expect(
    page.getByRole("button", { name: "Sign in with Credentials" })
  ).toBeVisible();

  // Customer enters email and password
  await page.fill('input[name="email"]', "TeeCustomer3@gmail.com");
  await page.fill('input[name="password"]', "12345678");

  await page.getByRole("button", { name: "Sign in with Credentials" }).click();
  // Expect to see Sign-Out button after login

  await page.getByRole("link", { name: "Massage" }).click();
  // Go to the shop page (assuming we navigate to a specific shop page)
  await page.goto("http://localhost:3000/shops/680e1b70a409a81e8bad7cad"); // เปลี่ยน URL เป็นของร้านที่ต้องการทดสอบ

  await page.waitForLoadState("networkidle"); // รอให้ network
  await expect(page.getByRole('heading', { name: 'Reviews' })).toBeVisible(); 
  await expect(page.getByText('No reviews found')).toBeVisible();

});
test("Guest can read comment and rating No Review", async ({ page }) => {
  
  await page.getByRole("link", { name: "Massage" }).click();
  // Go to the shop page (assuming we navigate to a specific shop page)
  await page.goto("http://localhost:3000/shops/680e1b70a409a81e8bad7cad"); // เปลี่ยน URL เป็นของร้านที่ต้องการทดสอบ

  await page.waitForLoadState("networkidle"); // รอให้ network
  await expect(page.getByRole('heading', { name: 'Reviews' })).toBeVisible(); 
  await expect(page.getByText('No reviews found')).toBeVisible();

});
test("Admin can read comment and rating No Review", async ({ page }) => {
  await page.getByRole("link", { name: "Sign-In" }).click();
  await expect(
    page.getByRole("button", { name: "Sign in with Credentials" })
  ).toBeVisible();

  // Customer enters email and password
  await page.fill('input[name="email"]', "adminTee@gmail.com");
  await page.fill('input[name="password"]', "12345678");

  await page.getByRole("button", { name: "Sign in with Credentials" }).click();
  // Expect to see Sign-Out button after login

  await page.getByRole("link", { name: "Massage" }).click();
  // Go to the shop page (assuming we navigate to a specific shop page)
  await page.goto("http://localhost:3000/shops/680e1b70a409a81e8bad7cad"); // เปลี่ยน URL เป็นของร้านที่ต้องการทดสอบ

  await page.waitForLoadState("networkidle"); // รอให้ network
  await expect(page.getByRole('heading', { name: 'Reviews' })).toBeVisible(); 
  await expect(page.getByText('No reviews found')).toBeVisible();

});



test("Customer edit comment and rating", async ({ page }) => {
  await page.getByRole("link", { name: "Sign-In" }).click();
  await expect(
    page.getByRole("button", { name: "Sign in with Credentials" })
  ).toBeVisible();
  await page.fill('input[name="email"]', "TeeCustomer3@gmail.com");
  await page.fill('input[name="password"]', "12345678");

  await expect(page.getByRole("button", { name: "Sign-Out" })).toBeVisible();

  await page.getByRole("link", { name: "Massage" }).click();
  await page.goto("http://localhost:3000/shops/67df82e11869b1292796dce8"); ///////////////// found
  await expect(page.getByRole("heading", { name: "Reviews" })).toBeVisible();
  await expect(page.getByLabel("Title")).toBeVisible();
  await expect(page.getByLabel("Comment")).toBeVisible();
  await expect(
    page.getByText("You have already submitted a review.")
  ).toBeVisible();
  await page.getByRole("menuitem", { name: "Edit" }).click();
  await expect(page.getByText("Edit Review")).toBeVisible();

  // กดดาว 4 ดาว
  await page.getByRole("radio", { name: "4 Stars" }).click();

  // เช็กว่าเลือกดาว 4 จริง ๆ
  await expect(page.getByRole("radio", { name: "4 Stars" })).toHaveAttribute(
    "aria-checked",
    "true"
  );

  await page.fill('label[name="Title"]', "Title of massage");

  await page.fill('label[name="Comment"]', "So good na");

  await page.getByRole("button", { name: "SAVE" }).click();

  await expect(page.getByLabel("Title")).toHaveValue("Title of massage");
  await expect(page.getByLabel("Comment")).toHaveValue("So good na");

  ///// logout
  await page.getByRole("button", { name: "Sign-Out" }).click();
  await expect(page.getByRole("heading", { name: "Signout" })).toBeVisible();
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page.getByRole("button", { name: "Sign-In" })).toBeVisible();
});

test("Authorize User delete comment and rating", async ({ page }) => {
  //////////// Customer //////////////////////////// (customer เห็นแค่ของตัวเอง ยังไม่ทำ)
  await page.getByRole("button", { name: "Sign-In" }).click();
  await expect(
    page.getByRole("button", { name: "Sign in with Credentials" })
  ).toBeVisible();
  await page.fill('input[name="email"]', "TeeCustomer3@gmail.com");
  await page.fill('input[name="password"]', "12345678");
  await page.click('button[type="submit"]');
  await expect(page.getByRole("button", { name: "Sign-Out" })).toBeVisible();

  await page.getByRole("link", { name: "Massage" }).click();
  await page.goto("http://localhost:3000/shops/67df82e11869b1292796dce8"); ///////////////// found
  await expect(page.getByRole("heading", { name: "Reviews" })).toBeVisible();
  await expect(page.getByLabel("Title")).toBeVisible();
  await expect(page.getByLabel("Comment")).toBeVisible();
  await expect(
    page.getByText("You have already submitted a review.")
  ).toBeVisible();
  await page.getByRole("menuitem", { name: "Delete" }).click();
  await expect(page.getByText("Delete this review?")).toBeVisible();
  await page.getByRole("button", { name: "DELETE" }).click();
  await expect(
    page.getByText("You have already submitted a review.")
  ).not.toBeVisible();

  ///// logout
  await page.getByRole("button", { name: "Sign-Out" }).click();
  await expect(page.getByRole("heading", { name: "Signout" })).toBeVisible();
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page.getByRole("button", { name: "Sign-In" })).toBeVisible();
  ///////////////////////

  //////////// Admin //////////////////////////// (admin เห็นหมด ยังไม่ทำ)
  await page.getByRole("button", { name: "Sign-In" }).click();
  await expect(
    page.getByRole("button", { name: "Sign in with Credentials" })
  ).toBeVisible();
  await page.fill('input[name="email"]', "TeeCustomer3@gmail.com");
  await page.fill('input[name="password"]', "12345678");
  await page.click('button[type="submit"]');
  await expect(page.getByRole("button", { name: "Sign-Out" })).toBeVisible();

  await page.getByRole("link", { name: "Massage" }).click();
  await page.goto("http://localhost:3000/shops/67df82e11869b1292796dce8"); ///////////////// found
  await expect(page.getByRole("heading", { name: "Reviews" })).toBeVisible();
  await expect(page.getByLabel("Title")).toBeVisible();
  await expect(page.getByLabel("Comment")).toBeVisible();
  await expect(
    page.getByText("You have already submitted a review.")
  ).toBeVisible();
  await page.getByRole("menuitem", { name: "Delete" }).click();
  await expect(page.getByText("Delete this review?")).toBeVisible();
  await page.getByRole("button", { name: "DELETE" }).click();
  await expect(
    page.getByText("You have already submitted a review.")
  ).not.toBeVisible();

  ///// logout
  await page.getByRole("button", { name: "Sign-Out" }).click();
  await expect(page.getByRole("heading", { name: "Signout" })).toBeVisible();
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page.getByRole("button", { name: "Sign-In" })).toBeVisible();
});


test('Customer can edit their own review and rating SAVE', async ({ page }) => {
  await page.getByRole("link", { name: "Sign-In" }).click();
  await expect(
    page.getByRole("button", { name: "Sign in with Credentials" })
  ).toBeVisible();

  // Customer enters email and password
  await page.fill('input[name="email"]', "TeeCustomer3@gmail.com");
  await page.fill('input[name="password"]', "12345678");

  await page.getByRole("button", { name: "Sign in with Credentials" }).click();
  // Expect to see Sign-Out button after login

  await page.getByRole("link", { name: "Massage" }).click();
  // Go to the shop page (assuming we navigate to a specific shop page)
  await page.goto("http://localhost:3000/shops/67df82e11869b1292796dce8"); // เปลี่ยน URL เป็นของร้านที่ต้องการทดสอบ

  // มี review ขอตัวเองจริงๆ
  await page.waitForLoadState("networkidle"); // รอให้ network
  await page.getByText("TeeAsCustomer3");
  const errorText = page.getByText("You have already submitted a review.");

  // เลื่อนลงไปหา element ถ้ายังไม่อยู่ในจอ
  await errorText.scrollIntoViewIfNeeded();

  // ค่อย expect ว่าเห็นแล้ว
  await expect(errorText).toBeVisible();
  
  const moreButton = page.getByLabel('More');

  // เลื่อนขึ้นไปหา More ก่อน ถ้ายังไม่อยู่ในจอ
  await moreButton.scrollIntoViewIfNeeded();

  // คลิกปุ่ม More
  await moreButton.click();


  // 2. รอเมนูแสดงผล (จริง ๆ กดแล้วเมนูมัน popup เลย)
  const editButton = page.getByRole('menuitem', { name: 'Edit' });
  const deleteButton = page.getByRole('menuitem', { name: 'Delete' });

  await expect(editButton).toBeVisible();
  await expect(deleteButton).toBeVisible();

  // 3. กด Edit
  await editButton.click();

  await page.getByLabel('Dialog Edit Review').isVisible();

  // Rating
  await page.getByLabel('Rating in Edit Review').isVisible();
  // (แล้วต่อด้วยกรอกข้อมูลใหม่ + submit ตามเทสต์ที่คุณต้องการ)
  const starLabelLocator = page.locator(
    'input[type="radio"][value="3"] + label'
  );
  await expect(starLabelLocator).toBeVisible();
  await starLabelLocator.click();

  // Title
  await page.getByLabel('Title in Edit Review').isVisible();
  // ไปหา input ชื่อ "Title" แล้วใส่ข้อความใหม่
  await page.getByLabel('Title').fill('New Edited Title');
  await expect(page.getByLabel('Title')).toHaveValue('New Edited Title');
  // Comment
  await page.getByLabel('Comment in Edit Review').isVisible();
  // ไปหา input ชื่อ "Comment" แล้วใส่ข้อความใหม่
  await page.getByLabel('Comment').fill('New edited comment content.');
  await expect(page.getByLabel('Comment')).toHaveValue('New edited comment content.');
  // Save
  await page.getByLabel('Save in Edit').isVisible();
  await page.getByLabel('Save in Edit').click();

  // เปลี่ยน comment จริงนะ
  await expect(
    page.getByText("New Edited Title")
  ).toBeVisible();

  await expect(
    page.getByText("New edited comment content.")
  ).toBeVisible();

  await errorText.scrollIntoViewIfNeeded();
  // ค่อย expect ว่าเห็นแล้ว
  await expect(errorText).toBeVisible();
    
});

test('Customer can edit their own review and rating CANCEL', async ({ page }) => {
  await page.getByRole("link", { name: "Sign-In" }).click();
  await expect(
    page.getByRole("button", { name: "Sign in with Credentials" })
  ).toBeVisible();

  // Customer enters email and password
  await page.fill('input[name="email"]', "TeeCustomer3@gmail.com");
  await page.fill('input[name="password"]', "12345678");

  await page.getByRole("button", { name: "Sign in with Credentials" }).click();
  // Expect to see Sign-Out button after login

  await page.getByRole("link", { name: "Massage" }).click();
  // Go to the shop page (assuming we navigate to a specific shop page)
  await page.goto("http://localhost:3000/shops/67df82e11869b1292796dce8"); // เปลี่ยน URL เป็นของร้านที่ต้องการทดสอบ

  // มี review ขอตัวเองจริงๆ
  await page.waitForLoadState("networkidle"); // รอให้ network
  await page.getByText("TeeAsCustomer3");
  const errorText = page.getByText("You have already submitted a review.");
  
  // มีหลังจาก Edit SAVE
  await page.getByText("New Edited Title").scrollIntoViewIfNeeded();
  await expect(page.getByText("New Edited Title")).toBeVisible();

  await page.getByText("New edited comment content").scrollIntoViewIfNeeded();
  await expect(page.getByText("New edited comment content")).toBeVisible();

  
  // เลื่อนลงไปหา element ถ้ายังไม่อยู่ในจอ
  await errorText.scrollIntoViewIfNeeded();

  // ค่อย expect ว่าเห็นแล้ว
  await expect(errorText).toBeVisible();
  
  const moreButton = page.getByLabel('More');

  // เลื่อนขึ้นไปหา More ก่อน ถ้ายังไม่อยู่ในจอ
  await moreButton.scrollIntoViewIfNeeded();

  // คลิกปุ่ม More
  await moreButton.click();


  // 2. รอเมนูแสดงผล (จริง ๆ กดแล้วเมนูมัน popup เลย)
  const editButton = page.getByRole('menuitem', { name: 'Edit' });
  const deleteButton = page.getByRole('menuitem', { name: 'Delete' });

  await expect(editButton).toBeVisible();
  await expect(deleteButton).toBeVisible();

  // 3. กด Edit
  await editButton.click();

  await page.getByLabel('Dialog Edit Review').isVisible();

  // Rating
  await page.getByLabel('Rating in Edit Review').isVisible();
  // (แล้วต่อด้วยกรอกข้อมูลใหม่ + submit ตามเทสต์ที่คุณต้องการ)
  const starLabelLocator = page.locator(
    'input[type="radio"][value="3"] + label'
  );
  await expect(starLabelLocator).toBeVisible();
  await starLabelLocator.click();

  // Title
  await page.getByLabel('Title in Edit Review').isVisible();
  // ไปหา input ชื่อ "Title" แล้วใส่ข้อความใหม่
  await page.getByLabel('Title').fill('New Edited Title but Cancel');
  await expect(page.getByLabel('Title')).toHaveValue('New Edited Title but Cancel');
  // Comment
  await page.getByLabel('Comment in Edit Review').isVisible();
  // ไปหา input ชื่อ "Comment" แล้วใส่ข้อความใหม่
  await page.getByLabel('Comment').fill('New edited comment content but Cancel');
  await expect(page.getByLabel('Comment')).toHaveValue('New edited comment content but Cancel');
  // Save
  await page.getByLabel('Cancel in Edit').isVisible();
  await page.getByLabel('Cancel in Edit').click();

  // ไม่เปลี่ยน comment จริงนะ
  await expect(page.getByText("New Edited Title")).toBeVisible();

  await expect(page.getByText("New edited comment content.")).toBeVisible();

  await errorText.scrollIntoViewIfNeeded();
  // ค่อย expect ว่าเห็นแล้ว
  await expect(errorText).toBeVisible();
    
});

/*

Test Case No.	Test Name
1	User can create a review and rating 

ryu
2	Guest cannot create a review and rating
3	Guest can read reviews and ratings
4	User can read reviews and ratings
5	Admin can read reviews and ratings
6	ShopOwner can read reviews and ratings


Tee
7.1	Customer can edit their own review and rating (save) ✅
7.2 7	Customer can edit their own review and rating (Cancel) ✅
8	Customer cannot edit others' reviews and ratings
9	Guest cannot edit any review and rating
10	ShopOwner cannot edit any review and rating
11	Admin cannot edit any review and rating

12	User can delete their own review and rating
13	User cannot delete others' reviews and ratings
14	Guest cannot delete any review and rating
15	Admin can delete any review and rating
16	ShopOwner cannot delete reviews and ratings




*/
