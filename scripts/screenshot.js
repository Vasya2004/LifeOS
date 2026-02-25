const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  // Screenshot Login Page
  try {
    await page.goto('http://localhost:3000/auth/login', { waitUntil: 'networkidle', timeout: 30000 });
    await page.screenshot({ path: 'preview/login.png', fullPage: false });
    console.log('Screenshot: login.png');
  } catch (e) {
    console.log('Login page error:', e.message);
  }

  // Screenshot Register Page
  try {
    await page.goto('http://localhost:3000/auth/register', { waitUntil: 'networkidle', timeout: 30000 });
    await page.screenshot({ path: 'preview/register.png', fullPage: false });
    console.log('Screenshot: register.png');
  } catch (e) {
    console.log('Register page error:', e.message);
  }

  // Create a mock authenticated state by setting localStorage BEFORE visiting pages
  await page.goto('http://localhost:3000/auth/login');
  await page.waitForTimeout(500);
  
  await page.evaluate(() => {
    // Set mock data in localStorage
    const mockData = {
      identity: {
        id: 'test-id',
        name: 'Тестовый Пользователь',
        vision: 'Стать лучшей версией себя',
        mission: 'Развиваться каждый день',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      stats: {
        level: 12,
        xp: 450,
        xpToNext: 1000,
        coins: 1250,
        totalCoinsEarned: 2000,
        totalCoinsSpent: 750,
        currentStreak: 5,
        longestStreak: 14,
        lastActiveDate: new Date().toISOString().split('T')[0],
        totalTasksCompleted: 47,
        totalGoalsAchieved: 8,
        totalProjectsCompleted: 3,
        totalHabitCompletions: 156,
        totalDeepWorkHours: 120,
        totalFocusSessions: 45,
        avgDailyTasks: 4.2,
      },
      areas: [
        { id: '1', name: 'Здоровье и фитнес', icon: 'heart', color: '#22c55e', vision: 'Быть в отличной форме', currentLevel: 7, targetLevel: 10, isActive: true },
        { id: '2', name: 'Карьера', icon: 'briefcase', color: '#3b82f6', vision: 'Стать экспертом', currentLevel: 8, targetLevel: 10, isActive: true },
        { id: '3', name: 'Финансы', icon: 'wallet', color: '#eab308', vision: 'Финансовая свобода', currentLevel: 5, targetLevel: 10, isActive: true },
        { id: '4', name: 'Отношения', icon: 'users', color: '#ec4899', vision: 'Крепкие связи', currentLevel: 6, targetLevel: 10, isActive: true },
      ],
      goals: [
        { id: '1', title: 'Пробежать полумарафон', description: '21.1 км', areaId: '1', type: 'outcome', status: 'active', priority: 5, targetDate: '2024-12-31', startedAt: '2024-01-01', progress: 65, milestones: [], relatedValues: [], relatedRoles: [] },
        { id: '2', title: 'Выучить TypeScript', description: 'Продвинутый уровень', areaId: '2', type: 'process', status: 'active', priority: 4, targetDate: '2024-06-30', startedAt: '2024-01-01', progress: 40, milestones: [], relatedValues: [], relatedRoles: [] },
        { id: '3', title: 'Накопить на отпуск', description: '3000 USD', areaId: '3', type: 'outcome', status: 'active', priority: 3, targetDate: '2024-08-01', startedAt: '2024-01-01', progress: 80, milestones: [], relatedValues: [], relatedRoles: [] },
      ],
      tasks: [
        { id: '1', title: 'Утренняя пробежка 5км', scheduledDate: new Date().toISOString().split('T')[0], status: 'completed', priority: 'high', energyCost: 'medium', energyType: 'physical' },
        { id: '2', title: 'Прочитать 30 минут', scheduledDate: new Date().toISOString().split('T')[0], status: 'todo', priority: 'medium', energyCost: 'low', energyType: 'mental' },
        { id: '3', title: 'Медитация', scheduledDate: new Date().toISOString().split('T')[0], status: 'completed', priority: 'medium', energyCost: 'low', energyType: 'emotional' },
      ],
      habits: [
        { id: '1', areaId: '1', title: 'Утренняя зарядка', description: '15 минут упражнений', frequency: 'daily', targetDays: [1,2,3,4,5,6,7], energyImpact: 10, energyType: 'physical', streak: 5, bestStreak: 14, totalCompletions: 45, xpReward: 10, entries: [] },
        { id: '2', areaId: '2', title: 'Читать профессиональную литературу', description: '30 минут', frequency: 'daily', targetDays: [1,2,3,4,5], energyImpact: 5, energyType: 'mental', streak: 12, bestStreak: 12, totalCompletions: 30, xpReward: 15, entries: [] },
      ],
    };
    
    Object.entries(mockData).forEach(([key, value]) => {
      localStorage.setItem(`lifeos_${key}`, JSON.stringify(value));
    });
  });

  const pages = [
    { url: 'http://localhost:3000/', name: 'dashboard' },
    { url: 'http://localhost:3000/areas', name: 'areas' },
    { url: 'http://localhost:3000/goals', name: 'goals' },
    { url: 'http://localhost:3000/tasks', name: 'tasks' },
    { url: 'http://localhost:3000/habits', name: 'habits' },
    { url: 'http://localhost:3000/skills', name: 'skills' },
    { url: 'http://localhost:3000/finance', name: 'finance' },
    { url: 'http://localhost:3000/settings', name: 'settings' },
  ];

  for (const { url, name } of pages) {
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `preview/${name}.png`, fullPage: false });
      console.log(`Screenshot: ${name}.png`);
    } catch (e) {
      console.log(`${name} page error:`, e.message);
    }
  }

  await browser.close();
  console.log('\nAll screenshots saved to /preview/');
})();
