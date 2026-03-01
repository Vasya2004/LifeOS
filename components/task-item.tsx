"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TaskItemProps {
  title: string
  completed?: boolean
  priority?: 1 | 2 | 3 | 4
  dueDate?: string
  project?: string
  onToggle?: () => void
  onClick?: () => void
}

export function TaskItem({
  title,
  completed = false,
  priority = 4,
  dueDate,
  project,
  onToggle,
  onClick,
}: TaskItemProps) {
  return (
    <div
      className={cn(
        "group flex items-center gap-3 py-2.5 px-3 -mx-3 rounded-lg cursor-pointer transition-colors",
        "hover:bg-[var(--bg-tertiary)]"
      )}
      onClick={onClick}
    >
      {/* Priority Dot (как в Todoist) */}
      <div
        className={cn(
          "w-2 h-2 rounded-full flex-shrink-0 transition-colors",
          priority === 1 && "bg-[var(--priority-p1)]",
          priority === 2 && "bg-[var(--priority-p2)]",
          priority === 3 && "bg-[var(--priority-p3)]",
          priority === 4 && "bg-[var(--priority-p4)]"
        )}
      />
      
      {/* Checkbox (как в Things 3) */}
      <button
        className={cn(
          "w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0",
          completed
            ? "bg-[var(--game-xp)] border-[var(--game-xp)]"
            : "border-[var(--border-hover)] hover:border-[var(--game-xp)]"
        )}
        onClick={(e) => {
          e.stopPropagation()
          onToggle?.()
        }}
      >
        {completed && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-[15px] leading-snug transition-all",
            completed
              ? "text-[var(--text-muted)] line-through"
              : "text-[var(--text-primary)]"
          )}
        >
          {title}
        </p>
        
        {/* Meta info (как в Things 3) */}
        {(dueDate || project) && (
          <div className="flex items-center gap-2 mt-0.5">
            {dueDate && (
              <span
                className={cn(
                  "text-xs",
                  priority === 1
                    ? "text-[var(--priority-p1)]"
                    : "text-[var(--text-muted)]"
                )}
              >
                {dueDate}
              </span>
            )}
            {project && (
              <>
                {dueDate && <span className="text-[var(--text-muted)]">·</span>}
                <span className="text-xs text-[var(--text-muted)]">{project}</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
