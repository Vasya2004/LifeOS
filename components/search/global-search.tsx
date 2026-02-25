// ============================================
// GLOBAL SEARCH COMPONENT
// ============================================

"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { 
  Search, 
  X, 
  Clock, 
  Trash2, 
  Filter,
  Command,
  CheckSquare,
  Target,
  Sparkles,
  Wallet,
  Heart,
  Repeat,
  BookOpen,
  Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { search, getSearchSuggestions, addToSearchHistory, getSearchHistory, clearSearchHistory } from "@/lib/search"
import type { SearchIndex, SearchableModule, SearchResult } from "@/lib/types/search"

const MODULE_ICONS: Record<SearchableModule, typeof Search> = {
  tasks: CheckSquare,
  goals: Target,
  skills: Sparkles,
  habits: Repeat,
  finance: Wallet,
  health: Heart,
  journal: BookOpen,
  achievements: Target,
}

const MODULE_LABELS: Record<SearchableModule, string> = {
  tasks: "Задачи",
  goals: "Цели",
  skills: "Навыки",
  habits: "Привычки",
  finance: "Финансы",
  health: "Здоровье",
  journal: "Журнал",
  achievements: "Достижения",
}

interface GlobalSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult | null>(null)
  const [suggestions, setSuggestions] = useState<ReturnType<typeof getSearchSuggestions>>([])
  const [history, setHistory] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedModules, setSelectedModules] = useState<SearchableModule[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load search history
  useEffect(() => {
    if (open) {
      setHistory(getSearchHistory())
      inputRef.current?.focus()
    }
  }, [open])

  // Search when query changes
  useEffect(() => {
    if (query.length >= 2) {
      setLoading(true)
      const timer = setTimeout(() => {
        const searchResults = search({
          query,
          filters: selectedModules.length > 0 ? { modules: selectedModules } : undefined,
          pageSize: 20,
        })
        setResults(searchResults)
        setSuggestions(getSearchSuggestions(query, 5))
        setLoading(false)
      }, 150)
      return () => clearTimeout(timer)
    } else {
      setResults(null)
      setSuggestions([])
    }
  }, [query, selectedModules])

  const handleSelect = useCallback((item: SearchIndex) => {
    addToSearchHistory(query)
    onOpenChange(false)
    
    // Navigate based on module
    const routes: Record<SearchableModule, string> = {
      tasks: `/tasks`,
      goals: `/goals`,
      skills: `/skills/${item.id}`,
      habits: `/habits`,
      finance: `/finance`,
      health: `/health`,
      journal: `/review`,
      achievements: `/analytics`,
    }
    
    router.push(routes[item.module])
  }, [query, onOpenChange, router])

  const handleHistoryClick = useCallback((term: string) => {
    setQuery(term)
  }, [])

  const clearHistory = useCallback(() => {
    clearSearchHistory()
    setHistory([])
  }, [])

  const toggleModule = useCallback((module: SearchableModule) => {
    setSelectedModules(prev => 
      prev.includes(module) 
        ? prev.filter(m => m !== module)
        : [...prev, module]
    )
  }, [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <DialogHeader className="px-4 pt-4 pb-0">
          <DialogTitle className="sr-only">Поиск по всем модулям</DialogTitle>
        </DialogHeader>
        
        {/* Search Input */}
        <div className="px-4 py-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск по задачам, целям, навыкам..."
              className="pl-10 pr-10"
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 size-8"
                onClick={() => setQuery("")}
              >
                <X className="size-4" />
              </Button>
            )}
          </div>
          
          {/* Module Filters */}
          <div className="flex items-center gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              className={cn(showFilters && "bg-accent")}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="size-3.5 mr-1" />
              Фильтры
              {selectedModules.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {selectedModules.length}
                </Badge>
              )}
            </Button>
            
            {selectedModules.map(module => (
              <Badge 
                key={module} 
                variant="secondary"
                className="cursor-pointer"
                onClick={() => toggleModule(module)}
              >
                {MODULE_LABELS[module]}
                <X className="size-3 ml-1" />
              </Badge>
            ))}
          </div>
          
          {showFilters && (
            <div className="mt-3 p-3 bg-muted rounded-lg">
              <Label className="text-xs font-medium mb-2 block">Модули</Label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(MODULE_LABELS) as SearchableModule[]).map(module => {
                  const Icon = MODULE_ICONS[module]
                  return (
                    <Button
                      key={module}
                      variant={selectedModules.includes(module) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleModule(module)}
                    >
                      <Icon className="size-3.5 mr-1" />
                      {MODULE_LABELS[module]}
                    </Button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
        
        {/* Results */}
        <ScrollArea className="max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : query.length >= 2 ? (
            results && results.items.length > 0 ? (
              <div className="py-2">
                <div className="px-4 py-2 text-xs text-muted-foreground">
                  Найдено {results.total} результатов
                </div>
                {results.items.map(item => (
                  <SearchResultItem 
                    key={`${item.module}-${item.id}`}
                    item={item}
                    query={query}
                    onClick={() => handleSelect(item)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Search className="size-12 mb-4 opacity-30" />
                <p>Ничего не найдено</p>
                <p className="text-sm">Попробуйте другой запрос</p>
              </div>
            )
          ) : suggestions.length > 0 ? (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-medium text-muted-foreground">
                Предложения
              </div>
              {suggestions.map(suggestion => (
                <button
                  key={`${suggestion.module}-${suggestion.id}`}
                  className="w-full px-4 py-3 text-left hover:bg-accent flex items-center gap-3"
                  onClick={() => {
                    const item = results?.items.find(i => i.id === suggestion.id)
                    if (item) handleSelect(item)
                  }}
                >
                  {(() => {
                    const Icon = MODULE_ICONS[suggestion.module]
                    return <Icon className="size-4 text-muted-foreground" />
                  })()}
                  <span dangerouslySetInnerHTML={{ __html: suggestion.highlight }} />
                </button>
              ))}
            </div>
          ) : history.length > 0 ? (
            <div className="py-2">
              <div className="flex items-center justify-between px-4 py-2">
                <span className="text-xs font-medium text-muted-foreground">
                  История поиска
                </span>
                <Button variant="ghost" size="sm" onClick={clearHistory}>
                  <Trash2 className="size-3.5 mr-1" />
                  Очистить
                </Button>
              </div>
              {history.map((term, i) => (
                <button
                  key={i}
                  className="w-full px-4 py-3 text-left hover:bg-accent flex items-center gap-3"
                  onClick={() => handleHistoryClick(term)}
                >
                  <Clock className="size-4 text-muted-foreground" />
                  <span>{term}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Command className="size-12 mb-4 opacity-30" />
              <p>Введите поисковый запрос</p>
              <p className="text-sm">Найдите задачи, цели, навыки и многое другое</p>
            </div>
          )}
        </ScrollArea>
        
        {/* Keyboard Shortcuts */}
        <div className="px-4 py-3 border-t bg-muted/50 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background rounded border">↑↓</kbd>
              Навигация
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background rounded border">↵</kbd>
              Выбрать
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-background rounded border">Esc</kbd>
            Закрыть
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function SearchResultItem({ 
  item, 
  query, 
  onClick 
}: { 
  item: SearchIndex
  query: string
  onClick: () => void 
}) {
  const Icon = MODULE_ICONS[item.module]
  
  // Highlight matching text
  const highlightText = (text: string, query: string) => {
    const parts = text.split(new RegExp(`(${query})`, 'gi'))
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <mark key={i} className="bg-primary/20 text-primary rounded px-0.5">{part}</mark>
        : part
    )
  }
  
  return (
    <button
      className="w-full px-4 py-3 text-left hover:bg-accent flex items-start gap-3 group"
      onClick={onClick}
    >
      <div className="p-2 rounded-lg bg-muted group-hover:bg-background">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">
          {highlightText(item.title, query)}
        </p>
        {item.description && (
          <p className="text-sm text-muted-foreground truncate">
            {highlightText(item.description, query)}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="outline" className="text-xs">
            {MODULE_LABELS[item.module]}
          </Badge>
          {item.status && (
            <Badge variant="secondary" className="text-xs">
              {item.status}
            </Badge>
          )}
          {item.tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-xs text-muted-foreground">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </button>
  )
}
