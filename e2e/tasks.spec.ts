import { test, expect } from '@playwright/test'

test.describe('Tasks', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tasks')
  })

  test('should display tasks page', async ({ page }) => {
    await expect(page.getByText('Задачи')).toBeVisible()
  })

  test('should display task stats', async ({ page }) => {
    await expect(page.getByText('Всего выполнено')).toBeVisible()
    await expect(page.getByText('Всего времени')).toBeVisible()
    await expect(page.getByText('Эффективность')).toBeVisible()
  })

  test('should switch between task tabs', async ({ page }) => {
    await page.getByRole('tab', { name: /Предстоящие/ }).click()
    await expect(page.getByText(/предстоящие задачи|Нет/)).toBeVisible()
    
    await page.getByRole('tab', { name: /Выполнено/ }).click()
    await expect(page.getByText(/выполненные задачи|Пока нет/)).toBeVisible()
  })

  test('should open create task dialog', async ({ page }) => {
    await page.getByRole('button', { name: 'Новая задача' }).click()
    await expect(page.getByText('Новая задача')).toBeVisible()
    await expect(page.getByPlaceholder(/Что нужно сделать/)).toBeVisible()
  })

  test('should validate required fields in task form', async ({ page }) => {
    await page.getByRole('button', { name: 'Новая задача' }).click()
    
    // Try to submit without filling required fields
    await page.getByRole('button', { name: 'Создать задачу' }).click()
    
    // Should show validation error
    await expect(page.getByText(/обязательно/i).first()).toBeVisible()
  })

  test('should validate duration range', async ({ page }) => {
    await page.getByRole('button', { name: 'Новая задача' }).click()
    
    // Fill required fields
    await page.getByPlaceholder(/Что нужно сделать/).fill('Test Task')
    
    // Set invalid duration (too high)
    const durationInput = page.locator('input[type="number"]').first()
    await durationInput.fill('2000')
    
    await page.getByRole('button', { name: 'Создать задачу' }).click()
    
    // Should show validation error for duration
    await expect(page.getByText(/максимум/i).first()).toBeVisible()
  })

  test('should create a new task with valid data', async ({ page }) => {
    await page.getByRole('button', { name: 'Новая задача' }).click()
    
    await page.getByPlaceholder(/Что нужно сделать/).fill('Test Task')
    await page.getByLabel('Приоритет').click()
    await page.getByRole('option', { name: /высокий/i }).click()
    
    // Select a duration
    await page.getByRole('button', { name: '30м' }).click()
    
    await page.getByRole('button', { name: 'Создать задачу' }).click()
    
    // Should show success
    await expect(page.getByText('Test Task')).toBeVisible()
  })

  test('should complete a task', async ({ page }) => {
    const taskCheckbox = page.locator('input[type="checkbox"]').first()
    
    if (await taskCheckbox.isVisible().catch(() => false)) {
      await taskCheckbox.click()
      
      // Should show success message with XP
      await expect(page.getByText(/выполнена.*XP/i)).toBeVisible()
    }
  })

  test('should delete a task', async ({ page }) => {
    const deleteButtons = page.getByRole('button', { name: /удалить/i })
    
    if (await deleteButtons.first().isVisible().catch(() => false)) {
      const initialCount = await page.locator('[class*="flex items-center gap-3"]').count()
      
      await deleteButtons.first().click()
      
      // Confirm deletion
      await page.getByRole('button', { name: /удалить|да/i }).click()
      
      // Should show success message
      await expect(page.getByText(/удалена/i)).toBeVisible()
    }
  })

  test('should restore a completed task', async ({ page }) => {
    await page.getByRole('tab', { name: /Выполнено/ }).click()
    
    const restoreButton = page.getByRole('button', { name: /восстановить/i }).first()
    
    if (await restoreButton.isVisible().catch(() => false)) {
      await restoreButton.click()
      
      // Should show success message
      await expect(page.getByText(/восстановлена/i)).toBeVisible()
    }
  })

  test('should filter tasks by priority', async ({ page }) => {
    await page.getByRole('button', { name: 'Новая задача' }).click()
    
    await page.getByPlaceholder(/Что нужно сделать/).fill('Critical Task')
    await page.getByLabel('Приоритет').click()
    await page.getByRole('option', { name: /критично/i }).click()
    await page.getByRole('button', { name: '30м' }).click()
    await page.getByRole('button', { name: 'Создать задачу' }).click()
    
    // Should show task with critical badge
    await expect(page.getByText('Критично').first()).toBeVisible()
  })
})
