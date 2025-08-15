import { test, expect } from '@playwright/test';

test('Signup and verify dashboard layout', async ({ page }) => {
  // Use a unique email for each test run to avoid conflicts
  const uniqueId = new Date().getTime();
  const userEmail = `testuser_${uniqueId}@example.com`;
  const userName = 'Test User';
  const userPassword = 'password123';

  // 1. Navigate to the signup page
  await page.goto('http://localhost:3000/signup');

  // 2. Fill out the signup form
  await page.getByLabel('Full name').fill(userName);
  await page.getByLabel('Email').fill(userEmail);
  await page.getByLabel('Password').fill(userPassword);

  // 3. Submit the form
  await page.getByRole('button', { name: 'Create an account' }).click();

  // 4. Verify redirection to the dashboard
  // The signup flow should automatically log the user in and redirect.
  await page.waitForURL('http://localhost:3000/dashboard');

  // 5. Check for welcome message to confirm login
  await expect(page.getByRole('heading', { name: `Welcome back, ${userName}!` })).toBeVisible({ timeout: 10000 });

  // 6. Check for the presence of the new Project Contextual Sidebar
  // We can check for the "All projects" back button as a unique element of this sidebar.
  await expect(page.getByRole('link', { name: 'All projects' })).toBeVisible();

  // 7. Check for the main navigation elements in the project sidebar
  await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Agents' })).toBeVisible();

  // 8. Take a screenshot for visual verification
  await page.screenshot({ path: 'tests/screenshots/dashboard_layout.png', fullPage: true });
});
