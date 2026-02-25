import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display dashboard page', async ({ page }) => {
    await expect(page.getByText(/Добро пожаловать|Главная/i)).toBeVisible()
  })

  test('should display user stats', async ({ page }) => {
    await expect(page.getByText('Опыт')).toBeVisible()
    await expect(page.getByText('Монеты')).toBeVisible()
    await expect(page.getByText('Дней подряд')).toBeVisible()
    await expect(page.getByText('Задач выполнено')).toBeVisible()
  })

  test('should display life areas section', async ({ page }) => {
    await expect(page.getByText('Сферы жизни')).toBeVisible()
  })

  test('should display quick actions', async ({ page }) => {
    await expect(page.getByText('Быстрые действия')).toBeVisible()
    await expect(page.getByText('Новая цель')).toBeVisible()
    await expect(page.getByText('Новая задача')).toBeVisible()
    await expect(page.getByText('Ежедневный обзор')).toBeVisible()
  })

  test('should display active goals section', async ({ page }) => {
    await expect(page.getByText(/Активные цели/i)).toBeVisible()
  })

  test('should navigate to goals from quick actions', async ({ page }) => {
    await page.getByText('Новая цель').click()
    await expect(page).toHaveURL(/.*goals.*/)
  })

  test('should navigate to tasks from quick actions', async ({ page }) => {
    await page.getByText('Новая задача').click()
    await expect(page).toHaveURL(/.*tasks.*/)
  })

  test('should navigate to review from quick actions', async ({ page }) => {
    await page.getByText('Ежедневный обзор').click()
    await expect(page).toHaveURL(/.*review.*/)
  })

  test('should display XP progress bar', async ({ page }) => {
    const progressBar = page.locator('[role="progressbar"]').first()
    await expect(progressBar).toBeVisible()
  })

  test('should display user level', async ({ page }) => {
    // Level indicator should be visible
    await expect(page.getByText(/Уровень \d+/).first()).toBeVisible()
  })

  test('should show empty state when no areas', async ({ page }) => {
    // Clear all data first
    await page.goto('/settings')
    await page.getByRole('button', { name: /очистить|сбросить/i }).click()
    
    await page.goto('/')
    
    // Should show empty state with button to add area
    await expect(page.getByText('Сферы жизни не созданы')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Добавить сферу' })).toBeVisible()
  })
})
