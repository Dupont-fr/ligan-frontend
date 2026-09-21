import { Loader2 } from 'lucide-react'

export function FullScreenLoader({ label = 'Chargement…' }: { label?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background">
      <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden />
      <p className="text-sm text-text-secondary">{label}</p>
    </div>
  )
}