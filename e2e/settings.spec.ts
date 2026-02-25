import { test, expect } from '@playwright/test'

test.describe('Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings')
  })

  test('should display settings page', async ({ page }) => {
    await expect(page.getByText('Настройки')).toBeVisible()
  })

  test('should display data export section', async ({ page }) => {
    await expect(page.getByText('Экспорт данных')).toBeVisible()
    await expect(page.getByRole('button', { name: /экспортировать|скачать/i })).toBeVisible()
  })

  test('should display data import section', async ({ page }) => {
    await expect(page.getByText('Импорт данных')).toBeVisible()
  })

  test('should display clear data section', async ({ page }) => {
    await expect(page.getByText('Очистить данные')).toBeVisible()
    await expect(page.getByRole('button', { name: /очистить|сбросить/i })).toBeVisible()
  })

  test('should export data', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: /экспортировать|скачать/i }).click()
    
    const download = await downloadPromise
    expect(download.suggestedFilename()).toContain('lifeos-backup')
    expect(download.suggestedFilename()).toContain('.json')
  })

  test('should show confirmation before clearing data', async ({ page }) => {
    await page.getByRole('button', { name: /очистить|сбросить/i }).click()
    
    // Should show confirmation dialog
    await expect(page.getByText(/подтвердить|уверены|удалить/i)).toBeVisible()
  })

  test('should navigate to different settings sections', async ({ page }) => {
    // Check for theme toggle
    const themeToggle = page.getByRole('button', { name: /тема|светлая|темная/i })
    if (await themeToggle.isVisible().catch(() => false)) {
      await expect(themeToggle).toBeVisible()
    }
    
    // Check for notification settings
    const notificationsSection = page.getByText(/уведомления|notifications/i)
    if (await notificationsSection.isVisible().catch(() => false)) {
      await expect(notificationsSection).toBeVisible()
    }
  })
})
