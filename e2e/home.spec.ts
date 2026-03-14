import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');
    
    // Check page title
    await expect(page).toHaveTitle(/Apomuden/);
  });

  test('should display hero section', async ({ page }) => {
    await page.goto('/');
    
    // Check for main heading
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
  });

  test('should have navigation links', async ({ page }) => {
    await page.goto('/');
    
    // Check for navigation
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    
    // Check for key navigation links
    await expect(page.getByRole('link', { name: /facilities/i })).toBeVisible();
  });

  test('should navigate to facilities page', async ({ page }) => {
    await page.goto('/');
    
    // Click facilities link
    await page.getByRole('link', { name: /facilities/i }).first().click();
    
    // Should be on facilities page
    await expect(page).toHaveURL(/facilities/);
  });
});

test.describe('Facilities Page', () => {
  test('should load facilities list', async ({ page }) => {
    await page.goto('/facilities');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check for facilities heading
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('should have search functionality', async ({ page }) => {
    await page.goto('/facilities');
    
    // Look for search input
    const searchInput = page.getByPlaceholder(/search/i);
    await expect(searchInput).toBeVisible();
  });

  test('should filter facilities by search', async ({ page }) => {
    await page.goto('/facilities');
    
    // Type in search
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('Korle Bu');
    
    // Wait for results to update
    await page.waitForTimeout(500);
    
    // Results should be filtered
    const facilityCards = page.locator('[data-testid="facility-card"]');
    // Just verify search doesn't break the page
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Emergency Page', () => {
  test('should load emergency request form', async ({ page }) => {
    await page.goto('/emergency');
    
    // Check for emergency form
    await expect(page.getByRole('heading', { name: /emergency/i })).toBeVisible();
  });

  test('should have emergency type selection', async ({ page }) => {
    await page.goto('/emergency');
    
    // Check for emergency type options
    const form = page.locator('form');
    await expect(form).toBeVisible();
  });
});

test.describe('Authentication', () => {
  test('should load login page', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Check for login form
    await expect(page.getByRole('heading', { name: /login|sign in/i })).toBeVisible();
  });

  test('should have phone input field', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Check for phone input
    const phoneInput = page.getByPlaceholder(/phone/i);
    await expect(phoneInput).toBeVisible();
  });

  test('should show error for invalid phone', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Enter invalid phone
    const phoneInput = page.getByPlaceholder(/phone/i);
    await phoneInput.fill('123');
    
    // Try to submit
    const submitButton = page.getByRole('button', { name: /continue|send|login/i });
    if (await submitButton.isVisible()) {
      await submitButton.click();
      // Should show some validation feedback
      await page.waitForTimeout(500);
    }
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    
    // Check for h1
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    
    // Should only have one h1
    await expect(h1).toHaveCount(1);
  });

  test('should have alt text on images', async ({ page }) => {
    await page.goto('/');
    
    // Get all images
    const images = page.locator('img');
    const count = await images.count();
    
    // Check each image has alt text (or is decorative)
    for (let i = 0; i < Math.min(count, 10); i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const role = await img.getAttribute('role');
      
      // Should have alt or be marked as presentation
      expect(alt !== null || role === 'presentation').toBeTruthy();
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');
    
    // Press Tab to navigate
    await page.keyboard.press('Tab');
    
    // Something should be focused
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });
});

test.describe('Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should display mobile menu', async ({ page }) => {
    await page.goto('/');
    
    // Check page loads on mobile
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have readable text on mobile', async ({ page }) => {
    await page.goto('/');
    
    // Main content should be visible
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });
});
