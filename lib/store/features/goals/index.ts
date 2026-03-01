// ============================================
// GOALS & PROJECTS FEATURE MODULE
// ============================================

import type { Goal, Project } from "@/lib/types"
import { getStore, setStore, KEYS, mutateKey, genId, today } from "@/lib/store/core"
import { addXp, addCoins } from "@/lib/store/features/gamification"

// ============================================
// GOALS
// ============================================

export function getGoals(): Goal[] {
  return getStore(KEYS.goals, [])
}

export function getGoalById(id: string): Goal | undefined {
  return getGoals().find(g => g.id === id)
}

export function createGoal(goal: Omit<Goal, "id" | "createdAt">): Goal {
  const goals = getGoals()
  const newGoal: Goal = { 
    ...goal, 
    id: genId(),
    milestones: goal.milestones || [],
  }
  const updatedGoals = [...goals, newGoal]
  setStore(KEYS.goals, updatedGoals)
  mutateKey(KEYS.goals, updatedGoals)
  
  addXp(50, "goal_created")
  return newGoal
}

export function updateGoal(id: string, updates: Partial<Goal>) {
  const goals = getGoals()
  const goal = goals.find(g => g.id === id)
  if (!goal) return
  
  const updated = { ...goal, ...updates }
  
  // Auto-complete if progress 100
  if (updated.progress >= 100 && !updated.completedAt) {
    updated.status = "completed"
    updated.completedAt = today()
    updated.progress = 100
    addXp(200 + (updated.priority * 50), "goal_completed")
  }
  
  const updatedGoals = goals.map(g => g.id === id ? updated : g)
  setStore(KEYS.goals, updatedGoals)
  mutateKey(KEYS.goals, updatedGoals)
}

export function deleteGoal(id: string) {
  const goals = getGoals()
  const updatedGoals = goals.filter(g => g.id !== id)
  setStore(KEYS.goals, updatedGoals)
  mutateKey(KEYS.goals, updatedGoals)
}

export function completeGoal(id: string) {
  updateGoal(id, { status: "completed", completedAt: today(), progress: 100 })
}

export function getGoalsByArea(areaId: string): Goal[] {
  return getGoals().filter(g => g.areaId === areaId)
}

export function getGoalsByStatus(status: Goal["status"]): Goal[] {
  return getGoals().filter(g => g.status === status)
}

// ============================================
// PROJECTS
// ============================================

export function getProjects(): Project[] {
  return getStore(KEYS.projects, [])
}

export function getProjectById(id: string): Project | undefined {
  return getProjects().find(p => p.id === id)
}

// Coins per priority when project completes
const PROJECT_COINS_BY_PRIORITY: Record<number, number> = { 1: 10, 2: 20, 3: 35, 4: 60, 5: 100 }

export function createProject(project: Omit<Project, "id" | "createdAt" | "updatedAt">): Project {
  const projects = getProjects()
  const ts = new Date().toISOString()
  const newProject: Project = {
    ...project,
    id: genId(),
    createdAt: ts,
    updatedAt: ts,
  }
  const updatedProjects = [...projects, newProject]
  setStore(KEYS.projects, updatedProjects)
  mutateKey(KEYS.projects, updatedProjects)

  addXp(30, "project_created")
  return newProject
}

export function updateProject(id: string, updates: Partial<Project>) {
  const projects = getProjects()
  const project = projects.find(p => p.id === id)
  if (!project) return

  const updated = { ...project, ...updates, updatedAt: new Date().toISOString() }
  const updatedProjects = projects.map(p => p.id === id ? updated : p)
  setStore(KEYS.projects, updatedProjects)
  mutateKey(KEYS.projects, updatedProjects)
}

export function deleteProject(id: string) {
  const projects = getProjects()
  const updatedProjects = projects.filter(p => p.id !== id)
  setStore(KEYS.projects, updatedProjects)
  mutateKey(KEYS.projects, updatedProjects)
}

export function completeProject(id: string) {
  const projects = getProjects()
  const project = projects.find(p => p.id === id)
  if (!project || project.status === "completed") return

  const xpReward = project.xpAwarded || project.priority * 50
  const coinReward = PROJECT_COINS_BY_PRIORITY[project.priority] ?? 35

  addXp(xpReward, "project_completed")
  addCoins(coinReward)

  const updatedProject = {
    ...project,
    status: "completed" as const,
    completedAt: today(),
    updatedAt: new Date().toISOString(),
  }

  setStore(KEYS.projects, projects.map(p => p.id === id ? updatedProject : p))
  mutateKey(KEYS.projects)
}

export function getProjectsByGoal(goalId: string): Project[] {
  return getProjects().filter(p => p.goalId === goalId)
}

export function getProjectsByStatus(status: Project["status"]): Project[] {
  return getProjects().filter(p => p.status === status)
}

export function getActiveProjects(): Project[] {
  return getProjects().filter(p => p.status === "active")
}
