"use client"

interface DialogProps {
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function Dialog({ onClose, title, children }: DialogProps) {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-background rounded-lg shadow-lg max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">{title}</h2>
          {children}
        </div>
      </div>
    </div>
  )
}
