// ============================================
// GOALS & PROJECTS
// ============================================

import type { Goal, Project } from "@/lib/types"
import { getStore, setStore, KEYS, mutateKey, genId, today } from "./core"
import { addXp, updateStats, getStats } from "./gamification"
import { DIFFICULTY_XP, DIFFICULTY_COINS } from "./defaults"

// Goals
export function getGoals(): Goal[] {
  return getStore(KEYS.goals, [])
}

export function addGoal(goal: Omit<Goal, "id" | "createdAt">) {
  const goals = getGoals()
  const newGoal: Goal = { 
    ...goal, 
    id: genId(),
    milestones: goal.milestones || [],
  }
  setStore(KEYS.goals, [...goals, newGoal])
  mutateKey(KEYS.goals)
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
  
  setStore(KEYS.goals, goals.map(g => g.id === id ? updated : g))
  mutateKey(KEYS.goals)
}

export function deleteGoal(id: string) {
  const goals = getGoals()
  setStore(KEYS.goals, goals.filter(g => g.id !== id))
  mutateKey(KEYS.goals)
}

// Projects
export function getProjects(): Project[] {
  return getStore(KEYS.projects, [])
}

export function addProject(project: Omit<Project, "id" | "actualHours">) {
  const projects = getProjects()
  const newProject: Project = { 
    ...project, 
    id: genId(),
    actualHours: 0,
  }
  setStore(KEYS.projects, [...projects, newProject])
  mutateKey(KEYS.projects)
  return newProject
}

export function updateProject(id: string, updates: Partial<Project>) {
  const projects = getProjects()
  setStore(KEYS.projects, projects.map(p => p.id === id ? { ...p, ...updates } : p))
  mutateKey(KEYS.projects)
}

export function deleteProject(id: string) {
  const projects = getProjects()
  setStore(KEYS.projects, projects.filter(p => p.id !== id))
  mutateKey(KEYS.projects)
}

export function completeProject(id: string) {
  const projects = getProjects()
  const project = projects.find(p => p.id === id)
  if (!project || project.status === "completed") return
  
  const xpReward = project.xpReward || DIFFICULTY_XP[project.difficulty]
  const coinReward = project.coinReward || DIFFICULTY_COINS[project.difficulty]
  
  updateStats({
    xp: getStats().xp + xpReward,
    coins: getStats().coins + coinReward,
    totalProjectsCompleted: getStats().totalProjectsCompleted + 1,
  })
  
  setStore(KEYS.projects, projects.map(p => 
    p.id === id ? { ...p, status: "completed", completedAt: today() } : p
  ))
  mutateKey(KEYS.projects)
}
