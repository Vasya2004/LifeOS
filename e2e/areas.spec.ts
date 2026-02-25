import { test, expect } from '@playwright/test'

test.describe('Areas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/areas')
  })

  test('should display areas page', async ({ page }) => {
    await expect(page.getByText('Сферы жизни')).toBeVisible()
  })

  test('should open create area dialog', async ({ page }) => {
    await page.getByRole('button', { name: 'Добавить' }).click()
    await expect(page.getByText('Новая сфера жизни')).toBeVisible()
  })

  test('should validate required fields in area form', async ({ page }) => {
    await page.getByRole('button', { name: 'Добавить' }).click()
    
    // Try to submit without filling required fields
    await page.getByRole('button', { name: 'Создать' }).click()
    
    // Should show validation error
    await expect(page.getByText(/обязательно/i).first()).toBeVisible()
  })

  test('should validate area name length', async ({ page }) => {
    await page.getByRole('button', { name: 'Добавить' }).click()
    
    // Enter too long name
    const longName = 'a'.repeat(110)
    await page.getByPlaceholder(/например, Здоровье/).fill(longName)
    
    await page.getByRole('button', { name: 'Создать' }).click()
    
    // Should show validation error
    await expect(page.getByText(/максимум/i).first()).toBeVisible()
  })

  test('should create a new area with valid data', async ({ page }) => {
    await page.getByRole('button', { name: 'Добавить' }).click()
    
    await page.getByPlaceholder(/например, Здоровье/).fill('Test Area')
    await page.getByPlaceholder(/Как вы хотите видеть/).fill('Test vision for this area')
    
    // Select a color (first one)
    const colorButtons = page.locator('button[style*="background-color"]')
    await colorButtons.first().click()
    
    await page.getByRole('button', { name: 'Создать' }).click()
    
    // Should show success and close dialog
    await expect(page.getByText('Test Area')).toBeVisible()
  })

  test('should display area with progress bar', async ({ page }) => {
    const areaCard = page.locator('[class*="Card"]').filter({ hasText: /[\w\s]+/ }).first()
    
    if (await areaCard.isVisible().catch(() => false)) {
      // Should have level indicator
      await expect(areaCard.getByText(/Current Level/i)).toBeVisible()
      
      // Should have progress bar
      const progressBar = areaCard.locator('[class*="h-2 rounded-full"]').first()
      await expect(progressBar).toBeVisible()
    }
  })

  test('should display identity/vision section', async ({ page }) => {
    await expect(page.getByText('Ваше видение')).toBeVisible()
  })

  test('should display values section', async ({ page }) => {
    await expect(page.getByText('Ценности')).toBeVisible()
    await expect(page.getByText('Что для вас важнее всего')).toBeVisible()
  })

  test('should show empty state when no areas', async ({ page }) => {
    // Clear all data first
    await page.goto('/settings')
    await page.getByRole('button', { name: /очистить|сбросить/i }).click()
    
    await page.goto('/areas')
    
    await expect(page.getByText('Сферы жизни не созданы')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Создать первую сферу' })).toBeVisible()
  })
})
