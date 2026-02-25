// ============================================
// REACT HOOK FORM + ZOD INTEGRATION
// ============================================

import { useForm, UseFormReturn, FieldValues, DefaultValues, Path } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ZodError } from "zod"
import { useCallback, useState } from "react"

interface UseValidatedFormOptions<T extends FieldValues> {
  schema: any // ZodSchema with defaults causes type issues
  defaultValues: DefaultValues<T>
  onSubmit: (data: T) => void | Promise<void>
}

interface UseValidatedFormReturn<T extends FieldValues> extends UseFormReturn<T> {
  isSubmitting: boolean
  submitError: string | null
  handleFormSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>
  resetForm: () => void
}

export function useValidatedForm<T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
}: UseValidatedFormOptions<T>): UseValidatedFormReturn<T> {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onChange",
  })

  const handleFormSubmit = useCallback(
    async (e?: React.BaseSyntheticEvent) => {
      e?.preventDefault()
      setSubmitError(null)

      const isValid = await form.trigger()
      if (!isValid) {
        const errors = form.formState.errors
        const firstError = Object.values(errors)[0]?.message as string
        if (firstError) {
          setSubmitError(firstError)
        }
        return
      }

      setIsSubmitting(true)
      try {
        await onSubmit(form.getValues())
        form.reset(defaultValues)
      } catch (error) {
        if (error instanceof Error) {
          setSubmitError(error.message)
        } else if (error instanceof ZodError) {
          setSubmitError(error.errors[0]?.message || "Ошибка валидации")
        } else {
          setSubmitError("Произошла неизвестная ошибка")
        }
      } finally {
        setIsSubmitting(false)
      }
    },
    [form, onSubmit, defaultValues]
  )

  const resetForm = useCallback(() => {
    form.reset(defaultValues)
    setSubmitError(null)
  }, [form, defaultValues])

  return {
    ...form,
    isSubmitting,
    submitError,
    handleFormSubmit,
    resetForm,
  }
}

// ============================================
// FORM FIELD HELPERS
// ============================================

export function getFieldError<T extends FieldValues>(
  form: UseFormReturn<T>,
  fieldName: Path<T>
): string | undefined {
  return form.formState.errors[fieldName]?.message as string | undefined
}

export function isFieldInvalid<T extends FieldValues>(
  form: UseFormReturn<T>,
  fieldName: Path<T>
): boolean {
  return !!form.formState.errors[fieldName]
}
