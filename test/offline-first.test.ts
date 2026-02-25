import { describe, it, expect, vi } from 'vitest'

// Mock environment variables
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://mock.supabase.co')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'mock-key')

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
    createClient: () => ({
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockReturnThis(),
    })
}))

import { convertToDbFormat } from '../lib/sync/offline-first'

describe('Offline-first Sync Engine - Data Conversion', () => {
    const userId = 'user-123'

    it('should convert camelCase to snake_case', () => {
        const input = {
            title: 'Test',
            energyCost: 'high',
            energyType: 'mental'
        }
        const result = convertToDbFormat('tasks', input, userId)

        expect(result).toHaveProperty('user_id', userId)
        expect(result).toHaveProperty('title', 'Test')
        expect(result).toHaveProperty('energy_cost', 'high')
        expect(result).toHaveProperty('energy_type', 'mental')
    })

    it('should skip ignored fields for goals (relatedRoles)', () => {
        const input = {
            title: 'Goal',
            relatedRoles: ['role-1'],
            relatedValues: ['value-1'],
            progress: 50
        }
        const result = convertToDbFormat('goals', input, userId)

        expect(result).toHaveProperty('title', 'Goal')
        expect(result).toHaveProperty('related_values', ['value-1'])
        expect(result).not.toHaveProperty('related_roles')
        expect(result).not.toHaveProperty('relatedRoles')
    })

    it('should skip ignored fields for habits (entries)', () => {
        const input = {
            title: 'Habit',
            entries: [{ date: '2024-01-01', completed: true }],
            streak: 5
        }
        const result = convertToDbFormat('habits', input, userId)

        expect(result).toHaveProperty('title', 'Habit')
        expect(result).toHaveProperty('streak', 5)
        expect(result).not.toHaveProperty('entries')
    })

    it('should apply special field overrides (tasks.project_id -> goal_id)', () => {
        const input = {
            projectId: 'goal-456',
            title: 'Subtask'
        }
        const result = convertToDbFormat('tasks', input, userId)

        expect(result).toHaveProperty('goal_id', 'goal-456')
        expect(result).not.toHaveProperty('project_id')
    })
})
