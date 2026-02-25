// ============================================
// REUSABLE FORM FIELD COMPONENT
// ============================================

import * as React from "react"
import { FieldValues, Path, UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface FormFieldProps<T extends FieldValues> {
  label: string
  name: Path<T>
  error?: string
  required?: boolean
  children: React.ReactNode
}

export function FormField<T extends FieldValues>({
  label,
  name,
  error,
  required,
  children,
}: FormFieldProps<T>) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className={cn(error && "text-destructive")}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

// ============================================
// TEXT INPUT FIELD
// ============================================

interface TextFieldProps<T extends FieldValues> {
  label: string
  name: Path<T>
  register: UseFormRegister<T>
  error?: string
  placeholder?: string
  required?: boolean
  type?: "text" | "email" | "password" | "number" | "date" | "time" | "url"
  min?: number
  max?: number
  step?: number
  disabled?: boolean
}

export function TextField<T extends FieldValues>({
  label,
  name,
  register,
  error,
  placeholder,
  required,
  type = "text",
  min,
  max,
  step,
  disabled,
}: TextFieldProps<T>) {
  return (
    <FormField label={label} name={name} error={error} required={required}>
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        className={error ? "border-destructive" : ""}
        min={min}
        max={max}
        step={step}
        {...register(name, { valueAsNumber: type === "number" })}
      />
    </FormField>
  )
}

// ============================================
// TEXTAREA FIELD
// ============================================

interface TextareaFieldProps<T extends FieldValues> {
  label: string
  name: Path<T>
  register: UseFormRegister<T>
  error?: string
  placeholder?: string
  required?: boolean
  rows?: number
  disabled?: boolean
}

export function TextareaField<T extends FieldValues>({
  label,
  name,
  register,
  error,
  placeholder,
  required,
  rows = 3,
  disabled,
}: TextareaFieldProps<T>) {
  return (
    <FormField label={label} name={name} error={error} required={required}>
      <Textarea
        id={name}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={error ? "border-destructive resize-none" : "resize-none"}
        {...register(name)}
      />
    </FormField>
  )
}

// ============================================
// SELECT FIELD
// ============================================

interface SelectOption {
  value: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  color?: string
}

interface SelectFieldProps<T extends FieldValues> {
  label: string
  name: Path<T>
  value: string
  onValueChange: (value: string) => void
  options: SelectOption[]
  error?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
}

export function SelectField<T extends FieldValues>({
  label,
  name,
  value,
  onValueChange,
  options,
  error,
  placeholder,
  required,
  disabled,
}: SelectFieldProps<T>) {
  return (
    <FormField label={label} name={name} error={error} required={required}>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger id={name} className={error ? "border-destructive" : ""}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                {option.color && (
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: option.color }}
                  />
                )}
                {option.icon && <option.icon className="size-4" />}
                {option.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  )
}

// ============================================
// NUMBER FIELD WITH BUTTONS
// ============================================

interface NumberFieldProps<T extends FieldValues> {
  label: string
  name: Path<T>
  value: number
  onChange: (value: number) => void
  error?: string
  required?: boolean
  min?: number
  max?: number
  step?: number
  presets?: number[]
  unit?: string
  disabled?: boolean
}

export function NumberField<T extends FieldValues>({
  label,
  name,
  value,
  onChange,
  error,
  required,
  min = 0,
  max = 1000000,
  step = 1,
  presets,
  unit = "",
  disabled,
}: NumberFieldProps<T>) {
  return (
    <FormField label={label} name={name} error={error} required={required}>
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <Input
            id={name}
            type="number"
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            className={error ? "border-destructive" : ""}
          />
          {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
        </div>
        {presets && presets.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {presets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onChange(preset)}
                disabled={disabled}
                className="px-2 py-1 text-xs rounded border hover:bg-accent disabled:opacity-50"
              >
                {preset}
                {unit}
              </button>
            ))}
          </div>
        )}
      </div>
    </FormField>
  )
}

// ============================================
// FORM ERROR DISPLAY
// ============================================

interface FormErrorProps {
  error: string | null
}

export function FormError({ error }: FormErrorProps) {
  if (!error) return null
  return (
    <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
      {error}
    </div>
  )
}

// ============================================
// FORM SUBMIT BUTTON
// ============================================

import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface SubmitButtonProps {
  isSubmitting: boolean
  children: React.ReactNode
  disabled?: boolean
  className?: string
}

export function SubmitButton({
  isSubmitting,
  children,
  disabled,
  className,
}: SubmitButtonProps) {
  return (
    <Button type="submit" disabled={isSubmitting || disabled} className={className}>
      {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
      {children}
    </Button>
  )
}
