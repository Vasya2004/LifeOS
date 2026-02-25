import { test, expect } from '@playwright/test'

test.describe('Habits', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/habits')
  })

  test('should display habits page', async ({ page }) => {
    await expect(page.getByText('Привычки')).toBeVisible()
  })

  test('should display habit stats', async ({ page }) => {
    await expect(page.getByText('Всего выполнено', { exact: false })).toBeVisible()
    await expect(page.getByText('Лучшая серия')).toBeVisible()
    await expect(page.getByText('Активных привычек')).toBeVisible()
  })

  test('should open create habit dialog', async ({ page }) => {
    await page.getByRole('button', { name: 'Новая привычка' }).click()
    await expect(page.getByText('Новая привычка')).toBeVisible()
    await expect(page.getByPlaceholder(/например, Утренняя/)).toBeVisible()
  })

  test('should validate required fields in habit form', async ({ page }) => {
    await page.getByRole('button', { name: 'Новая привычка' }).click()
    
    // Try to submit without filling required fields
    await page.getByRole('button', { name: 'Создать привычку' }).click()
    
    // Should show validation error
    await expect(page.getByText(/обязательно/i).first()).toBeVisible()
  })

  test('should validate XP reward range', async ({ page }) => {
    await page.getByRole('button', { name: 'Новая привычка' }).click()
    
    // Fill required fields
    await page.getByPlaceholder(/например, Утренняя/).fill('Test Habit')
    
    // Select an area
    await page.getByLabel('Сфера жизни').click()
    await page.getByRole('option').first().click()
    
    // Set invalid XP (too high)
    const xpInput = page.locator('input[type="number"]').first()
    await xpInput.fill('200')
    
    await page.getByRole('button', { name: 'Создать привычку' }).click()
    
    // Should show validation error
    await expect(page.getByText(/максимум/i).first()).toBeVisible()
  })

  test('should create a new habit with valid data', async ({ page }) => {
    // First, ensure we have an area
    await page.goto('/areas')
    const areaExists = await page.locator('[class*="Card"]').filter({ hasText: /[\w\s]+/ }).first().isVisible().catch(() => false)
    
    if (!areaExists) {
      await page.getByRole('button', { name: 'Добавить' }).click()
      await page.getByPlaceholder(/например, Здоровье/).fill('Test Area')
      await page.getByRole('button', { name: 'Создать' }).click()
    }
    
    await page.goto('/habits')
    await page.getByRole('button', { name: 'Новая привычка' }).click()
    
    await page.getByPlaceholder(/например, Утренняя/).fill('Test Habit')
    await page.getByLabel('Сфера жизни').click()
    await page.getByRole('option').first().click()
    
    await page.getByRole('button', { name: 'Создать привычку' }).click()
    
    // Should show success
    await expect(page.getByText('Test Habit')).toBeVisible()
  })

  test('should toggle habit completion', async ({ page }) => {
    const completeButton = page.getByRole('button', { name: /отметить выполнение/i }).first()
    
    if (await completeButton.isVisible().catch(() => false)) {
      await completeButton.click()
      
      // Should show XP gain notification
      await expect(page.getByText(/XP за привычку/i)).toBeVisible()
      
      // Button should change to "Выполнено"
      await expect(page.getByRole('button', { name: 'Выполнено' }).first()).toBeVisible()
    }
  })

  test('should show weekly progress grid', async ({ page }) => {
    const habitCard = page.locator('[class*="Card"]').filter({ hasText: /[\w\s]+/ }).first()
    
    if (await habitCard.isVisible().catch(() => false)) {
      // Should have 7 day boxes
      const dayBoxes = habitCard.locator('[class*="h-8"]').filter({ hasText: /[ПнВтСрЧтПтСбВс]/ })
      await expect(dayBoxes).toHaveCount(7)
    }
  })

  test('should delete a habit', async ({ page }) => {
    const deleteButtons = page.getByRole('button', { name: /удалить/i })
    
    if (await deleteButtons.first().isVisible().catch(() => false)) {
      await deleteButtons.first().click()
      
      // Confirm deletion
      await page.getByRole('button', { name: /удалить|да/i }).click()
      
      // Should show success message
      await expect(page.getByText(/удалена/i)).toBeVisible()
    }
  })

  test('should create habit with weekly frequency', async ({ page }) => {
    await page.getByRole('button', { name: 'Новая привычка' }).click()
    
    await page.getByPlaceholder(/например, Утренняя/).fill('Weekly Habit')
    await page.getByLabel('Сфера жизни').click()
    await page.getByRole('option').first().click()
    
    // Change frequency to weekly
    await page.getByLabel('Частота').click()
    await page.getByRole('option', { name: /по дням недели/i }).click()
    
    // Should show day selector
    await expect(page.getByText('Пн')).toBeVisible()
    await expect(page.getByText('Вт')).toBeVisible()
    
    // Select some days
    await page.getByRole('button', { name: 'Пн' }).click()
    await page.getByRole('button', { name: 'Ср' }).click()
    await page.getByRole('button', { name: 'Пт' }).click()
    
    await page.getByRole('button', { name: 'Создать привычку' }).click()
    
    await expect(page.getByText('Weekly Habit')).toBeVisible()
  })
})
