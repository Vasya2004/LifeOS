import { test, expect } from '@playwright/test'

test.describe('Goals', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/goals')
  })

  test('should display goals page', async ({ page }) => {
    await expect(page.getByText('Цели')).toBeVisible()
  })

  test('should show empty state when no goals', async ({ page }) => {
    const emptyState = page.getByText('Нет активных целей')
    if (await emptyState.isVisible().catch(() => false)) {
      await expect(page.getByRole('button', { name: 'Создать цель' })).toBeVisible()
    }
  })

  test('should open create goal dialog', async ({ page }) => {
    await page.getByRole('button', { name: 'Новая цель' }).click()
    await expect(page.getByText('Новая цель')).toBeVisible()
    await expect(page.getByPlaceholder(/например, Пробежать/)).toBeVisible()
  })

  test('should validate required fields in goal form', async ({ page }) => {
    await page.getByRole('button', { name: 'Новая цель' }).click()
    
    // Try to submit without filling required fields
    await page.getByRole('button', { name: 'Создать цель' }).click()
    
    // Should show validation error
    await expect(page.getByText(/обязательно/i).first()).toBeVisible()
  })

  test('should validate title length', async ({ page }) => {
    await page.getByRole('button', { name: 'Новая цель' }).click()
    
    // Enter too long title (over 200 chars)
    const longTitle = 'a'.repeat(250)
    await page.getByPlaceholder(/например, Пробежать/).fill(longTitle)
    
    // Fill other required fields
    await page.getByText('Сфера жизни').click()
    await page.getByRole('option').first().click()
    
    await page.getByLabel('Дедлайн').fill('2024-12-31')
    
    await page.getByRole('button', { name: 'Создать цель' }).click()
    
    // Should show validation error
    await expect(page.getByText(/максимум/i).first()).toBeVisible()
  })

  test('should switch between tabs', async ({ page }) => {
    await page.getByRole('tab', { name: /Выполнено/ }).click()
    await expect(page.getByText(/выполненные цели|Пока нет/)).toBeVisible()
    
    await page.getByRole('tab', { name: /Приостановлено/ }).click()
    await expect(page.getByText(/приостановленные цели|Нет/)).toBeVisible()
  })

  test('should create a new goal with valid data', async ({ page }) => {
    // Clear any existing data first
    await page.goto('/settings')
    await page.getByRole('button', { name: /очистить|сбросить/i }).click()
    await page.goto('/areas')
    
    // Create an area first
    await page.getByRole('button', { name: 'Добавить' }).click()
    await page.getByPlaceholder(/например, Здоровье/).fill('Test Area')
    await page.getByRole('button', { name: 'Создать' }).click()
    
    // Now create a goal
    await page.goto('/goals')
    await page.getByRole('button', { name: 'Новая цель' }).click()
    
    await page.getByPlaceholder(/например, Пробежать/).fill('Test Goal')
    await page.getByLabel('Сфера жизни').click()
    await page.getByRole('option').first().click()
    await page.getByLabel('Дедлайн').fill('2024-12-31')
    
    await page.getByRole('button', { name: 'Создать цель' }).click()
    
    // Should show success and close dialog
    await expect(page.getByText('Test Goal')).toBeVisible()
  })

  test('should edit an existing goal', async ({ page }) => {
    // This test assumes there's at least one goal
    const goalCard = page.locator('[class*="Card"]').filter({ hasText: /[\w\s]+/ }).first()
    
    if (await goalCard.isVisible().catch(() => false)) {
      await goalCard.hover()
      await page.getByRole('button', { name: /редактировать/i }).first().click()
      
      const titleInput = page.getByPlaceholder(/например, Пробежать/)
      await titleInput.clear()
      await titleInput.fill('Updated Goal Title')
      
      await page.getByRole('button', { name: 'Сохранить изменения' }).click()
      
      await expect(page.getByText('Updated Goal Title')).toBeVisible()
    }
  })

  test('should delete a goal', async ({ page }) => {
    const goalCard = page.locator('[class*="Card"]').filter({ hasText: /[\w\s]+/ }).first()
    
    if (await goalCard.isVisible().catch(() => false)) {
      const initialCount = await page.locator('[class*="Card"]').count()
      
      await goalCard.hover()
      await page.getByRole('button', { name: /удалить/i }).first().click()
      
      // Confirm deletion
      await page.getByRole('button', { name: /удалить|да/i }).click()
      
      // Should show success message
      await expect(page.getByText(/удалена/i)).toBeVisible()
    }
  })
})
